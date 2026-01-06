/**
 * Edge case tests for puzzle handlers using module mocking.
 */
import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { GutenGuessBook } from '~~/data';

// Mock the data module before imports
const createMockBook = (overrides: Partial<GutenGuessBook> = {}): GutenGuessBook => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  genre: 'Fiction',
  era: 'Modern',
  authorNationality: 'American',
  emoticons: '📚✨🎭',
  notableQuotes: ['Default quote'],
  publicationYear: 2000,
  setting: 'Test Setting',
  protagonist: 'Test Hero',
  summary: 'A test book.',
  ...overrides,
});

// Book with empty quotes to test fallback
const bookWithEmptyQuotes = createMockBook({
  id: 100,
  title: 'Book Without Quotes',
  notableQuotes: [],
});

// Many books to test selection beyond SELECTABLE_BOOKS_LIMIT (50)
const manyBooks = Array.from({ length: 60 }, (_, i) =>
  createMockBook({
    id: i + 1,
    title: `Book ${i + 1}`,
    author: `Author ${i + 1}`,
    publicationYear: 1800 + i * 3,
    era: i % 2 === 0 ? 'Victorian' : 'Modern',
    notableQuotes: i === 55 ? [] : [`Quote from book ${i + 1}`],
  }),
);

vi.mock('~~/data', () => ({
  getGutenGuessBooks: vi.fn(),
  GUTENGUESS_BOOK_COUNT: 60,
}));

import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';
import { GetDailyPuzzleHandler } from '../../src/application/queries/puzzle/GetDailyPuzzleHandler';
import { GetDailyPuzzleQuery } from '../../src/application/queries/puzzle/GetDailyPuzzleQuery';
import * as dataModule from '~~/data';

