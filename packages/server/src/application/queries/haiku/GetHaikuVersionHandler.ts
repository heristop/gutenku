import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GetHaikuVersionQuery } from './GetHaikuVersionQuery';
import type { HaikuVersion } from '@gutenku/shared';
import {
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';

@injectable()
export class GetHaikuVersionHandler implements IQueryHandler<
  GetHaikuVersionQuery,
  HaikuVersion
> {
  constructor(
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
  ) {}

  async execute(query: GetHaikuVersionQuery): Promise<HaikuVersion> {
    const cacheCount = await this.haikuRepository.getCacheCount();
    return {
      date: query.date,
      version: `${query.date}-${cacheCount}`,
    };
  }
}
