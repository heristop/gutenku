import { describe, expect, it } from 'vitest';
import {
  getCurrentPublicationDate,
  getNextRolloverAt,
  getPreviousRolloverAt,
  isValidDailyHaikuDate,
  secondsUntilNextRollover,
  toUtcDateString,
} from '~/domain/services/DailyHaikuSchedule';

const at = (iso: string) => new Date(iso);

describe('DailyHaikuSchedule', () => {
  describe('getNextRolloverAt', () => {
    it('returns today 10:00 UTC before the rollover', () => {
      expect(
        getNextRolloverAt(at('2026-10-23T09:59:59.999Z')).toISOString(),
      ).toBe('2026-10-23T10:00:00.000Z');
    });

    it('returns tomorrow 10:00 UTC exactly at the rollover', () => {
      expect(
        getNextRolloverAt(at('2026-10-23T10:00:00.000Z')).toISOString(),
      ).toBe('2026-10-24T10:00:00.000Z');
    });

    it('returns tomorrow 10:00 UTC after the rollover', () => {
      expect(
        getNextRolloverAt(at('2026-10-23T23:59:59.000Z')).toISOString(),
      ).toBe('2026-10-24T10:00:00.000Z');
    });

    it('returns today 10:00 UTC just after midnight', () => {
      expect(
        getNextRolloverAt(at('2026-10-23T00:00:00.000Z')).toISOString(),
      ).toBe('2026-10-23T10:00:00.000Z');
    });

    it('crosses month and year boundaries', () => {
      expect(
        getNextRolloverAt(at('2026-12-31T12:00:00.000Z')).toISOString(),
      ).toBe('2027-01-01T10:00:00.000Z');
    });

    it('is independent of the local timezone offset in the input', () => {
      // 11:30 in UTC+02:00 is 09:30 UTC, still before the rollover.
      expect(
        getNextRolloverAt(at('2026-10-23T11:30:00+02:00')).toISOString(),
      ).toBe('2026-10-23T10:00:00.000Z');
    });
  });

  describe('getPreviousRolloverAt / getCurrentPublicationDate', () => {
    it('before 10:00 UTC the live publication is yesterday', () => {
      const now = at('2026-10-23T09:00:00.000Z');

      expect(getPreviousRolloverAt(now).toISOString()).toBe(
        '2026-10-22T10:00:00.000Z',
      );
      expect(getCurrentPublicationDate(now)).toBe('2026-10-22');
    });

    it('from 10:00 UTC the live publication is today', () => {
      expect(getCurrentPublicationDate(at('2026-10-23T10:00:00.000Z'))).toBe(
        '2026-10-23',
      );
    });
  });

  describe('secondsUntilNextRollover', () => {
    it('counts seconds until the next rollover', () => {
      expect(secondsUntilNextRollover(at('2026-10-23T09:00:00.000Z'))).toBe(
        3600,
      );
      expect(secondsUntilNextRollover(at('2026-10-23T10:00:00.000Z'))).toBe(
        86_400,
      );
    });

    it('never returns less than one second', () => {
      expect(secondsUntilNextRollover(at('2026-10-23T09:59:59.999Z'))).toBe(1);
    });
  });

  it('formats UTC dates', () => {
    expect(toUtcDateString(at('2026-10-23T23:30:00-02:00'))).toBe('2026-10-24');
  });

  it.each([
    ['2026-10-23', true],
    ['2024-02-29', true],
    ['2026-02-29', false],
    ['2026-13-01', false],
    ['2026-1-01', false],
    ['20261023', false],
    ['', false],
    [undefined, false],
    [20_261_023, false],
  ])('isValidDailyHaikuDate(%s) -> %s', (value, expected) => {
    expect(isValidDailyHaikuDate(value)).toBe(expected);
  });
});

describe('DailyHaikuSchedule (server helpers)', () => {
  it('publicationInstant is 10:00 UTC of the day', async () => {
    const { publicationInstant } =
      await import('~/domain/services/DailyHaikuSchedule');

    expect(publicationInstant('2026-10-23').toISOString()).toBe(
      '2026-10-23T10:00:00.000Z',
    );
  });

  it('re-exports the shared helpers', async () => {
    const server = await import('~/domain/services/DailyHaikuSchedule');
    const shared = await import('@gutenku/shared');

    expect(server.getCurrentPublicationDate).toBe(
      shared.getCurrentPublicationDate,
    );
    expect(server.DAILY_HAIKU_ROLLOVER_HOUR_UTC).toBe(10);
  });
});
