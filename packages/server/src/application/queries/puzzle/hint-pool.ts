import type { PuzzleHint } from '@gutenku/shared';
import type { GutenGuessBook } from '~~/data';

/**
 * Supported locales for hint translations.
 */
export type HintLocale = 'en' | 'fr' | 'ja';

/**
 * Hint pool with difficulty ratings (lower = revealed earlier, higher = more revealing).
 */
export interface HintDefinition {
  type: PuzzleHint['type'];
  difficulty: number;
  generator: (
    book: GutenGuessBook,
    random: () => number,
    locale: HintLocale,
  ) => string;
}

export const HINT_POOL: HintDefinition[] = [
  {
    type: 'title_word_count',
    difficulty: 2,
    generator: (book, _random, locale) => {
      const title = book.title?.[locale] || book.title?.en || '';
      if (!title) {
        return '0';
      }
      // For Japanese, count ideograms (graphemes) since there are no space-separated words
      if (locale === 'ja') {
        const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
        const ideogramCount = [...segmenter.segment(title)].length;

        return `${ideogramCount}`;
      }
      const count = title.split(/\s+/).length;

      return `${count}`;
    },
  },
  {
    type: 'book_length',
    difficulty: 2,
    generator: (book) => {
      const wc = book.wordCount;

      if (wc < 40000) {
        return 'short';
      }

      if (wc < 80000) {
        return 'medium';
      }

      if (wc < 150000) {
        return 'long';
      }

      return 'epic';
    },
  },
  {
    type: 'genre',
    difficulty: 3,
    generator: (book) => book.genre,
  },
  {
    type: 'era',
    difficulty: 3,
    generator: (book) => book.era,
  },
  {
    type: 'protagonist',
    difficulty: 4,
    generator: (book, _random, locale) =>
      book.protagonist[locale] || book.protagonist.en,
  },
  {
    type: 'publication_century',
    difficulty: 4,
    generator: (book) => {
      const century = Math.floor(book.publicationYear / 100) + 1;
      const suffixes: Record<number, string> = { 21: 'st', 22: 'nd', 23: 'rd' };
      const suffix = suffixes[century] || 'th';

      return `${century}${suffix} century`;
    },
  },
  {
    type: 'setting',
    difficulty: 5,
    generator: (book) => book.setting,
  },
  {
    type: 'quote',
    difficulty: 6,
    generator: (book, random, locale) => {
      const quoteIndex = Math.floor(random() * book.notableQuotes.length);
      const quote = book.notableQuotes[quoteIndex];

      if (!quote) {
        const fallbacks: Record<HintLocale, string> = {
          en: 'A famous quote from this book...',
          fr: 'Une citation célèbre de ce livre...',
          ja: 'この本の有名な引用...',
        };
        return fallbacks[locale];
      }

      return quote[locale] || quote.en;
    },
  },
  {
    type: 'first_letter',
    difficulty: 7,
    generator: (book, _random, locale) => {
      const title = book.title[locale] || book.title.en;
      const firstChar = [...title][0]; // Multi-byte character support
      return `${firstChar.toUpperCase()}...`;
    },
  },
  {
    type: 'author_nationality',
    difficulty: 8,
    generator: (book) => book.authorNationality,
  },
  {
    type: 'author_name',
    difficulty: 10,
    generator: (book, _random, locale) => {
      const firstName = book.author?.split(' ')[0];
      if (firstName) {
        return firstName;
      }
      const fallbacks: Record<HintLocale, string> = {
        en: 'Unknown',
        fr: 'Inconnu',
        ja: '不明',
      };
      return fallbacks[locale];
    },
  },
];
