import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset module to clear shared state between tests
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a success toast', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts } = useToast();

    success('Success message');

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].message).toBe('Success message');
    expect(toasts.value[0].type).toBe('success');
  });

  it('should add an error toast', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { error, toasts } = useToast();

    error('Error message');

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].message).toBe('Error message');
    expect(toasts.value[0].type).toBe('error');
    expect(toasts.value[0].closable).toBe(true);
  });

  it('should add an info toast', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { info, toasts } = useToast();

    info('Info message');

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].message).toBe('Info message');
    expect(toasts.value[0].type).toBe('info');
  });

  it('should auto-remove toast after timeout', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts } = useToast();

    success('Will disappear');

    expect(toasts.value).toHaveLength(1);

    vi.advanceTimersByTime(2500);

    expect(toasts.value).toHaveLength(0);
  });

  it('should use different default timeouts per type', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, error, info, toasts } = useToast();

    success('Success');
    vi.advanceTimersByTime(2499);
    expect(toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);

    info('Info');
    vi.advanceTimersByTime(2999);
    expect(toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);

    error('Error');
    vi.advanceTimersByTime(3999);
    expect(toasts.value).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);
  });

  it('should allow custom timeout', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts } = useToast();

    success('Custom timeout', { timeout: 1000 });

    vi.advanceTimersByTime(999);
    expect(toasts.value).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);
  });

  it('should allow manual removal', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts, remove } = useToast();

    const id = success('Removable');
    expect(toasts.value).toHaveLength(1);

    remove(id);
    expect(toasts.value).toHaveLength(0);
  });

  it('should handle multiple toasts', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, error, info, toasts } = useToast();

    success('Success');
    error('Error');
    info('Info');

    expect(toasts.value).toHaveLength(3);
  });

  it('should return unique ids', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success } = useToast();

    const id1 = success('First');
    const id2 = success('Second');

    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('number');
    expect(typeof id2).toBe('number');
  });

  it('should not auto-remove with timeout of 0', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts } = useToast();

    success('Permanent', { timeout: 0 });

    vi.advanceTimersByTime(10000);

    // Toast should still exist (not auto-removed)
    expect(toasts.value).toHaveLength(1);
  });

  it('should allow custom closable option', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { success, toasts } = useToast();

    success('Closable', { closable: true });

    expect(toasts.value[0].closable).toBe(true);
  });

  it('should handle removing non-existent toast gracefully', async () => {
    const { useToast } = await import('@/core/composables/toast');
    const { remove } = useToast();

    expect(() => remove(9999)).not.toThrow();
  });
});
