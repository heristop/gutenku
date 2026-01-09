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
  GetDailyPuzzleQuery,
  SubmitGuessQuery,
  ReduceBooksQuery,
  GetPuzzleVersionQuery,
} from '~/application/queries/puzzle';
import type { PuzzleVersion, HaikuVersion } from '@gutenku/shared';
import { GetGlobalStatsQuery } from '~/application/queries/stats';
import { PubSubService } from '~/infrastructure/services/PubSubService';

// Instantiate PubSub singleton
const pubSubService = container.resolve(PubSubService);

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
      return queryBus.execute(new GetGlobalStatsQuery());
    },
    dailyPuzzle: async (
      _,
      {
        date,
        revealedRounds,
        visibleEmoticonCount,
        revealedHaikuCount,
      }: {
        date: string;
        revealedRounds?: number[];
        visibleEmoticonCount?: number;
        revealedHaikuCount?: number;
      },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(
        new GetDailyPuzzleQuery(
          date,
          revealedRounds || [],
          visibleEmoticonCount,
          revealedHaikuCount,
        ),
      );
    },
    submitGuess: async (
      _,
      {
        date,
        guessedBookId,
        currentRound,
      }: { date: string; guessedBookId: string; currentRound: number },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(
        new SubmitGuessQuery(date, guessedBookId, currentRound),
      );
    },
    reduceBooks: async (_, { date }: { date: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      return queryBus.execute(new ReduceBooksQuery(date));
    },
    puzzleVersion: async (_, { date }: { date: string }) => {
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
  Subscription: {
    quoteGenerated: {
      subscribe: () =>
        pubSubService.iterator<{ quoteGenerated: string }>(['QUOTE_GENERATED']),
      resolve: (payload: { quoteGenerated: string }) => payload.quoteGenerated,
    },
    puzzleAvailable: {
      subscribe: () =>
        pubSubService.iterator<{ puzzleAvailable: PuzzleVersion }>([
          'PUZZLE_AVAILABLE',
        ]),
      resolve: (payload: { puzzleAvailable: PuzzleVersion }) =>
        payload.puzzleAvailable,
    },
  },
};

export default resolvers;
