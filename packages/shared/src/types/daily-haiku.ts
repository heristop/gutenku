export interface DailyHaikuBook {
  title: string;
  author: string;
  emoticons?: string | null;
}

/**
 * Public shape of the published daily haiku, served by
 * `GET /api/daily-haiku` and the `dailyHaiku` GraphQL query.
 */
export interface DailyHaiku {
  /** Publication day in UTC (YYYY-MM-DD). */
  date: string;
  /** ISO timestamp of the publication. */
  publishedAt: string;
  title?: string | null;
  verses: string[];
  /** AI-generated reading of the haiku. */
  reading?: string | null;
  book: DailyHaikuBook;
  /** Absolute URL of the JPEG card for this day, null when no card exists. */
  cardUrl: string | null;
  /** ISO timestamp of the next daily rollover (10:00 UTC). */
  nextRolloverAt: string;
  /** Nearest earlier recorded day, null at the start of the archive. */
  previousDate?: string | null;
  /** Nearest later recorded day (never in the future), null for the latest. */
  nextDate?: string | null;
  /** A few words of the chapter around each verse (single-day query only). */
  excerpt?: DailyHaikuExcerpt | null;
}

export interface DailyHaikuExcerpt {
  /** One fragment per verse, in poem order, joined by " … " */
  text: string;
  /** Each verse as it reads in `text` */
  verses: string[];
}

/** One page of the archive, newest first. `nextBefore` is an exclusive cursor. */
export interface DailyHaikuPage {
  items: DailyHaiku[];
  nextBefore: string | null;
  hasMore: boolean;
}

export const DAILY_HAIKU_PAGE_MAX = 30;
export const DAILY_HAIKU_PAGE_DEFAULT = 14;

export interface DailyHaikusResponseData {
  dailyHaikus: DailyHaikuPage;
}

export interface DailyHaikuResponseData {
  dailyHaiku: DailyHaiku | null;
}
