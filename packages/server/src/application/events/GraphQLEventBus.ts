import { inject, injectable } from 'tsyringe';
import type { IEventBus } from '~/domain/events/IEventBus';
import type { DomainEvent } from '~/domain/events/DomainEvent';
import {
  type IMessagePublisher,
  IMessagePublisherToken,
} from '~/application/messaging/IMessagePublisher';
import { QuoteGeneratedEvent } from '~/domain/events/QuoteGeneratedEvent';

@injectable()
export class GraphQLEventBus implements IEventBus {
  constructor(
    @inject(IMessagePublisherToken)
    private readonly publisher: IMessagePublisher,
  ) {}

  async publish<E extends DomainEvent<unknown>>(event: E): Promise<void> {
    // Map known domain events to GraphQL payloads explicitly
    if (event instanceof QuoteGeneratedEvent) {
      await this.publisher.publish(event.type, {
        quoteGenerated: event.payload.quote,
      });
    }
  }
}
