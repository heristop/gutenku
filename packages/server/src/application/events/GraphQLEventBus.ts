import { injectable } from 'tsyringe';
import type { IEventBus } from '~/domain/events/IEventBus';
import type { DomainEvent } from '~/domain/events/DomainEvent';

@injectable()
export class GraphQLEventBus implements IEventBus {
  async publish<E extends DomainEvent<unknown>>(_event: E): Promise<void> {
    // No events currently published via GraphQL subscriptions
  }
}
