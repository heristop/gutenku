import { injectable } from 'tsyringe';
import type { BookValue } from '~/shared/types';
import type { IBookRepository } from '~/domain/repositories/IBookRepository';
import BookModel from '~/infrastructure/models/BookModel';
import ChapterModel from '~/infrastructure/models/ChapterModel';

@injectable()
export default class BookRepository implements IBookRepository {
  async getAllBooks(filter: string | null) {
    if (filter) {
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
    const randomBooks = await BookModel.aggregate([
      { $match: { 'chapters.0': { $exists: true } } },
      { $sample: { size: 1 } },
      {
        $lookup: {
          as: 'chapters',
          foreignField: '_id',
          from: 'chapters',
          localField: 'chapters',
        },
      },
    ]);

    if (!randomBooks || randomBooks.length === 0) {
      throw new Error('No book found');
    }

    const randomBook = randomBooks[0];

    if (!randomBook.chapters || randomBook.chapters.length === 0) {
      return this.selectRandomBook();
    }

    return randomBook;
  }
}
