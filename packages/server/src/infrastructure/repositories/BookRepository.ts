import { injectable } from 'tsyringe';
import { BookValue } from '../../shared/types';
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import BookModel from '../models/BookModel';
import ChapterModel from '../models/ChapterModel';

@injectable()
export default class BookRepository implements IBookRepository {
  async getAllBooks(filter: string | null) {
    if (filter) {
      // Find chapters matching filter via text search, then get their books
      const bookIds = await ChapterModel.find({ $text: { $search: filter } })
        .distinct('book')
        .exec();

      return await BookModel.find({ _id: { $in: bookIds } })
        .populate('chapters')
        .select('title author reference chapters')
        .limit(100)
        .lean()
        .exec();
    }

    return await BookModel.find()
      .populate('chapters')
      .select('title author reference chapters')
      .limit(100)
      .lean()
      .exec();
  }

  async getBookById(id: string) {
    return await BookModel.findById(id).populate('chapters').exec();
  }

  async selectRandomBook(): Promise<BookValue> {
    // Use MongoDB aggregation pipeline for efficient random selection
    const randomBooks = await BookModel.aggregate([
      // Match books that have chapters
      { $match: { 'chapters.0': { $exists: true } } },
      // Randomly sample one book
      { $sample: { size: 1 } },
      // Lookup the chapters
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapters',
          foreignField: '_id',
          as: 'chapters',
        },
      },
    ]);

    if (!randomBooks || randomBooks.length === 0) {
      throw new Error('No book found');
    }

    const randomBook = randomBooks[0];

    if (!randomBook.chapters || randomBook.chapters.length === 0) {
      // If somehow we got a book without chapters, try again
      // This should be rare with the aggregation pipeline
      return this.selectRandomBook();
    }

    return randomBook;
  }
}
