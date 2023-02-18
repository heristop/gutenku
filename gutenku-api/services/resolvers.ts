import Book from '../models/book';
import Chapter from '../models/chapter';
import Haiku from './haiku';
import OpenAI from './openai';

const resolvers = {
    Query: {
        books() {
            return Book.find().populate('chapters').exec();
        },
        book: (_: unknown, inputs: { id: string; }) => {
            return Book.findById(inputs.id).populate('chapters').exec();
        },
        chapters: () => {
            return Chapter.find().exec();
        },
        haiku: async (_: unknown, inputs: { useAI: boolean; }) => {
            if (true === inputs.useAI && '' !== process.env.OPENAI_API_KEY) {
                return await OpenAI.generate();
            }

            return await Haiku.generateWithImage();
        },
    }
};

export default resolvers;
