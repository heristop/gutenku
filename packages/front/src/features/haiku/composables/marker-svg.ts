/**
 * Generates hand-drawn SVG marker stroke paths for the pretext-powered
 * black marker (stabilo) effect. Each line gets a unique randomized path
 * with organic wavy edges and micro-variations.
 *
 * Bars extend to near-full container width (like a real marker stroke
 * across the page), not matched to per-line text width.
 */

export interface MarkerStrokeParams {
  /** Container width — bar extends to (near) this width (px) */
  containerWidth: number;
  /** Line height (px) */
  lineHeight: number;
  /** Unique seed for deterministic randomness per line */
  seed: number;
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
 * Generates a single marker stroke for one text line.
 * The stroke spans near-full container width with organic edges.
 */
export function generateMarkerStroke(params: MarkerStrokeParams): MarkerStroke {
  const { containerWidth, lineHeight, seed } = params;
  const rng = createRng(seed);

  // Bar dimensions — thick bars that nearly touch adjacent lines
  const barHeightRatio = lerp(0.75, 0.82, rng());
  const barHeight = lineHeight * barHeightRatio;
  const yOffset = (lineHeight - barHeight) / 2 + lerp(-0.3, 0.3, rng());

  // Width: generous overshoot on both sides to fully cover text
  const leftOvershoot = lerp(
    containerWidth * 0.005,
    containerWidth * 0.012,
    rng(),
  );
  const rightOvershoot = lerp(
    containerWidth * 0.01,
    containerWidth * 0.025,
    rng(),
  );
  const totalWidth = containerWidth + leftOvershoot + rightOvershoot;
  const xOffset = -leftOvershoot;

  // Visual micro-randomizations
  const rotation = lerp(-0.25, 0.25, rng());
  const opacity = lerp(0.88, 0.96, rng());
  const noiseSeed = Math.floor(rng() * 10000);

  // Straight edges, randomized caps only
  const topY = 0;
  const bottomY = barHeight;

  // Right cap — varied shape
  const rightCapBulge = lerp(1, 6, rng());
  const rightCapYBias = lerp(0.25, 0.75, rng());
  const rightCapCpY = topY + (bottomY - topY) * rightCapYBias;

  // Left cap — varied shape with asymmetric control point
  const leftCapBulge = lerp(-8, -1, rng());
  const leftCapYBias = lerp(0.15, 0.85, rng());
  const leftCapCpY = topY + (bottomY - topY) * leftCapYBias;

  // Path: straight top → right cap → straight bottom → left cap
  const d = [
    `M0,${topY.toFixed(1)}`,
    `L${totalWidth.toFixed(1)},${topY.toFixed(1)}`,
    `Q${(totalWidth + rightCapBulge).toFixed(1)},${rightCapCpY.toFixed(1)} ${totalWidth.toFixed(1)},${bottomY.toFixed(1)}`,
    `L0,${bottomY.toFixed(1)}`,
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
 * Generates bar segments for a single line, splitting around verse cutouts.
 * Lines without cutouts produce one full-width segment.
 * Lines with cutouts produce multiple segments (bar-gap-bar pattern).
 */
export function generateLineSegments(
  containerWidth: number,
  lineHeight: number,
  cutouts: Array<{ startX: number; endX: number }>,
  seed: number,
): BarSegment[] {
  if (!cutouts.length) {
    return [
      {
        x: 0,
        stroke: generateMarkerStroke({ containerWidth, lineHeight, seed }),
      },
    ];
  }

  // Sort cutouts by startX
  const sorted = [...cutouts].sort((a, b) => a.startX - b.startX);
  const segments: BarSegment[] = [];
  let currentX = 0;
  let segSeed = seed;

  for (const cutout of sorted) {
    const segWidth = cutout.startX - currentX;
    if (segWidth > 20) {
      segments.push({
        x: currentX,
        stroke: generateMarkerStroke({
          containerWidth: segWidth,
          lineHeight,
          seed: segSeed,
        }),
      });
    }
    currentX = cutout.endX;
    segSeed += 3571; // Different seed per segment
  }

  // Final segment after last cutout
  const finalWidth = containerWidth - currentX;
  if (finalWidth > 20) {
    segments.push({
      x: currentX,
      stroke: generateMarkerStroke({
        containerWidth: finalWidth,
        lineHeight,
        seed: segSeed,
      }),
    });
  }

  return segments;
}

/**
 * Generates bar segments for all lines, handling verse cutouts.
 */
export function generateAllLineSegments(
  lines: Array<{
    lineHeight: number;
    index: number;
    cutouts: Array<{ startX: number; endX: number }>;
  }>,
  containerWidth: number,
  baseSeed = 42,
): BarSegment[][] {
  return lines.map((line) =>
    generateLineSegments(
      containerWidth,
      line.lineHeight,
      line.cutouts,
      baseSeed + line.index * 7919,
    ),
  );
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
      containerWidth,
      lineHeight: line.lineHeight,
      seed: baseSeed + line.index * 7919,
    }),
  );
}
