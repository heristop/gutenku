import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DailyHaikuRecorder,
  FutureDailyHaikuError,
  buildAutoDailyHaikuEntity,
} from '~/application/services/DailyHaikuRecorder';
import { GetDailyHaikuHandler } from '~/application/queries/daily-haiku/GetDailyHaikuHandler';
import { GetDailyHaikuQuery } from '~/application/queries/daily-haiku/GetDailyHaikuQuery';
import { GetDailyHaikuPageHandler } from '~/application/queries/daily-haiku/GetDailyHaikuPageHandler';
import { GetDailyHaikuPageQuery } from '~/application/queries/daily-haiku/GetDailyHaikuPageQuery';
import {
  initDailyHaikuScheduler,
  ROLLOVER_DELAY_MS,
} from '~/infrastructure/schedulers/DailyHaikuScheduler';
import type {
  DailyHaikuEntity,
  DailyHaikuRecord,
  IDailyHaikuRepository,
} from '~/domain/repositories/IDailyHaikuRepository';
import type { IHaikuRepository } from '~/domain/repositories/IHaikuRepository';
import type HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import type { HaikuValue } from '~/shared/types';

const NOW = new Date('2026-10-24T12:00:00.000Z');
const CHAPTER_ID = '68c701011a684efaf0205a60';
const BOOK_ID = '68c701011a684efaf0205a20';

function makeHaiku(overrides: Partial<HaikuValue> = {}): HaikuValue {
  return {
    book: { reference: '205', title: 'Walden', author: 'Thoreau' },
    chapter: {
      _id: { toString: () => CHAPTER_ID },
      title: 'Solitude',
      content: 'long text',
      book: [{ toString: () => BOOK_ID }],
    } as unknown as HaikuValue['chapter'],
    verses: ['old pond', 'a frog jumps in', 'sound of water'],
    rawVerses: ['Old pond,', 'a frog jumps in', 'sound of water.'],
    cacheUsed: true,
    ...overrides,
  };
}

function toRecord(entity: DailyHaikuEntity): DailyHaikuRecord {
  const { card, ...rest } = entity;

  return { ...rest, hasCard: Boolean(card) };
}

/** In-memory repository sharing the semantics of DailyHaikuRepository. */
function createRepo(initial: DailyHaikuEntity[] = []) {
  const store = new Map(initial.map((e) => [e.date, e]));
  const repo = {
    store,
    isAvailable: vi.fn(() => true),
    insertIfAbsent: vi.fn(async (entity: DailyHaikuEntity) => {
      if (store.has(entity.date)) {
        return 'exists' as const;
      }

      store.set(entity.date, entity);

      return 'inserted' as const;
    }),
    publish: vi.fn(),
    findByDate: vi.fn(
      async (date: string, options: { notAfter?: string } = {}) => {
        if (options.notAfter && date > options.notAfter) {
          return null;
        }

        const entity = store.get(date);

        return entity ? toRecord(entity) : null;
      },
    ),
    findLatest: vi.fn(
      async (options: { notAfter?: string; complete?: boolean } = {}) => {
        const dates = [...store.keys()]
          .filter((d) => !options.notAfter || d <= options.notAfter)
          .filter(
            (d) =>
              !options.complete ||
              Boolean(store.get(d)!.title && store.get(d)!.description),
          )
          .toSorted()
          .toReversed();

        return dates[0] ? toRecord(store.get(dates[0])!) : null;
      },
    ),
    findPage: vi.fn(
      async (options: { before?: string; notAfter: string; limit: number }) => {
        const dates = [...store.keys()]
          .filter(
            (d) =>
              d <= options.notAfter && (!options.before || d < options.before),
          )
          .toSorted()
          .toReversed();
        const hasMore = dates.length > options.limit;

        return {
          records: dates
            .slice(0, options.limit)
            .map((d) => toRecord(store.get(d)!)),
          hasMore,
          following: hasMore ? dates[options.limit] : null,
        };
      },
    ),
    findNeighbours: vi.fn(async (date: string, notAfter: string) => {
      const dates = [...store.keys()].toSorted();

      return {
        previousDate: dates.findLast((d) => d < date) ?? null,
        nextDate: dates.find((d) => d > date && d <= notAfter) ?? null,
      };
    }),
  };

  return repo as typeof repo & IDailyHaikuRepository;
}

