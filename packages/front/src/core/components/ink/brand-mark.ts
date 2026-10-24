// Sumi ink for type set next to the mark (wordmarks, taglines)
export const SUMI = '#27221F';
export const SUMI_NIGHT = '#ECE6DA';

// The GutenKu mark: an open book, a haiku written on the right page
// (short / long / short) and the small vermilion stamp that signs it.
// Single source for the nav brand (BrandMark.vue) and every app icon
// (scripts/build-app-icons.mjs). Erasable TypeScript only, so Node can
// import this file directly.

export type MarkSize = 'full' | 'small';

export interface MarkColors {
  /** The book, in sumi */
  ink: string;
  /** The three haiku lines, written in ai-iro indigo */
  verse: string;
  paper: string;
  stamp: string;
  onStamp: string;
}

// The book in sumi; only the haiku is written in ai-iro indigo, and the
// vermilion stamp signs it.
export const MARK_LIGHT: MarkColors = {
  ink: '#27221F',
  verse: '#264348',
  paper: '#F5EFE3',
  stamp: '#BC2D29',
  onStamp: '#F8F4EC',
};

export const MARK_DARK: MarkColors = {
  ink: '#ECE6DA',
  verse: '#9FC0C4',
  paper: '#26231F',
  stamp: '#E0675A',
  onStamp: '#1D1A17',
};

// Drawn in a 64-unit sketch space, placed in the 0..100 icon box
const PLACE = 'translate(50 51) scale(1.5) translate(-32 -31)';

const PAGES =
  'M7 20 C 17 15, 26 15, 32 19 C 38 15, 47 15, 57 20 V 47 C 47 43, 38 43, 32 47 C 26 43, 17 43, 7 47 Z';
const SPINE = 'M32 19 V 47';
const PRINT = 'M12 26 h14 M12 31 h14 M12 36 h11';

const SIZES = {
  // 48px and up: faint printed text on the left page, a fine stamp with its rule
  full: {
    book: 2.6,
    haikuWidth: 2.6,
    haiku: 'M37 25 H47 M37 31 H53 M37 37 H46',
    stamp: { x: 46.6, y: 37.8, s: 7, r: 1.3 },
    rule: true,
    print: true,
  },
  // 16-32px: no faint text, heavier strokes, a stamp large enough to read red
  small: {
    book: 3.6,
    haikuWidth: 3.4,
    haiku: 'M36.5 25.5 H46.5 M36.5 31.5 H53 M36.5 37.5 H42',
    stamp: { x: 44.4, y: 35.8, s: 10.6, r: 2 },
    rule: false,
    print: false,
  },
} as const;

const STAMP_TURN = -8;

export interface MarkOptions {
  size?: MarkSize;
  colors?: MarkColors;
  /** Paper tile behind the book (rounded). Off when the host draws its own. */
  tile?: boolean;
  /** Corner radius of the tile in 0..100 units. */
  tileRadius?: number;
  /** Extra `filter="url(#…)"` reference applied to the ink strokes. */
  filter?: string;
}

/** Inner SVG markup for a `viewBox="0 0 100 100"` canvas. */
export function markSvg({
  size = 'full',
  colors = MARK_LIGHT,
  tile = true,
  tileRadius = 18,
  filter = '',
}: MarkOptions = {}): string {
  const k = SIZES[size];
  const f = filter ? ` filter="url(#${filter})"` : '';
  const { x, y, s, r } = k.stamp;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const inset = s * 0.16;

  return [
    tile
      ? `<rect x="2" y="2" width="96" height="96" rx="${tileRadius}" fill="${colors.paper}"/>`
      : '',
    `<g transform="${PLACE}" fill="none" stroke="${colors.ink}" stroke-linecap="round" stroke-linejoin="round"${f}>`,
    `<path d="${PAGES}" stroke-width="${k.book}"/>`,
    `<path d="${SPINE}" stroke-width="${k.book * 0.8}"/>`,
    k.print
      ? `<path d="${PRINT}" stroke-width="1.4" stroke-opacity="0.3"/>`
      : '',
    `<path d="${k.haiku}" stroke="${colors.verse}" stroke-width="${k.haikuWidth}"/>`,
    '</g>',
    `<g transform="${PLACE} rotate(${STAMP_TURN} ${cx} ${cy})">`,
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="${colors.stamp}"/>`,
    k.rule
      ? `<rect x="${x + inset}" y="${y + inset}" width="${s - inset * 2}" height="${s - inset * 2}" rx="${r * 0.6}" fill="none" stroke="${colors.onStamp}" stroke-width="0.45" stroke-opacity="0.85"/>`
      : '',
    '</g>',
  ].join('');
}

/** Single-colour silhouette (Safari pinned tab, monochrome contexts). */
export function markMonochrome(): string {
  const k = SIZES.small;
  const { x, y, s, r } = k.stamp;
  const cx = x + s / 2;
  const cy = y + s / 2;

  return [
    `<g transform="${PLACE}" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">`,
    `<path d="${PAGES}" stroke-width="${k.book}"/>`,
    `<path d="${SPINE}" stroke-width="${k.book * 0.8}"/>`,
    `<path d="${k.haiku}" stroke-width="${k.haikuWidth}"/>`,
    '</g>',
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="#000" transform="${PLACE} rotate(${STAMP_TURN} ${cx} ${cy})"/>`,
  ].join('');
}

/** The mark's parts, for drawings that animate it (the loading book). */
export const MARK_PARTS = {
  place: PLACE,
  pages: PAGES,
  spine: SPINE,
  small: SIZES.small,
  stampTurn: STAMP_TURN,
} as const;
