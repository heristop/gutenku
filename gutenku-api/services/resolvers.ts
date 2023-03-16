import Book from '../models/book';
import Chapter from '../models/chapter';
import Haiku from './haiku';
import OpenAI from './openai';
import { HaikuValue } from '../src/types';

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
        haiku: async (_, args: { useAI: boolean }): Promise<HaikuValue> => {
            let haiku: HaikuValue = null;

            if (true === args.useAI && undefined !== process.env.OPENAI_API_KEY) {
                haiku = await OpenAI.generate();
            } else {
                haiku = await Haiku.generate();
            }

            return await Haiku.addImage(haiku);
        }
    }
};

export default resolvers;
