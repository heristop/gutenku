import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetAllChaptersQuery } from './GetAllChaptersQuery';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import type { ChapterValue } from '~/shared/types';

@injectable()
export class GetAllChaptersHandler implements IQueryHandler<
  GetAllChaptersQuery,
  ChapterValue[]
> {
  constructor(
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(query: GetAllChaptersQuery): Promise<ChapterValue[]> {
    return this.chapterRepository.getAllChapters(query.filter ?? null);
  }
}
