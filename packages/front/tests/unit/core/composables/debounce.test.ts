import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebouncedCallback } from '@/core/composables/debounce';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { debouncedFn } = useDebouncedCallback(callback, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use default delay of 300ms', () => {
    const callback = vi.fn();
    const { debouncedFn } = useDebouncedCallback(callback);

    debouncedFn();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = vi.fn();
    const { debouncedFn } = useDebouncedCallback(callback, 100);

    debouncedFn('arg1', 'arg2');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should track pending state', () => {
    const callback = vi.fn();
    const { debouncedFn, isPending } = useDebouncedCallback(callback, 100);

    expect(isPending.value).toBe(false);

    debouncedFn();
    expect(isPending.value).toBe(true);

    vi.advanceTimersByTime(100);
    expect(isPending.value).toBe(false);
  });

  it('should reset timer on subsequent calls', () => {
    const callback = vi.fn();
    const { debouncedFn } = useDebouncedCallback(callback, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);

    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use last arguments when called multiple times', () => {
    const callback = vi.fn();
    const { debouncedFn } = useDebouncedCallback(callback, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledWith('third');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
