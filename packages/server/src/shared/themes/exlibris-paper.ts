import Canvas, { type CanvasRenderingContext2D } from 'canvas';
import { seededRandom } from '~/shared/helpers/SeededRandom';

export type ExLibrisMode = 'day' | 'night';

export interface ExLibrisPalette {
  paper: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  stamp: string;
  fibreDark: string;
  fibreLight: string;
  fibreLightAlpha: [number, number];
  grain: number;
  stampBlend: 'multiply' | 'source-over';
}

export const PALETTES: Record<ExLibrisMode, ExLibrisPalette> = {
  day: {
    paper: '#F5EFE3',
    ink: '#27221F',
    inkSoft: '#5D544C',
    inkFaint: 'rgba(39, 34, 31, 0.16)',
    stamp: '#BC2D29',
    fibreDark: '39, 34, 31',
    fibreLight: '255, 252, 244',
    fibreLightAlpha: [0.06, 0.14],
    grain: 7,
    stampBlend: 'multiply',
  },
  night: {
    paper: '#26231F',
    ink: '#ECE6DA',
    inkSoft: '#B3ABA0',
    inkFaint: 'rgba(236, 230, 218, 0.16)',
    stamp: '#E0675A',
    fibreDark: '10, 9, 8',
    fibreLight: '236, 230, 218',
    fibreLightAlpha: [0.015, 0.045],
    grain: 5,
    stampBlend: 'source-over',
  },
};

export type Rng = () => number;

/** FNV-1a: a stable 32-bit seed from any string. */
export function hashSeed(input: string): number {
  let h = 2166136261; // FNV offset basis

  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619); // FNV prime
  }

  return h >>> 0;
}

/** Mulberry32 (shared helper) so the same haiku prints the same sheet. */
export function createRng(seed: number): Rng {
  return seededRandom(seed >>> 0);
}

const between = (rng: Rng, min: number, max: number) =>
  min + rng() * (max - min);

/** Per-pixel grain: the tooth of uncoated rag paper. */
function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amp: number,
  rng: Rng,
): void {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const n = (rng() - 0.5) * amp;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n * 0.9;
  }

  ctx.putImageData(image, 0, 0);
}

/** Low-frequency formation: pulp settles unevenly, giving soft clouding. */
function drawFormation(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: ExLibrisPalette,
  rng: Rng,
): void {
  const cols = 72;
  const rows = Math.round((cols * h) / w);
  const cloud = Canvas.createCanvas(cols, rows);
  const cctx = cloud.getContext('2d');

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dark = rng() < 0.5;
      const rgb = dark ? palette.fibreDark : palette.fibreLight;
      cctx.fillStyle = `rgba(${rgb}, ${between(rng, 0, 0.012).toFixed(3)})`;
      cctx.fillRect(x, y, 1, 1);
    }
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cloud, 0, 0, w, h);
  ctx.restore();
}

/** A gently wandering line, as a wire mould never lies perfectly straight. */
function wobblyLine(
  ctx: CanvasRenderingContext2D,
  from: [number, number],
  to: [number, number],
  wobble: number,
  rng: Rng,
): void {
  const steps = 24;
  const phase = rng() * Math.PI * 2;
  const freq = between(rng, 1, 3);
  const [x0, y0] = from;
  const [x1, y1] = to;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = -(y1 - y0) / len;
  const ny = (x1 - x0) / len;

  ctx.beginPath();

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const off =
      Math.sin(phase + t * Math.PI * freq) * wobble +
      (rng() - 0.5) * wobble * 0.4;
    const x = x0 + (x1 - x0) * t + nx * off;
    const y = y0 + (y1 - y0) * t + ny * off;

    if (i === 0) {
      ctx.moveTo(x, y);
      continue;
    }

    ctx.lineTo(x, y);
  }

  ctx.stroke();
}

function drawLaidLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  palette: ExLibrisPalette,
  rng: Rng,
): void {
  const spacing = 7 * u;

  ctx.save();
  ctx.lineWidth = Math.max(1, 0.9 * u);

  for (let y = between(rng, 0, spacing); y < h; y += spacing) {
    const alpha = between(rng, 0.005, 0.011);
    ctx.strokeStyle = `rgba(${palette.fibreDark}, ${alpha.toFixed(3)})`;
    wobblyLine(ctx, [0, y], [w, y], 0.6 * u, rng);
  }

  // Two chain lines, roughly a hand-width apart, as on a folio sheet.
  ctx.lineWidth = Math.max(1, 1.6 * u);
  const center = w * between(rng, 0.42, 0.58);
  const gap = Math.min(w * 0.36, 300 * u);

  for (const x of [center - gap / 2, center + gap / 2]) {
    ctx.strokeStyle = `rgba(${palette.fibreDark}, 0.012)`;
    wobblyLine(ctx, [x, 0], [x + between(rng, -3, 3) * u, h], 1.4 * u, rng);
  }

  ctx.restore();
}

function drawFibres(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  palette: ExLibrisPalette,
  rng: Rng,
): void {
  const count = Math.round((w * h) / (u * u * 900));

  ctx.save();
  ctx.lineCap = 'round';

  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = between(rng, 5, 26) * u;
    const angle = rng() * Math.PI * 2;
    const bend = between(rng, -0.6, 0.6) * len;
    const dark = rng() < 0.6;
    const rgb = dark ? palette.fibreDark : palette.fibreLight;
    const alpha = dark
      ? between(rng, 0.02, 0.05)
      : between(rng, ...palette.fibreLightAlpha);
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;

    ctx.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
    ctx.lineWidth = between(rng, 0.35, 1) * u;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      (x + ex) / 2 - Math.sin(angle) * bend,
      (y + ey) / 2 + Math.cos(angle) * bend,
      ex,
      ey,
    );
    ctx.stroke();
  }

  ctx.restore();
}

