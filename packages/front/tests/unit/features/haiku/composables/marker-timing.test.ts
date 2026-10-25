import { describe, it, expect } from 'vitest';
import {
  MARKER_STAGGER_BUDGET_MS,
  MARKER_STROKE_MS,
  markerSequenceMs,
  markerStagger,
} from '@/features/haiku/composables/marker-timing';

describe('marker-timing', () => {
  it('keeps the whole sequence inside the 600ms ceiling', () => {
    expect(MARKER_STROKE_MS + MARKER_STAGGER_BUDGET_MS).toBe(600);
  });

  describe('markerStagger', () => {
    it.each([-1, 0, 1])('is zero for %i line(s)', (count) => {
      expect(markerStagger(count)).toBe(0);
      expect(markerStagger(count, 100)).toBe(0);
    });

    it('uses the full 30ms stagger when the budget allows it', () => {
      expect(markerStagger(2)).toBe(30);
      expect(markerStagger(10)).toBe(30);
    });

    it('shrinks the stagger as lines grow', () => {
      const lines = 100;

      expect(markerStagger(lines)).toBeCloseTo(
        MARKER_STAGGER_BUDGET_MS / (lines - 1),
      );
      expect(markerStagger(lines)).toBeLessThan(30);
    });

    it('subtracts the offset from the budget', () => {
      const lines = 50;

      expect(markerStagger(lines, 100)).toBeCloseTo(
        (MARKER_STAGGER_BUDGET_MS - 100) / (lines - 1),
      );
    });

    it('never goes negative when the offset exceeds the budget', () => {
      expect(markerStagger(5, MARKER_STAGGER_BUDGET_MS + 500)).toBe(0);
    });
  });

  describe('markerSequenceMs', () => {
    it('is a single stroke for zero or one line', () => {
      expect(markerSequenceMs(0)).toBe(MARKER_STROKE_MS);
      expect(markerSequenceMs(1)).toBe(MARKER_STROKE_MS);
      expect(markerSequenceMs(1, 80)).toBe(80 + MARKER_STROKE_MS);
    });

    it('adds the stagger of every line after the first', () => {
      expect(markerSequenceMs(3)).toBe(2 * 30 + MARKER_STROKE_MS);
    });

    it('never exceeds 600ms plus the offset for long pages', () => {
      expect(markerSequenceMs(500)).toBeCloseTo(600);
      expect(markerSequenceMs(500, 100)).toBeCloseTo(600);
    });

    it('collapses to offset plus stroke when the offset eats the budget', () => {
      const offset = MARKER_STAGGER_BUDGET_MS + 100;

      expect(markerSequenceMs(8, offset)).toBe(offset + MARKER_STROKE_MS);
    });
  });
});
