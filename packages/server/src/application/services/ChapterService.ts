import { inject, injectable } from 'tsyringe';
import { IChapterRepository } from '../../domain/repositories/IChapterRepository';

@injectable()
export default class ChapterService {
  constructor(
    @inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async getAllChapters(filter: string | null) {
    return await this.chapterRepository.getAllChapters(filter);
  }

  async getChapterById(id: string) {
    return await this.chapterRepository.getChapterById(id);
  }
}
