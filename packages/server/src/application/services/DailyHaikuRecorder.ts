import { inject, singleton } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import {
  type DailyHaikuEntity,
  type DailyHaikuRecord,
  type IDailyHaikuRepository,
  IDailyHaikuRepositoryToken,
} from '~/domain/repositories/IDailyHaikuRepository';
import {
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';
import {
  getCurrentPublicationDate,
  publicationInstant,
} from '~/domain/services/DailyHaikuSchedule';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import { dateToSeed } from '~/shared/helpers/SeededRandom';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('daily-haiku-recorder');

const CACHE_TTL_MS = 48 * 60 * 60 * 1000;
export const DEFAULT_ENSURE_TIMEOUT_MS = 3000;

export class FutureDailyHaikuError extends Error {
  constructor(date: string) {
    super(`Cannot record the daily haiku of a future date (${date})`);
    this.name = 'FutureDailyHaikuError';
  }
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

// Cached haikus keep the raw Mongo chapter (`_id`, `book: [ObjectId]`).
function toId(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const id = typeof value === 'string' ? value : String(value);

  return OBJECT_ID.test(id) ? id : undefined;
}

/** Where a haiku was cut from, as stored ids (the CLI publisher shares it) */
export function chapterIds(haiku: { chapter?: unknown; book?: unknown }): {
  chapterId?: string;
  bookId?: string;
} {
  const chapter = haiku.chapter as unknown as
    | { _id?: unknown; book?: unknown }
    | undefined;
  const book = haiku.book as unknown as { _id?: unknown } | undefined;
  const chapterBook = Array.isArray(chapter?.book)
    ? chapter.book[0]
    : chapter?.book;

  return {
    chapterId: toId(chapter?._id),
    bookId: toId(book?._id) ?? toId(chapterBook),
  };
}

function definedOnly<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== ''),
  ) as T;
}

export function buildAutoDailyHaikuEntity(
  date: string,
  haiku: HaikuValue,
): DailyHaikuEntity {
  return definedOnly<DailyHaikuEntity>({
    date,
    publishedAt: publicationInstant(date),
    verses: [...haiku.verses],
    rawVerses: haiku.rawVerses?.length ? [...haiku.rawVerses] : undefined,
    title: haiku.title,
    description: haiku.description,
    book: definedOnly({
      title: haiku.book.title,
      author: haiku.book.author,
      reference: haiku.book.reference,
      emoticons: haiku.book.emoticons,
    }),
    chapter: haiku.chapter?.title ? { title: haiku.chapter.title } : undefined,
    source: 'auto',
    ...chapterIds(haiku),
  });
}

/**
 * Makes sure the haiku of a publication day is recorded in `daily_haikus`,
 * so the day exists in the archive even when the `post` CLI did not run.
 * Picks the same haiku as the site's daily mode (best scored haiku cached
 * the day before), falling back to one local generation (never OpenAI).
 */
@singleton()
export class DailyHaikuRecorder {
  private readonly inFlight = new Map<
    string,
    Promise<DailyHaikuRecord | null>
  >();

  constructor(
    @inject(IDailyHaikuRepositoryToken)
    private readonly dailyHaikuRepository: IDailyHaikuRepository,
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
    @inject(HaikuGeneratorService)
    private readonly haikuGenerator: Pick<
      HaikuGeneratorService,
      'configure' | 'filter' | 'generate'
    >,
  ) {}

  /** Records `date` if missing and returns its record. Single-flight per date. */
  ensure(
    date: string,
    now: Date = new Date(),
  ): Promise<DailyHaikuRecord | null> {
    if (date > getCurrentPublicationDate(now)) {
      return Promise.reject(new FutureDailyHaikuError(date));
    }

    const pending = this.inFlight.get(date);

    if (pending) {
      return pending;
    }

    const run = this.record(date).finally(() => {
      this.inFlight.delete(date);
    });
    this.inFlight.set(date, run);

    return run;
  }

  /**
   * Like `ensure`, but waits at most `timeoutMs` and never throws: resolves
   * null on timeout or failure (the recording keeps going in the background).
   */
  async ensureWithin(
    date: string,
    timeoutMs = DEFAULT_ENSURE_TIMEOUT_MS,
    now: Date = new Date(),
  ): Promise<DailyHaikuRecord | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ensured = this.ensure(date, now).catch((err: unknown) => {
      log.warn({ err, date }, 'Failed to record the daily haiku');

      return null;
    });
    const timeout = new Promise<null>((resolve) => {
      timer = setTimeout(() => resolve(null), timeoutMs);
    });

    try {
      return await Promise.race([ensured, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  private async record(date: string): Promise<DailyHaikuRecord | null> {
    if (!this.dailyHaikuRepository.isAvailable()) {
      return null;
    }

    const existing = await this.dailyHaikuRepository.findByDate(date);

    if (existing) {
      return existing;
    }

    const haiku = await this.pickHaiku(date);

    if (!haiku) {
      log.warn({ date }, 'No haiku available to record');

      return null;
    }

    const result = await this.dailyHaikuRepository.insertIfAbsent(
      buildAutoDailyHaikuEntity(date, haiku),
    );
    log.info({ date, result }, 'Daily haiku recorded');

    return this.dailyHaikuRepository.findByDate(date);
  }

  private async pickHaiku(date: string): Promise<HaikuValue | null> {
    const cached = await this.haikuRepository.extractDeterministicFromCache(
      dateToSeed(date),
      0,
      date,
    );

    if (cached) {
      return cached;
    }

    log.info({ date }, 'Daily haiku cache miss, generating one locally');

    // No cache write, no filter, default thresholds: a plain local haiku.
    this.haikuGenerator.configure({
      cache: { minCachedDocs: 0, ttl: CACHE_TTL_MS, enabled: false },
    });
    this.haikuGenerator.filter([]);

    return this.haikuGenerator.generate();
  }
}
