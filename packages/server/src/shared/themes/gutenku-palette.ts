import Canvas, { type CanvasRenderingContext2D } from 'canvas';
import type { HaikuValue } from '~/shared/types';
import {
  PALETTES,
  createRng,
  createStamp,
  drawStamp,
  hashSeed,
} from '~/shared/themes/exlibris-paper';
import { EXLIBRIS_FONT } from '~/shared/themes/exlibris-type';

// The site's palette, for the cards that keep their own paper and hand but
// should still read as GutenKu: cream paper, warm ink, indigo, the stamp.
export const GK = {
  paper: PALETTES.day.paper,
  paperDeep: '#ECE4D6',
  paperEdge: '#D9CDB9',
  ink: PALETTES.day.ink,
  inkSoft: PALETTES.day.inkSoft,
  indigo: '#264348',
  onIndigo: '#F8F4EC',
  stamp: PALETTES.day.stamp,
} as const;

const STAMP_FONT_PATH = './src/shared/assets/fonts/JMH Typewriter.ttf';

/**
 * Re-inks a texture already drawn on the canvas: the "color" blend gives it
 * the palette's hue and keeps its own light and grain, as if the same sheet
 * had been made in another dye.
 */
export function dyePaper(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  height: number,
  { warmHighlights = false }: { warmHighlights?: boolean } = {},
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // A dark dye leaves the pale parts (torn edges) a cold tint of itself:
  // through the cream they land back on paper
  if (warmHighlights) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = GK.paper;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/** "- GutenKu" then the seal just after it, the pair right-aligned at `right`. */
export function signWithSeal(
  ctx: CanvasRenderingContext2D,
  haiku: HaikuValue,
  { right, baseline, size }: { right: number; baseline: number; size: number },
  {
    color = GK.inkSoft,
    onDark = false,
  }: { color?: string; onDark?: boolean } = {},
): void {
  const text = '- GutenKu';
  const gap = size * 0.3;
  const textRight = right - size - gap;

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, textRight - ctx.measureText(text).width, baseline);
  ctx.restore();

  // Centred on the text's x-height, as the Ex Libris seal sits by its line
  pressSeal(ctx, haiku, right - size / 2, baseline - size * 0.3, size, {
    onDark,
  });
}

/**
 * The vermilion GK seal pressed after a signature, the same seal the Ex
 * Libris card carries. `cx`/`cy` are its centre; size is in canvas pixels.
 */
export function pressSeal(
  ctx: CanvasRenderingContext2D,
  haiku: HaikuValue,
  cx: number,
  cy: number,
  size: number,
  { onDark = false }: { onDark?: boolean } = {},
): void {
  Canvas.registerFont(STAMP_FONT_PATH, { family: EXLIBRIS_FONT });

  // Multiplied into light paper; pressed over the top of a dark one
  const palette = onDark
    ? { ...PALETTES.day, stampBlend: 'source-over' as const }
    : PALETTES.day;
  const rng = createRng(hashSeed(`${(haiku.verses ?? []).join('|')}#seal`));
  const stamp = createStamp(
    palette,
    { size, u: size / 66, font: EXLIBRIS_FONT, label: 'GK' },
    rng,
  );

  drawStamp(ctx, stamp, cx, cy, -6, palette);
}

/** A drawing dyed in one palette colour, on its own sheet so only it takes the dye. */
export function dyedImage(image: Canvas.Image, color: string): Canvas.Canvas {
  const sheet = Canvas.createCanvas(image.width, image.height);
  const ctx = sheet.getContext('2d');

  ctx.drawImage(image, 0, 0);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = 'color';
  ctx.fillRect(0, 0, image.width, image.height);
  // "color" also paints the transparent ground: cut it back to the drawing
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(image, 0, 0);

  return sheet;
}

/** The torn-paper corners, in the deeper tones of the cream sheet. */
export function drawTornCorners(
  ctx: CanvasRenderingContext2D,
  decor: Canvas.Image,
  width: number,
  height: number,
): void {
  const dyed = dyedImage(decor, GK.paperEdge);
  const scale = Math.max(width / decor.width, height / decor.height);

  ctx.drawImage(
    dyed,
    (width - decor.width * scale) / 2,
    (height - decor.height * scale) / 2,
    decor.width * scale,
    decor.height * scale,
  );
}
