import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be importable', async () => {
    const module = await import('@/features/haiku/composables/typewriter');
    expect(module.useTypewriter).toBeDefined();
  });

  it('should expose displayText, showCursor and start', async () => {
    const { useTypewriter } =
      await import('@/features/haiku/composables/typewriter');

    const result = useTypewriter('Hello');

    expect(result.displayText).toBeDefined();
    expect(result.showCursor).toBeDefined();
    expect(typeof result.start).toBe('function');
  });

  it('should start with empty displayText', async () => {
    const { useTypewriter } =
      await import('@/features/haiku/composables/typewriter');

    const { displayText } = useTypewriter('Hello');

    expect(displayText.value).toBe('');
  });

  it('should start with cursor showing', async () => {
    const { useTypewriter } =
      await import('@/features/haiku/composables/typewriter');

    const { showCursor } = useTypewriter('Hello');

    expect(showCursor.value).toBeTruthy();
  });

  it('should accept options', async () => {
    const { useTypewriter } =
      await import('@/features/haiku/composables/typewriter');

    const onComplete = vi.fn();

    expect(() =>
      useTypewriter('Hello', { speed: 100, startDelay: 50, onComplete }),
    ).not.toThrow();
  });
});
