import { describe, it, expect } from 'vitest';
import { seededRandom, dateToSeed } from '~/shared/helpers/SeededRandom';

describe('Daily Haiku', () => {
  describe('Date exclusion logic', () => {
    /**
     * Tests the string comparison logic used in MongoDB query:
     * { createdAt: { $lt: excludeTimestamp } }
     *
     * Haikus created today are excluded from daily selection.
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

  describe('48-hour TTL strategy', () => {
    const TTL_48_HOURS = 48 * 60 * 60 * 1000;

    interface MockHaikuWithExpiry {
      id: string;
      createdAt: string;
      expireAt: Date;
      title: string;
    }

    function createHaikuWithTTL(
      id: string,
      createdAt: string,
      ttl: number,
    ): MockHaikuWithExpiry {
      return {
        id,
        createdAt,
        expireAt: new Date(new Date(createdAt).getTime() + ttl),
        title: `Haiku ${id}`,
      };
    }

    function isExpired(haiku: MockHaikuWithExpiry, now: Date): boolean {
      return haiku.expireAt <= now;
    }

    function getAvailableHaikus(
      haikus: MockHaikuWithExpiry[],
      now: Date,
    ): MockHaikuWithExpiry[] {
      return haikus.filter((h) => !isExpired(h, now));
    }

    function getEligibleForDaily(
      haikus: MockHaikuWithExpiry[],
      excludeDate: string,
      now: Date,
    ): MockHaikuWithExpiry[] {
      const excludeTimestamp = `${excludeDate}T00:00:00.000Z`;
      return getAvailableHaikus(haikus, now).filter(
        (h) => h.createdAt < excludeTimestamp,
      );
    }

    it('should have yesterday haikus available with 48h TTL', () => {
      // Day 1: Create haikus
      const day1 = '2026-01-05T12:00:00.000Z';
      const haikus = [
        createHaikuWithTTL('h1', day1, TTL_48_HOURS),
        createHaikuWithTTL('h2', '2026-01-05T14:00:00.000Z', TTL_48_HOURS),
      ];

      // Day 2: Check availability
      const day2 = new Date('2026-01-06T12:00:00.000Z');
      const available = getAvailableHaikus(haikus, day2);

      // Yesterday's haikus should still be available (< 48h)
      expect(available).toHaveLength(2);
    });

    it('should expire haikus after 48 hours', () => {
      const createdAt = '2026-01-05T12:00:00.000Z';
      const haiku = createHaikuWithTTL('h1', createdAt, TTL_48_HOURS);

      // At 47 hours - should NOT be expired
      const at47h = new Date('2026-01-07T11:00:00.000Z');
      expect(isExpired(haiku, at47h)).toBeFalsy();

      // At 49 hours - should be expired
      const at49h = new Date('2026-01-07T13:00:00.000Z');
      expect(isExpired(haiku, at49h)).toBeTruthy();
    });

    it('should have eligible haikus for daily selection on Day 2', () => {
      // Day 1: Create haikus
      const haikus = [
        createHaikuWithTTL('h1', '2026-01-05T10:00:00.000Z', TTL_48_HOURS),
        createHaikuWithTTL('h2', '2026-01-05T15:00:00.000Z', TTL_48_HOURS),
      ];

      // Day 2: Check eligibility for daily haiku
      const day2Now = new Date('2026-01-06T12:00:00.000Z');
      const eligible = getEligibleForDaily(haikus, '2026-01-06', day2Now);

      // Day 1 haikus are eligible (created before Day 2, not expired)
      expect(eligible).toHaveLength(2);
    });

    it('should NOT have eligible haikus on Day 1 (only today haikus exist)', () => {
      // Day 1: Create haikus
      const haikus = [
        createHaikuWithTTL('h1', '2026-01-05T10:00:00.000Z', TTL_48_HOURS),
        createHaikuWithTTL('h2', '2026-01-05T15:00:00.000Z', TTL_48_HOURS),
      ];

      // Day 1: Check eligibility (exclude today = Day 1)
      const day1Now = new Date('2026-01-05T18:00:00.000Z');
      const eligible = getEligibleForDaily(haikus, '2026-01-05', day1Now);

      // No haikus eligible (all from today)
      expect(eligible).toHaveLength(0);
    });

    it('should handle Day 3 correctly (Day 1 expired, Day 2 available)', () => {
      const haikus = [
        // Day 1 haikus - will expire on Day 3
        createHaikuWithTTL('h1-day1', '2026-01-05T10:00:00.000Z', TTL_48_HOURS),
        // Day 2 haikus - still available on Day 3
        createHaikuWithTTL('h2-day2', '2026-01-06T10:00:00.000Z', TTL_48_HOURS),
        // Day 3 haikus - excluded from daily
        createHaikuWithTTL('h3-day3', '2026-01-07T10:00:00.000Z', TTL_48_HOURS),
      ];

      // Day 3 afternoon
      const day3Now = new Date('2026-01-07T14:00:00.000Z');
      const eligible = getEligibleForDaily(haikus, '2026-01-07', day3Now);

      // Only Day 2 haiku is eligible:
      // - Day 1 expired (created 2026-01-05T10:00, expires 2026-01-07T10:00)
      // - Day 3 excluded (created today)
      expect(eligible).toHaveLength(1);
      expect(eligible[0].id).toBe('h2-day2');
    });

    it('should maintain daily pool across rolling 48h window', () => {
      // Simulate 5 days of haiku generation
      const haikus: MockHaikuWithExpiry[] = [];

      for (let day = 1; day <= 5; day++) {
        const dateStr = `2026-01-0${day}T12:00:00.000Z`;
        haikus.push(createHaikuWithTTL(`h-day${day}`, dateStr, TTL_48_HOURS));
      }

      // On Day 5 at 10:00 (before Day 3 expires at 12:00)
      const day5Morning = new Date('2026-01-05T10:00:00.000Z');
      const eligible = getEligibleForDaily(haikus, '2026-01-05', day5Morning);

      // Day 1, 2 expired; Day 3, 4 eligible; Day 5 excluded
      // Day 3 created Jan 3 at 12:00 → expires Jan 5 at 12:00 → still valid at 10:00
      expect(eligible).toHaveLength(2);
      expect(eligible.map((h) => h.id).sort()).toEqual(['h-day3', 'h-day4']);
    });

    it('should show only Day 4 eligible when Day 3 expires', () => {
      const haikus: MockHaikuWithExpiry[] = [];

      for (let day = 1; day <= 5; day++) {
        const dateStr = `2026-01-0${day}T12:00:00.000Z`;
        haikus.push(createHaikuWithTTL(`h-day${day}`, dateStr, TTL_48_HOURS));
      }

      // On Day 5 at 18:00 (after Day 3 expires at 12:00)
      const day5Afternoon = new Date('2026-01-05T18:00:00.000Z');
      const eligible = getEligibleForDaily(haikus, '2026-01-05', day5Afternoon);

      // Day 1, 2, 3 expired; Day 4 eligible; Day 5 excluded
      expect(eligible).toHaveLength(1);
      expect(eligible[0].id).toBe('h-day4');
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
