import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useQuoteRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be importable', async () => {
    const module = await import('@/features/haiku/composables/quote-rotation');
    expect(module.useQuoteRotation).toBeDefined();
  });

  it('should expose currentIndex, showQuote and start', async () => {
    const { useQuoteRotation } =
      await import('@/features/haiku/composables/quote-rotation');

    const quotes = ['Quote 1', 'Quote 2', 'Quote 3'];
    const result = useQuoteRotation(quotes);

    expect(result.currentIndex).toBeDefined();
    expect(result.showQuote).toBeDefined();
    expect(typeof result.start).toBe('function');
  });

  it('should start with currentIndex at 0', async () => {
    const { useQuoteRotation } =
      await import('@/features/haiku/composables/quote-rotation');

    const quotes = ['Quote 1', 'Quote 2'];
    const { currentIndex } = useQuoteRotation(quotes);

    expect(currentIndex.value).toBe(0);
  });

  it('should start with showQuote as false', async () => {
    const { useQuoteRotation } =
      await import('@/features/haiku/composables/quote-rotation');

    const quotes = ['Quote 1', 'Quote 2'];
    const { showQuote } = useQuoteRotation(quotes);

    expect(showQuote.value).toBeFalsy();
  });

  it('should accept options', async () => {
    const { useQuoteRotation } =
      await import('@/features/haiku/composables/quote-rotation');

    const quotes = ['Quote 1', 'Quote 2'];
    const onRotate = vi.fn();

    expect(() =>
      useQuoteRotation(quotes, { intervalMs: 3000, startDelay: 100, onRotate }),
    ).not.toThrow();
  });
});
