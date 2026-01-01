/* eslint-disable max-lines */
import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetDailyPuzzleHandler } from '../../src/application/queries/puzzle/GetDailyPuzzleHandler';
import { GetDailyPuzzleQuery } from '../../src/application/queries/puzzle/GetDailyPuzzleQuery';
import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';
import { GetGlobalStatsHandler } from '../../src/application/queries/stats/GetGlobalStatsHandler';
import { GetGlobalStatsQuery } from '../../src/application/queries/stats/GetGlobalStatsQuery';
import type { IGlobalStatsRepository } from '../../src/domain/repositories/IGlobalStatsRepository';
import type NaturalLanguageService from '../../src/domain/services/NaturalLanguageService';

describe('Puzzle Handlers', () => {
  describe('GetDailyPuzzleHandler', () => {
    let handler: GetDailyPuzzleHandler;

    beforeEach(() => {
      handler = new GetDailyPuzzleHandler();
    });

    it('returns puzzle for a given date', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      expect(result).toBeDefined();
      expect(result.puzzle).toBeDefined();
      expect(result.puzzle.date).toBe('2026-01-15');
      expect(result.puzzle.puzzleNumber).toBeGreaterThan(0);
      expect(result.puzzle.hints).toBeDefined();
      expect(Array.isArray(result.puzzle.hints)).toBeTruthy();
    });

    it('always includes round 1 hint', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      const round1Hint = result.puzzle.hints.find((h) => h.round === 1);
      expect(round1Hint).toBeDefined();
      expect(round1Hint?.type).toBe('emoticons');
    });

    it('includes revealed rounds in hints', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', [2, 3]);
      const result = await handler.execute(query);

      const rounds = result.puzzle.hints.map((h) => h.round);
      expect(rounds).toContain(1); // Always included
      expect(rounds).toContain(2);
      expect(rounds).toContain(3);
    });

    it('returns available books for autocomplete', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      expect(result.availableBooks).toBeDefined();
      expect(Array.isArray(result.availableBooks)).toBeTruthy();
      expect(result.availableBooks.length).toBeGreaterThan(0);

      const firstBook = result.availableBooks[0];
      expect(firstBook.reference).toBeDefined();
      expect(firstBook.title).toBeDefined();
      expect(firstBook.author).toBeDefined();
    });

    it('returns deterministic puzzle for same date', async () => {
      const query1 = new GetDailyPuzzleQuery('2026-06-15', []);
      const query2 = new GetDailyPuzzleQuery('2026-06-15', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      expect(result1.puzzle.puzzleNumber).toBe(result2.puzzle.puzzleNumber);
      expect(result1.puzzle.hints[0].content).toBe(
        result2.puzzle.hints[0].content,
      );
    });

    it('returns different puzzles for different dates', async () => {
      const query1 = new GetDailyPuzzleQuery('2026-01-15', []);
      const query2 = new GetDailyPuzzleQuery('2026-01-16', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      expect(result1.puzzle.puzzleNumber).not.toBe(result2.puzzle.puzzleNumber);
    });

    it('calculates correct puzzle number from launch date', async () => {
      // Launch date is 2026-01-01, so 2026-01-01 should be puzzle #1
      const query = new GetDailyPuzzleQuery('2026-01-01', []);
      const result = await handler.execute(query);

      expect(result.puzzle.puzzleNumber).toBe(1);
    });

    it('ensures era and publication_century do not both appear', async () => {
      // Test multiple dates to verify the exclusion rule
      const dates = [
        '2026-01-15',
        '2026-02-20',
        '2026-03-25',
        '2026-04-30',
        '2026-05-10',
      ];

      for (const date of dates) {
        const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
        const result = await handler.execute(query);

        const hintTypes = result.puzzle.hints.map((h) => h.type);
        const hasEra = hintTypes.includes('era');
        const hasCentury = hintTypes.includes('publication_century');

        // Both must not appear together
        expect(hasEra && hasCentury).toBeFalsy();
      }
    });

    it('returns correct book in available books list', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      // The correct book for this date should be in availableBooks
      // We can verify by submitting guesses
      const handler2 = new SubmitGuessHandler({
        getGlobalStats: vi.fn(),
        incrementGamePlayed: vi.fn().mockResolvedValue(),
      });

      let foundCorrect = false;
      for (const book of result.availableBooks) {
        const guessQuery = new SubmitGuessQuery(
          '2026-01-15',
          book.reference,
          1,
        );
        const guessResult = await handler2.execute(guessQuery);
        if (guessResult.isCorrect) {
          foundCorrect = true;
          break;
        }
      }

      expect(foundCorrect).toBeTruthy();
    });

    it('shuffles available books deterministically by date', async () => {
      const query1 = new GetDailyPuzzleQuery('2026-01-15', []);
      const query2 = new GetDailyPuzzleQuery('2026-01-15', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      // Same date should produce same book order
      expect(result1.availableBooks.map((b) => b.reference)).toEqual(
        result2.availableBooks.map((b) => b.reference),
      );
    });

    it('returns different book orders for different dates', async () => {
      const query1 = new GetDailyPuzzleQuery('2026-01-15', []);
      const query2 = new GetDailyPuzzleQuery('2026-06-20', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      // Different dates should produce different book orders (with high probability)
      const refs1 = result1.availableBooks.map((b) => b.reference).join(',');
      const refs2 = result2.availableBooks.map((b) => b.reference).join(',');
      expect(refs1).not.toBe(refs2);
    });

    it('includes haikus in puzzle response', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      expect(result.puzzle.haikus).toBeDefined();
      expect(Array.isArray(result.puzzle.haikus)).toBeTruthy();
      // Haikus may be empty if book doesn't have valid 5-7-5 sentences
      expect(result.puzzle.haikus.length).toBeGreaterThanOrEqual(0);
    });

    it('includes emoticon count in puzzle response', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      expect(result.puzzle.emoticonCount).toBeDefined();
      expect(result.puzzle.emoticonCount).toBeGreaterThan(0);
    });

    it('includes next puzzle available time', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', []);
      const result = await handler.execute(query);

      expect(result.puzzle.nextPuzzleAvailableAt).toBeDefined();
      expect(typeof result.puzzle.nextPuzzleAvailableAt).toBe('string');
    });

    it('handles all hint types', async () => {
      const query = new GetDailyPuzzleQuery('2026-01-15', [1, 2, 3, 4, 5, 6]);
      const result = await handler.execute(query);

      const hintTypes = result.puzzle.hints.map((h) => h.type);

      // Round 1 is always emoticons
      expect(hintTypes).toContain('emoticons');

      // Should have 6 hints total (emoticons + 5 from pool)
      expect(result.puzzle.hints).toHaveLength(6);

      // All hint types should be valid
      const validTypes = [
        'emoticons',
        'title_word_count',
        'genre',
        'era',
        'protagonist',
        'publication_century',
        'setting',
        'quote',
        'first_letter',
        'author_nationality',
        'author_name',
      ];
      for (const type of hintTypes) {
        expect(validTypes).toContain(type);
      }
    });
  });

  describe('SubmitGuessHandler', () => {
    let handler: SubmitGuessHandler;
    let mockStatsRepo: IGlobalStatsRepository;

    beforeEach(() => {
      mockStatsRepo = {
        getGlobalStats: vi.fn(),
        incrementGamePlayed: vi.fn().mockResolvedValue(),
      };
      handler = new SubmitGuessHandler(mockStatsRepo);
    });

    it('returns correct result for correct guess', async () => {
      // First get the puzzle to know the correct book
      const puzzleHandler = new GetDailyPuzzleHandler();
      const puzzleQuery = new GetDailyPuzzleQuery('2026-01-15', []);
      const puzzleResult = await puzzleHandler.execute(puzzleQuery);

      // Find a book that matches by testing
      const books = puzzleResult.availableBooks;
      let correctBookId: string | undefined;

      for (const book of books) {
        const guessQuery = new SubmitGuessQuery(
          '2026-01-15',
          book.reference,
          1,
        );
        const guessResult = await handler.execute(guessQuery);
        if (guessResult.isCorrect) {
          correctBookId = book.reference;
          break;
        }
      }

      expect(correctBookId).toBeDefined();

      const query = new SubmitGuessQuery('2026-01-15', correctBookId!, 1);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeTruthy();
      expect(result.correctBook).toBeDefined();
      expect(result.correctBook?.reference).toBe(correctBookId);
    });

    it('returns next hint for wrong guess before round 6', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 3);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeFalsy();
      expect(result.nextHint).toBeDefined();
      expect(result.nextHint?.round).toBe(4);
    });

    it('returns correct book after round 6 wrong guess', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeFalsy();
      expect(result.correctBook).toBeDefined();
      expect(result.nextHint).toBeUndefined();
    });

    it('increments stats on correct guess', async () => {
      const puzzleHandler = new GetDailyPuzzleHandler();
      const puzzleQuery = new GetDailyPuzzleQuery('2026-01-15', []);
      const puzzleResult = await puzzleHandler.execute(puzzleQuery);

      // Find correct book
      for (const book of puzzleResult.availableBooks) {
        const guessQuery = new SubmitGuessQuery(
          '2026-01-15',
          book.reference,
          1,
        );
        const guessResult = await handler.execute(guessQuery);
        if (guessResult.isCorrect) {
          break;
        }
      }

      // Give time for fire-and-forget
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockStatsRepo.incrementGamePlayed).toHaveBeenCalledWith(true);
    });

    it('increments stats on game over (round 6 wrong)', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6);
      await handler.execute(query);

      // Give time for fire-and-forget
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockStatsRepo.incrementGamePlayed).toHaveBeenCalledWith(false);
    });

    it('does not increment stats on wrong guess before round 6', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 3);
      await handler.execute(query);

      // Give time for fire-and-forget
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockStatsRepo.incrementGamePlayed).not.toHaveBeenCalled();
    });

    it('handles stats repo error gracefully', async () => {
      mockStatsRepo.incrementGamePlayed = vi
        .fn()
        .mockRejectedValue(new Error('DB error'));

      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6);
      const result = await handler.execute(query);

      // Should not throw, just continue
      expect(result).toBeDefined();
      expect(result.isCorrect).toBeFalsy();
    });

    it('returns all hints when game is over (round 6)', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6);
      const result = await handler.execute(query);

      expect(result.allHints).toBeDefined();
      expect(Array.isArray(result.allHints)).toBeTruthy();
      expect(result.allHints!.length).toBe(6);
    });

    it('returns all hints when guess is correct', async () => {
      const puzzleHandler = new GetDailyPuzzleHandler();
      const puzzleQuery = new GetDailyPuzzleQuery('2026-01-15', []);
      const puzzleResult = await puzzleHandler.execute(puzzleQuery);

      // Find correct book
      for (const book of puzzleResult.availableBooks) {
        const guessQuery = new SubmitGuessQuery(
          '2026-01-15',
          book.reference,
          1,
        );
        const guessResult = await handler.execute(guessQuery);
        if (guessResult.isCorrect) {
          expect(guessResult.allHints).toBeDefined();
          expect(guessResult.allHints!.length).toBe(6);
          break;
        }
      }
    });

    it('does not return all hints for wrong guess before round 6', async () => {
      const query = new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 3);
      const result = await handler.execute(query);

      expect(result.allHints).toBeUndefined();
    });

    it('handles different rounds correctly', async () => {
      for (let round = 1; round <= 5; round++) {
        const query = new SubmitGuessQuery(
          '2026-01-15',
          'wrong-book-id',
          round,
        );
        const result = await handler.execute(query);

        expect(result.isCorrect).toBeFalsy();
        expect(result.nextHint).toBeDefined();
        expect(result.nextHint?.round).toBe(round + 1);
      }
    });
  });

  describe('GetGlobalStatsHandler', () => {
    let handler: GetGlobalStatsHandler;
    let mockStatsRepo: IGlobalStatsRepository;

    beforeEach(() => {
      mockStatsRepo = {
        getGlobalStats: vi.fn().mockResolvedValue({
          totalGamesPlayed: 100,
          totalWins: 75,
          winRate: 0.75,
        }),
        incrementGamePlayed: vi.fn(),
      };
      handler = new GetGlobalStatsHandler(mockStatsRepo);
    });

    it('returns global stats from repository', async () => {
      const query = new GetGlobalStatsQuery();
      const result = await handler.execute(query);

      expect(result).toEqual({
        totalGamesPlayed: 100,
        totalWins: 75,
        winRate: 0.75,
      });
      expect(mockStatsRepo.getGlobalStats).toHaveBeenCalled();
    });

    it('handles empty stats', async () => {
      mockStatsRepo.getGlobalStats = vi.fn().mockResolvedValue({
        totalGamesPlayed: 0,
        totalWins: 0,
        winRate: 0,
      });

      const query = new GetGlobalStatsQuery();
      const result = await handler.execute(query);

      expect(result.totalGamesPlayed).toBe(0);
      expect(result.totalWins).toBe(0);
    });
  });
});

