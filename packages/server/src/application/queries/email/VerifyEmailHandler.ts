import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { VerifyEmailQuery, VerifyEmailResult } from './VerifyEmailQuery';
import {
  type IEmailSubscriptionRepository,
  IEmailSubscriptionRepositoryToken,
} from '~/domain/repositories/IEmailSubscriptionRepository';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('verify-email-handler');

@injectable()
export class VerifyEmailHandler
  implements IQueryHandler<VerifyEmailQuery, VerifyEmailResult>
{
  constructor(
    @inject(IEmailSubscriptionRepositoryToken)
    private readonly emailRepository: IEmailSubscriptionRepository,
  ) {}

  async execute(query: VerifyEmailQuery): Promise<VerifyEmailResult> {
    const { token } = query;

    if (!token || token.length !== 64) {
      return { success: false, message: 'Invalid verification token' };
    }

    try {
      const subscription =
        await this.emailRepository.findByVerificationToken(token);

      if (!subscription) {
        return {
          success: false,
          message: 'Invalid or expired verification link',
        };
      }

      if (subscription.status === 'verified') {
        return { success: true, message: 'Email already verified' };
      }

      if (subscription.status === 'unsubscribed') {
        return { success: false, message: 'This email has been unsubscribed' };
      }

      const verified = await this.emailRepository.verify(subscription.email);

      if (verified) {
        log.info({ email: subscription.email }, 'Email verified successfully');
        return { success: true, message: 'Email verified successfully' };
      }

      return { success: false, message: 'Verification failed' };
    } catch (error) {
      log.error({ err: error, token }, 'Verification error');
      return { success: false, message: 'Verification failed' };
    }
  }
}
