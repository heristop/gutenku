/// <reference types="node" />
import { EventEmitter } from 'events';
import { PubSubEngine } from './pubsub-engine';
export interface PubSubOptions {
    eventEmitter?: EventEmitter;
}
export declare class PubSub<Events extends {
    [event: string]: unknown;
} = Record<string, never>> extends PubSubEngine {
    protected ee: EventEmitter;
    private subscriptions;
    private subIdCounter;
    constructor(options?: PubSubOptions);
    publish<K extends keyof Events>(triggerName: K & string, payload: Events[K] extends never ? any : Events[K]): Promise<void>;
    subscribe<K extends keyof Events>(triggerName: K & string, onMessage: (...args: any[]) => void): Promise<number>;
    unsubscribe(subId: number): void;
}
