import Book from '../../models/book';
import Chapter from '../../models/chapter';
import { haiku } from './actions';

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
        haiku: async () => {
            return await haiku.generate();
        },
    }
};

export default resolvers;
