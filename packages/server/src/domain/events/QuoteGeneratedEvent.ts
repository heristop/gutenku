import type { DomainEvent } from '~/domain/events/DomainEvent';

export interface QuoteGeneratedPayload {
  quote: string;
}

export class QuoteGeneratedEvent implements DomainEvent<QuoteGeneratedPayload> {
  readonly type = 'QUOTE_GENERATED';
  constructor(public payload: QuoteGeneratedPayload) {}
}
