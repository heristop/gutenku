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

  describe('Mutation.submitGuess', () => {
    it('calls query bus with SubmitGuessQuery', async () => {
      const guessResult = { correct: true, score: 100 };
      mockQueryBus.execute.mockResolvedValue(guessResult);

      const result = await resolvers.Mutation.submitGuess(null, {
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
        async *generate() {
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

  describe('Query.dailyHaiku', () => {
    const record = {
      date: '2026-10-23',
      publishedAt: new Date('2026-10-23T10:02:00.000Z'),
      verses: ['a', 'b', 'c'],
      title: 'Title',
      description: 'Reading',
      book: { title: 'Walden', author: 'Thoreau', reference: '205' },
      source: 'cli',
      hasCard: true,
    };

    it('maps the record to the public shape with an absolute card URL', async () => {
      mockQueryBus.execute.mockResolvedValue(record);

      const result = await resolvers.Query.dailyHaiku(
        null,
        { date: '2026-10-23' },
        { publicBaseUrl: 'https://api.gutenku.xyz' },
      );

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2026-10-23', withCard: false }),
      );
      expect(result).toMatchObject({
        date: '2026-10-23',
        publishedAt: '2026-10-23T10:02:00.000Z',
        reading: 'Reading',
        book: { title: 'Walden', author: 'Thoreau', emoticons: null },
        cardUrl: `https://api.gutenku.xyz/api/daily-haiku/card.jpg?d=2026-10-23&v=${new Date('2026-10-23T10:02:00.000Z').getTime()}`,
      });
      expect(result?.book).not.toHaveProperty('reference');
    });

    it('returns null when nothing is published', async () => {
      mockQueryBus.execute.mockResolvedValue(null);

      expect(await resolvers.Query.dailyHaiku(null, {})).toBeNull();
    });

    it('rejects malformed dates', async () => {
      await expect(
        resolvers.Query.dailyHaiku(null, { date: '23/10/2026' }),
      ).rejects.toThrow(/YYYY-MM-DD/);
      expect(mockQueryBus.execute).not.toHaveBeenCalled();
    });

    it('rejects future dates with BAD_USER_INPUT future_date', async () => {
      const error = await resolvers.Query.dailyHaiku(null, {
        date: '2999-01-01',
      }).catch((err: unknown) => err);

      expect(error).toMatchObject({
        message: 'future_date',
        extensions: { code: 'BAD_USER_INPUT', reason: 'future_date' },
      });
      expect(mockQueryBus.execute).not.toHaveBeenCalled();
    });

    it('returns a null cardUrl for a day without card', async () => {
      mockQueryBus.execute.mockResolvedValue({ ...record, hasCard: false });

      const result = await resolvers.Query.dailyHaiku(null, {});

      expect(result?.cardUrl).toBeNull();
    });
  });

  describe('Query.dailyHaikus', () => {
    const page = {
      records: [
        {
          date: '2026-10-23',
          publishedAt: new Date('2026-10-23T10:00:00.000Z'),
          verses: ['a', 'b', 'c'],
          book: { title: 'Walden', author: 'Thoreau' },
          source: 'auto',
          hasCard: false,
          previousDate: '2026-10-21',
          nextDate: null,
        },
      ],
      nextBefore: '2026-10-23',
      hasMore: true,
    };

    it('returns a public page with neighbour dates', async () => {
      mockQueryBus.execute.mockResolvedValue(page);

      const result = await resolvers.Query.dailyHaikus(
        null,
        { before: '2026-10-24', limit: 1 },
        { publicBaseUrl: 'https://api.gutenku.xyz' },
      );

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ before: '2026-10-24', limit: 1 }),
      );
      expect(result).toMatchObject({
        nextBefore: '2026-10-23',
        hasMore: true,
        items: [
          {
            date: '2026-10-23',
            cardUrl: null,
            previousDate: '2026-10-21',
            nextDate: null,
          },
        ],
      });
      expect(result.items[0]).not.toHaveProperty('source');
    });

    it('defaults to 14 and clamps the limit to 30', async () => {
      mockQueryBus.execute.mockResolvedValue(page);

      await resolvers.Query.dailyHaikus(null, {});
      await resolvers.Query.dailyHaikus(null, { limit: 100 });

      expect(mockQueryBus.execute).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ before: undefined, limit: 14 }),
      );
      expect(mockQueryBus.execute).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ limit: 30 }),
      );
    });

    it('rejects an invalid cursor or limit with BAD_USER_INPUT', async () => {
      await expect(
        resolvers.Query.dailyHaikus(null, { before: 'yesterday' }),
      ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
      await expect(
        resolvers.Query.dailyHaikus(null, { limit: 0 }),
      ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
      expect(mockQueryBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('DailyHaiku neighbour fields', () => {
    const base = {
      date: '2026-10-21',
      publishedAt: '2026-10-21T10:00:00.000Z',
      verses: [],
      book: { title: 'W', author: 'T' },
      cardUrl: null,
      nextRolloverAt: '2026-10-24T10:00:00.000Z',
    };

    it('uses already resolved values without querying', async () => {
      const parent = { ...base, previousDate: null, nextDate: '2026-10-23' };

      expect(await resolvers.DailyHaiku.previousDate(parent)).toBeNull();
      expect(await resolvers.DailyHaiku.nextDate(parent)).toBe('2026-10-23');
      expect(mockQueryBus.execute).not.toHaveBeenCalled();
    });

    it('looks the neighbours up once per parent', async () => {
      mockQueryBus.execute.mockResolvedValue({
        previousDate: '2026-10-19',
        nextDate: '2026-10-23',
      });
      const parent = { ...base };

      expect(await resolvers.DailyHaiku.previousDate(parent)).toBe(
        '2026-10-19',
      );
      expect(await resolvers.DailyHaiku.nextDate(parent)).toBe('2026-10-23');
      expect(mockQueryBus.execute).toHaveBeenCalledTimes(1);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2026-10-21' }),
      );
    });
  });
});
