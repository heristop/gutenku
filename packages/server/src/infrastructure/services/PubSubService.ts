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

  public publish<T>(trigger: string, payload: T): Promise<void> {
    return this.pubSub.publish(trigger, payload);
  }

  public iterator<T = unknown>(
    triggers: string | readonly string[],
  ): AsyncIterableIterator<T> {
    interface Compat<T> {
      asyncIterableIterator?: (
        t: string | readonly string[],
      ) => AsyncIterableIterator<T>;
      asyncIterator?: (t: string | readonly string[]) => AsyncIterator<T>;
    }

    const compat = this.pubSub as unknown as Compat<T>;

    if (compat.asyncIterableIterator) {
      return compat.asyncIterableIterator(triggers);
    }

    if (compat.asyncIterator) {
      const iter = compat.asyncIterator(triggers);
      const asyncIter: AsyncIterableIterator<T> = {
        next: iter.next.bind(iter),
        return: iter.return?.bind(iter),
        throw: iter.throw?.bind(iter),
        [Symbol.asyncIterator]() {
          return this;
        },
      } as AsyncIterableIterator<T>;
      return asyncIter;
    }

    throw new Error('PubSub does not expose an async iterator method');
  }
}
