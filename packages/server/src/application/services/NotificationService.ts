import { container } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';
import {
  type IEmailSubscriptionRepository,
  IEmailSubscriptionRepositoryToken,
} from '~/domain/repositories/IEmailSubscriptionRepository';
import { sendDailyNotification } from './bridges/ResendBridge';

const log = createLogger('notification-service');

const BATCH_SIZE = 100;
const DELAY_BETWEEN_EMAILS_MS = 100;

export async function sendDailyNotifications(
  puzzleNumber: number,
): Promise<void> {
  const emailRepository = container.resolve<IEmailSubscriptionRepository>(
    IEmailSubscriptionRepositoryToken,
  );

  const totalSubscribers = await emailRepository.getVerifiedCount();

  if (totalSubscribers === 0) {
    log.info('No verified subscribers, skipping daily notifications');
    return;
  }

  log.info(
    { puzzleNumber, totalSubscribers },
    'Starting daily notification send',
  );

  let offset = 0;
  let sentCount = 0;
  let failedCount = 0;

  while (offset < totalSubscribers) {
    const subscribers = await emailRepository.getVerifiedSubscribers(
      BATCH_SIZE,
      offset,
    );

    for (const subscriber of subscribers) {
      try {
        const sent = await sendDailyNotification(
          subscriber.email,
          puzzleNumber,
          subscriber.unsubscribeToken,
        );

        if (sent) {
          await emailRepository.updateLastNotificationSent(subscriber.email);
          sentCount++;
        } else {
          failedCount++;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS);
        });
      } catch (error) {
        log.error(
          { err: error, email: subscriber.email },
          'Failed to send notification',
        );
        failedCount++;
      }
    }

    offset += BATCH_SIZE;
  }

  log.info(
    { puzzleNumber, sentCount, failedCount },
    'Daily notifications completed',
  );
}
