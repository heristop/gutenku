import { describe, it, expect } from 'vitest';
import {
  generateMarkerStroke,
  generateLineSegments,
  generateAllLineSegments,
  generateMarkerStrokes,
} from '@/features/haiku/composables/marker-svg';

describe('generateMarkerStroke', () => {
  it('produces a deterministic stroke for a given seed', () => {
    const a = generateMarkerStroke({
      containerWidth: 200,
      lineHeight: 30,
      seed: 42,
    });
    const b = generateMarkerStroke({
      containerWidth: 200,
      lineHeight: 30,
      seed: 42,
    });

    expect(a).toEqual(b);
  });

  it('produces different strokes for different seeds', () => {
    const a = generateMarkerStroke({
      containerWidth: 200,
      lineHeight: 30,
      seed: 1,
    });
    const b = generateMarkerStroke({
      containerWidth: 200,
      lineHeight: 30,
      seed: 2,
    });

    expect(a.path).not.toBe(b.path);
  });

  it('returns a well-formed stroke object with sane bounds', () => {
    const stroke = generateMarkerStroke({
      containerWidth: 300,
      lineHeight: 40,
      seed: 7,
    });

    expect(stroke.path.startsWith('M0,')).toBeTruthy();
    expect(stroke.path.endsWith('Z')).toBeTruthy();
    // bar wider than container (overshoot on both sides)
    expect(stroke.width).toBeGreaterThan(300);
    // bar height is a ratio (~0.75-0.82) of line height
    expect(stroke.height).toBeGreaterThan(40 * 0.7);
    expect(stroke.height).toBeLessThan(40);
    // xOffset is the negative left overshoot
    expect(stroke.xOffset).toBeLessThanOrEqual(0);
    expect(stroke.opacity).toBeGreaterThanOrEqual(0.88);
    expect(stroke.opacity).toBeLessThanOrEqual(0.96);
    expect(Number.isInteger(stroke.noiseSeed)).toBeTruthy();
  });
});

describe('generateLineSegments', () => {
  it('returns a single full-width segment when there are no cutouts', () => {
    const segments = generateLineSegments(400, 30, [], 10);

    expect(segments).toHaveLength(1);
    expect(segments[0].x).toBe(0);
  });

  it('splits around a cutout into multiple segments', () => {
    const segments = generateLineSegments(
      400,
      30,
      [{ startX: 100, endX: 200 }],
      10,
    );

    // segment before cutout (0..100) and after (200..400)
    expect(segments).toHaveLength(2);
    expect(segments[0].x).toBe(0);
    expect(segments[1].x).toBe(200);
  });

  it('skips segments narrower than the minimum width', () => {
    // cutout starts at 10 -> leading segment width 10 (<= 20) is skipped
    const segments = generateLineSegments(
      400,
      30,
      [{ startX: 10, endX: 380 }],
      10,
    );

    // only the trailing segment 380..400 has width 20 which is not > 20, so skipped too
    expect(segments).toHaveLength(0);
  });

  it('sorts cutouts before processing', () => {
    const segments = generateLineSegments(
      600,
      30,
      [
        { startX: 400, endX: 450 },
        { startX: 100, endX: 150 },
      ],
      10,
    );

    // segments: 0..100, 150..400, 450..600
    expect(segments.map((s) => s.x)).toEqual([0, 150, 450]);
  });
});

describe('generateAllLineSegments', () => {
  it('generates segments for each line based on its index and cutouts', () => {
    const lines = [
      { lineHeight: 30, index: 0, cutouts: [] },
      { lineHeight: 30, index: 1, cutouts: [{ startX: 100, endX: 200 }] },
    ];

    const result = generateAllLineSegments(lines, 400, 42);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(2);
  });
});

describe('generateMarkerStrokes', () => {
  it('generates one stroke per line', () => {
    const lines = [
      { lineHeight: 30, index: 0 },
      { lineHeight: 30, index: 1 },
      { lineHeight: 30, index: 2 },
    ];

    const strokes = generateMarkerStrokes(lines, 400, 42);

    expect(strokes).toHaveLength(3);
    // different seeds (baseSeed + index*7919) -> different paths
    expect(strokes[0].path).not.toBe(strokes[1].path);
  });
});
