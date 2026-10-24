const IMG_TAG = /<img\b[^>]*>/;
const ALT_ATTR = /\balt="([^"]*)"/;

function toFigure(img: string): string {
  const alt = ALT_ATTR.exec(img)?.[1]?.trim();
  const caption = alt ? `<figcaption>${alt}</figcaption>` : '';

  return `<figure class="article-figure">${img}${caption}</figure>`;
}

/**
 * Turns standalone images into captioned figures, using the alt text as the
 * caption. Covers markdown images (wrapped in <p>) and raw <img> blocks.
 */
export function wrapFigures(html: string): string {
  return html
    .replaceAll(
      new RegExp(String.raw`<p>\s*(${IMG_TAG.source})\s*</p>`, 'g'),
      (_, img: string) => toFigure(img),
    )
    .replaceAll(
      new RegExp(String.raw`(^|\n)(${IMG_TAG.source})[ \t]*(?=\n|$)`, 'g'),
      (_, lead: string, img: string) => `${lead}${toFigure(img)}`,
    );
}

const LEAD_MIN_CHARS = 80;

/**
 * Marks the first real prose paragraph (not a figure or a short italic
 * standfirst) so the reading column can open it with a drop cap.
 */
export function markLeadParagraph(html: string): string {
  let marked = false;

  return html.replaceAll(
    /<p>([\s\S]*?)<\/p>/g,
    (whole, inner: string, offset: number) => {
      if (marked || isInsideBlockquote(html, offset)) {
        return whole;
      }

      const text = inner.replaceAll(/<[^>]+>/g, '').trim();
      const startsWithText = /^[\p{L}\p{N}"'“‘(]/u.test(inner.trim());

      if (text.length < LEAD_MIN_CHARS || !startsWithText) {
        return whole;
      }

      marked = true;

      return `<p class="article-lead">${inner}</p>`;
    },
  );
}

// Asides become margin notes: their paragraphs never carry the drop cap
function isInsideBlockquote(html: string, offset: number): boolean {
  const before = html.slice(0, offset);
  const opened = before.split('<blockquote').length - 1;
  const closed = before.split('</blockquote>').length - 1;

  return opened > closed;
}

const ROMAN: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRomanNumeral(value: number): string {
  let rest = Math.floor(value);

  if (rest <= 0) {
    return '';
  }

  let out = '';

  for (const [amount, numeral] of ROMAN) {
    while (rest >= amount) {
      out += numeral;
      rest -= amount;
    }
  }

  return out;
}

/**
 * Defers every article image but the first: the body is prerendered, so all
 * of them would otherwise download with the page and compete with the fonts,
 * scripts and the lead image (the LCP) on a slow connection.
 */
export function lazyLoadImages(html: string): string {
  let seen = 0;

  return html.replaceAll(/<img\b(?![^>]*\bloading=)/g, (tag) => {
    seen += 1;

    return seen === 1 ? tag : `${tag} loading="lazy" decoding="async"`;
  });
}
