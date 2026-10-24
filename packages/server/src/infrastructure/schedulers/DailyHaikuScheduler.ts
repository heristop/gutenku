import { container } from 'tsyringe';
import { DailyHaikuRecorder } from '~/application/services/DailyHaikuRecorder';
import {
  getCurrentPublicationDate,
  getNextRolloverAt,
} from '~/domain/services/DailyHaikuSchedule';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('daily-haiku-scheduler');

/** Delay after the 10:00 UTC rollover, leaving the CLI post a head start. */
export const ROLLOVER_DELAY_MS = 5000;

export interface DailyHaikuSchedulerOptions {
  ensure?: (date: string) => Promise<unknown>;
  now?: () => Date;
}

export interface DailyHaikuSchedulerHandle {
  stop(): void;
}

/**
 * Records the haiku of each publication day in `daily_haikus` right after
 * the rollover (and once at boot), so the archive has no holes even when
 * the `post` CLI does not run.
 */
export function initDailyHaikuScheduler(
  options: DailyHaikuSchedulerOptions = {},
): DailyHaikuSchedulerHandle {
  const now = options.now ?? (() => new Date());
  const ensure =
    options.ensure ??
    ((date: string) => container.resolve(DailyHaikuRecorder).ensure(date));
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const run = async () => {
    const date = getCurrentPublicationDate(now());

    try {
      await ensure(date);
    } catch (err) {
      log.warn({ err, date }, 'Daily haiku recording failed');
    }
  };

  const arm = () => {
    if (stopped) {
      return;
    }

    const current = now();
    const delay =
      getNextRolloverAt(current).getTime() -
      current.getTime() +
      ROLLOVER_DELAY_MS;

    timer = setTimeout(() => {
      run().finally(arm);
    }, delay);
    timer.unref?.();
  };

  run();
  arm();

  return {
    stop() {
      stopped = true;

      if (timer) {
        clearTimeout(timer);
      }
    },
  };
}
