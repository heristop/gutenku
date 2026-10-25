import { describe, it, expect } from 'vitest';
import {
  extractMetadata,
  getLocaleFromPath,
  getSlugFromFilename,
  parseFrontmatter,
} from '@/features/blog/composables/article-metadata';

const FALLBACK_DESCRIPTION =
  'Articles about GutenKu, AI haiku generation, and classic literature.';

describe('getLocaleFromPath', () => {
  it('reads the locale from the filename suffix', () => {
    expect(getLocaleFromPath('2026-01-18-post.fr.md')).toBe('fr');
    expect(getLocaleFromPath('2026-01-18-post.ja.md')).toBe('ja');
  });

  it('falls back to the default locale without a suffix', () => {
    expect(getLocaleFromPath('2026-01-18-post.md')).toBe('en');
  });
});

describe('getSlugFromFilename', () => {
  it('drops the date prefix and the locale extension', () => {
    expect(getSlugFromFilename('2026-01-13-a-true-story.en.md')).toBe(
      'a-true-story',
    );
  });
});

describe('parseFrontmatter', () => {
  it('returns the content untouched when there is no frontmatter', () => {
    const content = '# Title\n\nText';

    expect(parseFrontmatter(content)).toEqual({
      frontmatter: {},
      body: content,
    });
  });

  it('reads description and image, unquoting values', () => {
    const { frontmatter, body } = parseFrontmatter(
      '---\ndescription: "A short one"\nimage: \'/a.webp\'\n---\n# Title\n',
    );

    expect(frontmatter).toEqual({
      description: 'A short one',
      image: '/a.webp',
    });
    expect(body).toBe('# Title\n');
  });

  it('ignores lines without a colon and unknown keys', () => {
    const { frontmatter } = parseFrontmatter(
      '---\nnot a pair\nauthor: Someone\ndescription: Kept\n---\nBody\n',
    );

    expect(frontmatter).toEqual({ description: 'Kept' });
  });
});

describe('extractMetadata', () => {
  it('takes the title from the first heading and strips it from the body', () => {
    const result = extractMetadata('# My Title\n\nFirst paragraph.\n');

    expect(result.title).toBe('My Title');
    expect(result.body).toBe('First paragraph.\n');
  });

  it('uses a default title and keeps the body when there is no heading', () => {
    const result = extractMetadata('Just text.');

    expect(result.title).toBe('GutenKu Blog');
    expect(result.body).toBe('Just text.');
  });

  it('prefers the frontmatter image, then the first body image, then the default', () => {
    expect(
      extractMetadata('---\nimage: /front.webp\n---\n# T\n\n![x](/body.webp)\n')
        .image,
    ).toBe('/front.webp');
    expect(extractMetadata('# T\n\n![x](/body.webp)\n').image).toBe(
      '/body.webp',
    );
    expect(extractMetadata('# T\n\nText\n').image).toBe('/og-image.png');
  });

  it('prefers the frontmatter description', () => {
    const result = extractMetadata(
      '---\ndescription: From frontmatter\n---\n# T\n\nFrom body\n',
    );

    expect(result.description).toBe('From frontmatter');
  });

  it('derives the description from the first plain line after the title', () => {
    const body = [
      '# T',
      '',
      '![cover](/c.webp)',
      '_a caption_',
      '## Section',
      '---',
      '',
      'Some **bold** and [a link](http://x.test) and _soft_ text.',
    ].join('\n');

    expect(extractMetadata(body).description).toBe(
      'Some bold and a link and soft text.',
    );
  });

  it('truncates a derived description to 160 characters', () => {
    const result = extractMetadata(`# T\n\n${'a'.repeat(300)}\n`);

    expect(result.description).toHaveLength(160);
  });

  it('ignores text before the title when deriving the description', () => {
    const result = extractMetadata('Intro line\n\n# T\n\nAfter title\n');

    expect(result.description).toBe('After title');
  });

  it('falls back to the site description when nothing can be derived', () => {
    expect(extractMetadata('# T\n').description).toBe(FALLBACK_DESCRIPTION);
    expect(extractMetadata('No title at all').description).toBe(
      FALLBACK_DESCRIPTION,
    );
  });
});
