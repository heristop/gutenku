/**
 * Persists the daily haiku (card + reading) to MongoDB so the public
 * `/api/daily-haiku` endpoints can serve it. Used by `post-haiku` and the
 * dev seed script. Never throws: a Mongo outage only logs a warning.
 */
import mongoose from 'mongoose';
import type { HaikuValue } from '~/shared/types';
import type {
  DailyHaikuEntity,
  DailyHaikuSource,
  PublishResult,
} from '~/domain/repositories/IDailyHaikuRepository';
import { getCurrentPublicationDate } from '~/domain/services/DailyHaikuSchedule';
import DailyHaikuRepository from '~/infrastructure/repositories/DailyHaikuRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import { chapterIds } from '~/application/services/DailyHaikuRecorder';

export type PublishableHaiku = Pick<
  HaikuValue,
  'verses' | 'title' | 'description'
> & {
  book: Pick<HaikuValue['book'], 'title' | 'author'> &
    Partial<Pick<HaikuValue['book'], 'reference' | 'emoticons'>>;
  chapter?: Partial<HaikuValue['chapter']> | null;
  // The verses as found in the chapter, before tidying (the excerpt finds them)
  rawVerses?: string[];
};

export interface PublishDailyHaikuInput {
  haiku: PublishableHaiku;
  card: Buffer;
  socialCaption?: string;
  now?: Date;
  source?: Exclude<DailyHaikuSource, 'auto'>;
}

export interface PublishDailyHaikuOptions {
  /** Replace the day's record even if it was not written by the recorder. */
  force?: boolean;
}

export interface PublishedDailyHaiku {
  date: string;
  result: PublishResult;
}

// The scheduled post runs right around 10:00 UTC; a run that starts a few
// minutes early still publishes the upcoming day.
export const EARLY_POST_GRACE_MS = 15 * 60 * 1000;

/** Publication date a post made at `now` belongs to. */
export function publicationDateForPost(now: Date): string {
  return getCurrentPublicationDate(
    new Date(now.getTime() + EARLY_POST_GRACE_MS),
  );
}

export interface PublishLogger {
  warn(message: string): void;
}

function definedOnly<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, v]) => v !== undefined && v !== null && v !== '',
    ),
  ) as T;
}

export function buildDailyHaikuEntity({
  haiku,
  card,
  socialCaption,
  now = new Date(),
  source = 'cli',
}: PublishDailyHaikuInput): DailyHaikuEntity {
  const chapterTitle = haiku.chapter?.title;

  return definedOnly<DailyHaikuEntity>({
    date: publicationDateForPost(now),
    publishedAt: now,
    verses: [...haiku.verses],
    title: haiku.title,
    description: haiku.description,
    book: definedOnly({
      title: haiku.book.title,
      author: haiku.book.author,
      reference: haiku.book.reference,
      emoticons: haiku.book.emoticons,
    }),
    chapter: chapterTitle ? { title: chapterTitle } : undefined,
    // Where the verses were cut from: the home page blacks out that chapter
    // around them
    rawVerses: haiku.rawVerses?.length ? [...haiku.rawVerses] : undefined,
    ...chapterIds(haiku),
    card: { contentType: 'image/jpeg', data: card },
    socialCaption,
    source,
  });
}

/**
 * Publishes the day's DailyHaiku. Replaces a record written by the server
 * recorder (`auto`), keeps any other unless `force`. Returns null on failure.
 */
export async function publishDailyHaiku(
  input: PublishDailyHaikuInput,
  logger: PublishLogger = console,
  options: PublishDailyHaikuOptions = {},
): Promise<PublishedDailyHaiku | null> {
  const entity = buildDailyHaikuEntity(input);
  const connection = new MongoConnection();

  try {
    const db = await connection.connect();

    if (!db) {
      logger.warn('MongoDB unreachable, daily haiku not published to DB');

      return null;
    }

    const result = await new DailyHaikuRepository(connection).publish(
      entity,
      options,
    );

    return { date: entity.date, result };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to publish daily haiku to DB: ${reason}`);

    return null;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}
