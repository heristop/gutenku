export interface DailyHaikuBookValue {
  title: string;
  author: string;
  reference?: string;
  emoticons?: string;
}

export interface DailyHaikuCard {
  contentType: 'image/jpeg';
  data: Buffer;
}

/**
 * Who wrote the record. `auto` is the server-side recorder (no card, no
 * AI reading) and may be replaced by a later CLI publication; the others are
 * only replaced with `--force`. Legacy documents without `source` are `cli`.
 */
export type DailyHaikuSource = 'auto' | 'cli' | 'seed' | 'backfill';

/** Haiku of the day D, D being the publication date (10:00 UTC rollover). */
export interface DailyHaikuEntity {
  /** Publication day in UTC (YYYY-MM-DD), unique. */
  date: string;
  publishedAt: Date;
  verses: string[];
  /** Verses as found in the chapter (used to highlight them); internal. */
  rawVerses?: string[];
  title?: string;
  /** AI-generated reading. */
  description?: string;
  book: DailyHaikuBookValue;
  chapter?: { title?: string };
  card?: DailyHaikuCard;
  socialCaption?: string;
  source: DailyHaikuSource;
  bookId?: string;
  chapterId?: string;
}

/** Read model: the card bytes are only loaded when explicitly requested. */
export type DailyHaikuRecord = Omit<DailyHaikuEntity, 'card'> & {
  card?: DailyHaikuCard;
  /** True when a card is stored, even if its bytes were not loaded. */
  hasCard: boolean;
};

export interface DailyHaikuFindOptions {
  withCard?: boolean;
  /** Ignore records published after this date (YYYY-MM-DD). */
  notAfter?: string;
  /** Only records with a title and a reading (what the site shows as a day). */
  complete?: boolean;
}

export interface DailyHaikuPageOptions {
  /** Exclusive upper bound (YYYY-MM-DD). */
  before?: string;
  /** Inclusive upper bound (YYYY-MM-DD), usually the current publication date. */
  notAfter: string;
  limit: number;
}

export interface DailyHaikuPageResult {
  /** Newest first, at most `limit` records, card bytes never loaded. */
  records: DailyHaikuRecord[];
  hasMore: boolean;
  /** Date of the record right after the page, when there is one. */
  following: string | null;
}

export interface DailyHaikuNeighbours {
  previousDate: string | null;
  nextDate: string | null;
}

export type InsertIfAbsentResult = 'inserted' | 'exists';
export type PublishResult = 'inserted' | 'replaced' | 'kept';

export interface DailyHaikuPublishOptions {
  /** Replace any existing record of the same day. */
  force?: boolean;
}

export interface IDailyHaikuRepository {
  /** False while MongoDB is not connected (reads return empty results). */
  isAvailable(): boolean;
  /** Inserts the record unless that day is already recorded. */
  insertIfAbsent(dailyHaiku: DailyHaikuEntity): Promise<InsertIfAbsentResult>;
  /**
   * Inserts, or replaces an `auto` (or legacy card-less) record of the same
   * day. Other records are kept unless `force` is set.
   */
  publish(
    dailyHaiku: DailyHaikuEntity,
    options?: DailyHaikuPublishOptions,
  ): Promise<PublishResult>;
  findLatest(options?: DailyHaikuFindOptions): Promise<DailyHaikuRecord | null>;
  findByDate(
    date: string,
    options?: DailyHaikuFindOptions,
  ): Promise<DailyHaikuRecord | null>;
  findPage(options: DailyHaikuPageOptions): Promise<DailyHaikuPageResult>;
  findNeighbours(date: string, notAfter: string): Promise<DailyHaikuNeighbours>;
}

export const IDailyHaikuRepositoryToken = 'IDailyHaikuRepository';
