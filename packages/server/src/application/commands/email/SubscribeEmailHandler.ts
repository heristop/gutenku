import crypto from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import type { ICommandHandler } from '~/application/cqrs/ICommandHandler';
import type {
  SubscribeEmailCommand,
  SubscribeEmailResult,
} from './SubscribeEmailCommand';
import {
  type IEmailSubscriptionRepository,
  IEmailSubscriptionRepositoryToken,
} from '~/domain/repositories/IEmailSubscriptionRepository';
import { sendVerificationEmail } from '~/application/services/bridges/ResendBridge';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('subscribe-email-handler');

const TOKEN_EXPIRY_HOURS = 24;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@injectable()
export class SubscribeEmailHandler
  implements ICommandHandler<SubscribeEmailCommand, SubscribeEmailResult>
{
  constructor(
    @inject(IEmailSubscriptionRepositoryToken)
    private readonly emailRepository: IEmailSubscriptionRepository,
  ) {}

  async execute(command: SubscribeEmailCommand): Promise<SubscribeEmailResult> {
    const email = command.email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    try {
      const existing = await this.emailRepository.findByEmail(email);

      if (existing?.status === 'verified') {
        return { success: true, message: 'Already subscribed' };
      }

      if (existing?.status === 'pending') {
        const emailSent = await sendVerificationEmail(
          email,
          existing.verificationToken,
        );

        if (!emailSent) {
          return { success: false, message: 'Failed to send verification email' };
        }
        return { success: true, message: 'Verification email resent' };
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(
        Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
      );

      await this.emailRepository.create(
        email,
        verificationToken,
        unsubscribeToken,
        tokenExpiresAt,
      );

      const emailSent = await sendVerificationEmail(email, verificationToken);

      if (!emailSent) {
        log.warn({ email }, 'Subscription created but email failed to send');
        return { success: false, message: 'Failed to send verification email' };
      }

      log.info({ email }, 'Subscription initiated, verification email sent');
      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      log.error({ err: error, email }, 'Failed to process subscription');
      return { success: false, message: 'Subscription failed' };
    }
  }
}
