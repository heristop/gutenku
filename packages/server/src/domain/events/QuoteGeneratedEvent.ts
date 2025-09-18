import { DomainEvent } from './DomainEvent';

export type QuoteGeneratedPayload = { quote: string };

export class QuoteGeneratedEvent implements DomainEvent<QuoteGeneratedPayload> {
  readonly type = 'QUOTE_GENERATED';
  constructor(public payload: QuoteGeneratedPayload) {}
}
