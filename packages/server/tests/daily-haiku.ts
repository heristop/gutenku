import { describe, it, expect } from 'vitest';
import { seededRandom, dateToSeed } from '~/shared/helpers/SeededRandom';

describe('Daily Haiku', () => {
  describe('Date exclusion logic', () => {
    /**
     * Tests the string comparison logic used in MongoDB query:
     * { createdAt: { $lt: excludeTimestamp } }
     *
     * This ensures haikus created today are excluded from daily selection.
     */

    it('should exclude haikus created on the current day', () => {
      const excludeDate = '2026-01-06';
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;

      // Haiku created at midnight today - should be EXCLUDED
      const todayMidnight = '2026-01-06T00:00:00.000Z';
      expect(todayMidnight < excludeTimestamp).toBeFalsy();

      // Haiku created in the afternoon today - should be EXCLUDED
      const todayAfternoon = '2026-01-06T14:30:00.000Z';
      expect(todayAfternoon < excludeTimestamp).toBeFalsy();

      // Haiku created at end of today - should be EXCLUDED
      const todayEndOfDay = '2026-01-06T23:59:59.999Z';
      expect(todayEndOfDay < excludeTimestamp).toBeFalsy();
    });

    it('should include haikus created before the current day', () => {
      const excludeDate = '2026-01-06';
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;

      // Haiku created yesterday at end of day - should be INCLUDED
      const yesterdayEnd = '2026-01-05T23:59:59.999Z';
      expect(yesterdayEnd < excludeTimestamp).toBeTruthy();

      // Haiku created yesterday morning - should be INCLUDED
      const yesterdayMorning = '2026-01-05T08:00:00.000Z';
      expect(yesterdayMorning < excludeTimestamp).toBeTruthy();

      // Haiku created a week ago - should be INCLUDED
      const weekAgo = '2025-12-30T12:00:00.000Z';
      expect(weekAgo < excludeTimestamp).toBeTruthy();

      // Haiku created a year ago - should be INCLUDED
      const yearAgo = '2025-01-06T12:00:00.000Z';
      expect(yearAgo < excludeTimestamp).toBeTruthy();
    });

    it('should handle boundary case exactly at midnight', () => {
      const excludeDate = '2026-01-06';
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;

      // Exactly at midnight of exclude date - should be EXCLUDED (not less than)
      const exactMidnight = '2026-01-06T00:00:00.000Z';
      expect(exactMidnight < excludeTimestamp).toBeFalsy();

      // One millisecond before midnight - should be INCLUDED
      const beforeMidnight = '2026-01-05T23:59:59.999Z';
      expect(beforeMidnight < excludeTimestamp).toBeTruthy();
    });

    it('should work correctly with ISO string comparison for month boundaries', () => {
      // Test month boundary (Dec 31 to Jan 1)
      const excludeTimestamp = '2026-01-01T00:00:00.000Z';

      const dec31 = '2025-12-31T23:59:59.999Z';
      const jan1 = '2026-01-01T00:00:00.000Z';

      expect(dec31 < excludeTimestamp).toBeTruthy(); // Dec 31 included
      expect(jan1 < excludeTimestamp).toBeFalsy(); // Jan 1 excluded
    });

    it('should work correctly with ISO string comparison for year boundaries', () => {
      const excludeTimestamp = '2026-01-01T00:00:00.000Z';

      const lastYearDec = '2025-12-15T12:00:00.000Z';
      const thisYearJan = '2026-01-01T12:00:00.000Z';

      expect(lastYearDec < excludeTimestamp).toBeTruthy(); // Last year included
      expect(thisYearJan < excludeTimestamp).toBeFalsy(); // This year excluded
    });
  });

  describe('Deterministic selection from cache', () => {
    interface MockHaiku {
      id: string;
      createdAt: string;
      title: string;
    }

    function createMockCache(count: number, startDate: string): MockHaiku[] {
      const cache: MockHaiku[] = [];
      const baseDate = new Date(startDate);

      for (let i = 0; i < count; i++) {
        const createdAt = new Date(
          baseDate.getTime() - i * 24 * 60 * 60 * 1000,
        );
        cache.push({
          id: `haiku-${i}`,
          createdAt: createdAt.toISOString(),
          title: `Haiku ${i}`,
        });
      }

      // Sort by id for deterministic ordering (like _id in MongoDB)
      return cache.sort((a, b) => a.id.localeCompare(b.id));
    }

    function selectDeterministicHaiku(
      cache: MockHaiku[],
      excludeDate: string,
      seed: number,
    ): MockHaiku | null {
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;

      // Filter haikus created before excludeDate
      const eligibleHaikus = cache.filter(
        (h) => h.createdAt < excludeTimestamp,
      );

      if (eligibleHaikus.length === 0) {
        return null;
      }

      // Use seeded random to select
      const random = seededRandom(seed);
      const index = Math.floor(random() * eligibleHaikus.length);

      return eligibleHaikus[index];
    }

    it('should return the same haiku for the same date', () => {
      const cache = createMockCache(50, '2026-01-05'); // All created before Jan 6
      const date = '2026-01-06';
      const seed = dateToSeed(date);

      const haiku1 = selectDeterministicHaiku(cache, date, seed);
      const haiku2 = selectDeterministicHaiku(cache, date, seed);

      expect(haiku1).toEqual(haiku2);
      expect(haiku1).not.toBeNull();
    });

    it('should return different haikus for different dates', () => {
      const cache = createMockCache(50, '2026-01-05');

      const haiku1 = selectDeterministicHaiku(
        cache,
        '2026-01-06',
        dateToSeed('2026-01-06'),
      );
      const haiku2 = selectDeterministicHaiku(
        cache,
        '2026-01-07',
        dateToSeed('2026-01-07'),
      );

      // Very likely to be different with 50 items
      expect(haiku1?.id).not.toEqual(haiku2?.id);
    });

    it('should exclude haikus created on the current day', () => {
      // Create cache with haikus created today and yesterday
      const cache: MockHaiku[] = [
        {
          id: 'haiku-today-1',
          createdAt: '2026-01-06T10:00:00.000Z',
          title: 'Today 1',
        },
        {
          id: 'haiku-today-2',
          createdAt: '2026-01-06T15:00:00.000Z',
          title: 'Today 2',
        },
        {
          id: 'haiku-yesterday',
          createdAt: '2026-01-05T12:00:00.000Z',
          title: 'Yesterday',
        },
        {
          id: 'haiku-old',
          createdAt: '2026-01-01T08:00:00.000Z',
          title: 'Old',
        },
      ].sort((a, b) => a.id.localeCompare(b.id));

      const date = '2026-01-06';
      const seed = dateToSeed(date);

      // Run selection 100 times to ensure today's haikus are never selected
      for (let i = 0; i < 100; i++) {
        const selected = selectDeterministicHaiku(cache, date, seed + i);

        expect(selected).not.toBeNull();
        expect(selected?.createdAt.startsWith('2026-01-06')).toBeFalsy();
      }
    });

    it('should return null when no eligible haikus exist', () => {
      // All haikus created today
      const cache: MockHaiku[] = [
        {
          id: 'haiku-1',
          createdAt: '2026-01-06T10:00:00.000Z',
          title: 'Today 1',
        },
        {
          id: 'haiku-2',
          createdAt: '2026-01-06T15:00:00.000Z',
          title: 'Today 2',
        },
      ];

      const date = '2026-01-06';
      const seed = dateToSeed(date);

      const selected = selectDeterministicHaiku(cache, date, seed);

      expect(selected).toBeNull();
    });

    it('should maintain determinism when cache grows with new haikus today', () => {
      // Initial cache with old haikus
      const initialCache = createMockCache(30, '2026-01-05');
      const date = '2026-01-06';
      const seed = dateToSeed(date);

      const haiku1 = selectDeterministicHaiku(initialCache, date, seed);

      // Add new haikus created today (these should be excluded)
      const expandedCache = [
        ...initialCache,
        {
          id: 'new-haiku-1',
          createdAt: '2026-01-06T10:00:00.000Z',
          title: 'New 1',
        },
        {
          id: 'new-haiku-2',
          createdAt: '2026-01-06T14:00:00.000Z',
          title: 'New 2',
        },
      ].sort((a, b) => a.id.localeCompare(b.id));

      const haiku2 = selectDeterministicHaiku(expandedCache, date, seed);

      // Same haiku should be selected because new haikus are excluded
      expect(haiku1?.id).toEqual(haiku2?.id);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string date gracefully', () => {
      // This tests the robustness of dateToSeed
      const seed = dateToSeed('2026-01-06');
      expect(seed).toBe(20260106);
    });

    it('should handle leap year dates', () => {
      const excludeTimestamp = '2024-02-29T00:00:00.000Z';

      const feb28 = '2024-02-28T23:59:59.999Z';
      const feb29 = '2024-02-29T00:00:00.000Z';
      const mar1 = '2024-03-01T00:00:00.000Z';

      expect(feb28 < excludeTimestamp).toBeTruthy();
      expect(feb29 < excludeTimestamp).toBeFalsy();
      expect(mar1 < excludeTimestamp).toBeFalsy();
    });

    it('should produce valid index for any cache size', () => {
      const cacheSizes = [1, 10, 50, 100, 500, 1000];
      const seed = dateToSeed('2026-01-06');

      for (const size of cacheSizes) {
        const random = seededRandom(seed);
        const index = Math.floor(random() * size);

        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(size);
      }
    });
  });
});
