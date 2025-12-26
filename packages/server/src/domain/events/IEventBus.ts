import type { DomainEvent } from './DomainEvent';

export interface IEventBus {
  publish<E extends DomainEvent<unknown>>(event: E): Promise<void>;
}

export const IEventBusToken = 'IEventBus';
