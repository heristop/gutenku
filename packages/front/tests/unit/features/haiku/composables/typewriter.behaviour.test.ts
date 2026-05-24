import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTypewriter } from '@/features/haiku/composables/typewriter';

describe('useTypewriter (timing behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('types one character at a time at the configured speed', () => {
    const { displayText, start } = useTypewriter('Hi', { speed: 100 });

    start();
    expect(displayText.value).toBe('H');

    vi.advanceTimersByTime(100);
    expect(displayText.value).toBe('Hi');
  });

  it('calls onComplete and hides cursor when finished', () => {
    const onComplete = vi.fn();
    const { showCursor, start } = useTypewriter('Hi', {
      speed: 50,
      onComplete,
    });

    start();
    vi.advanceTimersByTime(50); // second char
    vi.advanceTimersByTime(50); // completion tick

    expect(onComplete).toHaveBeenCalledOnce();
    expect(showCursor.value).toBeFalsy();
  });

  it('honors a start delay before typing', () => {
    const { displayText, start } = useTypewriter('Hi', {
      speed: 50,
      startDelay: 200,
    });

    start();
    expect(displayText.value).toBe('');

    vi.advanceTimersByTime(200);
    expect(displayText.value).toBe('H');
  });

  it('restarts cleanly when start is called again', () => {
    const { displayText, start } = useTypewriter('AB', { speed: 50 });

    start();
    vi.advanceTimersByTime(50);
    expect(displayText.value).toBe('AB');

    start(); // resets
    expect(displayText.value).toBe('A');
  });
});
