import { describe, expect, it } from 'vitest';
import {
  addHeadingIds,
  decodeEntities,
  pickActiveHeading,
  readingFraction,
  slugifyHeading,
} from '@/features/blog/composables/article-toc';

describe('slugifyHeading', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyHeading('The Skeptical Discovery')).toBe(
      'the-skeptical-discovery',
    );
  });

  it('folds French accents and drops apostrophes', () => {
    expect(slugifyHeading("Ce qu'il faut retenir : l'éthique")).toBe(
      'ce-quil-faut-retenir-lethique',
    );
    expect(slugifyHeading('Œuvre à côté')).toBe('œuvre-a-cote');
  });

  it('keeps Japanese text and trims punctuation', () => {
    expect(slugifyHeading('「俳句」とは？')).toBe('俳句-とは');
  });

  it('falls back when nothing is left', () => {
    expect(slugifyHeading('!!!')).toBe('section');
  });
});

describe('decodeEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeEntities('We&#39;re &amp; &quot;you&quot; &#x2014;')).toBe(
      'We\'re & "you" —',
    );
  });

  it('leaves unknown entities alone', () => {
    expect(decodeEntities('&bogus;')).toBe('&bogus;');
  });
});

describe('addHeadingIds', () => {
  it('adds ids to h2 and h3 and returns the outline', () => {
    const { html, headings } = addHeadingIds(
      '<h1>Title</h1><h2>One</h2><p>x</p><h3>Sub <em>part</em></h3><h4>Deep</h4>',
    );

    expect(html).toBe(
      '<h1>Title</h1><h2 id="one">One</h2><p>x</p><h3 id="sub-part">Sub <em>part</em></h3><h4>Deep</h4>',
    );
    expect(headings).toEqual([
      { id: 'one', text: 'One', level: 2 },
      { id: 'sub-part', text: 'Sub part', level: 3 },
    ]);
  });

  it('de-duplicates repeated headings', () => {
    const { headings } = addHeadingIds(
      '<h2>Notes</h2><h3>Notes</h3><h2>Notes</h2>',
    );

    expect(headings.map((h) => h.id)).toEqual(['notes', 'notes-2', 'notes-3']);
  });

  it('keeps authored ids and avoids colliding with them', () => {
    const { html, headings } = addHeadingIds(
      '<h2>Intro</h2><h2 id="intro">Opening</h2>',
    );

    expect(html).toBe('<h2 id="intro-2">Intro</h2><h2 id="intro">Opening</h2>');
    expect(headings.map((h) => h.id)).toEqual(['intro-2', 'intro']);
  });

  it('decodes entities in the label', () => {
    const { headings } = addHeadingIds('<h2>The Fraud We&#39;re All In</h2>');

    expect(headings[0]).toEqual({
      id: 'the-fraud-were-all-in',
      text: "The Fraud We're All In",
      level: 2,
    });
  });

  it('is stable across renders', () => {
    const source = '<h2>A</h2><h2>B</h2><h3>A</h3>';

    expect(addHeadingIds(source)).toEqual(addHeadingIds(source));
  });

  it('skips empty headings from the outline', () => {
    const { headings } = addHeadingIds('<h2><img src="x"></h2><h2>Real</h2>');

    expect(headings.map((h) => h.text)).toEqual(['Real']);
  });
});

describe('pickActiveHeading', () => {
  const line = 300;

  it('is -1 before the first heading reaches the line', () => {
    expect(pickActiveHeading([400, 900], line)).toBe(-1);
  });

  it('picks the last heading above the reading line', () => {
    expect(pickActiveHeading([-800, -100, 250, 700], line)).toBe(2);
  });

  it('counts a heading sitting on the line', () => {
    expect(pickActiveHeading([-100, 300.5], line)).toBe(1);
  });

  it('activates the last section at the end of the page', () => {
    expect(pickActiveHeading([-900, 200, 600], line, true)).toBe(2);
  });

  it('handles an empty outline', () => {
    expect(pickActiveHeading([], line, true)).toBe(-1);
  });
});

describe('readingFraction', () => {
  it('is 0 before the body reaches the line', () => {
    expect(readingFraction(500, 2000, 300)).toBe(0);
  });

  it('grows as the body passes the line', () => {
    expect(readingFraction(-700, 2000, 300)).toBe(0.5);
  });

  it('clamps at 1 and guards an empty body', () => {
    expect(readingFraction(-5000, 2000, 300)).toBe(1);
    expect(readingFraction(0, 0, 300)).toBe(0);
  });
});
