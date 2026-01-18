import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Note: useLoadingMessages uses onMounted/onUnmounted which require component context
// We test the core logic by calling the function directly and checking initial state

describe('useLoadingMessages', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a message ref', async () => {
    // Mock Vue lifecycle hooks
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
      };
    });

    const { useLoadingMessages } = await import(
      '@/core/composables/loading-messages'
    );
    const { message } = useLoadingMessages();

    expect(message).toBeDefined();
    expect(message.value).toHaveProperty('text');
    expect(message.value).toHaveProperty('icon');
  });

  it('should accept custom messages', async () => {
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
      };
    });

    const { Sparkles } = await import('lucide-vue-next');
    const { useLoadingMessages } = await import(
      '@/core/composables/loading-messages'
    );

    const customMessages = [
      { icon: Sparkles, text: 'Custom message 1' },
      { icon: Sparkles, text: 'Custom message 2' },
    ];

    const { message } = useLoadingMessages({ messages: customMessages });

    expect(message.value.text).toMatch(/Custom message [12]/);
  });

  it('should accept custom interval', async () => {
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
      };
    });

    const { useLoadingMessages } = await import(
      '@/core/composables/loading-messages'
    );

    // Should not throw with custom interval
    expect(() =>
      useLoadingMessages({ intervalMs: 1000 }),
    ).not.toThrow();
  });

  it('should accept context option', async () => {
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
      };
    });

    const { useLoadingMessages } = await import(
      '@/core/composables/loading-messages'
    );

    const { message } = useLoadingMessages({ context: 'craft' });

    expect(message.value.text).toBeTruthy();
  });

  it('should use default context when not specified', async () => {
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((cb) => cb()),
        onUnmounted: vi.fn(),
      };
    });

    const { useLoadingMessages } = await import(
      '@/core/composables/loading-messages'
    );

    const { message } = useLoadingMessages();

    expect(message.value.text).toBeTruthy();
  });
});
