import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { SubmitGuessQuery } from './SubmitGuessQuery';
import type { GuessResult, PuzzleHint, BookValue } from '@gutenku/shared';
import {
  getGutenGuessBooks,
  type GutenGuessBook,
} from '~/cli/gutenguess-books';
import {
  type IGlobalStatsRepository,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';

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
 * Generate hint for a specific round
 */
function generateHintForRound(book: GutenGuessBook, round: number): PuzzleHint {
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

  const hints: Record<number, PuzzleHint> = {
    1: {
      round: 1,
      type: 'haiku',
      content:
        haikus[book.genre] ||
        'Pages turn with care\nStories waiting to be read\nFind the hidden tale',
    },
    2: {
      round: 2,
      type: 'emoticons',
      content: book.emoticons,
    },
    3: {
      round: 3,
      type: 'genre_era',
      content: `${book.genre}, ${book.era}`,
    },
    4: {
      round: 4,
      type: 'quote',
      content: book.notableQuotes[0] || 'A famous quote from this book...',
    },
    5: {
      round: 5,
      type: 'letter_author',
      content: `${book.title[0].toUpperCase()}... by a ${book.authorNationality} author`,
    },
    6: {
      round: 6,
      type: 'author_name',
      content: book.author.split(' ')[0],
    },
  };

  return hints[round];
}

/**
 * Convert GutenGuessBook to BookValue
 */
function bookToValue(book: GutenGuessBook): BookValue {
  return {
    reference: book.id.toString(),
    title: book.title,
    author: book.author,
    emoticons: book.emoticons,
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
    const { date, guessedBookId, currentRound } = query;

    // Get the correct book for today
    const correctBook = selectDailyBook(date);
    const isCorrect = correctBook.id.toString() === guessedBookId;

    if (isCorrect) {
      // Fire-and-forget - don't block the response
      this.globalStatsRepository.incrementGamePlayed(true).catch(() => {});
      return {
        isCorrect: true,
        correctBook: bookToValue(correctBook),
      };
    }

    // Wrong guess - provide next hint if available
    const nextRound = currentRound + 1;

    if (nextRound <= 6) {
      return {
        isCorrect: false,
        nextHint: generateHintForRound(correctBook, nextRound),
      };
    }

    // Game over - reveal the correct book
    // Fire-and-forget - don't block the response
    this.globalStatsRepository.incrementGamePlayed(false).catch(() => {});
    return {
      isCorrect: false,
      correctBook: bookToValue(correctBook),
    };
  }
}
