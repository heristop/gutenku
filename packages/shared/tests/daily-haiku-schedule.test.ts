import { describe, expect, it } from 'vitest';
import {
  DAILY_HAIKU_ROLLOVER_HOUR_UTC,
  getCurrentPublicationDate,
  getNextRolloverAt,
  getPreviousRolloverAt,
  isValidDailyHaikuDate,
  toUtcDateString,
} from '../src/utils/daily-haiku-schedule';

const at = (iso: string) => new Date(iso);

describe('daily haiku schedule', () => {
  it('rolls over at 10:00 UTC', () => {
    expect(DAILY_HAIKU_ROLLOVER_HOUR_UTC).toBe(10);
    expect(getCurrentPublicationDate(at('2026-10-24T09:59:59.999Z'))).toBe(
      '2026-10-23',
    );
    expect(getCurrentPublicationDate(at('2026-10-24T10:00:00.000Z'))).toBe(
      '2026-10-24',
    );
  });

  it('computes the surrounding rollovers', () => {
    const now = at('2026-10-24T09:59:00.000Z');

    expect(getNextRolloverAt(now).toISOString()).toBe(
      '2026-10-24T10:00:00.000Z',
    );
    expect(getPreviousRolloverAt(now).toISOString()).toBe(
      '2026-10-23T10:00:00.000Z',
    );
    expect(
      getNextRolloverAt(at('2026-10-24T10:00:00.000Z')).toISOString(),
    ).toBe('2026-10-25T10:00:00.000Z');
  });

  it('validates YYYY-MM-DD strictly', () => {
    expect(isValidDailyHaikuDate('2026-02-28')).toBeTruthy();
    expect(isValidDailyHaikuDate('2026-02-30')).toBeFalsy();
    expect(isValidDailyHaikuDate('2026-2-3')).toBeFalsy();
    expect(isValidDailyHaikuDate(20_261_024)).toBeFalsy();
  });

  it('formats UTC days', () => {
    expect(toUtcDateString(at('2026-10-23T23:30:00-03:00'))).toBe('2026-10-24');
  });
});
