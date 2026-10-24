import { describe, expect, it } from 'vitest';
import {
  lazyLoadImages,
  markLeadParagraph,
  toRomanNumeral,
  wrapFigures,
} from '@/features/blog/composables/article-figures';

describe('wrapFigures', () => {
  it('wraps a markdown image paragraph in a captioned figure', () => {
    const html = '<p><img src="/a.webp" alt="An eye reading"></p>';

    expect(wrapFigures(html)).toBe(
      '<figure class="article-figure"><img src="/a.webp" alt="An eye reading"><figcaption>An eye reading</figcaption></figure>',
    );
  });

  it('wraps raw image blocks and skips the caption without alt text', () => {
    const html =
      '<h2>T</h2>\n<img src="/b.png" class="article-img" />\n<p>x</p>';

    expect(wrapFigures(html)).toBe(
      '<h2>T</h2>\n<figure class="article-figure"><img src="/b.png" class="article-img" /></figure>\n<p>x</p>',
    );
  });

  it('leaves inline images inside text alone', () => {
    const html = '<p>see <img src="/c.png" alt="c"> here</p>';

    expect(wrapFigures(html)).toBe(html);
  });
});

describe('toRomanNumeral', () => {
  it('converts positive integers', () => {
    expect(toRomanNumeral(1)).toBe('I');
    expect(toRomanNumeral(4)).toBe('IV');
    expect(toRomanNumeral(14)).toBe('XIV');
    expect(toRomanNumeral(0)).toBe('');
  });
});

describe('markLeadParagraph', () => {
  const long =
    'A Markov chain cannot read, yet it found seventeen syllables of rain in a Victorian novel.';

  it('skips short italic standfirsts and marks the first prose paragraph', () => {
    const html = `<p><em>Anatomy of a fraud</em></p><p>${long}</p><p>${long}</p>`;

    expect(markLeadParagraph(html)).toBe(
      `<p><em>Anatomy of a fraud</em></p><p class="article-lead">${long}</p><p>${long}</p>`,
    );
  });

  it('never puts the drop cap inside a margin note', () => {
    const html = `<blockquote>\n<p>${long}</p>\n</blockquote><p>${long}</p>`;

    expect(markLeadParagraph(html)).toBe(
      `<blockquote>\n<p>${long}</p>\n</blockquote><p class="article-lead">${long}</p>`,
    );
  });

  it('leaves html without prose untouched', () => {
    expect(markLeadParagraph('<h2>Title</h2>')).toBe('<h2>Title</h2>');
  });
});

describe('lazyLoadImages', () => {
  it('keeps the first image eager and defers the others', () => {
    const html = '<img src="a.webp"><p>x</p><img src="b.png"><img src="c.png">';

    expect(lazyLoadImages(html)).toBe(
      '<img src="a.webp"><p>x</p>' +
        '<img loading="lazy" decoding="async" src="b.png">' +
        '<img loading="lazy" decoding="async" src="c.png">',
    );
  });

  it('leaves an image that already sets loading alone', () => {
    const html = '<img src="a.webp"><img loading="eager" src="b.png">';

    expect(lazyLoadImages(html)).toBe(html);
  });
});
