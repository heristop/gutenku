export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

// Below this many sections an article reads fine without a contents list
export const TOC_MIN_HEADINGS = 3;

// The reading line sits 30% down the viewport: a heading above it is "read"
export const READING_LINE = 0.3;

const HEADING = /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g;
const ID_ATTR = /\sid="([^"]*)"/;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeEntities(text: string): string {
  return text.replaceAll(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (whole, code: string) => {
      if (code.startsWith('#')) {
        const point =
          code[1].toLowerCase() === 'x'
            ? Number.parseInt(code.slice(2), 16)
            : Number.parseInt(code.slice(1), 10);

        return Number.isFinite(point) ? String.fromCodePoint(point) : whole;
      }

      return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
    },
  );
}

export function headingText(innerHtml: string): string {
  return decodeEntities(innerHtml.replaceAll(/<[^>]+>/g, ''))
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Readable, URL-safe id for a heading. Latin accents fold to their base
 * letter ("Éthique" -> "ethique"); other scripts (kana, kanji) are kept.
 */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize('NFKD')
    .replaceAll(/\p{M}/gu, '')
    .toLowerCase()
    .replaceAll(/['’]/g, '')
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '');

  return slug || 'section';
}

function uniqueId(base: string, taken: Set<string>): string {
  let id = base;
  let n = 2;

  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }

  taken.add(id);

  return id;
}

/**
 * Gives every h2/h3 of the rendered article a stable id (keeping any id the
 * markdown already set) and returns the outline for the contents list.
 */
export function addHeadingIds(html: string): {
  html: string;
  headings: TocHeading[];
} {
  const headings: TocHeading[] = [];
  const taken = new Set<string>();

  // Authored ids win: reserve them before slugging the rest
  for (const match of html.matchAll(HEADING)) {
    const authored = ID_ATTR.exec(match[2])?.[1];

    if (authored) {
      taken.add(authored);
    }
  }

  const out = html.replaceAll(
    HEADING,
    (_whole, level: string, attrs: string, inner: string) => {
      const text = headingText(inner);
      const authored = ID_ATTR.exec(attrs)?.[1];
      const id = authored || uniqueId(slugifyHeading(text), taken);

      if (text) {
        headings.push({ id, text, level: level === '2' ? 2 : 3 });
      }

      const rest = authored ? attrs : `${attrs} id="${id}"`;

      return `<h${level}${rest}>${inner}</h${level}>`;
    },
  );

  return { html: out, headings };
}

/**
 * Index of the section being read: the last heading whose top has crossed
 * the reading line. At the very end of the page the last section wins even
 * when it is too short to reach the line. -1 before the first heading.
 */
export function pickActiveHeading(
  tops: readonly number[],
  line: number,
  atEnd = false,
): number {
  if (tops.length === 0) {
    return -1;
  }

  if (atEnd) {
    return tops.length - 1;
  }

  // Tops run in document order; a 1px tolerance absorbs subpixel landings
  const firstBelow = tops.findIndex((top) => top - 1 > line);

  return firstBelow === -1 ? tops.length - 1 : firstBelow - 1;
}

/**
 * How much of the article body has passed the reading line, from 0 to 1.
 */
export function readingFraction(
  bodyTop: number,
  bodyHeight: number,
  line: number,
): number {
  if (bodyHeight <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, (line - bodyTop) / bodyHeight));
}
