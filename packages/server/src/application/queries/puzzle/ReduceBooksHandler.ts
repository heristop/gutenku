import { injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { ReduceBooksQuery } from './ReduceBooksQuery';
import { getPuzzleNumber, type BookValue } from '@gutenku/shared';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import { z } from 'zod';

// Limit when using the book reduction lifeline
const REDUCED_BOOKS_LIMIT = 30;

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
 * Convert date string to numeric seed, offset from main puzzle seed
 */
function dateToReduceSeed(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Add offset to differentiate from main puzzle seed
  return year * 10000 + month * 100 + day + 7777;
}

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
 * Convert GutenGuessBook to BookValue
 */
function bookToValue(book: GutenGuessBook): BookValue {
  return {
    reference: book.id.toString(),
    title: book.title,
    author: book.author,
  };
}

// Validation schema for date
const reduceBooksSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

@injectable()
export class ReduceBooksHandler implements IQueryHandler<
  ReduceBooksQuery,
  BookValue[]
> {
  async execute(query: ReduceBooksQuery): Promise<BookValue[]> {
    // Validate input
    const validated = reduceBooksSchema.parse({ date: query.date });
    const { date } = validated;

    // Get the correct book for today (must be included)
    const correctBook = selectDailyBook(date);

    // Get all available books
    const allBooks = getGutenGuessBooks();

    // Use seeded random for deterministic selection
    const seed = dateToReduceSeed(date);
    const random = seededRandom(seed);

    // Remove correct book from pool, shuffle, take N-1
    const otherBooks = allBooks.filter((b) => b.id !== correctBook.id);
    const shuffledOthers = shuffleWithSeed(otherBooks, random);
    const selectedOthers = shuffledOthers.slice(0, REDUCED_BOOKS_LIMIT - 1);

    // Add correct book and shuffle final list
    const finalBooks = shuffleWithSeed(
      [...selectedOthers, correctBook],
      random,
    );

    return finalBooks.map(bookToValue);
  }
}