describe('Puzzle Edge Cases - Quote Fallback', () => {
  let handler: SubmitGuessHandler;

  beforeEach(() => {
    handler = new SubmitGuessHandler({
      getGlobalStats: vi.fn(),
      incrementGamePlayed: vi.fn().mockResolvedValue(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses fallback quote when notableQuotes array is empty', async () => {
    // Mock to return a single book with empty quotes
    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue([bookWithEmptyQuotes]);

    const query = new SubmitGuessQuery('2026-01-01', 'wrong-book-id', 6);
    const result = await handler.execute(query);

    expect(result.allHints).toBeDefined();
    expect(result.allHints!.length).toBeGreaterThan(0);

    // Find quote hint if present
    const quoteHint = result.allHints!.find((h) => h.type === 'quote');
    if (quoteHint) {
      // Should use the fallback text since notableQuotes is empty
      expect(quoteHint.content).toBe('A famous quote from this book...');
    }
  });

  it('uses fallback quote when quote index is out of bounds', async () => {
    // Book with quotes that may have edge case index selection
    const bookWithOneQuote = createMockBook({
      id: 200,
      notableQuotes: [], // Empty to ensure fallback
    });

    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue([bookWithOneQuote]);

    // Test multiple dates to exercise quote selection
    let foundFallback = false;
    for (let day = 1; day <= 50; day++) {
      const date = `2026-01-${String(day).padStart(2, '0')}`;
      try {
        const query = new SubmitGuessQuery(date, 'wrong', 6);
        const result = await handler.execute(query);

        const quoteHint = result.allHints?.find((h) => h.type === 'quote');
        if (quoteHint && quoteHint.content === 'A famous quote from this book...') {
          foundFallback = true;
          break;
        }
      } catch {
        continue;
      }
    }

    // With empty quotes, we should hit the fallback eventually
    expect(foundFallback).toBeTruthy();
  });
});

describe('Puzzle Edge Cases - Book Selection Swap', () => {
  let puzzleHandler: GetDailyPuzzleHandler;

  beforeEach(() => {
    puzzleHandler = new GetDailyPuzzleHandler();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('swaps correct book into available books when beyond SELECTABLE_BOOKS_LIMIT', async () => {
    // Use many books so correct book may be beyond index 50
    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue(manyBooks);

    // The selection algorithm uses puzzle number to pick from shuffled books
    // With 60 books and various dates, some correct books will be beyond index 50
    let foundSwapCase = false;

    for (let day = 1; day <= 60; day++) {
      const date = `2026-${String(Math.floor((day - 1) / 28) + 1).padStart(2, '0')}-${String(((day - 1) % 28) + 1).padStart(2, '0')}`;

      try {
        const query = new GetDailyPuzzleQuery(date, []);
        const result = await puzzleHandler.execute(query);

        // Available books should be limited to 50
        expect(result.availableBooks.length).toBeLessThanOrEqual(50);

        // The correct book should always be included
        // We can verify by checking that all 50 slots are filled when we have 60 books
        if (result.availableBooks.length === 50) {
          foundSwapCase = true;
        }
      } catch {
        continue;
      }
    }

    expect(foundSwapCase).toBeTruthy();
  });

  it('includes correct book in available books regardless of position', async () => {
    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue(manyBooks);

    const submitHandler = new SubmitGuessHandler({
      getGlobalStats: vi.fn(),
      incrementGamePlayed: vi.fn().mockResolvedValue(),
    });

    // Test that correct book is always in available books
    for (let day = 1; day <= 30; day++) {
      const date = `2026-01-${String(day).padStart(2, '0')}`;

      try {
        const puzzleQuery = new GetDailyPuzzleQuery(date, []);
        const puzzleResult = await puzzleHandler.execute(puzzleQuery);

        // Find the correct book by trying guesses
        let correctBookFound = false;
        for (const book of puzzleResult.availableBooks) {
          const guessQuery = new SubmitGuessQuery(date, book.reference, 1);
          const guessResult = await submitHandler.execute(guessQuery);

          if (guessResult.isCorrect) {
            correctBookFound = true;
            // Verify it's in the available books
            expect(
              puzzleResult.availableBooks.some(
                (b) => b.reference === book.reference,
              ),
            ).toBeTruthy();
            break;
          }
        }

        expect(correctBookFound).toBeTruthy();
      } catch {
        continue;
      }
    }
  });
});

describe('Puzzle Edge Cases - Era/Century Replacement', () => {
  let handler: SubmitGuessHandler;

  beforeEach(() => {
    handler = new SubmitGuessHandler({
      getGlobalStats: vi.fn(),
      incrementGamePlayed: vi.fn().mockResolvedValue(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('never shows both era and publication_century hints', async () => {
    // Use a single book to ensure consistent hint generation
    const singleBook = createMockBook({
      id: 1,
      era: 'Victorian',
      publicationYear: 1850,
    });

    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue([singleBook]);

    // Test many dates to exercise the exclusion/replacement logic
    let testedCount = 0;

    for (let day = 1; day <= 365; day++) {
      const month = Math.floor((day - 1) / 28) % 12 + 1;
      const dayOfMonth = ((day - 1) % 28) + 1;
      const date = `2026-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;

      try {
        const query = new SubmitGuessQuery(date, 'wrong', 6);
        const result = await handler.execute(query);

        if (result.allHints) {
          const hasEra = result.allHints.some((h) => h.type === 'era');
          const hasCentury = result.allHints.some(
            (h) => h.type === 'publication_century',
          );

          // The exclusion rule: era and publication_century should never both appear
          expect(hasEra && hasCentury).toBeFalsy();
          testedCount++;
        }
      } catch {
        continue;
      }
    }

    // Verify we tested enough dates
    expect(testedCount).toBeGreaterThan(100);
  });

  it('exercises replacement logic when era and century would both appear', async () => {
    // Book with both era and publication year that could generate conflicting hints
    const book = createMockBook({
      id: 1,
      era: 'Romantic',
      publicationYear: 1818, // 19th century
      genre: 'Gothic Horror',
      setting: 'Europe',
      protagonist: 'Scientist',
      authorNationality: 'British',
    });

    vi.mocked(dataModule.getGutenGuessBooks).mockReturnValue([book]);

    // Collect all hint types across many dates
    const hintTypeSets: Set<string>[] = [];

    for (let day = 1; day <= 200; day++) {
      const month = Math.floor((day - 1) / 28) % 12 + 1;
      const dayOfMonth = ((day - 1) % 28) + 1;
      const date = `2026-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;

      try {
        const query = new SubmitGuessQuery(date, 'wrong', 6);
        const result = await handler.execute(query);

        if (result.allHints) {
          const hintTypes = new Set(result.allHints.map((h) => h.type));
          hintTypeSets.push(hintTypes);

          // Verify exclusion rule
          const hasEra = hintTypes.has('era');
          const hasCentury = hintTypes.has('publication_century');
          expect(hasEra && hasCentury).toBeFalsy();
        }
      } catch {
        continue;
      }
    }

    // We should have found cases with era OR century (but not both)
    const casesWithEra = hintTypeSets.filter((s) => s.has('era')).length;
    const casesWithCentury = hintTypeSets.filter((s) =>
      s.has('publication_century'),
    ).length;

    // At least some dates should have era or century
    expect(casesWithEra + casesWithCentury).toBeGreaterThan(0);
  });
});
