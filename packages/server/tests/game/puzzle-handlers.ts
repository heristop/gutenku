import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GetDailyPuzzleHandler } from '../../src/application/queries/puzzle/GetDailyPuzzleHandler';
import { GetDailyPuzzleQuery } from '../../src/application/queries/puzzle/GetDailyPuzzleQuery';
import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';
import { GetGlobalStatsHandler } from '../../src/application/queries/stats/GetGlobalStatsHandler';
import { GetGlobalStatsQuery } from '../../src/application/queries/stats/GetGlobalStatsQuery';
import type { IGlobalStatsRepository } from '../../src/domain/repositories/IGlobalStatsRepository';

describe('Puzzle Handlers', () => {
  describe('GetDailyPuzzleHandler', () => {
    let handler: GetDailyPuzzleHandler;

    beforeEach(() => {
      handler = new GetDailyPuzzleHandler();
    });

    it('returns puzzle for a given date', async () => {
      const query = new GetDailyPuzzleQuery('2025-01-15', []);
      const result = await handler.execute(query);

      expect(result).toBeDefined();
      expect(result.puzzle).toBeDefined();
      expect(result.puzzle.date).toBe('2025-01-15');
      expect(result.puzzle.puzzleNumber).toBeGreaterThan(0);
      expect(result.puzzle.hints).toBeDefined();
      expect(Array.isArray(result.puzzle.hints)).toBeTruthy();
    });

    it('always includes round 1 hint', async () => {
      const query = new GetDailyPuzzleQuery('2025-01-15', []);
      const result = await handler.execute(query);

      const round1Hint = result.puzzle.hints.find((h) => h.round === 1);
      expect(round1Hint).toBeDefined();
      expect(round1Hint?.type).toBe('haiku');
    });

    it('includes revealed rounds in hints', async () => {
      const query = new GetDailyPuzzleQuery('2025-01-15', [2, 3]);
      const result = await handler.execute(query);

      const rounds = result.puzzle.hints.map((h) => h.round);
      expect(rounds).toContain(1); // Always included
      expect(rounds).toContain(2);
      expect(rounds).toContain(3);
    });

    it('returns available books for autocomplete', async () => {
      const query = new GetDailyPuzzleQuery('2025-01-15', []);
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
      const query1 = new GetDailyPuzzleQuery('2025-06-15', []);
      const query2 = new GetDailyPuzzleQuery('2025-06-15', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      expect(result1.puzzle.puzzleNumber).toBe(result2.puzzle.puzzleNumber);
      expect(result1.puzzle.hints[0].content).toBe(
        result2.puzzle.hints[0].content,
      );
    });

    it('returns different puzzles for different dates', async () => {
      const query1 = new GetDailyPuzzleQuery('2025-01-15', []);
      const query2 = new GetDailyPuzzleQuery('2025-01-16', []);

      const result1 = await handler.execute(query1);
      const result2 = await handler.execute(query2);

      expect(result1.puzzle.puzzleNumber).not.toBe(result2.puzzle.puzzleNumber);
    });

    it('calculates correct puzzle number from launch date', async () => {
      // Launch date is 2025-01-01, so 2025-01-01 should be puzzle #1
      const query = new GetDailyPuzzleQuery('2025-01-01', []);
      const result = await handler.execute(query);

      expect(result.puzzle.puzzleNumber).toBe(1);
    });

    it('handles all hint types', async () => {
      const query = new GetDailyPuzzleQuery('2025-01-15', [1, 2, 3, 4, 5, 6]);
      const result = await handler.execute(query);

      const hintTypes = result.puzzle.hints.map((h) => h.type);
      expect(hintTypes).toContain('haiku');
      expect(hintTypes).toContain('emoticons');
      expect(hintTypes).toContain('genre_era');
      expect(hintTypes).toContain('quote');
      expect(hintTypes).toContain('letter_author');
      expect(hintTypes).toContain('author_name');
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
      const puzzleQuery = new GetDailyPuzzleQuery('2025-01-15', []);
      const puzzleResult = await puzzleHandler.execute(puzzleQuery);

      // Find a book that matches by testing
      const books = puzzleResult.availableBooks;
      let correctBookId: string | undefined;

      for (const book of books) {
        const guessQuery = new SubmitGuessQuery(
          '2025-01-15',
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

      const query = new SubmitGuessQuery('2025-01-15', correctBookId!, 1);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeTruthy();
      expect(result.correctBook).toBeDefined();
      expect(result.correctBook?.reference).toBe(correctBookId);
    });

    it('returns next hint for wrong guess before round 6', async () => {
      const query = new SubmitGuessQuery('2025-01-15', 'wrong-book-id', 3);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeFalsy();
      expect(result.nextHint).toBeDefined();
      expect(result.nextHint?.round).toBe(4);
    });

    it('returns correct book after round 6 wrong guess', async () => {
      const query = new SubmitGuessQuery('2025-01-15', 'wrong-book-id', 6);
      const result = await handler.execute(query);

      expect(result.isCorrect).toBeFalsy();
      expect(result.correctBook).toBeDefined();
      expect(result.nextHint).toBeUndefined();
    });

    it('increments stats on correct guess', async () => {
      const puzzleHandler = new GetDailyPuzzleHandler();
      const puzzleQuery = new GetDailyPuzzleQuery('2025-01-15', []);
      const puzzleResult = await puzzleHandler.execute(puzzleQuery);

      // Find correct book
      for (const book of puzzleResult.availableBooks) {
        const guessQuery = new SubmitGuessQuery(
          '2025-01-15',
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
      const query = new SubmitGuessQuery('2025-01-15', 'wrong-book-id', 6);
      await handler.execute(query);

      // Give time for fire-and-forget
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockStatsRepo.incrementGamePlayed).toHaveBeenCalledWith(false);
    });

    it('does not increment stats on wrong guess before round 6', async () => {
      const query = new SubmitGuessQuery('2025-01-15', 'wrong-book-id', 3);
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

      const query = new SubmitGuessQuery('2025-01-15', 'wrong-book-id', 6);
      const result = await handler.execute(query);

      // Should not throw, just continue
      expect(result).toBeDefined();
      expect(result.isCorrect).toBeFalsy();
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
    const query = new GetDailyPuzzleQuery('2025-01-15', [1, 2, 3]);
    expect(query.date).toBe('2025-01-15');
    expect(query.revealedRounds).toEqual([1, 2, 3]);
  });

  it('GetDailyPuzzleQuery defaults revealedRounds to empty array', () => {
    const query = new GetDailyPuzzleQuery('2025-01-15');
    expect(query.revealedRounds).toEqual([]);
  });

  it('SubmitGuessQuery stores all parameters', () => {
    const query = new SubmitGuessQuery('2025-01-15', 'book-123', 3);
    expect(query.date).toBe('2025-01-15');
    expect(query.guessedBookId).toBe('book-123');
    expect(query.currentRound).toBe(3);
  });

  it('GetGlobalStatsQuery can be instantiated', () => {
    const query = new GetGlobalStatsQuery();
    expect(query).toBeDefined();
  });
});
