import { container } from 'tsyringe';
import { PubSubService } from '../services/PubSubService';
import { getPuzzleNumber } from '@gutenku/shared';
import { getGutenGuessBooks } from '~~/data';
import { sendDailyNotifications } from '~/application/services/NotificationService';
import { createLogger } from '../services/Logger';

const log = createLogger('puzzle-scheduler');

function scheduleNextPuzzle(): void {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(async () => {
    const pubSub = container.resolve(PubSubService);
    const today = new Date().toISOString().split('T')[0];
    const puzzleNumber = getPuzzleNumber(today);
    const bookCount = getGutenGuessBooks().length;

    pubSub.publish('PUZZLE_AVAILABLE', {
      puzzleAvailable: {
        puzzleNumber,
        version: `${puzzleNumber}-${bookCount}`,
      },
    });

    // Send email notifications to verified subscribers
    try {
      await sendDailyNotifications(puzzleNumber);
    } catch (error) {
      log.error({ err: error }, 'Failed to send daily notifications');
    }

    // Schedule next day
    scheduleNextPuzzle();
  }, msUntilMidnight);
}

export function initPuzzleScheduler(): void {
  scheduleNextPuzzle();
}