function makeEntity(date: string, extra: Partial<DailyHaikuEntity> = {}) {
  return {
    ...buildAutoDailyHaikuEntity(date, makeHaiku()),
    source: 'cli' as const,
    ...extra,
  };
}

describe('DailyHaikuRecorder', () => {
  let repo: ReturnType<typeof createRepo>;
  let haikuRepo: Pick<IHaikuRepository, 'extractDeterministicFromCache'>;
  let generator: {
    configure: ReturnType<typeof vi.fn>;
    filter: ReturnType<typeof vi.fn>;
    generate: ReturnType<typeof vi.fn>;
  };
  let recorder: DailyHaikuRecorder;

  beforeEach(() => {
    repo = createRepo();
    haikuRepo = {
      extractDeterministicFromCache: vi.fn(async () => makeHaiku()),
    };
    generator = {
      configure: vi.fn(),
      filter: vi.fn(),
      generate: vi.fn(async () =>
        makeHaiku({ verses: ['generated', 'locally', 'today'] }),
      ),
    };
    recorder = new DailyHaikuRecorder(
      repo,
      haikuRepo as IHaikuRepository,
      generator as unknown as HaikuGeneratorService,
    );
  });

  it('records the cached daily pick as an auto record without card', async () => {
    const record = await recorder.ensure('2026-10-24', NOW);

    expect(haikuRepo.extractDeterministicFromCache).toHaveBeenCalledWith(
      20261024,
      0,
      '2026-10-24',
    );
    expect(generator.generate).not.toHaveBeenCalled();
    expect(repo.insertIfAbsent).toHaveBeenCalledWith({
      date: '2026-10-24',
      publishedAt: new Date('2026-10-24T10:00:00.000Z'),
      verses: ['old pond', 'a frog jumps in', 'sound of water'],
      rawVerses: ['Old pond,', 'a frog jumps in', 'sound of water.'],
      book: { title: 'Walden', author: 'Thoreau', reference: '205' },
      chapter: { title: 'Solitude' },
      source: 'auto',
      chapterId: CHAPTER_ID,
      bookId: BOOK_ID,
    });
    expect(record?.hasCard).toBeFalsy();
    expect(record?.source).toBe('auto');
  });

  it('falls back to one local generation (no cache, no filter) on a cache miss', async () => {
    vi.mocked(haikuRepo.extractDeterministicFromCache).mockResolvedValue(null);

    const record = await recorder.ensure('2026-10-24', NOW);

    expect(generator.configure).toHaveBeenCalledWith({
      cache: expect.objectContaining({ enabled: false }),
    });
    expect(generator.filter).toHaveBeenCalledWith([]);
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(record?.verses).toEqual(['generated', 'locally', 'today']);
  });

  it('returns the existing record without picking a haiku', async () => {
    repo.store.set('2026-10-24', makeEntity('2026-10-24', { title: 'CLI' }));

    const record = await recorder.ensure('2026-10-24', NOW);

    expect(record?.title).toBe('CLI');
    expect(haikuRepo.extractDeterministicFromCache).not.toHaveBeenCalled();
    expect(repo.insertIfAbsent).not.toHaveBeenCalled();
  });

  it('is single-flight per date', async () => {
    const [a, b] = await Promise.all([
      recorder.ensure('2026-10-24', NOW),
      recorder.ensure('2026-10-24', NOW),
    ]);

    expect(a).toEqual(b);
    expect(haikuRepo.extractDeterministicFromCache).toHaveBeenCalledTimes(1);
    expect(repo.insertIfAbsent).toHaveBeenCalledTimes(1);
  });

  it('returns the winner when another process recorded the day first', async () => {
    repo.insertIfAbsent.mockImplementationOnce(async () => {
      repo.store.set('2026-10-24', makeEntity('2026-10-24', { title: 'Win' }));

      return 'exists';
    });

    expect((await recorder.ensure('2026-10-24', NOW))?.title).toBe('Win');
  });

  it('refuses future dates', async () => {
    await expect(recorder.ensure('2026-10-25', NOW)).rejects.toBeInstanceOf(
      FutureDailyHaikuError,
    );
    // Before 10:00 UTC the current publication date is still the day before.
    await expect(
      recorder.ensure('2026-10-24', new Date('2026-10-24T09:59:59.000Z')),
    ).rejects.toBeInstanceOf(FutureDailyHaikuError);
  });

  it('does nothing without a database', async () => {
    repo.isAvailable.mockReturnValue(false);

    expect(await recorder.ensure('2026-10-24', NOW)).toBeNull();
    expect(haikuRepo.extractDeterministicFromCache).not.toHaveBeenCalled();
  });

  describe('ensureWithin', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('resolves null on timeout and keeps recording in the background', async () => {
      vi.useFakeTimers();
      let release!: () => void;
      vi.mocked(haikuRepo.extractDeterministicFromCache).mockImplementation(
        () =>
          new Promise((resolve) => {
            release = () => resolve(makeHaiku());
          }),
      );

      const pending = recorder.ensureWithin('2026-10-24', 3000, NOW);
      await vi.advanceTimersByTimeAsync(3000);

      expect(await pending).toBeNull();

      release();
      await vi.runAllTimersAsync();
      expect(repo.store.has('2026-10-24')).toBeTruthy();
    });

    it('never throws', async () => {
      expect(await recorder.ensureWithin('2026-10-30', 3000, NOW)).toBeNull();

      repo.findByDate.mockRejectedValueOnce(new Error('db down'));
      expect(await recorder.ensureWithin('2026-10-24', 3000, NOW)).toBeNull();
    });
  });
});

