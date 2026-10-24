import Canvas, { type CanvasRenderingContext2D } from 'canvas';
import type { HaikuValue } from '~/shared/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '~/shared/constants/canvas';
import {
  PALETTES,
  createRng,
  createStamp,
  drawLaidPaper,
  drawStamp,
  hashSeed,
  type ExLibrisMode,
  type ExLibrisPalette,
} from '~/shared/themes/exlibris-paper';
import { placePlate } from '~/shared/themes/exlibris-plate';
import {
  EXLIBRIS_FONT,
  drawTracked,
  ellipsize,
  layoutPoem,
  setFont,
  squash,
  trackedWidth,
  type PoemLayout,
} from '~/shared/themes/exlibris-type';

export type { ExLibrisMode } from '~/shared/themes/exlibris-paper';
export { EXLIBRIS_FONT } from '~/shared/themes/exlibris-type';

/**
 * Ex Libris: the haiku typed onto a library-book page. Laid paper, a printer's
 * rule, the poem as the only focal point, then the signature and one
 * vermilion GK stamp pressed after it. Every size derives from the canvas, in
 * units of the 900x1125 daily card.
 */
export interface ExLibrisOptions {
  width?: number;
  height?: number;
  mode?: ExLibrisMode;
  /** Shown in the colophon as "No. <number>" when given. */
  number?: string | number;
  /** Date typed at the head of the page; defaults to today (UTC). */
  date?: Date;
  /**
   * An illustration printed as a plate above the poem, as a frontispiece
   * faces a title page. Steps aside when long verses need the room.
   */
  plate?: Canvas.Image;
}

const FONT_PATH = './src/shared/assets/fonts/JMH Typewriter.ttf';
const STAMP_TILT = -6;
const POEM_LEADING = 1.45;

interface Run {
  text: string;
  color: string;
}

interface Metrics {
  u: number;
  stamp: number;
  stampGap: number;
  sig: number;
  note: number;
}

interface SignatureBlock {
  lines: Run[][];
  note: string;
  textWidth: number;
  textHeight: number;
  height: number;
}

interface Heading {
  text: string;
  size: number;
  gap: number;
}

const runsText = (runs: Run[]) => runs.map((r) => r.text).join('');

/** "cut from <Book>, <Author>": one line when it fits, else book and author stacked. */
function signatureLines(
  ctx: CanvasRenderingContext2D,
  haiku: HaikuValue,
  maxWidth: number,
  palette: ExLibrisPalette,
): Run[][] {
  const lead = 'cut from ';
  const title = squash(haiku.book?.title);
  const author = squash(haiku.book?.author);
  const single: Run[] = [
    { text: lead, color: palette.inkSoft },
    { text: title, color: palette.ink },
    { text: author ? `, ${author}` : '', color: palette.inkSoft },
  ];

  if (ctx.measureText(runsText(single)).width <= maxWidth) {
    return [single];
  }

  const titleFit = ellipsize(
    ctx,
    title,
    maxWidth - ctx.measureText(lead).width,
  );
  const lines: Run[][] = [
    [
      { text: lead, color: palette.inkSoft },
      { text: titleFit, color: palette.ink },
    ],
  ];

  if (author) {
    lines.push([
      { text: ellipsize(ctx, author, maxWidth), color: palette.inkSoft },
    ]);
  }

  return lines;
}

function layoutSignature(
  ctx: CanvasRenderingContext2D,
  haiku: HaikuValue,
  contentWidth: number,
  m: Metrics,
  palette: ExLibrisPalette,
): SignatureBlock {
  setFont(ctx, m.note);
  const chapter = squash(haiku.chapter?.title);
  const note = chapter ? ellipsize(ctx, chapter, contentWidth * 0.6) : '';
  const noteWidth = note ? ctx.measureText(note).width : 0;

  setFont(ctx, m.sig);
  const maxWidth = Math.min(
    contentWidth - m.stamp - m.stampGap,
    contentWidth * 0.78,
  );
  const lines = signatureLines(ctx, haiku, maxWidth, palette);
  const textWidth = Math.max(
    noteWidth,
    ...lines.map((l) => ctx.measureText(runsText(l)).width),
  );
  const textHeight = lines.length * m.sig * 1.5 + (note ? m.note * 1.6 : 0);

  return {
    lines,
    note,
    textWidth,
    textHeight,
    height: Math.max(textHeight, m.stamp * 1.05),
  };
}

