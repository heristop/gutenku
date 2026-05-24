import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useQuoteRotation } from '@/features/haiku/composables/quote-rotation';

describe('useQuoteRotation (timing behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts hidden at index zero', () => {
    const { currentIndex, showQuote } = useQuoteRotation(['a', 'b', 'c']);
    expect(currentIndex.value).toBe(0);
    expect(showQuote.value).toBeFalsy();
  });

  it('reveals quote and rotates on interval', () => {
    const onRotate = vi.fn();
    const { currentIndex, showQuote, start } = useQuoteRotation(
      ['a', 'b', 'c'],
      { intervalMs: 1000, onRotate },
    );

    start();
    expect(showQuote.value).toBeTruthy();

    vi.advanceTimersByTime(1000);
    expect(currentIndex.value).toBe(1);
    expect(onRotate).toHaveBeenCalledWith(1);

    vi.advanceTimersByTime(2000);
    expect(currentIndex.value).toBe(0); // wraps around
  });

  it('respects a start delay before beginning rotation', () => {
    const { showQuote, start } = useQuoteRotation(['a', 'b'], {
      intervalMs: 1000,
      startDelay: 500,
    });

    start();
    expect(showQuote.value).toBeFalsy();

    vi.advanceTimersByTime(500);
    expect(showQuote.value).toBeTruthy();
  });

  it('does not start twice when already active', () => {
    const onRotate = vi.fn();
    const { start } = useQuoteRotation(['a', 'b'], {
      intervalMs: 1000,
      onRotate,
    });

    start();
    start(); // second call is a no-op while active

    vi.advanceTimersByTime(1000);
    expect(onRotate).toHaveBeenCalledTimes(1);
  });
});
