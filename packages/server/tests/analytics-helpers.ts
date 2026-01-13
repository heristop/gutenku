import { describe, expect, it } from 'vitest';
import {
  formatPercent,
  formatRejectPercent,
  calculateStdDev,
  calculateMean,
  calculateMedian,
  getPercentile,
  getScoreThreshold,
  getSentimentLevel,
  getSuccessRateLevel,
  calculateCompositeScore,
} from '../src/utils/analytics-helpers';

describe('Analytics Helpers', () => {
  describe('formatPercent', () => {
    it('formats high percentage', () => {
      expect(formatPercent(85.5)).toBe('85.5%');
    });

    it('formats medium percentage', () => {
      expect(formatPercent(65.123)).toBe('65.1%');
    });

    it('formats low percentage', () => {
      expect(formatPercent(25)).toBe('25.0%');
    });

    it('formats zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('formats 100%', () => {
      expect(formatPercent(100)).toBe('100.0%');
    });
  });

  describe('formatRejectPercent', () => {
    it('calculates percentage correctly', () => {
      expect(formatRejectPercent(25, 100)).toBe('25.0%');
    });

    it('returns 0% when total is zero', () => {
      expect(formatRejectPercent(10, 0)).toBe('0%');
    });

    it('handles decimal results', () => {
      expect(formatRejectPercent(1, 3)).toBe('33.3%');
    });

    it('handles zero count', () => {
      expect(formatRejectPercent(0, 100)).toBe('0.0%');
    });
  });

  describe('calculateStdDev', () => {
    it('returns 0 for empty array', () => {
      expect(calculateStdDev([])).toBe(0);
    });

    it('returns 0 for single value', () => {
      expect(calculateStdDev([5])).toBe(0);
    });

    it('returns 0 for identical values', () => {
      expect(calculateStdDev([5, 5, 5, 5])).toBe(0);
    });

    it('calculates standard deviation correctly', () => {
      // For [2, 4, 4, 4, 5, 5, 7, 9], mean=5, variance=4, stddev=2
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      expect(calculateStdDev(values)).toBe(2);
    });

    it('handles negative values', () => {
      const values = [-2, -1, 0, 1, 2];
      expect(calculateStdDev(values)).toBeCloseTo(1.414, 2);
    });
  });

  describe('calculateMean', () => {
    it('returns 0 for empty array', () => {
      expect(calculateMean([])).toBe(0);
    });

    it('returns single value for array of one', () => {
      expect(calculateMean([42])).toBe(42);
    });

    it('calculates mean correctly', () => {
      expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('handles decimal values', () => {
      expect(calculateMean([1.5, 2.5, 3.5])).toBe(2.5);
    });

    it('handles negative values', () => {
      expect(calculateMean([-5, 0, 5])).toBe(0);
    });
  });

  describe('calculateMedian', () => {
    it('returns 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });

    it('returns single value for array of one', () => {
      expect(calculateMedian([42])).toBe(42);
    });

    it('returns middle value for odd-length array', () => {
      expect(calculateMedian([1, 3, 5])).toBe(3);
    });

    it('returns average of middle values for even-length array', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    });

    it('handles unsorted array', () => {
      expect(calculateMedian([5, 1, 3])).toBe(3);
    });
  });

  describe('getPercentile', () => {
    it('returns 0 for empty array', () => {
      expect(getPercentile([], 50)).toBe(0);
    });

    it('returns correct 50th percentile (median)', () => {
      expect(getPercentile([1, 2, 3, 4, 5], 50)).toBe(3);
    });

    it('returns correct 90th percentile', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(getPercentile(values, 90)).toBe(9);
    });

    it('returns first value for 0th percentile', () => {
      expect(getPercentile([1, 2, 3, 4, 5], 0)).toBe(1);
    });

    it('returns last value for 100th percentile', () => {
      expect(getPercentile([1, 2, 3, 4, 5], 100)).toBe(5);
    });
  });

  describe('getScoreThreshold', () => {
    it('returns good when value meets threshold', () => {
      expect(getScoreThreshold(0.5, 0.5)).toBe('good');
    });

    it('returns good when value exceeds threshold', () => {
      expect(getScoreThreshold(0.8, 0.5)).toBe('good');
    });

    it('returns warn when value below threshold', () => {
      expect(getScoreThreshold(0.3, 0.5)).toBe('warn');
    });
  });

  describe('getSentimentLevel', () => {
    it('returns positive for high sentiment', () => {
      expect(getSentimentLevel(0.7)).toBe('positive');
      expect(getSentimentLevel(0.9)).toBe('positive');
    });

    it('returns neutral for medium sentiment', () => {
      expect(getSentimentLevel(0.5)).toBe('neutral');
      expect(getSentimentLevel(0.45)).toBe('neutral');
    });

    it('returns negative for low sentiment', () => {
      expect(getSentimentLevel(0.3)).toBe('negative');
      expect(getSentimentLevel(0.1)).toBe('negative');
    });

    it('handles boundary at 0.6', () => {
      expect(getSentimentLevel(0.6)).toBe('neutral');
      expect(getSentimentLevel(0.61)).toBe('positive');
    });

    it('handles boundary at 0.4', () => {
      expect(getSentimentLevel(0.4)).toBe('neutral');
      expect(getSentimentLevel(0.39)).toBe('negative');
    });
  });

  describe('getSuccessRateLevel', () => {
    it('returns excellent for 80% or above', () => {
      expect(getSuccessRateLevel(80)).toBe('excellent');
      expect(getSuccessRateLevel(95)).toBe('excellent');
      expect(getSuccessRateLevel(100)).toBe('excellent');
    });

    it('returns good for 50% to 79%', () => {
      expect(getSuccessRateLevel(50)).toBe('good');
      expect(getSuccessRateLevel(65)).toBe('good');
      expect(getSuccessRateLevel(79)).toBe('good');
    });

    it('returns poor for below 50%', () => {
      expect(getSuccessRateLevel(49)).toBe('poor');
      expect(getSuccessRateLevel(25)).toBe('poor');
      expect(getSuccessRateLevel(0)).toBe('poor');
    });
  });

  describe('calculateCompositeScore', () => {
    it('returns 0 for 0 success and 0 quality', () => {
      expect(calculateCompositeScore(0, 0)).toBe(0);
    });

    it('returns 1 for 100% success and max quality', () => {
      expect(calculateCompositeScore(100, 15)).toBe(1);
    });

    it('weights success at 40% by default', () => {
      // 100% success, 0 quality = 0.4 * 1 + 0.6 * 0 = 0.4
      expect(calculateCompositeScore(100, 0)).toBe(0.4);
    });

    it('weights quality at 60% by default', () => {
      // 0% success, max quality = 0.4 * 0 + 0.6 * 1 = 0.6
      expect(calculateCompositeScore(0, 15)).toBe(0.6);
    });

    it('calculates balanced score correctly', () => {
      // 50% success, 50% quality = 0.4 * 0.5 + 0.6 * 0.5 = 0.5
      expect(calculateCompositeScore(50, 7.5)).toBe(0.5);
    });

    it('allows custom weights', () => {
      // Equal weights: 50% success, 50% quality
      const score = calculateCompositeScore(100, 15, 15, 0.5, 0.5);
      expect(score).toBe(1);
    });

    it('clamps quality to max', () => {
      // Quality above max should be clamped
      expect(calculateCompositeScore(100, 20, 15)).toBe(1);
    });

    it('handles negative quality', () => {
      // Negative quality should be clamped to 0
      expect(calculateCompositeScore(100, -5, 15)).toBe(0.4);
    });
  });
});
