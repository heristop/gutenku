import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type { GetHaikuVersionQuery } from './GetHaikuVersionQuery';
import type { HaikuVersion } from '@gutenku/shared';
import {
  IHaikuRepositoryToken,
  type IHaikuRepository,
} from '~/domain/repositories/IHaikuRepository';

@injectable()
export class GetHaikuVersionHandler implements IQueryHandler<
  GetHaikuVersionQuery,
  HaikuVersion
> {
  constructor(
    @inject(IHaikuRepositoryToken) private haikuRepo: IHaikuRepository,
  ) {}

  async execute(query: GetHaikuVersionQuery): Promise<HaikuVersion> {
    const cacheCount = await this.haikuRepo.getCacheCount();

    return {
      date: query.date,
      version: `${query.date}-${cacheCount}`,
    };
  }
}
