import Canvas, { type CanvasRenderingContext2D } from 'canvas';
import type { HaikuValue } from '~/shared/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '~/shared/constants/canvas';
import {
  PALETTES,
  createRng,
  createStamp,
  drawStamp,
  hashSeed,
  type Rng,
} from '~/shared/themes/exlibris-paper';
import {
  EXLIBRIS_FONT,
  drawTracked,
  ellipsize,
  layoutPoem,
  setFont,
  squash,
  trackedWidth,
} from '~/shared/themes/exlibris-type';
import { GK } from '~/shared/themes/gutenku-palette';

/**
 * Catalogue: the haiku filed under its book, typed onto a library catalogue
 * card laid on indigo bookcloth. Call number in the margin, author and title
 * at the head, the poem on the ruled lines, the tracing at the foot, the
 * GK stamp, and the punched hole the card hung by in its drawer.
 * Sizes are in units of the 900x1125 daily card.
 */
const FONT_PATH = './src/shared/assets/fonts/JMH Typewriter.ttf';

const CLOTH = '#1F383C';
const CARD = '#F3ECDD';
const RULE_BLUE = 'rgba(38, 67, 72, 0.2)';
const RULE_RED = 'rgba(188, 45, 41, 0.62)';
const CARD_TILT = -1.2;

interface CardLayout {
  width: number;
  height: number;
  pad: number;
  margin: number;
  lineGap: number;
  head: number;
  poemTop: number;
  poemRows: number;
  footTop: number;
}

