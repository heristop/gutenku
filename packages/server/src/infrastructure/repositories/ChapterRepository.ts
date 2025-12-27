import { injectable } from 'tsyringe';
import type { ChapterValue } from '~/shared/types';
import type { IChapterRepository } from '~/domain/repositories/IChapterRepository';
import ChapterModel from '~/infrastructure/models/ChapterModel';

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
        .exec();
    }

    return await ChapterModel.find().populate('book').exec();
  }

  async getChapterById(id: string) {
    return await ChapterModel.findById(id).populate('book').exec();
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
      .exec();
  }
}
