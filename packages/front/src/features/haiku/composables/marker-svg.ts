/**
 * Generates hand-drawn SVG marker stroke paths for the pretext-powered
 * black marker (stabilo) effect. Each line gets a unique randomized path
 * with organic wavy edges and micro-variations.
 *
 * Bars span the line's own extent — the full container for justified lines,
 * the measured text width for the last line of a paragraph — and are split
 * around the verse cutouts measured from the rendered <mark> boxes.
 */

export interface MarkerStrokeParams {
  /** Extent the bar has to cover (px) */
  extent: number;
  /** Line height (px) */
  lineHeight: number;
  /** Unique seed for deterministic randomness per line */
  seed: number;
  /** Overshoot past the start — off when the bar butts against a verse */
  bleedStart?: boolean;
  /** Overshoot past the end — off when the bar butts against a verse */
  bleedEnd?: boolean;
}

export interface MarkerStroke {
  /** SVG path d attribute for the filled marker shape */
  path: string;
  /** Total width of the stroke (px) */
  width: number;
  /** Total height of the stroke (px) */
  height: number;
  /** X offset from line start — slight random indent (px) */
  xOffset: number;
  /** Vertical offset from line top (px) */
  yOffset: number;
  /** Slight rotation for hand-drawn feel (deg) */
  rotation: number;
  /** Fill opacity (0-1) */
  opacity: number;
  /** feTurbulence seed for noise texture */
  noiseSeed: number;
}

export interface VerseCutout {
  startX: number;
  endX: number;
}

/**
 * Bars narrower than this read as ink blobs rather than strokes. Gaps this
 * small between two cutouts are swallowed instead, so no text leaks through.
 */
const MIN_SEGMENT_WIDTH = 14;

