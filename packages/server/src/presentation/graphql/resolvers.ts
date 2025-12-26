import { container } from 'tsyringe';
import type { HaikuValue, HaikuVariables } from '~/shared/types';
import BookService from '~/application/services/BookService';
import ChapterService from '~/application/services/ChapterService';
import HaikuBridgeService from '~/application/services/HaikuBridgeService';
import { PubSubService } from '~/infrastructure/services/PubSubService';

// Instantiate PubSub singleton
const pubSubService = container.resolve(PubSubService);

const resolvers = {
  Query: {
    book: async (_, { id }: { id: string }) => {
      const bookService = container.resolve(BookService);

      return await bookService.getBookById(id);
    },
    books: async (_, { filter }: { filter?: string }) => {
      const bookService = container.resolve(BookService);

      return await bookService.getAllBooks(filter);
    },
    chapter: async (_, { id }: { id: string }) => {
      const chapterService = container.resolve(ChapterService);

      return await chapterService.getChapterById(id);
    },
    chapters: async (_, { filter }: { filter?: string }) => {
      const chapterService = container.resolve(ChapterService);

      return await chapterService.getAllChapters(filter);
    },
    haiku: async (_, args: HaikuVariables): Promise<HaikuValue> => {
      const haikuBridgeService = container.resolve(HaikuBridgeService);

      return await haikuBridgeService.generate(args);
    },
  },
  Subscription: {
    quoteGenerated: {
      subscribe: () => pubSubService.iterator<string>(['QUOTE_GENERATED']),
    },
  },
};

export default resolvers;
