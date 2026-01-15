import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type {
  UnsubscribeEmailQuery,
  UnsubscribeEmailResult,
} from './UnsubscribeEmailQuery';
import {
  type IEmailSubscriptionRepository,
  IEmailSubscriptionRepositoryToken,
} from '~/domain/repositories/IEmailSubscriptionRepository';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('unsubscribe-email-handler');

@injectable()
export class UnsubscribeEmailHandler implements IQueryHandler<
  UnsubscribeEmailQuery,
  UnsubscribeEmailResult
> {
  constructor(
    @inject(IEmailSubscriptionRepositoryToken)
    private readonly emailRepository: IEmailSubscriptionRepository,
  ) {}

  async execute(query: UnsubscribeEmailQuery): Promise<UnsubscribeEmailResult> {
    const { token } = query;

    if (!token || token.length !== 64) {
      return { success: false, message: 'Invalid unsubscribe token' };
    }

    try {
      const subscription =
        await this.emailRepository.findByUnsubscribeToken(token);

      if (!subscription) {
        return { success: false, message: 'Invalid unsubscribe link' };
      }

      if (subscription.status === 'unsubscribed') {
        return { success: true, message: 'Already unsubscribed' };
      }

      const unsubscribed = await this.emailRepository.unsubscribe(
        subscription.email,
      );

      if (unsubscribed) {
        log.info({ email: subscription.email }, 'Email unsubscribed');

        return { success: true, message: 'Successfully unsubscribed' };
      }

      return { success: false, message: 'Unsubscribe failed' };
    } catch (error) {
      log.error({ err: error, token }, 'Unsubscribe error');

      return { success: false, message: 'Unsubscribe failed' };
    }
  }
}
