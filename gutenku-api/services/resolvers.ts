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
        haiku: async (_, args: {
            useAI: boolean,
            withImg: boolean,
            selectionCount: number,
        }): Promise<HaikuValue> => {
            let haiku: HaikuValue = null;
            const haikuService = new HaikuService();

            if (true === args.useAI && undefined !== process.env.OPENAI_API_KEY) {
                const openAIService = new OpenAIService(haikuService, {
                    'apiKey': process.env.OPENAI_API_KEY,
                    'selectionCount': args.selectionCount,
                });

                haiku = await openAIService.generate();
            } else {
                haiku = await haikuService.generate();
            }

            if (false === args.withImg) {
                return haiku;
            }

            return await haikuService.addImage(haiku);
        }
    }
};

export default resolvers;
