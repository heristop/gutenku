import { inject, injectable } from 'tsyringe';
import type { IMessagePublisher } from '~/application/messaging/IMessagePublisher';
import { PubSubService } from '~/infrastructure/services/PubSubService';

@injectable()
export class PubSubMessagePublisher implements IMessagePublisher {
  constructor(@inject(PubSubService) private readonly pubsub: PubSubService) {}

  async publish(
    trigger: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.pubsub.instance.publish(trigger, payload);
  }
}
