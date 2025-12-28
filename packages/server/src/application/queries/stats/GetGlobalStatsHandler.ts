import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetGlobalStatsQuery } from './GetGlobalStatsQuery';
import {
  type IGlobalStatsRepository,
  type GlobalStatsValue,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';

@injectable()
export class GetGlobalStatsHandler implements IQueryHandler<
  GetGlobalStatsQuery,
  GlobalStatsValue
> {
  constructor(
    @inject(IGlobalStatsRepositoryToken)
    private readonly globalStatsRepository: IGlobalStatsRepository,
  ) {}

  async execute(_query: GetGlobalStatsQuery): Promise<GlobalStatsValue> {
    return this.globalStatsRepository.getGlobalStats();
  }
}
