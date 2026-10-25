import type { CanvasRenderingContext2D } from 'canvas';

export const EXLIBRIS_FONT = 'JMH Typewriter';
const VERSE_INDENTS = [0, 2.2, 1];

export interface PoemLine {
  text: string;
  indent: number;
}

export interface PoemLayout {
  fontSize: number;
  tracking: number;
  lines: PoemLine[];
  width: number;
}

export function squash(text: string | undefined): string {
  return (text ?? '').replaceAll(/\s+/g, ' ').trim();
}

export function setFont(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.font = `${size}px "${EXLIBRIS_FONT}"`;
}

export function trackedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
): number {
  const count = [...text].length;

  if (count === 0) {
    return 0;
  }

  return ctx.measureText(text).width + tracking * (count - 1);
}

/** Draws glyph by glyph so tracking can be set (node-canvas lacks letterSpacing). */
export function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  boldStroke = 0,
): void {
  let cursor = x;

  if (boldStroke > 0) {
    ctx.lineWidth = boldStroke;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle;
  }

  for (const ch of text) {
    ctx.fillText(ch, cursor, y);

    if (boldStroke > 0) {
      ctx.strokeText(ch, cursor, y);
    }

    cursor += ctx.measureText(ch).width + tracking;
  }
}

/** Trims to fit, typewriter-honest: three full stops, never a glyph the face may lack. */
export function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  tracking = 0,
): string {
  const clean = squash(text);

  if (trackedWidth(ctx, clean, tracking) <= maxWidth) {
    return clean;
  }

  const chars = [...clean];

  while (chars.length > 1) {
    chars.pop();
    const candidate = `${chars
      .join('')
      .trimEnd()
      .replace(/[,;:.-]+$/, '')}...`;

    if (trackedWidth(ctx, candidate, tracking) <= maxWidth) {
      return candidate;
    }
  }

  return '...';
}

function wrapWords(
  ctx: CanvasRenderingContext2D,
  text: string,
  firstWidth: number,
  restWidth: number,
  tracking: number,
): string[] {
  const lines: string[] = [];
  let current = '';

  for (const word of text.split(' ').filter(Boolean)) {
    const next = current ? `${current} ${word}` : word;
    const limit = lines.length === 0 ? firstWidth : restWidth;

    if (current && trackedWidth(ctx, next, tracking) > limit) {
      lines.push(current);
      current = word;
      continue;
    }

    current = next;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

/**
 * Staggered verses (+2.2em, +1em), sized so the longest line fills ~75% of
 * the measure; below the floor size, long verses wrap with a hanging indent.
 */
export function layoutPoem(
  ctx: CanvasRenderingContext2D,
  verses: string[],
  maxWidth: number,
  u: number,
): PoemLayout {
  const minSize = 30 * u;
  const maxSize = 66 * u;
  // The longest line should span ~75% of the inner width.
  const target = maxWidth * 0.75;
  const probe = 100;
  setFont(ctx, probe);
  const widestAtProbe = Math.max(
    1,
    ...verses.map(
      (v, i) =>
        (VERSE_INDENTS[i] ?? 0) * probe + trackedWidth(ctx, v, -0.025 * probe),
    ),
  );
  const size = Math.min(
    maxSize,
    Math.max(minSize, (target / widestAtProbe) * probe),
  );

  setFont(ctx, size);
  const tracking = -0.025 * size;
  const lines = verses.flatMap((verse, i) => {
    const indent = VERSE_INDENTS[i] ?? 0;
    const wrapped = wrapWords(
      ctx,
      verse,
      maxWidth - indent * size,
      maxWidth - (indent + 1) * size,
      tracking,
    );

    return wrapped.map((text, j) => ({
      text,
      indent: j === 0 ? indent : indent + 1,
    }));
  });

  const width = Math.max(
    0,
    ...lines.map((l) => l.indent * size + trackedWidth(ctx, l.text, tracking)),
  );

  return { fontSize: size, tracking, lines, width };
}
