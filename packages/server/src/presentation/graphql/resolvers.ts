import { container } from 'tsyringe';
import type { HaikuValue, HaikuVariables } from '~/shared/types';
import { type IQueryBus, IQueryBusToken } from '~/application/cqrs';
import {
  GetBookByIdQuery,
  GetAllBooksQuery,
} from '~/application/queries/books';
import {
  GetChapterByIdQuery,
  GetAllChaptersQuery,
} from '~/application/queries/chapters';
import {
  GenerateHaikuQuery,
  GetHaikuVersionQuery,
} from '~/application/queries/haiku';
import {
  GenerateHaikuIterativeHandler,
  type HaikuProgress,
  type IterativeHaikuArgs,
} from '~/application/queries/haiku/GenerateHaikuIterativeHandler';
import {
  GetDailyPuzzleQuery,
  SubmitGuessQuery,
  ReduceBooksQuery,
  GetPuzzleVersionQuery,
  RevealEmoticonQuery,
  RevealHaikuQuery,
} from '~/application/queries/puzzle';
import type { PuzzleVersion, HaikuVersion } from '@gutenku/shared';
import { GetGlobalStatsQuery } from '~/application/queries/stats';

const resolvers = {
  Query: {
    book: async (_, { id }: { id: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetBookByIdQuery(id));
    },
    books: async (_, { filter }: { filter?: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetAllBooksQuery(filter));
    },
    chapter: async (_, { id }: { id: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetChapterByIdQuery(id));
    },
    chapters: async (_, { filter }: { filter?: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetAllChaptersQuery(filter));
    },
    haiku: async (_, args: HaikuVariables): Promise<HaikuValue> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GenerateHaikuQuery(args));
    },
    globalStats: async () => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      const stats = await queryBus.execute(new GetGlobalStatsQuery());

      const todayGames = stats.todayGamesPlayed || 0;
      const todayAverageEmoticonScratches =
        todayGames > 0 ? stats.todayEmoticonScratches / todayGames : 0;
      const todayAverageHaikuReveals =
        todayGames > 0 ? stats.todayHaikuReveals / todayGames : 0;
      const todayTotalHints =
        stats.todayEmoticonScratches +
        stats.todayHaikuReveals +
        stats.todayRoundHints;
      const todayAverageHints =
        todayGames > 0 ? todayTotalHints / todayGames : 0;

      const weekGames = stats.weekGamesPlayed || 0;
      const weekAverageEmoticonScratches =
        weekGames > 0 ? stats.weekEmoticonScratches / weekGames : 0;
      const weekAverageHaikuReveals =
        weekGames > 0 ? stats.weekHaikuReveals / weekGames : 0;
      const weekTotalHints =
        stats.weekEmoticonScratches +
        stats.weekHaikuReveals +
        stats.weekRoundHints;
      const weekAverageHints = weekGames > 0 ? weekTotalHints / weekGames : 0;

      return {
        ...stats,
        todayAverageEmoticonScratches,
        todayAverageHaikuReveals,
        todayAverageHints,
        todayTotalHints,
        weekAverageEmoticonScratches,
        weekAverageHaikuReveals,
        weekAverageHints,
        weekTotalHints,
      };
    },
    dailyPuzzle: async (
      _,
      {
        date,
        revealedRounds,
        visibleEmoticonCount,
        revealedHaikuCount,
        locale,
      }: {
        date: string;
        revealedRounds?: number[];
        visibleEmoticonCount?: number;
        revealedHaikuCount?: number;
        locale?: string;
      },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(
        new GetDailyPuzzleQuery(
          date,
          revealedRounds || [],
          visibleEmoticonCount,
          revealedHaikuCount,
          locale || 'en',
        ),
      );
    },
    submitGuess: async (
      _,
      {
        date,
        guessedBookId,
        currentRound,
        hints,
        locale,
      }: {
        date: string;
        guessedBookId: string;
        currentRound: number;
        hints?: { emoticonScratches: number; haikuReveals: number };
        locale?: string;
      },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(
        new SubmitGuessQuery(
          date,
          guessedBookId,
          currentRound,
          hints,
          locale || 'en',
        ),
      );
    },
    reduceBooks: async (
      _,
      { date, locale }: { date: string; locale?: string },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new ReduceBooksQuery(date, locale || 'en'));
    },
    puzzleVersion: async (
      _,
      { date }: { date: string },
    ): Promise<PuzzleVersion> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetPuzzleVersionQuery(date));
    },
    haikuVersion: async (
      _,
      { date }: { date: string },
    ): Promise<HaikuVersion> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new GetHaikuVersionQuery(date));
    },
  },
  Mutation: {
    revealEmoticon: async (
      _,
      {
        date,
        scratchedPositions,
      }: { date: string; scratchedPositions: number[] },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(
        new RevealEmoticonQuery(date, scratchedPositions),
      );
    },
    revealHaiku: async (
      _,
      { date, index }: { date: string; index: number },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new RevealHaikuQuery(date, index));
    },
  },
  Subscription: {
    haikuGeneration: {
      subscribe: async function* (
        _: unknown,
        args: IterativeHaikuArgs,
      ): AsyncGenerator<{ haikuGeneration: HaikuProgress }> {
        const handler = container.resolve(GenerateHaikuIterativeHandler);
        for await (const progress of handler.generate(args)) {
          yield { haikuGeneration: progress };
        }
      },
    },
  },
};

export default resolvers;
