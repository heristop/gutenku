import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetChapterByIdQuery } from './GetChapterByIdQuery';
import {
  type IChapterRepository,
  IChapterRepositoryToken,
} from '~/domain/repositories/IChapterRepository';
import type { ChapterValue } from '~/shared/types';

@injectable()
export class GetChapterByIdHandler implements IQueryHandler<
  GetChapterByIdQuery,
  ChapterValue | null
> {
  constructor(
    @inject(IChapterRepositoryToken)
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(query: GetChapterByIdQuery): Promise<ChapterValue | null> {
    return this.chapterRepository.getChapterById(query.id);
  }
}
