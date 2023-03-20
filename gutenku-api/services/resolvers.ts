import { Connection } from 'mongoose';
import Book from '../models/book';
import Chapter from '../models/chapter';
import { HaikuValue } from '../src/types';
import HaikuService from './haiku';
import OpenAIService from './openai';

const resolvers = {
    Query: {
        books() {
            return Book.find().populate('chapters').exec();
        },
        book: (_, args: { id: string; }) => {
            return Book.findById(args.id).populate('chapters').exec();
        },
        chapters: () => {
            return Chapter.find().exec();
        },
        haiku: async (_: any, args: {
            useAI: boolean,
            skipCache: boolean,
            appendImg: boolean,
            selectionCount: number,
        }, context: { db: Connection; }): Promise<HaikuValue> => {
            let haiku: HaikuValue = null;
            const haikuService = new HaikuService(context.db, {
                'minCachedDocs': parseInt(process.env.MIN_CACHED_DOCS),
                'ttl': 24 * 60 * 60 * 1000, // 24 hours,
                'skip': !!args.skipCache,
            });

            if (true === args.useAI && undefined !== process.env.OPENAI_API_KEY) {
                const openAIService = new OpenAIService(haikuService, {
                    'apiKey': process.env.OPENAI_API_KEY,
                    'selectionCount': args.selectionCount,
                });

                haiku = await openAIService.generate();
            } else {
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
