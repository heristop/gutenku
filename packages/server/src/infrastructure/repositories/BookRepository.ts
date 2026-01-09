import { injectable } from 'tsyringe';
import mongoSanitize from 'mongo-sanitize';
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
      // Sanitize filter to prevent MongoDB injection
      const sanitizedFilter = mongoSanitize(filter) as string;
      const bookIds = await ChapterModel.find({
        $text: { $search: sanitizedFilter },
      })
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
    return await BookModel.findById(id).populate('chapters').lean().exec();
  }

  async selectRandomBook(retries = 5): Promise<BookValue> {
    const books = await this.selectRandomBooks(1);
    if (books.length === 0) {
      if (retries <= 0) {
        throw new Error('Failed to find book with chapters after max retries');
      }
      return this.selectRandomBook(retries - 1);
    }
    return books[0];
  }

  async selectRandomBooks(count: number): Promise<BookValue[]> {
    const randomBooks = await BookModel.aggregate(
      [
        { $match: { 'chapters.0': { $exists: true } } },
        { $sample: { size: count } },
        {
          $lookup: {
            as: 'chapters',
            foreignField: '_id',
            from: 'chapters',
            localField: 'chapters',
          },
        },
      ],
      { maxTimeMS: 5000 },
    );

    // Filter out books with empty chapters (edge case from lookup)
    return (randomBooks || []).filter(
      (book) => book.chapters && book.chapters.length > 0,
    );
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

  async addChapters(bookId: string, chapterIds: string[]): Promise<void> {
    if (chapterIds.length === 0) {return;}
    await BookModel.findByIdAndUpdate(bookId, {
      $push: { chapters: { $each: chapterIds } },
    }).exec();
  }

  async deleteByReference(reference: number): Promise<DeleteBookResult> {
    // Use findOneAndDelete to combine find + delete in one operation
    const book = await BookModel.findOneAndDelete({
      reference: String(reference),
    }).exec();

    if (!book) {
      return { deleted: false, chaptersDeleted: 0 };
    }

    // Delete all associated chapters
    const chapterResult = await ChapterModel.deleteMany({
      book: book._id,
    }).exec();

    return {
      deleted: true,
      chaptersDeleted: chapterResult.deletedCount ?? 0,
    };
  }
}
