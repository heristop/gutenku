import { describe, it, expect } from 'vitest';
import {
  seededRandom,
  dateToSeed,
  shuffleWithSeed,
  getTodayUTC,
} from '~/shared/helpers/SeededRandom';

describe('SeededRandom', () => {
  describe('seededRandom', () => {
    it('should return deterministic values for the same seed', () => {
      const random1 = seededRandom(12345);
      const random2 = seededRandom(12345);

      const values1 = [random1(), random1(), random1()];
      const values2 = [random2(), random2(), random2()];

      expect(values1).toEqual(values2);
    });

    it('should return different values for different seeds', () => {
      const random1 = seededRandom(12345);
      const random2 = seededRandom(67890);

      expect(random1()).not.toEqual(random2());
    });

    it('should return values between 0 and 1', () => {
      const random = seededRandom(42);

      for (let i = 0; i < 100; i++) {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should produce consistent sequence across multiple calls', () => {
      const seed = 20260106;
      const random = seededRandom(seed);

      // Generate a sequence
      const sequence = Array.from({ length: 10 }, () => random());

      // Verify the sequence is reproducible
      const random2 = seededRandom(seed);
      const sequence2 = Array.from({ length: 10 }, () => random2());

      expect(sequence).toEqual(sequence2);
    });
  });

  describe('dateToSeed', () => {
    it('should convert date string to numeric seed', () => {
      expect(dateToSeed('2026-01-06')).toBe(20260106);
      expect(dateToSeed('2025-12-31')).toBe(20251231);
      expect(dateToSeed('2024-06-15')).toBe(20240615);
    });

    it('should handle single-digit months and days', () => {
      expect(dateToSeed('2026-01-01')).toBe(20260101);
      expect(dateToSeed('2026-09-05')).toBe(20260905);
    });

    it('should produce unique seeds for different dates', () => {
      const seed1 = dateToSeed('2026-01-06');
      const seed2 = dateToSeed('2026-01-07');
      const seed3 = dateToSeed('2026-02-06');

      expect(seed1).not.toEqual(seed2);
      expect(seed1).not.toEqual(seed3);
      expect(seed2).not.toEqual(seed3);
    });
  });

  describe('shuffleWithSeed', () => {
    it('should return deterministic shuffle for the same seed', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const seed = 12345;

      const shuffled1 = shuffleWithSeed(array, seededRandom(seed));
      const shuffled2 = shuffleWithSeed(array, seededRandom(seed));

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should not modify the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];

      shuffleWithSeed(original, seededRandom(42));

      expect(original).toEqual(copy);
    });

    it('should contain all original elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleWithSeed(array, seededRandom(42));

      expect(shuffled.sort()).toEqual(array.sort());
    });

    it('should produce different results for different seeds', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const shuffled1 = shuffleWithSeed(array, seededRandom(12345));
      const shuffled2 = shuffleWithSeed(array, seededRandom(67890));

      // Very unlikely to be the same with different seeds
      expect(shuffled1).not.toEqual(shuffled2);
    });
  });

  describe('getTodayUTC', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const today = getTodayUTC();

      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return consistent value within the same UTC day', () => {
      const today1 = getTodayUTC();
      const today2 = getTodayUTC();

      expect(today1).toEqual(today2);
    });
  });

  describe('Daily haiku selection determinism', () => {
    it('should select the same index for the same date', () => {
      const date = '2026-01-06';
      const seed = dateToSeed(date);
      const cacheSize = 100;

      // Simulate deterministic selection
      const random1 = seededRandom(seed);
      const index1 = Math.floor(random1() * cacheSize);

      const random2 = seededRandom(seed);
      const index2 = Math.floor(random2() * cacheSize);

      expect(index1).toEqual(index2);
    });

    it('should select different indices for different dates', () => {
      const cacheSize = 100;

      const seed1 = dateToSeed('2026-01-06');
      const random1 = seededRandom(seed1);
      const index1 = Math.floor(random1() * cacheSize);

      const seed2 = dateToSeed('2026-01-07');
      const random2 = seededRandom(seed2);
      const index2 = Math.floor(random2() * cacheSize);

      // Different dates should likely produce different indices
      // (not guaranteed, but very likely with 100 items)
      expect(index1).not.toEqual(index2);
    });

    it('should distribute selections across the cache', () => {
      const cacheSize = 100;
      const selections = new Set<number>();

      // Test 30 consecutive days
      for (let day = 1; day <= 30; day++) {
        const date = `2026-01-${day.toString().padStart(2, '0')}`;
        const seed = dateToSeed(date);
        const random = seededRandom(seed);
        const index = Math.floor(random() * cacheSize);
        selections.add(index);
      }

      // Should have reasonable distribution (at least 15 unique selections in 30 days)
      expect(selections.size).toBeGreaterThan(15);
    });
  });
});
