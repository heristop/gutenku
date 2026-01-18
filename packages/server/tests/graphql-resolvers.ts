import 'reflect-metadata';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import resolvers from '../src/presentation/graphql/resolvers';
import { IQueryBusToken } from '../src/application/cqrs';
import { GenerateHaikuIterativeHandler } from '../src/application/queries/haiku/GenerateHaikuIterativeHandler';

describe('GraphQL Resolvers', () => {
  let mockQueryBus: { execute: ReturnType<typeof vi.fn> };

  beforeAll(() => {
    mockQueryBus = { execute: vi.fn() };

    container.register(IQueryBusToken, { useValue: mockQueryBus });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query.book', () => {
    it('calls query bus with GetBookByIdQuery', async () => {
      mockQueryBus.execute.mockResolvedValue({ id: '123', title: 'Test Book' });

      const result = await resolvers.Query.book(null, { id: '123' });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual({ id: '123', title: 'Test Book' });
    });
  });

  describe('Query.books', () => {
    it('calls query bus with GetAllBooksQuery', async () => {
      mockQueryBus.execute.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await resolvers.Query.books(null, { filter: 'test' });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('handles undefined filter', async () => {
      mockQueryBus.execute.mockResolvedValue([]);

      const result = await resolvers.Query.books(null, {});

      expect(result).toEqual([]);
    });
  });

  describe('Query.chapter', () => {
    it('calls query bus with GetChapterByIdQuery', async () => {
      mockQueryBus.execute.mockResolvedValue({
        id: '456',
        content: 'Chapter content',
      });

      const result = await resolvers.Query.chapter(null, { id: '456' });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual({ id: '456', content: 'Chapter content' });
    });
  });

  describe('Query.chapters', () => {
    it('calls query bus with GetAllChaptersQuery', async () => {
      mockQueryBus.execute.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);

      const result = await resolvers.Query.chapters(null, { filter: 'nature' });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('Query.haiku', () => {
    it('calls query bus with GenerateHaikuQuery', async () => {
      const mockHaiku = {
        verses: ['line 1', 'line 2', 'line 3'],
        book: { title: 'Test', author: 'Author' },
      };
      mockQueryBus.execute.mockResolvedValue(mockHaiku);

      const result = await resolvers.Query.haiku(null, {});

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result.verses).toHaveLength(3);
    });
  });

  describe('Query.globalStats', () => {
    it('calls query bus with GetGlobalStatsQuery', async () => {
      const stats = {
        totalHaikusGenerated: 100,
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        totalEmoticonScratches: 10,
        totalHaikuReveals: 5,
        totalRoundHints: 20,
        todayHaikusGenerated: 5,
        todayEmoticonScratches: 3,
        todayHaikuReveals: 2,
        todayRoundHints: 15,
        todayGamesPlayed: 10,
        todayGamesWon: 8,
        currentDay: '2026-01-12',
        weekHaikusGenerated: 25,
        weekGamesPlayed: 20,
        weekGamesWon: 15,
        weekEmoticonScratches: 6,
        weekHaikuReveals: 4,
        weekRoundHints: 30,
        currentWeek: '2026-W02',
      };
      mockQueryBus.execute.mockResolvedValue(stats);

      const result = await resolvers.Query.globalStats(null, null);

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual({
        ...stats,
        todayAverageEmoticonScratches: 0.3,
        todayAverageHaikuReveals: 0.2,
        todayAverageHints: 2,
        todayTotalHints: 20,
        weekAverageEmoticonScratches: 0.3,
        weekAverageHaikuReveals: 0.2,
        weekAverageHints: 2,
        weekTotalHints: 40,
      });
    });
  });

  describe('Query.dailyPuzzle', () => {
    it('calls query bus with GetDailyPuzzleQuery', async () => {
      const puzzle = { date: '2024-01-01', book: { id: '1' } };
      mockQueryBus.execute.mockResolvedValue(puzzle);

      const result = await resolvers.Query.dailyPuzzle(null, {
        date: '2024-01-01',
        revealedRounds: [1, 2],
        visibleEmoticonCount: 3,
        revealedHaikuCount: 2,
      });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(puzzle);
    });

    it('handles undefined optional parameters', async () => {
      const puzzle = { date: '2024-01-01' };
      mockQueryBus.execute.mockResolvedValue(puzzle);

      const result = await resolvers.Query.dailyPuzzle(null, {
        date: '2024-01-01',
      });

      expect(result).toEqual(puzzle);
    });
  });

  describe('Query.submitGuess', () => {
    it('calls query bus with SubmitGuessQuery', async () => {
      const guessResult = { correct: true, score: 100 };
      mockQueryBus.execute.mockResolvedValue(guessResult);

      const result = await resolvers.Query.submitGuess(null, {
        date: '2024-01-01',
        guessedBookId: 'book123',
        currentRound: 3,
      });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(guessResult);
    });
  });

  describe('Query.reduceBooks', () => {
    it('calls query bus with ReduceBooksQuery', async () => {
      const reducedBooks = [{ id: '1' }, { id: '2' }];
      mockQueryBus.execute.mockResolvedValue(reducedBooks);

      const result = await resolvers.Query.reduceBooks(null, {
        date: '2024-01-01',
      });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(reducedBooks);
    });
  });

  describe('Query.puzzleVersion', () => {
    it('calls query bus with GetPuzzleVersionQuery', async () => {
      const version = { version: '1.2.3', date: '2024-01-01' };
      mockQueryBus.execute.mockResolvedValue(version);

      const result = await resolvers.Query.puzzleVersion(null, {
        date: '2024-01-01',
      });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(version);
    });
  });

  describe('Query.haikuVersion', () => {
    it('calls query bus with GetHaikuVersionQuery', async () => {
      const version = { version: '2.0.0', date: '2024-01-01' };
      mockQueryBus.execute.mockResolvedValue(version);

      const result = await resolvers.Query.haikuVersion(null, {
        date: '2024-01-01',
      });

      expect(mockQueryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(version);
    });
  });

  describe('Subscription.haikuGeneration', () => {
    it('yields progress from GenerateHaikuIterativeHandler', async () => {
      const mockProgress = [
        {
          currentIteration: 1,
          totalIterations: 2,
          bestScore: 0.5,
          bestHaiku: null,
          isComplete: false,
        },
        {
          currentIteration: 2,
          totalIterations: 2,
          bestScore: 0.8,
          bestHaiku: { verses: ['a', 'b', 'c'] },
          isComplete: true,
        },
      ];

      const mockHandler = {
        generate: async function* () {
          for (const p of mockProgress) {
            yield p;
          }
        },
      };

      container.register(GenerateHaikuIterativeHandler, {
        useValue: mockHandler as unknown as GenerateHaikuIterativeHandler,
      });

      const generator = resolvers.Subscription.haikuGeneration.subscribe(null, {
        iterations: 2,
      });

      const results: unknown[] = [];
      for await (const result of generator) {
        results.push(result);
      }

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ haikuGeneration: mockProgress[0] });
      expect(results[1]).toEqual({ haikuGeneration: mockProgress[1] });
    });
  });
});
