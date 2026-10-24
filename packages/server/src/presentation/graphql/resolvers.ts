import { container } from 'tsyringe';
import {
  type AIAccess,
  openAIScopeFor,
  withoutDisallowedAI,
} from '~/presentation/graphql/ai-access';
import {
  type OpenAIScope,
  runWithOpenAIScope,
  scopedGenerator,
} from '~/infrastructure/external/openai-scope';
import { checkOpenAIKey } from '~/infrastructure/external/openai-key-check';
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
import {
  GetDailyHaikuNeighboursQuery,
  GetDailyHaikuPageQuery,
  GetDailyHaikuQuery,
} from '~/application/queries/daily-haiku';
import {
  DAILY_HAIKU_PAGE_DEFAULT,
  DAILY_HAIKU_PAGE_MAX,
  type DailyHaiku,
  type DailyHaikuPage,
  type PuzzleVersion,
  type HaikuVersion,
} from '@gutenku/shared';
import { GraphQLError } from 'graphql';
import type { DailyHaikuNeighbours } from '~/domain/repositories/IDailyHaikuRepository';
import {
  getCurrentPublicationDate,
  isValidDailyHaikuDate,
} from '~/domain/services/DailyHaikuSchedule';
import {
  resolvePublicBaseUrl,
  toPublicDailyHaiku,
  toPublicDailyHaikuPage,
} from '~/presentation/rest/daily-haiku-presenter';
import { GetGlobalStatsQuery } from '~/application/queries/stats';

function badUserInput(message: string, reason: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', reason },
  });
}

function assertDailyHaikuDate(name: string, value: string): void {
  if (!isValidDailyHaikuDate(value)) {
    throw badUserInput(`${name} must be YYYY-MM-DD`, 'invalid_date');
  }
}

// Both neighbour fields share one lookup per parent object.
const neighbourLookups = new WeakMap<
  DailyHaiku,
  Promise<DailyHaikuNeighbours>
>();

function resolveNeighbour(
  parent: DailyHaiku,
  field: 'previousDate' | 'nextDate',
): Promise<string | null> | string | null {
  const known = parent[field];

  if (known !== undefined) {
    return known;
  }

  let lookup = neighbourLookups.get(parent);

  if (!lookup) {
    const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
    lookup = queryBus.execute(new GetDailyHaikuNeighboursQuery(parent.date));
    neighbourLookups.set(parent, lookup);
  }

  return lookup.then((neighbours) => neighbours[field]);
}

const resolvers = {
  DailyHaiku: {
    previousDate: (parent: DailyHaiku) =>
      resolveNeighbour(parent, 'previousDate'),
    nextDate: (parent: DailyHaiku) => resolveNeighbour(parent, 'nextDate'),
  },
  Query: {
    book: async (_: unknown, { id }: { id: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetBookByIdQuery(id));
    },
    books: async (_: unknown, { filter }: { filter?: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetAllBooksQuery(filter));
    },
    chapter: async (_: unknown, { id }: { id: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetChapterByIdQuery(id));
    },
    chapters: async (_: unknown, { filter }: { filter?: string }) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetAllChaptersQuery(filter));
    },
    haiku: async (
      _: unknown,
      args: HaikuVariables,
      context?: { ai?: AIAccess },
    ): Promise<HaikuValue> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return runWithOpenAIScope(openAIScopeFor(context?.ai), () =>
        queryBus.execute(
          new GenerateHaikuQuery(withoutDisallowedAI(args, context?.ai)),
        ),
      );
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
      _: unknown,
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
    reduceBooks: async (
      _: unknown,
      {
        date,
        locale,
        guessedBookIds,
        currentRound,
      }: {
        date: string;
        locale?: string;
        guessedBookIds?: string[];
        currentRound?: number;
      },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(
        new ReduceBooksQuery(
          date,
          locale || 'en',
          guessedBookIds ?? [],
          currentRound ?? 1,
        ),
      );
    },
    puzzleVersion: async (
      _: unknown,
      { date }: { date: string },
    ): Promise<PuzzleVersion> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetPuzzleVersionQuery(date));
    },
    haikuVersion: async (
      _: unknown,
      { date }: { date: string },
    ): Promise<HaikuVersion> => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new GetHaikuVersionQuery(date));
    },
    dailyHaiku: async (
      _: unknown,
      { date }: { date?: string | null },
      context?: { publicBaseUrl?: string },
    ): Promise<DailyHaiku | null> => {
      if (date) {
        assertDailyHaikuDate('date', date);

        if (date > getCurrentPublicationDate()) {
          throw badUserInput('future_date', 'future_date');
        }
      }

      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      const record = await queryBus.execute(
        new GetDailyHaikuQuery(date ?? undefined),
      );

      if (!record) {
        return null;
      }

      return toPublicDailyHaiku(
        record,
        context?.publicBaseUrl ?? resolvePublicBaseUrl(),
      );
    },
    dailyHaikus: async (
      _: unknown,
      { before, limit }: { before?: string | null; limit?: number | null },
      context?: { publicBaseUrl?: string },
    ): Promise<DailyHaikuPage> => {
      if (before) {
        assertDailyHaikuDate('before', before);
      }

      if (limit !== undefined && limit !== null && limit < 1) {
        throw badUserInput('limit must be a positive integer', 'invalid_limit');
      }

      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);
      const page = await queryBus.execute(
        new GetDailyHaikuPageQuery(
          before ?? undefined,
          Math.min(limit ?? DAILY_HAIKU_PAGE_DEFAULT, DAILY_HAIKU_PAGE_MAX),
        ),
      );

      return toPublicDailyHaikuPage(
        page,
        context?.publicBaseUrl ?? resolvePublicBaseUrl(),
      );
    },
  },
  Mutation: {
    checkOpenAIKey: (_: unknown, { key }: { key: string }) =>
      checkOpenAIKey(key),
    revealEmoticon: async (
      _: unknown,
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
      _: unknown,
      { date, index }: { date: string; index: number },
    ) => {
      const queryBus = container.resolve<IQueryBus>(IQueryBusToken);

      return queryBus.execute(new RevealHaikuQuery(date, index));
    },
    submitGuess: async (
      _: unknown,
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
  },
  Subscription: {
    haikuGeneration: {
      async *subscribe(
        _: unknown,
        args: IterativeHaikuArgs,
        context?: { ai?: AIAccess },
      ): AsyncGenerator<{ haikuGeneration: HaikuProgress }> {
        const handler = container.resolve(GenerateHaikuIterativeHandler);
        const allowed = withoutDisallowedAI(args, context?.ai);
        const scope: OpenAIScope = openAIScopeFor(context?.ai);

        for await (const progress of scopedGenerator(
          scope,
          handler.generate(allowed),
        )) {
          // The last event says if AI fell short (a rejected key, no credit)
          yield {
            haikuGeneration:
              progress.isComplete && scope.failure
                ? { ...progress, aiError: scope.failure }
                : progress,
          };
        }
      },
    },
  },
};

export default resolvers;
