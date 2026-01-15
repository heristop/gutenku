import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { SubmitGuessQuery } from './SubmitGuessQuery';
import {
  getPuzzleNumber,
  type GuessResult,
  type PuzzleHint,
  type BookValue,
} from '@gutenku/shared';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import {
  type IGlobalStatsRepository,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';
import { submitGuessSchema } from '~/infrastructure/validation/schemas';

/**
 * Mulberry32 seeded PRNG for deterministic random selection
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to numeric seed
 */
function dateToSeed(dateStr: string): number {
  if (!dateStr) {
    return 0;
  }
  const [year, month, day] = dateStr.split('-').map(Number);

  return year * 10000 + month * 100 + day;
}

/**
 * Select book for the given date. Matches GetDailyPuzzleHandler logic.
 */
function selectDailyBook(dateStr: string): GutenGuessBook {
  const books = getGutenGuessBooks();
  const puzzleNumber = getPuzzleNumber(dateStr);

  // Determine which cycle we're in (each cycle = N books)
  const cycleNumber = Math.floor((puzzleNumber - 1) / books.length);
  const positionInCycle = (puzzleNumber - 1) % books.length;

  // Shuffle books deterministically for this cycle
  const cycleSeed = cycleNumber * 1_000_000 + 42;
  const random = seededRandom(cycleSeed);
  const shuffledBooks = shuffleWithSeed([...books], random);

  return shuffledBooks[positionInCycle];
}

/**
 * Supported locales for hint translations.
 */
type HintLocale = 'en' | 'fr' | 'ja';

/**
 * Hint pool with difficulty ratings (lower = revealed earlier, higher = more revealing).
 */
interface HintDefinition {
  type: PuzzleHint['type'];
  difficulty: number;
  generator: (
    book: GutenGuessBook,
    random: () => number,
    locale: HintLocale,
  ) => string;
}

const HINT_POOL: HintDefinition[] = [
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

      return `Published in the ${century}${suffix} century`;
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
        return 'A famous quote from this book...';
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
    generator: (book) => book.author?.split(' ')[0] || 'Unknown',
  },
];

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate 6 hints for the book: emoticons (round 1) + 5 randomly selected hints from pool.
 * Excludes era/publication_century pairs. Sorts by difficulty. Uses seeded PRNG.
 */
function generateAllHints(
  book: GutenGuessBook,
  dateStr: string,
  locale: HintLocale = 'en',
): PuzzleHint[] {
  const seed = dateToSeed(dateStr);
  const random = seededRandom(seed);

  // Round 1: Always emoticons
  const hints: PuzzleHint[] = [
    {
      round: 1,
      type: 'emoticons',
      content: book.emoticons,
    },
  ];

  // Shuffle the hint pool and select 5
  const shuffledPool = shuffleWithSeed([...HINT_POOL], random);
  const selectedHints = shuffledPool.slice(0, 5);

  // Exclusion rule: era and publication_century cannot both appear
  const hasEra = selectedHints.some((h) => h.type === 'era');
  const hasCentury = selectedHints.some(
    (h) => h.type === 'publication_century',
  );

  if (hasEra && hasCentury) {
    // Remove era and find a replacement from remaining pool
    const eraIndex = selectedHints.findIndex((h) => h.type === 'era');
    const remaining = shuffledPool.slice(5);
    const replacement = remaining.find(
      (h) => h.type !== 'era' && h.type !== 'publication_century',
    );

    if (replacement) {
      selectedHints[eraIndex] = replacement;
    }
  }

  // Sort by difficulty (ascending = harder hints first, easier hints later)
  selectedHints.sort((a, b) => a.difficulty - b.difficulty);

  // Generate content for each selected hint and assign rounds 2-6
  for (let i = 0; i < selectedHints.length; i++) {
    const hintDef = selectedHints[i];
    hints.push({
      round: i + 2,
      type: hintDef.type,
      content: hintDef.generator(book, random, locale),
    });
  }

  return hints;
}

/**
 * Generate hint for a specific round
 */
function generateHintForRound(
  book: GutenGuessBook,
  dateStr: string,
  round: number,
  locale: HintLocale = 'en',
): PuzzleHint {
  return generateAllHints(book, dateStr, locale)[round - 1];
}

/**
 * Convert GutenGuessBook to BookValue with localized title and summary
 */
function bookToValue(
  book: GutenGuessBook,
  locale: HintLocale = 'en',
): BookValue {
  return {
    reference: book.id.toString(),
    title: book.title[locale] || book.title.en,
    author: book.author,
    emoticons: book.emoticons,
    summary: book.summary[locale] || book.summary.en,
  };
}

@injectable()
export class SubmitGuessHandler implements IQueryHandler<
  SubmitGuessQuery,
  GuessResult
> {
  constructor(
    @inject(IGlobalStatsRepositoryToken)
    private readonly globalStatsRepository: IGlobalStatsRepository,
  ) {}

  async execute(query: SubmitGuessQuery): Promise<GuessResult> {
    // Validate input parameters
    const validated = submitGuessSchema.parse({
      date: query.date,
      guessedBookId: query.guessedBookId,
      currentRound: query.currentRound,
    });

    const { date, guessedBookId, currentRound } = validated;

    // Get locale from query, default to 'en', validate it's a supported locale
    const locale = (
      ['en', 'fr', 'ja'].includes(query.locale) ? query.locale : 'en'
    ) as HintLocale;

    // Get the correct book for today
    const correctBook = selectDailyBook(date);
    const isCorrect = correctBook.id.toString() === guessedBookId;

    // Prepare hint stats for stats tracking
    // Round hints = currentRound - 1 (round 1 has no hint, round 2 has 1 hint revealed, etc.)
    const roundHints = Math.max(0, currentRound - 1);
    const hintStats = {
      emoticonScratches: query.hints?.emoticonScratches ?? 0,
      haikuReveals: query.hints?.haikuReveals ?? 0,
      roundHints,
    };

    if (isCorrect) {
      // Fire-and-forget - don't block the response
      this.globalStatsRepository
        .incrementGamePlayed(true, hintStats)
        .catch(() => {});
      return {
        isCorrect: true,
        correctBook: bookToValue(correctBook, locale),
        allHints: generateAllHints(correctBook, date, locale),
      };
    }

    // Wrong guess - provide next hint if available
    const nextRound = currentRound + 1;

    if (nextRound <= 6) {
      return {
        isCorrect: false,
        nextHint: generateHintForRound(correctBook, date, nextRound, locale),
      };
    }

    // Game over - reveal the correct book and all hints
    // Fire-and-forget - don't block the response
    this.globalStatsRepository
      .incrementGamePlayed(false, hintStats)
      .catch(() => {});
    return {
      isCorrect: false,
      correctBook: bookToValue(correctBook, locale),
      allHints: generateAllHints(correctBook, date, locale),
    };
  }
}
