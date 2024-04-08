import { BookValue } from '../../shared/types';
import BookModel from '../models/BookModel';

export default class BookRepository {
  async getAllBooks(filter: string | null) {
    const query = {};

    if (filter) {
      query['chapters.content'] = { $regex: filter, $options: 'i' };
    }

    return await BookModel.find(query).populate('chapters').exec();
  }

  async getBookById(id: string) {
    return await BookModel.findById(id).populate('chapters').exec();
  }

  async selectRandomBook(): Promise<BookValue> {
    const books = await BookModel.find({ 'chapters.id': { $ne: null } })
      .populate('chapters')
      .exec();

    const randomBook = books[Math.floor(Math.random() * books.length)];

    if (!randomBook) {
      throw new Error('No book found');
    }

    if (0 === randomBook.chapters.length) {
      return this.selectRandomBook();
    }

    return randomBook;
  }
}
