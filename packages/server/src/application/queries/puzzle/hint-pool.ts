import type { PuzzleHint } from '@gutenku/shared';
import type { GutenGuessBook } from '~~/data';
import { shuffleWithSeed } from '~/domain/services/PuzzleService';

/**
 * Supported locales for hint translations.
 */
export type HintLocale = 'en' | 'fr' | 'ja';

/**
 * How much a clue gives away against a 50-book shelf.
 * - soft: needs knowledge and still leaves most of the shelf open
 * - medium: cuts the shelf to a handful for a reader who knows the books
 *   (or, for the title word count, for anyone reading the spines)
 * - sharp: usually settles it (a quote, the title's first letter, the
 *   author's first name, all readable against the shelf)
 */
export type HintTier = 'soft' | 'medium' | 'sharp';

/**
 * Hint pool with difficulty ratings (lower = revealed earlier, higher = more
 * revealing). Ratings never overlap across tiers, so sorting by difficulty
 * keeps the tiers in order.
 */
export interface HintDefinition {
  type: PuzzleHint['type'];
  tier: HintTier;
  difficulty: number;
  generator: (
    book: GutenGuessBook,
    random: () => number,
    locale: HintLocale,
  ) => string;
}

/** The century a book was first published in (1813 → 19) */
export function centuryOf(book: GutenGuessBook): number {
  return Math.floor(book.publicationYear / 100) + 1;
}

/**
 * Words in the localized title. Japanese has no spaces, so its titles count
 * graphemes instead.
 */
export function titleWordCount(
  book: GutenGuessBook,
  locale: HintLocale,
): number {
  const title = book.title?.[locale] || book.title?.en || '';

  if (!title) {
    return 0;
  }

  if (locale === 'ja') {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });

    return [...segmenter.segment(title)].length;
  }

  return title.split(/\s+/).length;
}

/** First character of the localized title, upper-cased (multi-byte safe) */
export function titleFirstLetter(
  book: GutenGuessBook,
  locale: HintLocale,
): string {
  const title = book.title?.[locale] || book.title?.en || '';

  return ([...title][0] ?? '').toUpperCase();
}

export const HINT_POOL: HintDefinition[] = [
  {
    type: 'title_word_count',
    tier: 'medium',
    difficulty: 4,
    generator: (book, _random, locale) => `${titleWordCount(book, locale)}`,
  },
  {
    type: 'book_length',
    tier: 'soft',
    difficulty: 1,
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
    tier: 'medium',
    difficulty: 4,
    generator: (book) => book.genre,
  },
  {
    type: 'era',
    tier: 'soft',
    difficulty: 3,
    generator: (book) => book.era,
  },
  {
    type: 'protagonist',
    tier: 'soft',
    difficulty: 2,
    generator: (book, _random, locale) =>
      book.protagonist[locale] || book.protagonist.en,
  },
  {
    type: 'publication_century',
    tier: 'soft',
    difficulty: 1,
    generator: (book) => {
      const century = centuryOf(book);
      const suffixes: Record<number, string> = { 21: 'st', 22: 'nd', 23: 'rd' };
      const suffix = suffixes[century] || 'th';

      return `${century}${suffix} century`;
    },
  },
  {
    type: 'setting',
    tier: 'medium',
    difficulty: 5,
    generator: (book) => book.setting,
  },
  {
    type: 'quote',
    tier: 'sharp',
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
    tier: 'sharp',
    difficulty: 7,
    generator: (book, _random, locale) =>
      `${titleFirstLetter(book, locale)}...`,
  },
  {
    type: 'author_nationality',
    tier: 'soft',
    difficulty: 2,
    generator: (book) => book.authorNationality,
  },
  {
    type: 'author_name',
    tier: 'sharp',
    difficulty: 8,
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

/**
 * The day's clue ramp after the Bookmoji: two soft clues, two medium, one
 * sharp. Every day then climbs the same curve (round 6, the last try, always
 * gets a clue that can settle it) instead of a random draw that could open
 * on the author's name or end on the book's length.
 */
export const HINT_PLAN: ReadonlyArray<readonly [HintTier, number]> = [
  ['soft', 2],
  ['medium', 2],
  ['sharp', 1],
];

// Era and publication century tell the same story: never both in one day
const EXCLUSIVE_PAIRS: ReadonlyArray<
  readonly [PuzzleHint['type'], PuzzleHint['type']]
> = [['era', 'publication_century']];

function conflicts(def: HintDefinition, picked: HintDefinition[]): boolean {
  return EXCLUSIVE_PAIRS.some(
    ([a, b]) =>
      (def.type === a && picked.some((p) => p.type === b)) ||
      (def.type === b && picked.some((p) => p.type === a)),
  );
}

/**
 * Pick the day's five clue definitions following HINT_PLAN, in reveal order.
 * Consumes the seeded PRNG once for the pool shuffle.
 */
export function selectHintDefinitions(
  random: () => number,
  pool: readonly HintDefinition[] = HINT_POOL,
): HintDefinition[] {
  const shuffled = shuffleWithSeed([...pool], random);
  const picked: HintDefinition[] = [];

  for (const [tier, count] of HINT_PLAN) {
    let taken = 0;

    for (const def of shuffled) {
      if (taken === count) {
        break;
      }

      if (def.tier !== tier || picked.includes(def) || conflicts(def, picked)) {
        continue;
      }
      picked.push(def);
      taken++;
    }
  }

  return picked.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * All six clues for a book: the Bookmoji (round 1) then the planned ramp
 * (rounds 2-6). Shared by the puzzle and the guess handlers so both always
 * agree on what each round reveals.
 */
export function generateHints(
  book: GutenGuessBook,
  random: () => number,
  locale: HintLocale = 'en',
): PuzzleHint[] {
  const hints: PuzzleHint[] = [
    { round: 1, type: 'emoticons', content: book.emoticons },
  ];

  for (const [i, def] of selectHintDefinitions(random).entries()) {
    hints.push({
      round: i + 2,
      type: def.type,
      content: def.generator(book, random, locale),
    });
  }

  return hints;
}