/** Laid paper: formation, laid lines, two chain lines, fibres, grain. */
export function drawLaidPaper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  palette: ExLibrisPalette,
  rng: Rng,
): void {
  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, w, h);
  drawFormation(ctx, w, h, palette, rng);
  drawLaidLines(ctx, w, h, u, palette, rng);
  drawFibres(ctx, w, h, u, palette, rng);
  drawGrain(ctx, w, h, palette.grain, rng);
}

/** Rounded square traced as points, each nudged outward/inward like ink bleeding into fibre. */
function bledSquarePath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  radiusRatio: number,
  bleed: number,
  rng: Rng,
): void {
  const half = size / 2;
  const r = size * radiusRatio;
  const waves = [0, 1, 2].map(() => ({
    freq: Math.floor(between(rng, 3, 11)),
    phase: rng() * Math.PI * 2,
    amp: between(rng, 0.3, 1),
  }));
  const samples = 220;

  ctx.beginPath();

  for (let i = 0; i < samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);
    // Clamp the ray to the square, then swing it onto the corner arc.
    const scale = half / Math.max(Math.abs(dx), Math.abs(dy));
    let px = dx * scale;
    let py = dy * scale;
    const inner = half - r;

    if (Math.abs(px) > inner && Math.abs(py) > inner) {
      const ccx = Math.sign(px) * inner;
      const ccy = Math.sign(py) * inner;
      const a = Math.atan2(py - ccy, px - ccx);
      px = ccx + Math.cos(a) * r;
      py = ccy + Math.sin(a) * r;
    }

    const noise =
      waves.reduce(
        (sum, wv) => sum + Math.sin(theta * wv.freq + wv.phase) * wv.amp,
        0,
      ) /
        3 +
      (rng() - 0.5) * 0.5;
    const len = Math.hypot(px, py);
    const k = (len + noise * bleed) / len;
    const x = cx + px * k;
    const y = cy + py * k;

    if (i === 0) {
      ctx.moveTo(x, y);
      continue;
    }

    ctx.lineTo(x, y);
  }

  ctx.closePath();
}

export interface StampOptions {
  size: number;
  u: number;
  font: string;
  label: string;
}

/**
 * The GK rubber stamp: vermilion body, inner rule and monogram carved out
 * (so the paper shows through), uneven inking and a bled edge.
 */
export function createStamp(
  palette: ExLibrisPalette,
  options: StampOptions,
  rng: Rng,
): Canvas.Canvas {
  const { size, u, font, label } = options;
  const pad = size * 0.2;
  const dim = Math.ceil(size + pad * 2);
  const stamp = Canvas.createCanvas(dim, dim);
  const sctx = stamp.getContext('2d');
  const c = dim / 2;

  sctx.fillStyle = palette.stamp;
  bledSquarePath(sctx, c, c, size, 0.17, size * 0.008, rng);
  sctx.fill();

  sctx.globalCompositeOperation = 'destination-out';

  // Inner rule
  sctx.globalAlpha = 0.8;
  sctx.lineWidth = Math.max(1.5 * u, size * 0.035);
  sctx.strokeStyle = '#000';
  bledSquarePath(sctx, c, c, size * 0.84, 0.13, size * 0.005, rng);
  sctx.stroke();

  // Monogram, carved with tight tracking and a touch of weight
  sctx.globalAlpha = 1;
  const fontSize = size * 0.42;
  sctx.font = `${fontSize}px "${font}"`;
  sctx.textBaseline = 'middle';
  sctx.fillStyle = '#000';
  sctx.strokeStyle = '#000';
  sctx.lineWidth = fontSize * 0.035;
  sctx.lineJoin = 'round';
  const tracking = -0.01 * fontSize;
  const chars = [...label];
  const widths = chars.map((ch) => sctx.measureText(ch).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let x = c - total / 2;

  chars.forEach((ch, i) => {
    sctx.fillText(ch, x, c + fontSize * 0.04);
    sctx.strokeText(ch, x, c + fontSize * 0.04);
    x += widths[i] + tracking;
  });

  // Uneven inking: pale patches and missed specks
  for (let i = 0; i < 6; i++) {
    sctx.globalAlpha = between(rng, 0.015, 0.04);
    sctx.beginPath();
    sctx.arc(
      c + between(rng, -0.5, 0.5) * size,
      c + between(rng, -0.5, 0.5) * size,
      between(rng, 0.08, 0.25) * size,
      0,
      Math.PI * 2,
    );
    sctx.fill();
  }

  for (let i = 0; i < 36; i++) {
    sctx.globalAlpha = between(rng, 0.25, 0.8);
    sctx.beginPath();
    sctx.arc(
      c + between(rng, -0.52, 0.52) * size,
      c + between(rng, -0.52, 0.52) * size,
      between(rng, 0.2, 0.7) * u,
      0,
      Math.PI * 2,
    );
    sctx.fill();
  }

  return stamp;
}

export function drawStamp(
  ctx: CanvasRenderingContext2D,
  stamp: Canvas.Canvas,
  cx: number,
  cy: number,
  tiltDeg: number,
  palette: ExLibrisPalette,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  ctx.globalCompositeOperation = palette.stampBlend;
  ctx.globalAlpha = 0.94;
  ctx.drawImage(stamp, -stamp.width / 2, -stamp.height / 2);
  ctx.restore();
}
