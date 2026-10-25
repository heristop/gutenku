/**
 * Daily haiku publication schedule (10:00 UTC rollover). The pure date
 * helpers live in @gutenku/shared so the front uses the exact same rules.
 */
import {
  DAILY_HAIKU_ROLLOVER_HOUR_UTC,
  getNextRolloverAt,
} from '@gutenku/shared';

export {
  DAILY_HAIKU_ROLLOVER_HOUR_UTC,
  getCurrentPublicationDate,
  getNextRolloverAt,
  getPreviousRolloverAt,
  isValidDailyHaikuDate,
  toUtcDateString,
} from '@gutenku/shared';

/** Whole seconds until the next rollover (at least 1). */
export function secondsUntilNextRollover(now: Date = new Date()): number {
  const ms = getNextRolloverAt(now).getTime() - now.getTime();

  return Math.max(1, Math.ceil(ms / 1000));
}

/** Rollover instant (10:00 UTC) of a publication date. */
export function publicationInstant(date: string): Date {
  const instant = new Date(`${date}T00:00:00.000Z`);
  instant.setUTCHours(DAILY_HAIKU_ROLLOVER_HOUR_UTC, 0, 0, 0);

  return instant;
}
