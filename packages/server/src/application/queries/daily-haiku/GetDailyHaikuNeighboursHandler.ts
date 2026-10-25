import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type { GetDailyHaikuNeighboursQuery } from './GetDailyHaikuNeighboursQuery';
import {
  IDailyHaikuRepositoryToken,
  type DailyHaikuNeighbours,
  type IDailyHaikuRepository,
} from '~/domain/repositories/IDailyHaikuRepository';
import { getCurrentPublicationDate } from '~/domain/services/DailyHaikuSchedule';

@injectable()
export class GetDailyHaikuNeighboursHandler implements IQueryHandler<
  GetDailyHaikuNeighboursQuery,
  DailyHaikuNeighbours
> {
  constructor(
    @inject(IDailyHaikuRepositoryToken)
    private readonly repository: IDailyHaikuRepository,
  ) {}

  execute(query: GetDailyHaikuNeighboursQuery): Promise<DailyHaikuNeighbours> {
    return this.repository.findNeighbours(
      query.date,
      getCurrentPublicationDate(),
    );
  }
}
