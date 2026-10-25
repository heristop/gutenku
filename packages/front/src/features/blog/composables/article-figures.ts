import ARTICLE_IMAGE_SIZES from './article-image-sizes.json';

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

      return `<p class="article-lead gk-drop-cap">${inner}</p>`;
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

const SRC_ATTR = /\bsrc="([^"]+)"/;
const STYLE_ATTR = /\bstyle="([^"]*)"/;

/**
 * Gives every known article image its width and height, so the browser
 * reserves the plate before it loads and the text never jumps under the
 * reader. Sizes come from article-image-sizes.json (pnpm generate:image-sizes).
 */
export function sizeImages(
  html: string,
  sizes: Record<string, readonly number[]> = ARTICLE_IMAGE_SIZES,
): string {
  return html.replaceAll(/<img\b[^>]*?(\s*\/?)>/g, (tag, close: string) => {
    const size = sizes[SRC_ATTR.exec(tag)?.[1] ?? ''];

    if (!size || /\bwidth=/.test(tag)) {
      return tag;
    }

    // Its proportions, so the page can size the plate as the original did
    // (a share of the column, capped in height) without waiting for it. An
    // article's own inline style keeps its say: the ratio joins it.
    const ratio = Math.round((size[0] / size[1]) * 1000) / 1000;
    const ratioRule = `--img-ratio: ${ratio};`;

    if (STYLE_ATTR.test(tag)) {
      const styled = tag.replace(STYLE_ATTR, `style="${ratioRule} $1"`);
      const open = styled.slice(0, styled.length - close.length - 1);

      return `${open} width="${size[0]}" height="${size[1]}"${close}>`;
    }

    const open = tag.slice(0, tag.length - close.length - 1);

    return `${open} width="${size[0]}" height="${size[1]}" style="${ratioRule.slice(0, -1)}"${close}>`;
  });
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
