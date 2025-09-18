import { injectable } from 'tsyringe';
import { ChapterValue } from '../../shared/types';
import { IChapterRepository } from '../../domain/repositories/IChapterRepository';
import ChapterModel from '../models/ChapterModel';

@injectable()
export default class ChapterRepository implements IChapterRepository {
  async getAllChapters(filter: string | null) {
    const query = {};

    if (filter) {
      // eslint-disable-next-line
      query['content'] = { $regex: filter, $options: 'i' };
    }

    return await ChapterModel.find(query).populate('book').exec();
  }

  async getChapterById(id: string) {
    return await ChapterModel.findById(id).populate('book').exec();
  }

  async getFilteredChapters(filterWords: string[]): Promise<ChapterValue[]> {
    const filterPattern = filterWords.join('|');
    const query = { content: { $regex: filterPattern, $options: 'i' } };

    return await ChapterModel.find(query).populate('book').exec();
  }
}
