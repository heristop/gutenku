import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Vue lifecycle hooks at top level
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: vi.fn((cb) => cb()),
    onUnmounted: vi.fn(),
  };
});

describe('useLoadingMessages', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a message ref', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');
    const { message } = useLoadingMessages();

    expect(message).toBeDefined();
    expect(message.value).toHaveProperty('text');
    expect(message.value).toHaveProperty('icon');
  });

  it('should accept custom messages', async () => {
    const { Sparkles } = await import('lucide-vue-next');
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const customMessages = [
      { icon: Sparkles, text: 'Custom message 1' },
      { icon: Sparkles, text: 'Custom message 2' },
    ];

    const { message } = useLoadingMessages({ messages: customMessages });

    expect(message.value.text).toMatch(/Custom message [12]/);
  });

  it('should accept custom interval', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    // Should not throw with custom interval
    expect(() => useLoadingMessages({ intervalMs: 1000 })).not.toThrow();
  });

  it('should accept context option', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const { message } = useLoadingMessages({ context: 'craft' });

    expect(message.value.text).toBeTruthy();
  });

  it('should use default context when not specified', async () => {
    const { useLoadingMessages } =
      await import('@/core/composables/loading-messages');

    const { message } = useLoadingMessages();

    expect(message.value.text).toBeTruthy();
  });
});
