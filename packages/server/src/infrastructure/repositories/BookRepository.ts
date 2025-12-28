import { injectable } from 'tsyringe';
import type { BookValue } from '~/shared/types';
import type {
  IBookRepository,
  CreateBookInput,
  DeleteBookResult,
} from '~/domain/repositories/IBookRepository';
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

  async existsByReference(reference: number): Promise<boolean> {
    const count = await BookModel.countDocuments({
      reference: String(reference),
    }).exec();
    return count > 0;
  }

  async findByReference(reference: number): Promise<BookValue | null> {
    return await BookModel.findOne({ reference: String(reference) })
      .populate('chapters')
      .lean()
      .exec();
  }

  async create(input: CreateBookInput): Promise<string> {
    const book = new BookModel({
      reference: String(input.reference),
      title: input.title,
      author: input.author,
      chapters: [],
    });

    const saved = await book.save();
    return saved._id.toString();
  }

  async addChapter(bookId: string, chapterId: string): Promise<void> {
    await BookModel.findByIdAndUpdate(bookId, {
      $push: { chapters: chapterId },
    }).exec();
  }

  async deleteByReference(reference: number): Promise<DeleteBookResult> {
    const book = await BookModel.findOne({
      reference: String(reference),
    }).exec();

    if (!book) {
      return { deleted: false, chaptersDeleted: 0 };
    }

    // Delete all associated chapters
    const chapterResult = await ChapterModel.deleteMany({
      book: book._id,
    }).exec();

    // Delete the book
    await BookModel.deleteOne({ _id: book._id }).exec();

    return {
      deleted: true,
      chaptersDeleted: chapterResult.deletedCount ?? 0,
    };
  }
}
