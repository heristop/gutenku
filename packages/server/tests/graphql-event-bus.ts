import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { GraphQLEventBus } from '../src/application/events/GraphQLEventBus';
import type { DomainEvent } from '../src/domain/events/DomainEvent';

describe('GraphQLEventBus', () => {
  it('publish resolves without throwing (no-op)', async () => {
    const bus = new GraphQLEventBus();
    const event = {
      eventName: 'TestEvent',
      occurredOn: new Date(),
      payload: { foo: 'bar' },
    } as unknown as DomainEvent<unknown>;

    await expect(bus.publish(event)).resolves.toBeUndefined();
  });
});