function drawRunsRightAligned(
  ctx: CanvasRenderingContext2D,
  runs: Run[],
  right: number,
  y: number,
): void {
  let x = right - ctx.measureText(runsText(runs)).width;

  for (const run of runs) {
    ctx.fillStyle = run.color;
    ctx.fillText(run.text, x, y);
    x += ctx.measureText(run.text).width;
  }
}

/** Signature right-aligned, then the rakkan pressed just after it. */
function drawSignature(
  ctx: CanvasRenderingContext2D,
  block: SignatureBlock,
  right: number,
  top: number,
  m: Metrics,
  palette: ExLibrisPalette,
  stamp: Canvas.Canvas,
): void {
  const textRight = right - m.stamp - m.stampGap;
  const lineHeight = m.sig * 1.5;
  let y = top + (block.height - block.textHeight) / 2;

  setFont(ctx, m.sig);

  for (const runs of block.lines) {
    y += lineHeight;
    drawRunsRightAligned(ctx, runs, textRight, y - lineHeight * 0.3);
  }

  if (block.note) {
    setFont(ctx, m.note);
    y += m.note * 1.6;
    drawRunsRightAligned(
      ctx,
      [{ text: block.note, color: palette.inkSoft }],
      textRight,
      y - m.note * 0.45,
    );
  }

  drawStamp(
    ctx,
    stamp,
    right - m.stamp / 2,
    top + block.height / 2,
    STAMP_TILT,
    palette,
  );
}

