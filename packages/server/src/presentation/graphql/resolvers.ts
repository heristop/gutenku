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
import { GenerateHaikuQuery } from '~/application/queries/haiku';
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
  },
  Subscription: {
    quoteGenerated: {
      subscribe: () => pubSubService.iterator<string>(['QUOTE_GENERATED']),
    },
  },
};

export default resolvers;
