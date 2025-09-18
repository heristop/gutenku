import { injectable, inject } from 'tsyringe';
import { IMessagePublisher } from '../../application/messaging/IMessagePublisher';
import { PubSubService } from '../services/PubSubService';

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
