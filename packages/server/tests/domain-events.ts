import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { QuoteGeneratedEvent } from '~/domain/events/QuoteGeneratedEvent';

describe('QuoteGeneratedEvent', () => {
  it('creates event with correct type', () => {
    const event = new QuoteGeneratedEvent({ quote: 'test quote' });
    expect(event.type).toBe('QUOTE_GENERATED');
  });

  it('stores payload correctly', () => {
    const event = new QuoteGeneratedEvent({ quote: 'my test quote' });
    expect(event.payload.quote).toBe('my test quote');
  });

  it('implements DomainEvent interface', () => {
    const event = new QuoteGeneratedEvent({ quote: 'test' });
    expect(event).toHaveProperty('type');
    expect(event).toHaveProperty('payload');
  });

  it('handles empty quote', () => {
    const event = new QuoteGeneratedEvent({ quote: '' });
    expect(event.payload.quote).toBe('');
    expect(event.type).toBe('QUOTE_GENERATED');
  });

  it('handles quote with special characters', () => {
    const quote = 'Line 1\nLine 2\tTabbed "quoted" \'apostrophe\'';
    const event = new QuoteGeneratedEvent({ quote });
    expect(event.payload.quote).toBe(quote);
  });

  it('handles unicode characters in quote', () => {
    const quote = '日本語 🌸 émojis';
    const event = new QuoteGeneratedEvent({ quote });
    expect(event.payload.quote).toBe(quote);
  });

  it('type property is constant', () => {
    const event1 = new QuoteGeneratedEvent({ quote: 'test1' });
    const event2 = new QuoteGeneratedEvent({ quote: 'test2' });
    // All instances share the same type
    expect(event1.type).toBe(event2.type);
    expect(event1.type).toBe('QUOTE_GENERATED');
  });
});
