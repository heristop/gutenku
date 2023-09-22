import { container } from 'tsyringe';
import { HaikuValue, HaikuVariables } from '../../shared/types';
import BookService from '../../application/services/BookService';
import ChapterService from '../../application/services/ChapterService';
import HaikuBridgeService from '../../application/services/HaikuBridgeService';
import { PubSubService } from '../../infrastructure/services/PubSubService';

// Instanciate PubSub singleton
const pubSub = container.resolve(PubSubService).instance;

const resolvers = {
    Query: {
        books: async (_, { filter }: { filter?: string }) => {
            const bookService = container.resolve(BookService);

            return await bookService.getAllBooks(filter);
        },
        book: async (_, { id }: { id: string; }) => {
            const bookService = container.resolve(BookService);

            return await bookService.getBookById(id);
        },
        chapters: async (_, { filter }: { filter?: string }) => {
            const chapterService = container.resolve(ChapterService);

            return await chapterService.getAllChapters(filter);
        },
        chapter: async (_, { id }: { id: string; }) => {
            const chapterService = container.resolve(ChapterService);

            return await chapterService.getChapterById(id);
        },
        haiku: async (_, args: HaikuVariables): Promise<HaikuValue> => {
            const haikuBridgeService = container.resolve(HaikuBridgeService);

            return await haikuBridgeService.generate(args);
        }
    },
    Subscription: {
        quoteGenerated: {
            subscribe: () => pubSub.asyncIterator(['QUOTE_GENERATED']),
        },
    },
};

export default resolvers;
