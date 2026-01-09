import { injectable } from 'tsyringe';
import type { ChapterValue } from '~/shared/types';
import type {
  IChapterRepository,
  CreateChapterInput,
} from '~/domain/repositories/IChapterRepository';
import ChapterModel from '~/infrastructure/models/ChapterModel';
import BookModel from '~/infrastructure/models/BookModel';

@injectable()
export default class ChapterRepository implements IChapterRepository {
  async getAllChapters(filter: string | null) {
    if (filter) {
      return await ChapterModel.find(
        { $text: { $search: filter } },
        { score: { $meta: 'textScore' } },
      )
        .sort({ score: { $meta: 'textScore' } })
        .populate('book')
        .lean()
        .exec();
    }

    return await ChapterModel.find().populate('book').lean().exec();
  }

  async getChapterById(id: string) {
    return await ChapterModel.findById(id).populate('book').lean().exec();
  }

  async getFilteredChapters(filterWords: string[]): Promise<ChapterValue[]> {
    const searchTerms = filterWords.join(' ');

    return await ChapterModel.find(
      { $text: { $search: searchTerms } },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(100)
      .populate('book')
      .lean()
      .exec();
  }

  async getChaptersByBookReference(reference: string): Promise<ChapterValue[]> {
    const book = await BookModel.findOne({ reference }).lean().exec();
    if (!book) {
      return [];
    }
    // Skip populate since we already have the book - attach it manually
    const chapters = await ChapterModel.find({ book: book._id }).lean().exec();
    return chapters.map((chapter) => ({ ...chapter, book })) as ChapterValue[];
  }

  async createMany(chapters: CreateChapterInput[]): Promise<string[]> {
    const createdChapters = await ChapterModel.insertMany(
      chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
        book: ch.bookId,
      })),
    );

    return createdChapters.map((ch) => ch._id.toString());
  }

  async deleteByBookId(bookId: string): Promise<number> {
    const result = await ChapterModel.deleteMany({ book: bookId }).exec();
    return result.deletedCount ?? 0;
  }
}
