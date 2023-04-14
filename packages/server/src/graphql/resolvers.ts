import { Connection } from 'mongoose';
import Book from '../models/book';
import Chapter from '../models/chapter';
import { HaikuValue } from '../types';
import HaikuService from '../services/haiku';
import OpenAIService from '../services/openai';

const resolvers = {
    Query: {
        books: (_, { content }: { content?: string }) => {
            const query = {};

            if (content) {
                query['chapters.content'] = { $regex: content, $options: 'i' };
            }

            return Book.find(query).populate('chapters').exec();
        },
        book: (_, { id }: { id: string; }) => {
            return Book.findById(id).populate('chapters').exec();
        },
        chapters: (_, { content }: { content?: string }) => {
            const query = {};

            if (content) {
                // eslint-disable-next-line
                query['content'] = { $regex: content, $options: 'i' };
            }

            return Chapter.findOne(query).populate('book').exec();
        },
        haiku: async (_, args: {
            useAI: boolean,
            skipCache: boolean,
            appendImg: boolean,
            selectionCount: number,
            theme: string,
        }, context: { db: Connection; }): Promise<HaikuValue> => {
            let haiku: HaikuValue = null;
            const haikuService = new HaikuService(context.db, {
                cache: {
                    'minCachedDocs': parseInt(process.env.MIN_CACHED_DOCS),
                    'ttl': 24 * 60 * 60 * 1000, // 24 hours,
                    'disable': !!args.skipCache || 'true' === process.env.DISABLE_CACHE,
                },
                theme: args.theme,
            });

            const MODE_AI = args.useAI && undefined !== process.env.OPENAI_API_KEY;

            if (true === MODE_AI) {
                const openAIService = new OpenAIService(haikuService, {
                    'apiKey': process.env.OPENAI_API_KEY,
                    'selectionCount': args.selectionCount,
                });

                haiku = await openAIService.generate();
            }

            if (false === MODE_AI) {
                haiku = await haikuService.generate();
            }

            if (false !== args.appendImg) {
                haiku = await haikuService.appendImg(haiku);
            }

            return haiku;
        }
    }
};

export default resolvers;
