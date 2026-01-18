import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollLock } from '@/core/composables/scroll-lock';

describe('useScrollLock', () => {
  let originalScrollY: number;
  let originalBodyStyle: CSSStyleDeclaration;

  beforeEach(() => {
    originalScrollY = globalThis.scrollY;
    originalBodyStyle = document.body.style;

    // Mock scrollY
    Object.defineProperty(globalThis, 'scrollY', {
      value: 100,
      writable: true,
      configurable: true,
    });

    // Mock scrollTo
    globalThis.scrollTo = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'scrollY', {
      value: originalScrollY,
      writable: true,
      configurable: true,
    });
    document.body.style.cssText = '';
  });

  it('should start unlocked', () => {
    const { isLocked } = useScrollLock();
    expect(isLocked.value).toBe(false);
  });

  it('should lock scroll', () => {
    const { isLocked, lock } = useScrollLock();

    lock();

    expect(isLocked.value).toBe(true);
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-100px');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should unlock scroll', () => {
    const { isLocked, lock, unlock } = useScrollLock();

    lock();
    expect(isLocked.value).toBe(true);

    unlock();

    expect(isLocked.value).toBe(false);
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.overflow).toBe('');
    expect(globalThis.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  it('should not double-lock', () => {
    const { isLocked, lock } = useScrollLock();

    lock();
    lock();

    expect(isLocked.value).toBe(true);
  });

  it('should not double-unlock', () => {
    const { isLocked, lock, unlock } = useScrollLock();

    lock();
    unlock();
    unlock();

    expect(isLocked.value).toBe(false);
    expect(globalThis.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('should handle unlock when not locked', () => {
    const { isLocked, unlock } = useScrollLock();

    unlock();

    expect(isLocked.value).toBe(false);
    expect(globalThis.scrollTo).not.toHaveBeenCalled();
  });

  it('should set left and right styles when locked', () => {
    const { lock } = useScrollLock();

    lock();

    expect(document.body.style.left).toBe('0px');
    expect(document.body.style.right).toBe('0px');
  });

  it('should clear left and right styles when unlocked', () => {
    const { lock, unlock } = useScrollLock();

    lock();
    unlock();

    expect(document.body.style.left).toBe('');
    expect(document.body.style.right).toBe('');
  });
});