describe('Puzzle Query Classes', () => {
  it('GetDailyPuzzleQuery stores date and revealedRounds', () => {
    const query = new GetDailyPuzzleQuery('2026-01-15', [1, 2, 3]);
    expect(query.date).toBe('2026-01-15');
    expect(query.revealedRounds).toEqual([1, 2, 3]);
  });

  it('GetDailyPuzzleQuery defaults revealedRounds to empty array', () => {
    const query = new GetDailyPuzzleQuery('2026-01-15');
    expect(query.revealedRounds).toEqual([]);
  });

  it('SubmitGuessQuery stores all parameters', () => {
    const query = new SubmitGuessQuery('2026-01-15', 'book-123', 3);
    expect(query.date).toBe('2026-01-15');
    expect(query.guessedBookId).toBe('book-123');
    expect(query.currentRound).toBe(3);
  });

  it('GetGlobalStatsQuery can be instantiated', () => {
    const query = new GetGlobalStatsQuery();
    expect(query).toBeDefined();
  });
});

describe('SubmitGuessHandler Hint Coverage', () => {
  let handler: SubmitGuessHandler;

  beforeEach(() => {
    handler = new SubmitGuessHandler({
      getGlobalStats: vi.fn(),
      incrementGamePlayed: vi.fn().mockResolvedValue(),
    });
  });

  it('covers all hint types through allHints on game over', async () => {
    const allHintTypes = new Set<string>();
    const requiredTypes = [
      'emoticons',
      'title_word_count',
      'genre',
      'era',
      'protagonist',
      'publication_century',
      'setting',
      'quote',
      'first_letter',
      'author_nationality',
      'author_name',
    ];

    // Test many dates to collect all hint types from SubmitGuessHandler
    for (let day = 1; day <= 90; day++) {
      const date = `2026-${String(Math.floor(day / 28) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      // Trigger game over to get allHints
      const query = new SubmitGuessQuery(date, 'wrong-book-id', 6);
      const result = await handler.execute(query);

      if (result.allHints) {
        for (const hint of result.allHints) {
          allHintTypes.add(hint.type);
        }
      }

      // Early exit if we found all types
      if (allHintTypes.size === requiredTypes.length) {
        break;
      }
    }

    // Verify we found all types through SubmitGuessHandler
    for (const type of requiredTypes) {
      expect(allHintTypes.has(type)).toBeTruthy();
    }
  });

  it('generates first_letter hint through SubmitGuessHandler', async () => {
    let foundFirstLetter = false;

    for (let day = 1; day <= 90; day++) {
      const date = `2026-${String(Math.floor(day / 28) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      const query = new SubmitGuessQuery(date, 'wrong-book-id', 6);
      const result = await handler.execute(query);

      const firstLetterHint = result.allHints?.find(
        (h) => h.type === 'first_letter',
      );
      if (firstLetterHint) {
        expect(firstLetterHint.content).toMatch(/^[A-Z]\.\.\.$/);
        foundFirstLetter = true;
        break;
      }
    }

    expect(foundFirstLetter).toBeTruthy();
  });

  it('generates publication_century hint through SubmitGuessHandler', async () => {
    let foundCentury = false;

    for (let day = 1; day <= 90; day++) {
      const date = `2026-${String(Math.floor(day / 28) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      const query = new SubmitGuessQuery(date, 'wrong-book-id', 6);
      const result = await handler.execute(query);

      const centuryHint = result.allHints?.find(
        (h) => h.type === 'publication_century',
      );
      if (centuryHint) {
        expect(centuryHint.content).toMatch(
          /^Published in the \d+(st|nd|rd|th) century$/,
        );
        foundCentury = true;
        break;
      }
    }

    expect(foundCentury).toBeTruthy();
  });

  it('triggers era/century exclusion replacement logic', async () => {
    // Test many dates to find one where era/century exclusion happens
    // This exercises the replacement logic in generateAllHints
    let checkedDates = 0;

    for (let day = 1; day <= 120; day++) {
      const date = `2026-${String(Math.floor(day / 28) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      const query = new SubmitGuessQuery(date, 'wrong-book-id', 6);
      const result = await handler.execute(query);

      if (result.allHints) {
        const hintTypes = result.allHints.map((h) => h.type);
        const hasEra = hintTypes.includes('era');
        const hasCentury = hintTypes.includes('publication_century');

        // Verify the exclusion rule is enforced
        expect(hasEra && hasCentury).toBeFalsy();
        checkedDates++;
      }
    }

    expect(checkedDates).toBeGreaterThan(0);
  });
});

describe('Hint Type Coverage', () => {
  let puzzleHandler: GetDailyPuzzleHandler;

  beforeEach(() => {
    puzzleHandler = new GetDailyPuzzleHandler();
  });

  it('generates first_letter hint correctly', async () => {
    // Test multiple dates to find one where first_letter hint is included
    const dates = [
      '2026-02-01',
      '2026-02-15',
      '2026-03-01',
      '2026-03-15',
      '2026-04-01',
      '2026-04-15',
      '2026-05-01',
      '2026-05-15',
      '2026-06-01',
      '2026-06-15',
    ];

    let foundFirstLetter = false;
    for (const date of dates) {
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      const firstLetterHint = result.puzzle.hints.find(
        (h) => h.type === 'first_letter',
      );
      if (firstLetterHint) {
        // First letter hint should end with "..."
        expect(firstLetterHint.content).toMatch(/^[A-Z]\.\.\.$/);
        foundFirstLetter = true;
        break;
      }
    }

    expect(foundFirstLetter).toBeTruthy();
  });

  it('generates publication_century hint with correct suffix', async () => {
    // Test multiple dates to find one with publication_century
    const dates = [
      '2026-02-01',
      '2026-02-15',
      '2026-03-01',
      '2026-03-15',
      '2026-04-01',
      '2026-04-15',
      '2026-05-01',
      '2026-05-15',
      '2026-06-01',
      '2026-06-15',
    ];

    let foundCentury = false;
    for (const date of dates) {
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      const centuryHint = result.puzzle.hints.find(
        (h) => h.type === 'publication_century',
      );
      if (centuryHint) {
        // Should match pattern like "Published in the 19th century"
        expect(centuryHint.content).toMatch(
          /^Published in the \d+(st|nd|rd|th) century$/,
        );
        foundCentury = true;
        break;
      }
    }

    expect(foundCentury).toBeTruthy();
  });

  it('generates title_word_count hint correctly', async () => {
    const dates = [
      '2026-02-01',
      '2026-02-15',
      '2026-03-01',
      '2026-03-15',
      '2026-04-01',
    ];

    let foundWordCount = false;
    for (const date of dates) {
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      const wordCountHint = result.puzzle.hints.find(
        (h) => h.type === 'title_word_count',
      );
      if (wordCountHint) {
        // Should match pattern like "3 words" or "1 word"
        expect(wordCountHint.content).toMatch(/^\d+ words?$/);
        foundWordCount = true;
        break;
      }
    }

    expect(foundWordCount).toBeTruthy();
  });

  it('generates quote hint from book notable quotes', async () => {
    const dates = [
      '2026-02-01',
      '2026-02-15',
      '2026-03-01',
      '2026-03-15',
      '2026-04-01',
      '2026-04-15',
      '2026-05-01',
      '2026-05-15',
    ];

    let foundQuote = false;
    for (const date of dates) {
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      const quoteHint = result.puzzle.hints.find((h) => h.type === 'quote');
      if (quoteHint) {
        // Quote should be a non-empty string
        expect(quoteHint.content.length).toBeGreaterThan(0);
        foundQuote = true;
        break;
      }
    }

    expect(foundQuote).toBeTruthy();
  });

  it('generates author_name hint with first name only', async () => {
    const dates = [
      '2026-02-01',
      '2026-02-15',
      '2026-03-01',
      '2026-03-15',
      '2026-04-01',
      '2026-04-15',
      '2026-05-01',
      '2026-05-15',
      '2026-06-01',
      '2026-06-15',
    ];

    let foundAuthorName = false;
    for (const date of dates) {
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      const authorNameHint = result.puzzle.hints.find(
        (h) => h.type === 'author_name',
      );
      if (authorNameHint) {
        // Should be a single word (first name)
        expect(authorNameHint.content).not.toContain(' ');
        expect(authorNameHint.content.length).toBeGreaterThan(0);
        foundAuthorName = true;
        break;
      }
    }

    expect(foundAuthorName).toBeTruthy();
  });

  it('generates all hint types across multiple dates', async () => {
    const allHintTypes = new Set<string>();
    const requiredTypes = [
      'emoticons',
      'title_word_count',
      'genre',
      'era',
      'protagonist',
      'publication_century',
      'setting',
      'quote',
      'first_letter',
      'author_nationality',
      'author_name',
    ];

    // Test many dates to collect all hint types
    for (let day = 1; day <= 60; day++) {
      const date = `2026-${String(Math.floor(day / 28) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      const query = new GetDailyPuzzleQuery(date, [1, 2, 3, 4, 5, 6]);
      const result = await puzzleHandler.execute(query);

      for (const hint of result.puzzle.hints) {
        allHintTypes.add(hint.type);
      }

      // Early exit if we found all types
      if (allHintTypes.size === requiredTypes.length) {
        break;
      }
    }

    // Verify we found all types
    for (const type of requiredTypes) {
      expect(allHintTypes.has(type)).toBeTruthy();
    }
  });
});

describe('GetDailyPuzzleHandler with Chapter Repository', () => {
  it('generates haikus when chapters are available', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi.fn().mockResolvedValue([
        {
          id: 'ch1',
          content:
            'the wind blows softly. the river flows to the sea. leaves fall from the tree.',
        },
      ]),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi
        .fn()
        .mockImplementation((content: string) => {
          return content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        }),
      hasUpperCaseWords: vi.fn().mockReturnValue(false),
      hasBlacklistedCharsInQuote: vi.fn().mockReturnValue(false),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    const result = await handler.execute(query);

    expect(result.puzzle.haikus).toBeDefined();
    expect(Array.isArray(result.puzzle.haikus)).toBeTruthy();
  });

  it('returns empty haikus when no chapters exist', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi.fn().mockResolvedValue([]),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi.fn(),
      hasUpperCaseWords: vi.fn(),
      hasBlacklistedCharsInQuote: vi.fn(),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    const result = await handler.execute(query);

    expect(result.puzzle.haikus).toEqual([]);
  });

  it('returns empty haikus when chapter repository throws', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi
        .fn()
        .mockRejectedValue(new Error('DB error')),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi.fn(),
      hasUpperCaseWords: vi.fn(),
      hasBlacklistedCharsInQuote: vi.fn(),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    const result = await handler.execute(query);

    // Should handle error gracefully and return empty array
    expect(result.puzzle.haikus).toEqual([]);
  });

  it('filters out sentences with uppercase words', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi.fn().mockResolvedValue([
        {
          id: 'ch1',
          content: 'The LOUD noise echoes. a quiet whisper at dawn.',
        },
      ]),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi
        .fn()
        .mockImplementation((content: string) => {
          return content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        }),
      hasUpperCaseWords: vi.fn().mockImplementation((s: string) => {
        return /\b[A-Z]{2,}\b/.test(s);
      }),
      hasBlacklistedCharsInQuote: vi.fn().mockReturnValue(false),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    await handler.execute(query);

    expect(mockNaturalLanguage.hasUpperCaseWords).toHaveBeenCalled();
  });

  it('filters out sentences with blacklisted characters', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi.fn().mockResolvedValue([
        {
          id: 'ch1',
          content: 'normal sentence here. sentence with @special chars.',
        },
      ]),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi
        .fn()
        .mockImplementation((content: string) => {
          return content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        }),
      hasUpperCaseWords: vi.fn().mockReturnValue(false),
      hasBlacklistedCharsInQuote: vi.fn().mockImplementation((s: string) => {
        return s.includes('@');
      }),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    await handler.execute(query);

    expect(mockNaturalLanguage.hasBlacklistedCharsInQuote).toHaveBeenCalled();
  });

  it('returns empty haikus when not enough 5-syllable verses', async () => {
    const mockChapterRepo = {
      getChaptersByBookReference: vi.fn().mockResolvedValue([
        {
          id: 'ch1',
          content: 'one verse only here.',
        },
      ]),
      getChapterById: vi.fn(),
      createChapter: vi.fn(),
      createChapters: vi.fn(),
      deleteChaptersByBookReference: vi.fn(),
    };

    const mockNaturalLanguage = {
      extractSentencesByPunctuation: vi
        .fn()
        .mockImplementation((content: string) => {
          return content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        }),
      hasUpperCaseWords: vi.fn().mockReturnValue(false),
      hasBlacklistedCharsInQuote: vi.fn().mockReturnValue(false),
    };

    const handler = new GetDailyPuzzleHandler(
      mockChapterRepo,
      mockNaturalLanguage as unknown as NaturalLanguageService,
    );

    const query = new GetDailyPuzzleQuery('2026-01-15', []);
    const result = await handler.execute(query);

    // Not enough verses for a complete haiku
    expect(result.puzzle.haikus).toEqual([]);
  });
});