// Seeded PRNG (mulberry32) for deterministic per-line randomness
function createRng(seed: number): () => number {
  let t = seed | 0;

  return () => {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;

    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Traces one edge of the bar as a slightly uneven polyline, the way a marker
 * tip wanders as it is dragged. Deviations stay sub-pixel-ish so the bar still
 * reads as a straight stroke.
 */
function traceEdge(
  from: number,
  to: number,
  y: number,
  wobble: number,
  steps: number,
  rng: () => number,
): string[] {
  const points: string[] = [];

  for (let i = 1; i <= steps; i++) {
    const x = lerp(from, to, i / steps);
    const dy = i === steps ? 0 : lerp(-wobble, wobble, rng());
    points.push(`L${x.toFixed(1)},${(y + dy).toFixed(1)}`);
  }

  return points;
}

/**
 * Generates a single marker stroke covering `extent` pixels of one text line.
 */
export function generateMarkerStroke(params: MarkerStrokeParams): MarkerStroke {
  const {
    extent,
    lineHeight,
    seed,
    bleedStart = true,
    bleedEnd = true,
  } = params;
  const rng = createRng(seed);

  // Bar height: comfortably clears ascenders and descenders while leaving
  // a strip of paper between consecutive lines, like real redaction passes
  const barHeight = lineHeight * lerp(0.68, 0.76, rng());
  const yOffset = (lineHeight - barHeight) / 2 + lerp(-0.4, 0.4, rng());

  // Width: small overshoot so no glyph edge pokes out at the line ends.
  // Suppressed where the bar stops at a verse, or it would creep over it.
  const leftOvershoot = bleedStart ? lerp(1.5, 4.5, rng()) : 0;
  const rightOvershoot = bleedEnd ? lerp(2.5, 7, rng()) : 0;
  const totalWidth = extent + leftOvershoot + rightOvershoot;
  const xOffset = -leftOvershoot;

  // Visual micro-randomizations. Near-opaque: a redacted word must not be
  // legible through the ink, only sensed as a shape.
  const rotation = lerp(-0.22, 0.22, rng());
  const opacity = lerp(0.99, 1, rng());
  const noiseSeed = Math.floor(rng() * 10000);

  const topY = 0;
  const bottomY = barHeight;
  const steps = Math.max(2, Math.min(10, Math.round(totalWidth / 55)));
  const wobble = lerp(0.35, 0.75, rng());

  // Right cap — varied shape
  const rightCapBulge = lerp(1, 5, rng());
  const rightCapCpY = lerp(topY, bottomY, lerp(0.25, 0.75, rng()));

  // Left cap — varied shape with asymmetric control point
  const leftCapBulge = lerp(-6, -1, rng());
  const leftCapCpY = lerp(topY, bottomY, lerp(0.15, 0.85, rng()));

  // Path: wandering top edge → right cap → wandering bottom edge → left cap
  const d = [
    `M0,${topY.toFixed(1)}`,
    ...traceEdge(0, totalWidth, topY, wobble, steps, rng),
    `Q${(totalWidth + rightCapBulge).toFixed(1)},${rightCapCpY.toFixed(1)} ${totalWidth.toFixed(1)},${bottomY.toFixed(1)}`,
    ...traceEdge(totalWidth, 0, bottomY, wobble, steps, rng),
    `Q${leftCapBulge.toFixed(1)},${leftCapCpY.toFixed(1)} 0,${topY.toFixed(1)}`,
    'Z',
  ].join(' ');

  return {
    path: d,
    width: totalWidth,
    height: barHeight,
    xOffset,
    yOffset,
    rotation,
    opacity,
    noiseSeed,
  };
}

export interface BarSegment {
  /** X position of this segment within the line */
  x: number;
  /** The generated stroke for this segment */
  stroke: MarkerStroke;
}

/**
 * Clamps cutouts to the line, drops empty ones and merges neighbours whose
 * gap is too narrow to hold a readable bar.
 */
function normalizeCutouts(
  cutouts: VerseCutout[],
  extent: number,
): VerseCutout[] {
  const clamped = cutouts
    .map((cutout) => ({
      startX: Math.max(0, Math.min(cutout.startX, extent)),
      endX: Math.max(0, Math.min(cutout.endX, extent)),
    }))
    .filter((cutout) => cutout.endX > cutout.startX)
    .sort((a, b) => a.startX - b.startX);

  if (!clamped.length) {
    return [];
  }

  const merged: VerseCutout[] = [clamped[0]];

  for (const cutout of clamped.slice(1)) {
    const last = merged.at(-1)!;

    if (cutout.startX - last.endX < MIN_SEGMENT_WIDTH) {
      last.endX = Math.max(last.endX, cutout.endX);

      continue;
    }
    merged.push(cutout);
  }

  return merged;
}

/**
 * Generates bar segments for a single line, splitting around verse cutouts.
 * Lines without cutouts produce one full-extent segment.
 */
export function generateLineSegments(
  extent: number,
  lineHeight: number,
  cutouts: VerseCutout[],
  seed: number,
): BarSegment[] {
  const windows = normalizeCutouts(cutouts, extent);

  if (!windows.length) {
    return [
      {
        x: 0,
        stroke: generateMarkerStroke({ extent, lineHeight, seed }),
      },
    ];
  }

  const segments: BarSegment[] = [];
  let currentX = 0;
  let segSeed = seed;

  const addSegment = (from: number, to: number) => {
    if (to - from < MIN_SEGMENT_WIDTH) {
      return;
    }
    segments.push({
      x: from,
      stroke: generateMarkerStroke({
        extent: to - from,
        lineHeight,
        seed: segSeed,
        bleedStart: from === 0,
        bleedEnd: to === extent,
      }),
    });
  };

  for (const window of windows) {
    addSegment(currentX, window.startX);
    currentX = window.endX;
    segSeed += 3571; // Different seed per segment
  }

  addSegment(currentX, extent);

  return segments;
}

export interface MarkerLineExtent {
  lineHeight: number;
  index: number;
  /** Natural text width (px) — used to shrinkwrap the last line of a paragraph */
  width: number;
  isLastLine: boolean;
}

/**
 * Generates bar segments for all lines, handling verse cutouts.
 * Justified lines are covered edge to edge; the last line of a paragraph is
 * left-aligned, so its bar stops just past the text instead of running on.
 */
export function generateAllLineSegments(
  lines: MarkerLineExtent[],
  containerWidth: number,
  cutouts: VerseCutout[][] = [],
  baseSeed = 42,
): BarSegment[][] {
  return lines.map((line, index) => {
    const extent = line.isLastLine
      ? Math.min(containerWidth, line.width + line.lineHeight * 0.2)
      : containerWidth;

    return generateLineSegments(
      extent,
      line.lineHeight,
      cutouts[index] ?? [],
      baseSeed + line.index * 7919,
    );
  });
}

/**
 * Generates marker strokes for a batch of lines (no cutout support — for title/author).
 */
export function generateMarkerStrokes(
  lines: Array<{ lineHeight: number; index: number }>,
  containerWidth: number,
  baseSeed = 42,
): MarkerStroke[] {
  return lines.map((line) =>
    generateMarkerStroke({
      extent: containerWidth,
      lineHeight: line.lineHeight,
      seed: baseSeed + line.index * 7919,
    }),
  );
}