/** Bookcloth: a dyed linen weave, a little worn at the edges. */
function drawCloth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  rng: Rng,
): void {
  ctx.fillStyle = CLOTH;
  ctx.fillRect(0, 0, w, h);

  const step = Math.max(2, 2.4 * u);

  ctx.lineWidth = Math.max(1, 0.9 * u);

  for (let x = 0; x < w; x += step) {
    ctx.strokeStyle = `rgba(255, 252, 244, ${0.018 + rng() * 0.03})`;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (rng() - 0.5) * 2 * u, h);
    ctx.stroke();
  }

  for (let y = 0; y < h; y += step) {
    ctx.strokeStyle = `rgba(4, 12, 14, ${0.05 + rng() * 0.06})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + (rng() - 0.5) * 2 * u);
    ctx.stroke();
  }

  // Slubs: the odd thicker thread that makes linen look like linen
  for (let i = 0; i < 260; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (20 + rng() * 60) * u;

    ctx.strokeStyle = `rgba(255, 252, 244, ${0.03 + rng() * 0.04})`;
    ctx.lineWidth = (0.8 + rng() * 1.2) * u;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (rng() - 0.5) * 2 * u);
    ctx.stroke();
  }

  // Handled edges go darker
  const vignette = ctx.createRadialGradient(
    w / 2,
    h * 0.45,
    Math.min(w, h) * 0.25,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );

  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/** Smooth card stock: flat colour, a fine grain, a few fibres. */
function drawCardStock(
  ctx: CanvasRenderingContext2D,
  card: CardLayout,
  u: number,
  rng: Rng,
): void {
  ctx.fillStyle = CARD;
  ctx.fillRect(0, 0, card.width, card.height);

  const dots = Math.round((card.width * card.height) / (14 * u * u));

  for (let i = 0; i < dots; i++) {
    const shade = rng() < 0.5 ? '39, 34, 31' : '255, 252, 244';

    ctx.fillStyle = `rgba(${shade}, ${0.03 + rng() * 0.05})`;
    ctx.fillRect(rng() * card.width, rng() * card.height, u, u);
  }

  for (let i = 0; i < 40; i++) {
    const x = rng() * card.width;
    const y = rng() * card.height;

    ctx.strokeStyle = `rgba(39, 34, 31, ${0.04 + rng() * 0.05})`;
    ctx.lineWidth = 0.7 * u;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + (rng() - 0.5) * 18 * u,
      y + (rng() - 0.5) * 18 * u,
      x + (rng() - 0.5) * 30 * u,
      y + (rng() - 0.5) * 30 * u,
    );
    ctx.stroke();
  }
}

/** The printed rules: red under the heading, blue for each typed line. */
function drawRules(
  ctx: CanvasRenderingContext2D,
  card: CardLayout,
  u: number,
): void {
  ctx.lineWidth = 1.6 * u;
  ctx.strokeStyle = RULE_RED;
  ctx.beginPath();
  ctx.moveTo(0, card.head);
  ctx.lineTo(card.width, card.head);
  ctx.stroke();

  // The red margin rule the call number sits behind
  ctx.lineWidth = 1.2 * u;
  ctx.beginPath();
  ctx.moveTo(card.margin - 14 * u, 0);
  ctx.lineTo(card.margin - 14 * u, card.height);
  ctx.stroke();

  ctx.strokeStyle = RULE_BLUE;
  ctx.lineWidth = 1.1 * u;

  for (
    let y = card.head + card.lineGap;
    y < card.height - card.lineGap * 0.4;
    y += card.lineGap
  ) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(card.width, y);
    ctx.stroke();
  }
}

function typeLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  size: number,
  color: string,
  tracking = 0,
): void {
  setFont(ctx, size);
  ctx.fillStyle = color;
  drawTracked(ctx, text, x, baseline, tracking);
}

/** "Dumas, Alexandre": catalogue order, surname first. */
function catalogueName(author: string): string {
  const parts = author.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return author;
  }

  const surname = parts.pop();

  return `${surname}, ${parts.join(' ')}`;
}

function renderCard(
  haiku: HaikuValue,
  u: number,
  maxWidth: number,
  rng: Rng,
): Canvas.Canvas {
  // Measure on a scratch context: the card's height follows its content
  const probe = Canvas.createCanvas(10, 10).getContext('2d');
  const pad = 46 * u;
  const margin = 132 * u;
  const width = maxWidth;
  const textWidth = width - margin - pad;
  const verses = (haiku.verses ?? []).map(squash).filter(Boolean);
  const poem = layoutPoem(probe, verses, textWidth, u * 0.82);
  const lineGap = Math.max(poem.fontSize * 1.5, 34 * u);
  const headSize = 19 * u;
  const head = pad + headSize * 1.5 * 3 + 10 * u;
  const poemTop = head + lineGap;
  const poemRows = poem.lines.length;
  const footTop = poemTop + lineGap * (poemRows + 0.6);
  const height = Math.max(width * 0.62, footTop + lineGap * 1.7 + pad);

  const card: CardLayout = {
    width,
    height,
    pad,
    margin,
    lineGap,
    head,
    poemTop,
    poemRows,
    footTop,
  };

  const canvas = Canvas.createCanvas(Math.round(width), Math.round(height));
  const ctx = canvas.getContext('2d');

  drawCardStock(ctx, card, u, rng);
  drawRules(ctx, card, u);

  // Call number in the margin: the Gutenberg shelf, then the book's number
  const reference = squash(haiku.book?.reference);
  const callSize = 17 * u;

  typeLine(
    ctx,
    'PG',
    pad * 0.75,
    pad + callSize,
    callSize,
    GK.ink,
    0.06 * callSize,
  );

  if (reference) {
    typeLine(
      ctx,
      reference,
      pad * 0.75,
      pad + callSize * 2.5,
      callSize,
      GK.ink,
      0.04 * callSize,
    );
  }

  // Heading: author (catalogue order), title indented, then the chapter
  const author = squash(haiku.book?.author);
  const title = squash(haiku.book?.title);
  const chapter = squash(haiku.chapter?.title);
  const headLines = [
    {
      text: author ? catalogueName(author) : 'Anonymous',
      indent: 0,
      color: GK.ink,
    },
    { text: title, indent: 2, color: GK.ink },
    { text: chapter, indent: 2, color: GK.inkSoft },
  ];

  setFont(ctx, headSize);
  headLines.forEach((line, i) => {
    if (!line.text) {
      return;
    }

    const x = margin + line.indent * headSize * 0.6;
    const fit = ellipsize(ctx, line.text, width - pad - x);

    typeLine(ctx, fit, x, pad + headSize * (1 + i * 1.5), headSize, line.color);
  });

  // The poem sits on the blue rules, a typed line per rule
  poem.lines.forEach((line, i) => {
    typeLine(
      ctx,
      line.text,
      margin + line.indent * poem.fontSize,
      // Each typed line rests on its rule, descenders through it
      poemTop + lineGap * i - 3 * u,
      poem.fontSize,
      GK.ink,
      poem.tracking,
    );
  });

  // Tracing: what the card is filed under, on the first free rule after
  // the poem
  const tracingBaseline =
    head + lineGap * (Math.ceil((footTop - head) / lineGap) + 1) - 3 * u;
  const haikuTitle = squash(haiku.title).replaceAll(/^["']+|["']+$/g, '');
  const tracingSize = 15 * u;
  const tracing = haikuTitle ? `1. Haiku.  I. ${haikuTitle}.` : '1. Haiku.';

  setFont(ctx, tracingSize);
  typeLine(
    ctx,
    ellipsize(ctx, tracing, width - margin - pad - 110 * u),
    margin,
    tracingBaseline,
    tracingSize,
    GK.inkSoft,
  );

  // The GK stamp, pressed over the lower right corner
  const stampSize = 76 * u;
  const stamp = createStamp(
    PALETTES.day,
    { size: stampSize, u, font: EXLIBRIS_FONT, label: 'GK' },
    rng,
  );

  drawStamp(
    ctx,
    stamp,
    width - pad - stampSize * 0.45,
    height - pad - stampSize * 0.35,
    -7,
    PALETTES.day,
  );

  // The punched hole: cut clean through, the cloth shows beneath
  const holeR = 13 * u;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(width / 2, height - pad * 0.62, holeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return canvas;
}

function drawCardBehind(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  u: number,
  rng: Rng,
): void {
  const card: CardLayout = {
    width,
    height,
    pad: 0,
    margin: 132 * u,
    lineGap: height,
    head: 0,
    poemTop: 0,
    poemRows: 0,
    footTop: 0,
  };
  const sheet = Canvas.createCanvas(Math.round(width), Math.round(height));
  const sheetCtx = sheet.getContext('2d');

  drawCardStock(sheetCtx, card, u, rng);
  // Seen at an angle, a step back: a shade darker
  sheetCtx.fillStyle = 'rgba(39, 34, 31, 0.08)';
  sheetCtx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(cx + 10 * u, cy - 34 * u);
  ctx.rotate((1.8 * Math.PI) / 180);
  ctx.shadowColor = 'rgba(2, 10, 12, 0.4)';
  ctx.shadowBlur = 24 * u;
  ctx.shadowOffsetY = 8 * u;
  ctx.drawImage(sheet, -width / 2, -height / 2);
  ctx.restore();
}

export function renderCatalogue(haiku: HaikuValue): Canvas.Canvas {
  Canvas.registerFont(FONT_PATH, { family: EXLIBRIS_FONT });

  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;
  const u = Math.min(w / 900, h / 1125);
  const rng = createRng(
    hashSeed(
      `${(haiku.verses ?? []).join('|')}#${haiku.book?.reference ?? ''}#catalogue`,
    ),
  );

  const canvas = Canvas.createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  drawCloth(ctx, w, h, u, rng);

  const card = renderCard(haiku, u, 790 * u, rng);
  const cx = w / 2;
  const cy = h * 0.47;

  // The next card in the drawer, blank, showing above this one
  drawCardBehind(ctx, card.width, card.height, cx, cy, u, rng);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((CARD_TILT * Math.PI) / 180);
  // A card resting on cloth: a soft, slightly low shadow
  ctx.shadowColor = 'rgba(2, 10, 12, 0.5)';
  ctx.shadowBlur = 34 * u;
  ctx.shadowOffsetY = 14 * u;
  ctx.drawImage(card, -card.width / 2, -card.height / 2);
  ctx.restore();

  // Colophon, stamped small in the cloth below the card
  const size = 13 * u;

  setFont(ctx, size);
  ctx.fillStyle = 'rgba(243, 236, 221, 0.55)';
  const text = 'GutenKu · gutenku.xyz';
  const tracking = 0.12 * size;

  drawTracked(
    ctx,
    text,
    (w - trackedWidth(ctx, text, tracking)) / 2,
    h - 52 * u,
    tracking,
  );

  return canvas;
}

export default {
  async create(haiku: HaikuValue): Promise<Canvas.Canvas> {
    return renderCatalogue(haiku);
  },
};
