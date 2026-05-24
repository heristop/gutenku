import { describe, expect, it } from 'vitest';
import type { HaikuValue } from '../src/types/haiku';
import {
  formatAuthorHashtag,
  generateSocialCaption,
  maskBookTitle,
} from '../src/utils/social';

describe('maskBookTitle', () => {
  it('keeps spaces and the first vowel found, masking everything else', () => {
    // First vowel in "Moby Dick" is 'o'. Spaces and 'o' (case-insensitive) survive.
    expect(maskBookTitle('Moby Dick')).toBe('*o** ****');
  });

  it('preserves the chosen vowel case-insensitively', () => {
    // First vowel is 'A' (uppercase). Both 'A' and 'a' survive; spaces kept.
    expect(maskBookTitle('A Tale')).toBe('A *a**');
  });

  it('returns the title unchanged when there is no vowel', () => {
    // No a/e/i/o/u/y in "Grr" -> nonMaskedVowel stays empty.
    expect(maskBookTitle('Grr')).toBe('Grr');
  });

  it('treats y as a vowel', () => {
    // First vowel is 'y'.
    expect(maskBookTitle('Try')).toBe('**y');
  });

  it('returns an empty string unchanged (no vowel branch)', () => {
    expect(maskBookTitle('')).toBe('');
  });
});

describe('formatAuthorHashtag', () => {
  it('lowercases and strips spaces, commas, hyphens, dots and parentheses', () => {
    expect(formatAuthorHashtag('Herman Melville')).toBe('hermanmelville');
    expect(formatAuthorHashtag('Doe, John')).toBe('doejohn');
    expect(formatAuthorHashtag('Jean-Paul Sartre')).toBe('jeanpaulsartre');
    // Parentheses and dots are stripped, but inner letters are preserved.
    expect(formatAuthorHashtag('J.R.R. Tolkien (Sr)')).toBe('jrrtolkiensr');
  });

  it('returns an empty string for empty input', () => {
    expect(formatAuthorHashtag('')).toBe('');
  });
});

function makeHaiku(overrides: Partial<HaikuValue> = {}): HaikuValue {
  return {
    book: {
      reference: 'ref',
      title: 'Moby Dick',
      author: 'Herman Melville',
    },
    chapter: { content: 'chapter content' },
    verses: ['line one', 'line two', 'line three'],
    rawVerses: ['line one', 'line two', 'line three'],
    title: 'An Ocean Whisper',
    cacheUsed: false,
    ...overrides,
  };
}

describe('generateSocialCaption', () => {
  it('returns an empty string when haiku.title is missing', () => {
    const haiku = makeHaiku({ title: undefined });
    expect(generateSocialCaption(haiku)).toBe('');
  });

  it('builds a caption without an emoticons hint when book has no emoticons', () => {
    const haiku = makeHaiku();
    const caption = generateSocialCaption(haiku);

    expect(caption).toContain('🌸  “An Ocean Whisper” 🗻');
    expect(caption).toContain('📚 Guess the book! 👇');
    expect(caption).not.toContain('Bookmoji');
    // First hint becomes "Hint 1 (First letter ...)".
    expect(caption).toContain('💡 Hint 1 (First letter of the book):\nM...');
    expect(caption).toContain('💡 Hint 2 (Author):\nHerman...');
    expect(caption).toContain('📗 Moby Dick by Herman Melville');
    expect(caption).toContain('line one\nline two\nline three');
    expect(caption).toContain(
      '#gutenku #bookstagram #guessthebook #hermanmelville',
    );
    // No translations supplied -> blank flag values.
    expect(caption).toContain('🇫🇷 \n');
    expect(caption).toContain('🇯🇵 ');
  });

  it('includes the Bookmoji hint and shifts hint numbers when emoticons exist', () => {
    const haiku = makeHaiku({
      book: {
        reference: 'ref',
        title: 'Moby Dick',
        author: 'Herman Melville',
        emoticons: '🐳🌊',
      },
    });
    const caption = generateSocialCaption(haiku);

    expect(caption).toContain('💡 Hint 1 (Bookmoji):\n🐳🌊');
    expect(caption).toContain('💡 Hint 2 (First letter of the book):\nM...');
    expect(caption).toContain('💡 Hint 3 (Author):\nHerman...');
  });

  it('uses provided translations and hashtags', () => {
    const haiku = makeHaiku({
      translations: { fr: 'Un souffle', jp: '海のささやき' },
      hashtags: '#poetry #haiku',
    });
    const caption = generateSocialCaption(haiku);

    expect(caption).toContain('🇫🇷 Un souffle');
    expect(caption).toContain('🇯🇵 海のささやき');
    expect(caption).toContain('#hermanmelville #poetry #haiku');
  });

  it('appends extra hashtags from options', () => {
    const haiku = makeHaiku();
    const caption = generateSocialCaption(haiku, {
      extraHashtags: '#daily #books',
    });

    expect(caption).toContain('#hermanmelville #daily #books');
  });

  it('omits extra hashtags when option is empty', () => {
    const haiku = makeHaiku();
    const caption = generateSocialCaption(haiku, { extraHashtags: '' });

    // No double space introduced by extra hashtags; trailing hashtags blank.
    expect(caption).toContain('#guessthebook #hermanmelville');
    expect(caption.endsWith('#hermanmelville')).toBe(true);
  });
});
