import Book from '../models/book';
import Chapter from '../models/chapter';
import HaikuService from './HaikuService';

const resolvers = {
    Query: {
        books() {
            return Book.find().populate('chapters').exec();
        },
        book: (_, inputs) => {
            return Book.findById(inputs.id).populate('chapters').exec();
        },
        chapters: () => {
            return Chapter.find().exec();
        },
        haiku: async () => {
            return await HaikuService.generate();
        },
    }
};

export default resolvers;
