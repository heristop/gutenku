import { inject, injectable } from 'tsyringe';
import { type IQueryBus, IQueryBusToken } from '~/application/cqrs';
import {
  GetAllChaptersQuery,
  GetChapterByIdQuery,
} from '~/application/queries/chapters';

@injectable()
export default class ChapterService {
  constructor(@inject(IQueryBusToken) private readonly queryBus: IQueryBus) {}

  async getAllChapters(filter: string | null) {
    return this.queryBus.execute(new GetAllChaptersQuery(filter));
  }

  async getChapterById(id: string) {
    return this.queryBus.execute(new GetChapterByIdQuery(id));
  }
}
