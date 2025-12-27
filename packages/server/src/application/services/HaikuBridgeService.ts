import { inject, injectable } from 'tsyringe';
import type { HaikuValue, HaikuVariables } from '~/shared/types';
import { type IQueryBus, IQueryBusToken } from '~/application/cqrs';
import { GenerateHaikuQuery } from '~/application/queries/haiku';

@injectable()
export default class HaikuBridgeService {
  constructor(@inject(IQueryBusToken) private readonly queryBus: IQueryBus) {}

  async generate(args: HaikuVariables): Promise<HaikuValue> {
    return this.queryBus.execute(new GenerateHaikuQuery(args));
  }
}
