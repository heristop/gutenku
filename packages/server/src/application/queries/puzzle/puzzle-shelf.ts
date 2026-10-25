import type { GutenGuessBook } from '~~/data';
import type { PuzzleHint } from '@gutenku/shared';
import {
  dateToSeed,
  seededRandom,
  shuffleWithSeed,
} from '~/domain/services/PuzzleService';
import {
  centuryOf,
  titleFirstLetter,
  titleWordCount,
  type HintLocale,
} from './hint-pool';

/** Books on the day's shelf */
export const SHELF_SIZE = 50;

/** Books left on the shelf after "Narrow the shelf" */
export const NARROWED_SHELF_SIZE = 30;

/**
 * Share of the decoys drawn from the answer's neighbourhood (same era or same
 * genre). The rest are drawn from the whole catalogue. A third is enough for
 * soft clues to do real work without making the board a wall of look-alikes.
 */
export const NEIGHBOUR_SHARE = 1 / 3;

// Offsets keep the shelf draws independent from the hint and haiku draws,
// which consume the plain date seed
const SHELF_SEED_OFFSET = 3_331;
const NARROW_SEED_OFFSET = 7_777;

function isNeighbour(book: GutenGuessBook, answer: GutenGuessBook): boolean {
  return book.era === answer.era || book.genre === answer.genre;
}

/**
 * The day's decoys, seeded by date: about a third from the answer's
 * neighbourhood (same era or genre), the rest from the whole catalogue.
 * Drawing them fresh each day keeps the shelf from becoming a fixed set in
 * which the one unfamiliar title is the answer.
 */
function getShelfDecoys(
  books: readonly GutenGuessBook[],
  correctBook: GutenGuessBook,
  dateStr: string,
): GutenGuessBook[] {
  const random = seededRandom(dateToSeed(dateStr) + SHELF_SEED_OFFSET);
  const others = shuffleWithSeed(
    books.filter((b) => b.id !== correctBook.id),
    random,
  );
  const wanted = Math.min(SHELF_SIZE - 1, others.length);
  const neighbours = others
    .filter((b) => isNeighbour(b, correctBook))
    .slice(0, Math.round(wanted * NEIGHBOUR_SHARE));
  const picked = new Set(neighbours);
  const rest = others
    .filter((b) => !picked.has(b))
    .slice(0, wanted - neighbours.length);

  return [...neighbours, ...rest];
}

/**
 * The day's shelf: the answer plus up to SHELF_SIZE - 1 decoys, in a
 * date-seeded order.
 */
export function getDailyShelf(
  books: readonly GutenGuessBook[],
  correctBook: GutenGuessBook,
  dateStr: string,
): GutenGuessBook[] {
  const decoys = getShelfDecoys(books, correctBook, dateStr);
  const random = seededRandom(dateToSeed(dateStr));

  return shuffleWithSeed([...decoys, correctBook], random);
}

/** Clue types narrowing can check a decoy against */
type CheckableHint =
  | 'era'
  | 'publication_century'
  | 'genre'
  | 'author_nationality'
  | 'first_letter'
  | 'title_word_count';

const CONTRADICTS: Record<
  CheckableHint,
  (book: GutenGuessBook, answer: GutenGuessBook, locale: HintLocale) => boolean
> = {
  era: (book, answer) => book.era !== answer.era,
  publication_century: (book, answer) => centuryOf(book) !== centuryOf(answer),
  genre: (book, answer) => book.genre !== answer.genre,
  author_nationality: (book, answer) =>
    book.authorNationality !== answer.authorNationality,
  first_letter: (book, answer, locale) =>
    titleFirstLetter(book, locale) !== titleFirstLetter(answer, locale),
  title_word_count: (book, answer, locale) =>
    titleWordCount(book, locale) !== titleWordCount(answer, locale),
};

/** How many of the open clues rule this decoy out */
export function countContradictions(
  book: GutenGuessBook,
  answer: GutenGuessBook,
  openHintTypes: readonly PuzzleHint['type'][],
  locale: HintLocale = 'en',
): number {
  return openHintTypes.filter(
    (type) =>
      type in CONTRADICTS &&
      CONTRADICTS[type as CheckableHint](book, answer, locale),
  ).length;
}

export interface NarrowingState {
  /** Books already guessed (all wrong while the game is open) */
  guessedIds?: readonly string[];
  /** Clue types open so far */
  openHintTypes?: readonly PuzzleHint['type'][];
  locale?: HintLocale;
}

/**
 * The narrowed shelf is a subset of the day's shelf that keeps the answer.
 * Books already guessed leave first, then the decoys the open clues rule out
 * (most contradictions first); a date-seeded draw settles the rest. The same
 * day and state always give the same shelf.
 */
export function getNarrowedShelf(
  books: readonly GutenGuessBook[],
  correctBook: GutenGuessBook,
  dateStr: string,
  state: NarrowingState = {},
): GutenGuessBook[] {
  const { guessedIds = [], openHintTypes = [], locale = 'en' } = state;
  const guessed = new Set(guessedIds);
  const random = seededRandom(dateToSeed(dateStr) + NARROW_SEED_OFFSET);
  const decoys = shuffleWithSeed(
    getShelfDecoys(books, correctBook, dateStr),
    random,
  ).filter((b) => !guessed.has(b.id.toString()));

  // Stable sort: the seeded order breaks ties
  const kept = decoys
    .map((book, order) => ({
      book,
      order,
      misses: countContradictions(book, correctBook, openHintTypes, locale),
    }))
    .sort((a, b) => a.misses - b.misses || a.order - b.order)
    .slice(0, NARROWED_SHELF_SIZE - 1)
    .map((entry) => entry.book);

  return shuffleWithSeed([...kept, correctBook], random);
}
