import { describe, it, expect } from 'vitest';
import {
  generateMarkerStroke,
  generateLineSegments,
  generateAllLineSegments,
  generateMarkerStrokes,
} from '@/features/haiku/composables/marker-svg';

describe('generateMarkerStroke', () => {
  it('produces a deterministic stroke for a given seed', () => {
    const a = generateMarkerStroke({ extent: 200, lineHeight: 30, seed: 42 });
    const b = generateMarkerStroke({ extent: 200, lineHeight: 30, seed: 42 });

    expect(a).toEqual(b);
  });

  it('produces different strokes for different seeds', () => {
    const a = generateMarkerStroke({ extent: 200, lineHeight: 30, seed: 1 });
    const b = generateMarkerStroke({ extent: 200, lineHeight: 30, seed: 2 });

    expect(a.path).not.toBe(b.path);
  });

  it('returns a well-formed stroke object with sane bounds', () => {
    const stroke = generateMarkerStroke({
      extent: 300,
      lineHeight: 40,
      seed: 7,
    });

    expect(stroke.path.startsWith('M0,')).toBeTruthy();
    expect(stroke.path.endsWith('Z')).toBeTruthy();
    // bar wider than the extent it covers (overshoot on both sides)
    expect(stroke.width).toBeGreaterThan(300);
    // bar height is a ratio (~0.68-0.76) of line height, leaving paper between lines
    expect(stroke.height).toBeGreaterThan(40 * 0.67);
    expect(stroke.height).toBeLessThan(40 * 0.77);
    // xOffset is the negative left overshoot
    expect(stroke.xOffset).toBeLessThanOrEqual(0);
    // near-opaque: a redacted word must not be legible through the ink
    expect(stroke.opacity).toBeGreaterThanOrEqual(0.96);
    expect(stroke.opacity).toBeLessThanOrEqual(1);
    expect(Number.isInteger(stroke.noiseSeed)).toBeTruthy();
  });

  it('traces wandering edges rather than a plain rectangle', () => {
    const stroke = generateMarkerStroke({
      extent: 400,
      lineHeight: 30,
      seed: 3,
    });

    // several line-to commands per edge, not a single one
    expect(stroke.path.match(/L/g)?.length).toBeGreaterThan(4);
  });
});

describe('generateLineSegments', () => {
  it('returns a single full-extent segment when there are no cutouts', () => {
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
    // leading 0..10 and trailing 390..400 are both too narrow to draw
    const segments = generateLineSegments(
      400,
      30,
      [{ startX: 10, endX: 390 }],
      10,
    );

    expect(segments).toHaveLength(0);
  });

  it('merges cutouts too close together so no text leaks between them', () => {
    const segments = generateLineSegments(
      400,
      30,
      [
        { startX: 100, endX: 150 },
        { startX: 155, endX: 200 },
      ],
      10,
    );

    // the 5px gap is swallowed: one bar before, one after
    expect(segments.map((s) => s.x)).toEqual([0, 200]);
  });

  it('clamps cutouts to the line extent', () => {
    const segments = generateLineSegments(
      400,
      30,
      [{ startX: -50, endX: 120 }],
      10,
    );

    expect(segments.map((s) => s.x)).toEqual([120]);
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
      { lineHeight: 30, index: 0, width: 400, isLastLine: false },
      { lineHeight: 30, index: 1, width: 400, isLastLine: false },
    ];

    const result = generateAllLineSegments(lines, 400, [
      [],
      [{ startX: 100, endX: 200 }],
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(1);
    expect(result[1]).toHaveLength(2);
  });

  it('covers justified lines edge to edge', () => {
    const [segments] = generateAllLineSegments(
      [{ lineHeight: 30, index: 0, width: 180, isLastLine: false }],
      400,
    );

    // the line is justified to the container, so the bar spans it whole
    expect(segments[0].stroke.width).toBeGreaterThan(400);
  });

  it('shrinkwraps the last line of a paragraph to its measured text', () => {
    const [segments] = generateAllLineSegments(
      [{ lineHeight: 30, index: 0, width: 180, isLastLine: true }],
      400,
    );

    // left-aligned last line: the bar stops just past the text
    expect(segments[0].stroke.width).toBeLessThan(220);
    expect(segments[0].stroke.width).toBeGreaterThan(180);
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
