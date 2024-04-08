import { PubSub } from 'graphql-subscriptions';
import { singleton } from 'tsyringe';

@singleton()
export class PubSubService {
  private readonly pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  public get instance(): PubSub {
    return this.pubSub;
  }
}
