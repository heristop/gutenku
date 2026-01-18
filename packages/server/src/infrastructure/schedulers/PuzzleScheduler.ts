import { container } from 'tsyringe';
import { PubSubService } from '../services/PubSubService';
import { getPuzzleNumber } from '@gutenku/shared';
import { getGutenGuessBooks } from '~~/data';

function scheduleNextPuzzle(): void {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
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

    // Schedule next day
    scheduleNextPuzzle();
  }, msUntilMidnight);
}

export function initPuzzleScheduler(): void {
  scheduleNextPuzzle();
}