describe('GetDailyHaikuHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(dates: string[]) {
    const repo = createRepo(dates.map((d) => makeEntity(d)));
    const recorder = {
      ensureWithin: vi.fn(async (date: string) => {
        repo.store.set(date, makeEntity(date, { source: 'auto' }));

        return repo.findByDate(date);
      }),
    };

    return {
      repo,
      recorder,
      handler: new GetDailyHaikuHandler(repo, recorder),
    };
  }

  it('returns the current day without recording it again', async () => {
    const { handler, recorder } = setup(['2026-10-23', '2026-10-24']);

    const record = await handler.execute(new GetDailyHaikuQuery());

    expect(record?.date).toBe('2026-10-24');
    expect(recorder.ensureWithin).not.toHaveBeenCalled();
  });

  it('lazily records the current day when the latest is stale', async () => {
    const { handler, recorder } = setup(['2026-10-23']);

    const record = await handler.execute(new GetDailyHaikuQuery());

    expect(recorder.ensureWithin).toHaveBeenCalledWith('2026-10-24');
    expect(record?.date).toBe('2026-10-24');
  });

  it('stands in the latest complete day while today has no title or reading', async () => {
    const { handler, repo } = setup([]);
    repo.store.set(
      '2026-10-23',
      makeEntity('2026-10-23', {
        title: 'Gilded Joy',
        description: 'A reading.',
      }),
    );
    repo.store.set(
      '2026-10-24',
      makeEntity('2026-10-24', {
        title: undefined,
        description: undefined,
        source: 'auto',
      }),
    );

    expect((await handler.execute(new GetDailyHaikuQuery()))?.date).toBe(
      '2026-10-23',
    );
  });

  it('falls back to the stale latest when recording fails', async () => {
    const { handler, recorder } = setup(['2026-10-23']);
    recorder.ensureWithin.mockResolvedValue(null);

    expect((await handler.execute(new GetDailyHaikuQuery()))?.date).toBe(
      '2026-10-23',
    );
  });

  it('reads a given past date, with the card when asked, without recording', async () => {
    const { handler, repo, recorder } = setup(['2026-10-20', '2026-10-24']);

    await handler.execute(new GetDailyHaikuQuery('2026-10-20', true));

    expect(repo.findByDate).toHaveBeenCalledWith('2026-10-20', {
      withCard: true,
      notAfter: '2026-10-24',
    });
    expect(recorder.ensureWithin).not.toHaveBeenCalled();
  });

  it('adds neighbours when asked', async () => {
    const { handler } = setup(['2026-10-18', '2026-10-20', '2026-10-24']);

    const record = await handler.execute(
      new GetDailyHaikuQuery('2026-10-20', false, true),
    );

    expect(record).toMatchObject({
      previousDate: '2026-10-18',
      nextDate: '2026-10-24',
    });
  });

  it('returns null for a future date', async () => {
    const { handler, repo } = setup(['2026-10-24']);
    repo.store.set('2026-10-25', makeEntity('2026-10-25'));

    expect(
      await handler.execute(new GetDailyHaikuQuery('2026-10-25')),
    ).toBeNull();
  });
});

