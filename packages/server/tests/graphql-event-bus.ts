import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GraphQLEventBus } from '~/application/events/GraphQLEventBus';
import type { IMessagePublisher } from '~/application/messaging/IMessagePublisher';
import { QuoteGeneratedEvent } from '~/domain/events/QuoteGeneratedEvent';
import type { DomainEvent } from '~/domain/events/DomainEvent';

describe('GraphQLEventBus', () => {
  const createMockPublisher = (): IMessagePublisher => ({
    publish: vi.fn().mockResolvedValue(),
  });

  it('publishes QuoteGeneratedEvent with correct payload', async () => {
    const publisher = createMockPublisher();
    const eventBus = new GraphQLEventBus(publisher);

    const event = new QuoteGeneratedEvent({ quote: 'test quote' });
    await eventBus.publish(event);

    expect(publisher.publish).toHaveBeenCalledWith('QUOTE_GENERATED', {
      quoteGenerated: 'test quote',
    });
  });

  it('publishes QuoteGeneratedEvent with empty quote', async () => {
    const publisher = createMockPublisher();
    const eventBus = new GraphQLEventBus(publisher);

    const event = new QuoteGeneratedEvent({ quote: '' });
    await eventBus.publish(event);

    expect(publisher.publish).toHaveBeenCalledWith('QUOTE_GENERATED', {
      quoteGenerated: '',
    });
  });

  it('does not publish for unknown event types', async () => {
    const publisher = createMockPublisher();
    const eventBus = new GraphQLEventBus(publisher);

    // Create a mock unknown event
    const unknownEvent: DomainEvent<unknown> = {
      type: 'UNKNOWN_EVENT',
      payload: { data: 'test' },
      occurredAt: new Date(),
    };

    await eventBus.publish(unknownEvent);

    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('handles publisher errors gracefully', async () => {
    const publisher = createMockPublisher();
    (publisher.publish as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Publish failed'),
    );
    const eventBus = new GraphQLEventBus(publisher);

    const event = new QuoteGeneratedEvent({ quote: 'test' });

    await expect(eventBus.publish(event)).rejects.toThrow('Publish failed');
  });

  it('publishes QuoteGeneratedEvent with special characters', async () => {
    const publisher = createMockPublisher();
    const eventBus = new GraphQLEventBus(publisher);

    const event = new QuoteGeneratedEvent({
      quote: 'Test with "quotes" and \'apostrophes\'',
    });
    await eventBus.publish(event);

    expect(publisher.publish).toHaveBeenCalledWith('QUOTE_GENERATED', {
      quoteGenerated: 'Test with "quotes" and \'apostrophes\'',
    });
  });
});
