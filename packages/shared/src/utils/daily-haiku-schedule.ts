/**
 * Daily haiku publication schedule. A new haiku is published every day at
 * 10:00 UTC; the "current" publication date is the UTC day of the most
 * recent rollover.
 */
export const DAILY_HAIKU_ROLLOVER_HOUR_UTC = 10;

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function rolloverOn(date: Date): Date {
  const rollover = new Date(date);
  rollover.setUTCHours(DAILY_HAIKU_ROLLOVER_HOUR_UTC, 0, 0, 0);

  return rollover;
}

/** Next 10:00 UTC strictly after `now`. */
export function getNextRolloverAt(now: Date = new Date()): Date {
  const today = rolloverOn(now);

  if (now.getTime() < today.getTime()) {
    return today;
  }

  return new Date(today.getTime() + DAY_MS);
}

/** Most recent 10:00 UTC at or before `now`. */
export function getPreviousRolloverAt(now: Date = new Date()): Date {
  return new Date(getNextRolloverAt(now).getTime() - DAY_MS);
}

/** UTC calendar day (YYYY-MM-DD) of `date`. */
export function toUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Publication date (YYYY-MM-DD) live at `now`: switches at 10:00 UTC. */
export function getCurrentPublicationDate(now: Date = new Date()): string {
  return toUtcDateString(getPreviousRolloverAt(now));
}

/** Strict YYYY-MM-DD check that also rejects impossible dates. */
export function isValidDailyHaikuDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && toUtcDateString(parsed) === value;
}
