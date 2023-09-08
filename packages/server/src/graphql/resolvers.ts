import { Connection } from 'mongoose';
import Book from '../models/book';
import Chapter from '../models/chapter';
import { HaikuValue } from '../types';
import HaikuService from '../services/haiku';
import OpenAIService from '../services/openai';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const resolvers = {
    Query: {
        books: (_, { filter }: { filter?: string }) => {
            const query = {};

            if (filter) {
                query['chapters.content'] = { $regex: filter, $options: 'i' };
            }

            return Book.find(query).populate('chapters').exec();
        },
        book: (_, { id }: { id: string; }) => {
            return Book.findById(id).populate('chapters').exec();
        },
        chapters: (_, { filter }: { filter?: string }) => {
            const query = {};

            if (filter) {
                // eslint-disable-next-line
                query['content'] = { $regex: filter, $options: 'i' };
            }

            return Chapter.find(query).populate('book').exec();
        },
        haiku: async (_, args: {
            useAI: boolean,
            useCache: boolean,
            appendImg: boolean,
            selectionCount: number,
            theme: string,
            filter: string,
            sentimentMinScore: number,
            markovMinScore: number,
            promptTemperature: number,
            descriptionTemperature: number,
        }, context: { db: Connection; }): Promise<HaikuValue> => {
            let haiku: HaikuValue = null;

            const haikuService = new HaikuService(context.db, pubsub, {
                cache: {
                    'minCachedDocs': parseInt(process.env.MIN_CACHED_DOCS),
                    'ttl': 24 * 60 * 60 * 1000, // 24 hours,
                    'enabled': args.useCache,
                },
                score: {
                    'sentiment': args.sentimentMinScore,
                    'markovChain': args.markovMinScore,
                },
                theme: args.theme,
            });

            const OPENAI_SELECTION_MODE = args.useAI && undefined !== process.env.OPENAI_API_KEY;

            if (true === OPENAI_SELECTION_MODE) {
                const openAIService = new OpenAIService(haikuService, {
                    apiKey: process.env.OPENAI_API_KEY,
                    selectionCount: args.selectionCount,
                    temperature: {
                        'prompt': args.promptTemperature,
                        'description': args.promptTemperature,
                    },
                });

                haiku = await openAIService.generate();
            }

            if (null === haiku) {
                haiku = await haikuService
                    .filter(args.filter ? args.filter.split(' ') : [])
                    .generate();
            }

            if (false !== args.appendImg) {
                haiku = await haikuService.appendImg(haiku);
            }

            return haiku;
        }
    },
    Subscription: {
        quoteGenerated: {
            subscribe: () => pubsub.asyncIterator(['QUOTE_GENERATED']),
        },
    },
};

export default resolvers;
