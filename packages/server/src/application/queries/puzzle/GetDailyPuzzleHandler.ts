import { injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetDailyPuzzleQuery } from './GetDailyPuzzleQuery';
import type {
  DailyPuzzleResponse,
  PuzzleHint,
  BookValue,
} from '@gutenku/shared';
import {
  getGutenGuessBooks,
  type GutenGuessBook,
} from '~/cli/gutenguess-books';

// Launch date for puzzle numbering (adjust as needed)
const LAUNCH_DATE = new Date('2025-01-01');

/**
 * Mulberry32 seeded PRNG for deterministic random selection
 */
function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    // eslint-disable-next-line unicorn/prefer-math-trunc -- >>> 0 converts to unsigned 32-bit int
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert date string to numeric seed
 */
function dateToSeed(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

/**
 * Calculate puzzle number (days since launch)
 */
function getPuzzleNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const diffTime = date.getTime() - LAUNCH_DATE.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Select deterministic book based on date
 */
function selectDailyBook(dateStr: string): GutenGuessBook {
  const books = getGutenGuessBooks();
  const seed = dateToSeed(dateStr);
  const random = seededRandom(seed);
  const bookIndex = Math.floor(random() * books.length);
  return books[bookIndex];
}

/**
 * Generate all hints for a book
 */
function generateHints(book: GutenGuessBook): PuzzleHint[] {
  return [
    {
      round: 1,
      type: 'haiku',
      content: generateHaikuHint(book),
    },
    {
      round: 2,
      type: 'emoticons',
      content: book.emoticons,
    },
    {
      round: 3,
      type: 'genre_era',
      content: `${book.genre}, ${book.era}`,
    },
    {
      round: 4,
      type: 'quote',
      content: book.notableQuotes[0] || 'A famous quote from this book...',
    },
    {
      round: 5,
      type: 'letter_author',
      content: `${book.title[0].toUpperCase()}... by a ${book.authorNationality} author`,
    },
    {
      round: 6,
      type: 'author_name',
      content: book.author.split(' ')[0],
    },
  ];
}

/**
 * Generate a simple haiku-style hint about the book
 */
function generateHaikuHint(book: GutenGuessBook): string {
  // Simple thematic haiku based on genre
  const haikus: Record<string, string> = {
    Fantasy:
      'Through the looking glass\nWonders bloom in every word\nDreams become quite real',
    'Gothic Horror':
      'Shadows creep and grow\nDarkness hides what fears to light\nMonsters walk among',
    Mystery:
      'Clues in every line\nTruth awaits the keen of eye\nSecrets shall be found',
    Romance:
      'Hearts entwined by fate\nLove blooms despite all the odds\nPassion writes the end',
    Adventure:
      'Brave souls venture forth\nThrough danger and mystery\nGlory awaits them',
    'Science Fiction':
      'Beyond the known stars\nFutures yet to be written\nWonders or warnings',
    'Coming-of-Age':
      'Youth finds its own path\nThrough trials wisdom is born\nGrowth comes with each step',
    'Social Novel':
      'Society shown\nMirrors held to human hearts\nTruth in fiction told',
    Philosophy:
      'Questions without end\nWisdom sought through ancient words\nThink and find your truth',
    'Epic Poetry':
      'Heroes rise and fall\nGods and mortals intertwine\nLegends never die',
  };

  return (
    haikus[book.genre] ||
    'Pages turn with care\nStories waiting to be read\nFind the hidden tale'
  );
}

/**
 * Convert GutenGuess books to BookValue for autocomplete
 */
function getAvailableBooks(): BookValue[] {
  return getGutenGuessBooks().map((book) => ({
    reference: book.id.toString(),
    title: book.title,
    author: book.author,
    emoticons: book.emoticons,
  }));
}

@injectable()
export class GetDailyPuzzleHandler implements IQueryHandler<
  GetDailyPuzzleQuery,
  DailyPuzzleResponse
> {
  async execute(query: GetDailyPuzzleQuery): Promise<DailyPuzzleResponse> {
    const { date, revealedRounds } = query;

    // Select today's book deterministically
    const book = selectDailyBook(date);

    // Generate all hints
    const allHints = generateHints(book);

    // Filter hints based on revealed rounds (for progressive reveal)
    const hints = allHints.filter(
      (hint) => revealedRounds.includes(hint.round) || hint.round === 1,
    );

    return {
      puzzle: {
        date,
        puzzleNumber: getPuzzleNumber(date),
        hints,
      },
      availableBooks: getAvailableBooks(),
    };
  }
}
