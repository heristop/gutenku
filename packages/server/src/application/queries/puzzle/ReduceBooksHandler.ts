import { injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { ReduceBooksQuery } from './ReduceBooksQuery';
import type { BookValue } from '@gutenku/shared';
import { getGutenGuessBooks, type GutenGuessBook } from '~~/data';
import {
  dateToSeed,
  seededRandom,
  selectDailyBook,
} from '~/domain/services/PuzzleService';
import { z } from 'zod';
import { getNarrowedShelf } from './puzzle-shelf';
import { generateHints, type HintLocale } from './hint-pool';

/**
 * Convert GutenGuessBook to BookValue with localized title
 */
function bookToValue(
  book: GutenGuessBook,
  locale: HintLocale = 'en',
): BookValue {
  return {
    reference: book.id.toString(),
    title: book.title[locale] || book.title.en,
    author: book.author,
  };
}

// Validation schema for date
const reduceBooksSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guessedBookIds: z.array(z.string().max(32)).max(6),
  currentRound: z.number().int().min(1).max(6),
});

@injectable()
export class ReduceBooksHandler implements IQueryHandler<
  ReduceBooksQuery,
  BookValue[]
> {
  async execute(query: ReduceBooksQuery): Promise<BookValue[]> {
    // Validate input
    const validated = reduceBooksSchema.parse({
      date: query.date,
      guessedBookIds: [...(query.guessedBookIds ?? [])],
      currentRound: query.currentRound ?? 1,
    });
    const { date, guessedBookIds, currentRound } = validated;

    // Get locale from query, validate it's supported
    const locale = (
      ['en', 'fr', 'ja'].includes(query.locale) ? query.locale : 'en'
    ) as HintLocale;

    // Get the correct book for today (must be included)
    const correctBook = selectDailyBook(date);

    // The clues open so far (the Bookmoji aside), as the puzzle serves them
    const openHintTypes = generateHints(
      correctBook,
      seededRandom(dateToSeed(date)),
      locale,
    )
      .filter((h) => h.round > 1 && h.round <= currentRound)
      .map((h) => h.type);

    // A subset of the day's shelf: guessed books and the decoys the open
    // clues rule out leave first
    const finalBooks = getNarrowedShelf(
      getGutenGuessBooks(),
      correctBook,
      date,
      {
        guessedIds: guessedBookIds,
        openHintTypes,
        locale,
      },
    );

    return finalBooks.map((book) => bookToValue(book, locale));
  }
}