function layoutHeading(
  ctx: CanvasRenderingContext2D,
  haiku: HaikuValue,
  poemSize: number,
  maxWidth: number,
  u: number,
): Heading | null {
  const raw = squash(haiku.title).replaceAll(/^["']+|["']+$/g, '');

  if (!raw) {
    return null;
  }

  const size = Math.min(30 * u, Math.max(20 * u, poemSize * 0.6));
  setFont(ctx, size);

  return {
    text: ellipsize(ctx, raw, maxWidth, -0.01 * size),
    size,
    gap: poemSize * 1.25,
  };
}

function drawPoem(
  ctx: CanvasRenderingContext2D,
  poem: PoemLayout,
  left: number,
  top: number,
  ink: string,
): void {
  const lineHeight = poem.fontSize * POEM_LEADING;
  let y = top;

  setFont(ctx, poem.fontSize);
  ctx.fillStyle = ink;

  for (const line of poem.lines) {
    y += lineHeight;
    drawTracked(
      ctx,
      line.text,
      left + line.indent * poem.fontSize,
      y - lineHeight * 0.3,
      poem.tracking,
    );
  }
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "Friday · 23 October", typed small at the head of the page. */
export function dateLine(date: Date): string {
  return `${WEEKDAYS[date.getUTCDay()]} · ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

function colophonText(options: ExLibrisOptions): string {
  if (options.number !== undefined && options.number !== '') {
    return `GutenKu · No. ${options.number} · gutenku.xyz`;
  }

  return 'GutenKu · gutenku.xyz';
}

function drawSmallLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  size: number,
  color: string,
  align: 'left' | 'center',
): void {
  const tracking = 0.08 * size;
  setFont(ctx, size);
  ctx.fillStyle = color;
  const left =
    align === 'center' ? x - trackedWidth(ctx, text, tracking) / 2 : x;
  drawTracked(ctx, text, left, baseline, tracking);
}

interface FocalRoom {
  left: number;
  width: number;
  headerBaseline: number;
  colophonBaseline: number;
  focalHeight: number;
  tailHeight: number;
  h: number;
  u: number;
}

/**
 * Where the title and poem start. Alone, the poem centres on the optical
 * centre (45% down) with its signature right under it; under a plate, the
 * whole block centres in the room the plate leaves.
 */
function focalTop(
  ctx: CanvasRenderingContext2D,
  plate: Canvas.Image | undefined,
  room: FocalRoom,
): number {
  const { u, h, focalHeight, tailHeight } = room;
  const lowest = room.colophonBaseline - 48 * u - tailHeight - focalHeight;
  const placed = plate ? placePlate(ctx, plate, { ...room, lowest }) : null;

  if (!placed) {
    return Math.max(
      room.headerBaseline + 48 * u,
      Math.min(lowest, h * 0.45 - focalHeight / 2),
    );
  }

  return Math.max(
    placed.highest,
    Math.min(lowest, placed.opticalCentre - (focalHeight + tailHeight) / 2),
  );
}

export function renderExLibris(
  haiku: HaikuValue,
  options: ExLibrisOptions = {},
): Canvas.Canvas {
  Canvas.registerFont(FONT_PATH, { family: EXLIBRIS_FONT });

  const w = options.width ?? CANVAS_WIDTH;
  const h = options.height ?? CANVAS_HEIGHT;
  const u = Math.min(w / 900, h / 1125);
  const m: Metrics = {
    u,
    stamp: 66 * u,
    stampGap: 18 * u,
    sig: 18 * u,
    note: 15 * u,
  };
  const palette = PALETTES[options.mode ?? 'day'];
  const verses = (haiku.verses ?? []).map(squash).filter(Boolean);
  const rng = createRng(
    hashSeed(`${verses.join('|')}#${haiku.book?.reference ?? ''}`),
  );

  const canvas = Canvas.createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawLaidPaper(ctx, w, h, u, palette, rng);

  const margin = 64 * u;
  const content = { left: margin, right: w - margin };
  const contentWidth = content.right - content.left;
  const poem = layoutPoem(ctx, verses, contentWidth, u);
  const heading = layoutHeading(ctx, haiku, poem.fontSize, contentWidth, u);
  const sig = layoutSignature(ctx, haiku, contentWidth, m, palette);

  const headerBaseline = margin + 12 * u;
  const colophonBaseline = h - 40 * u;
  const headingHeight = heading ? heading.size + heading.gap : 0;
  const poemHeight = poem.lines.length * poem.fontSize * POEM_LEADING;
  const focalHeight = headingHeight + poemHeight;
  const sigGap = poem.fontSize * 0.9;
  const tailHeight = sigGap + sig.height;

  let y = focalTop(ctx, options.plate, {
    left: content.left,
    width: contentWidth,
    headerBaseline,
    colophonBaseline,
    focalHeight,
    tailHeight,
    h,
    u,
  });

  drawSmallLine(
    ctx,
    dateLine(options.date ?? new Date()),
    content.left,
    headerBaseline,
    15 * u,
    palette.inkSoft,
    'left',
  );

  const poemLeft = Math.max(content.left, (w - poem.width) / 2);

  if (heading) {
    setFont(ctx, heading.size);
    ctx.fillStyle = palette.ink;
    drawTracked(
      ctx,
      heading.text,
      poemLeft,
      y + heading.size,
      -0.01 * heading.size,
      heading.size * 0.045,
    );
  }

  y += headingHeight;
  drawPoem(ctx, poem, poemLeft, y, palette.ink);
  y += poemHeight + sigGap;

  const sigRight = Math.min(
    content.right,
    Math.max(
      poemLeft + poem.width,
      content.left + sig.textWidth + m.stampGap + m.stamp,
    ),
  );
  const stamp = createStamp(
    palette,
    { size: m.stamp, u, font: EXLIBRIS_FONT, label: 'GK' },
    rng,
  );
  drawSignature(ctx, sig, sigRight, y, m, palette, stamp);
  drawSmallLine(
    ctx,
    colophonText(options),
    w / 2,
    colophonBaseline,
    12 * u,
    palette.inkSoft,
    'center',
  );

  return canvas;
}

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    return renderExLibris(haiku);
  },
};
