import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const detect = vi.fn();
const load = vi.fn();

vi.mock('@fingerprintjs/botd', () => ({
  load,
}));

describe('useBotDetection (detection behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    detect.mockReset();
    load.mockReset();
    load.mockResolvedValue({ detect });
    // Force the setTimeout fallback branch (no requestIdleCallback)
    delete (globalThis as Record<string, unknown>).requestIdleCallback;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle', async () => {
    const { useBotDetection } =
      await import('@/core/composables/bot-detection');
    const { isBot, isLoading } = useBotDetection();
    expect(isBot.value).toBeFalsy();
    expect(isLoading.value).toBeFalsy();
  });

  it('detects a bot via the fallback timer path', async () => {
    detect.mockReturnValue({ bot: true });
    const { useBotDetection } =
      await import('@/core/composables/bot-detection');
    const { isBot, isLoading, detectBot } = useBotDetection();

    detectBot();
    expect(isLoading.value).toBeTruthy();

    await vi.advanceTimersByTimeAsync(2000);

    expect(isBot.value).toBeTruthy();
    expect(isLoading.value).toBeFalsy();
  });

  it('uses requestIdleCallback when available', async () => {
    (globalThis as Record<string, unknown>).requestIdleCallback = (
      cb: () => void,
    ) => {
      cb();
      return 1;
    };
    detect.mockReturnValue({ bot: false });

    const { useBotDetection } =
      await import('@/core/composables/bot-detection');
    const { isBot, detectBot } = useBotDetection();

    detectBot();
    await vi.advanceTimersByTimeAsync(0);
    await Promise.resolve();

    expect(isBot.value).toBeFalsy();
    delete (globalThis as Record<string, unknown>).requestIdleCallback;
  });

  it('does not run twice while loading', async () => {
    detect.mockReturnValue({ bot: false });
    const { useBotDetection } =
      await import('@/core/composables/bot-detection');
    const { detectBot } = useBotDetection();

    detectBot();
    detectBot(); // ignored while loading

    await vi.advanceTimersByTimeAsync(2000);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('handles detection errors gracefully', async () => {
    load.mockRejectedValue(new Error('load failed'));
    const { useBotDetection } =
      await import('@/core/composables/bot-detection');
    const { isBot, isLoading, detectBot } = useBotDetection();

    detectBot();
    await vi.advanceTimersByTimeAsync(2000);

    expect(isBot.value).toBeFalsy();
    expect(isLoading.value).toBeFalsy();
  });
});
