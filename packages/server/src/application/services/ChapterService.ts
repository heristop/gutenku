import { injectable } from 'tsyringe';
import ChapterRepository from '../../infrastructure/repositories/ChapterRepository';

@injectable()
export default class ChapterService {
  constructor(private readonly chapterRepository: ChapterRepository) {}

  async getAllChapters(filter: string | null) {
    return await this.chapterRepository.getAllChapters(filter);
  }

  async getChapterById(id: string) {
    return await this.chapterRepository.getChapterById(id);
  }
}
