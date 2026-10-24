import { PubSubEngine } from './pubsub-engine';
export declare class PubSubAsyncIterableIterator<T> implements AsyncIterableIterator<T> {
    private pullQueue;
    private pushQueue;
    private eventsArray;
    private allSubscribed;
    private running;
    private pubsub;
    constructor(pubsub: PubSubEngine, eventNames: string | readonly string[]);
    next(): Promise<IteratorResult<T>>;
    return(): Promise<IteratorResult<T>>;
    throw(error: any): Promise<never>;
    [Symbol.asyncIterator](): this;
    private pushValue;
    private pullValue;
    private emptyQueue;
    private subscribeAll;
    private unsubscribeAll;
}
