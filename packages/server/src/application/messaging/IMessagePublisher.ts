export interface IMessagePublisher {
  publish(trigger: string, payload: Record<string, unknown>): Promise<void>;
}

export const IMessagePublisherToken = 'IMessagePublisher';
