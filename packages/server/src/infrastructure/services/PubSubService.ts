import { PubSub } from 'graphql-subscriptions';
import { injectable } from 'tsyringe';

@injectable()
export class PubSubService {
    private readonly pubSub: PubSub;

    constructor() {
        this.pubSub = new PubSub();
    }

    public get instance(): PubSub {
        return this.pubSub;
    }
}
