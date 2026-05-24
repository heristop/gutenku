import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withSetup } from '../../helpers/with-setup';
import { Sparkles } from '@lucide/vue';

describe('useLoadingMessages (rotation behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // deterministic shuffle order
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rotates messages on the interval and stops on unmount', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const messages = [
      { icon: Sparkles, text: 'one' },
      { icon: Sparkles, text: 'two' },
      { icon: Sparkles, text: 'three' },
    ];

    const { result, unmount } = withSetup(() =>
      useLoadingMessages({ messages, intervalMs: 1000 }),
    );

    const first = result.message.value.text;
    vi.advanceTimersByTime(1000);
    expect(result.message.value.text).not.toBe(first);

    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('does not start a timer for a single-message pool', async () => {
    const setInterval = vi.spyOn(globalThis, 'setInterval');
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const { result, unmount } = withSetup(() =>
      useLoadingMessages({ messages: [{ icon: Sparkles, text: 'solo' }] }),
    );

    expect(result.message.value.text).toBe('solo');
    expect(setInterval).not.toHaveBeenCalled();
    unmount();
  });

  it('selects from the craft pool when requested', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const { result, unmount } = withSetup(() =>
      useLoadingMessages({ context: 'craft' }),
    );

    expect(result.message.value.text).toBeTruthy();
    unmount();
  });
});