describe('GetDailyHaikuPageHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const DATES = ['2026-10-18', '2026-10-20', '2026-10-21', '2026-10-23'];

  function setup() {
    const repo = createRepo(DATES.map((d) => makeEntity(d)));
    const recorder = {
      ensureWithin: vi.fn(async (date: string) => {
        repo.store.set(date, makeEntity(date, { source: 'auto' }));

        return repo.findByDate(date);
      }),
    };

    return {
      repo,
      recorder,
      handler: new GetDailyHaikuPageHandler(repo, recorder),
    };
  }

  it('ensures today on the first page and links neighbours', async () => {
    const { handler, recorder } = setup();

    const page = await handler.execute(
      new GetDailyHaikuPageQuery(undefined, 3),
    );

    expect(recorder.ensureWithin).toHaveBeenCalledWith('2026-10-24');
    expect(
      page.records.map(({ date, previousDate, nextDate }) => ({
        date,
        previousDate,
        nextDate,
      })),
    ).toEqual([
      { date: '2026-10-24', previousDate: '2026-10-23', nextDate: null },
      {
        date: '2026-10-23',
        previousDate: '2026-10-21',
        nextDate: '2026-10-24',
      },
      {
        date: '2026-10-21',
        previousDate: '2026-10-20',
        nextDate: '2026-10-23',
      },
    ]);
    expect(page.hasMore).toBeTruthy();
    expect(page.nextBefore).toBe('2026-10-21');
  });

  it('pages with the exclusive cursor without recording', async () => {
    const { handler, recorder } = setup();

    const page = await handler.execute(
      new GetDailyHaikuPageQuery('2026-10-21', 3),
    );

    expect(recorder.ensureWithin).not.toHaveBeenCalled();
    expect(page.records.map((r) => r.date)).toEqual([
      '2026-10-20',
      '2026-10-18',
    ]);
    expect(page.records[0].nextDate).toBe('2026-10-21');
    expect(page.records[1].previousDate).toBeNull();
    expect(page.hasMore).toBeFalsy();
    expect(page.nextBefore).toBeNull();
  });
});

describe('DailyHaikuScheduler', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs at boot, then 5s after each 10:00 UTC rollover', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-24T09:00:00.000Z') });
    const ensure = vi.fn(async () => null);

    const scheduler = initDailyHaikuScheduler({ ensure });
    await vi.advanceTimersByTimeAsync(0);

    expect(ensure).toHaveBeenCalledTimes(1);
    expect(ensure).toHaveBeenLastCalledWith('2026-10-23');

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 + ROLLOVER_DELAY_MS - 1);
    expect(ensure).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(ensure).toHaveBeenCalledTimes(2);
    expect(ensure).toHaveBeenLastCalledWith('2026-10-24');

    await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);
    expect(ensure).toHaveBeenCalledTimes(3);
    expect(ensure).toHaveBeenLastCalledWith('2026-10-25');

    scheduler.stop();
    await vi.advanceTimersByTimeAsync(48 * 60 * 60 * 1000);
    expect(ensure).toHaveBeenCalledTimes(3);
  });

  it('keeps running when a recording fails', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-24T09:59:00.000Z') });
    const ensure = vi.fn(async () => {
      throw new Error('db down');
    });

    const scheduler = initDailyHaikuScheduler({ ensure });
    await vi.advanceTimersByTimeAsync(60_000 + ROLLOVER_DELAY_MS);
    await vi.advanceTimersByTimeAsync(24 * 60 * 60 * 1000);

    expect(ensure).toHaveBeenCalledTimes(3);
    scheduler.stop();
  });
});
