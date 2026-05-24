import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withSetup } from '../../helpers/with-setup';

describe('useScrollLock unmount cleanup', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'scrollY', {
      value: 100,
      configurable: true,
      writable: true,
    });
    globalThis.scrollTo = vi.fn();
  });

  afterEach(() => {
    document.body.style.cssText = '';
  });

  it('unlocks automatically when the component unmounts while locked', async () => {
    const { useScrollLock } = await import('@/core/composables/scroll-lock');
    const { result, unmount } = withSetup(() => useScrollLock());

    result.lock();
    expect(result.isLocked.value).toBeTruthy();
    expect(document.body.style.position).toBe('fixed');

    unmount();

    expect(result.isLocked.value).toBeFalsy();
    expect(document.body.style.position).toBe('');
    expect(globalThis.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  it('does nothing on unmount when not locked', async () => {
    const { useScrollLock } = await import('@/core/composables/scroll-lock');
    const { result, unmount } = withSetup(() => useScrollLock());

    unmount();

    expect(result.isLocked.value).toBeFalsy();
    expect(globalThis.scrollTo).not.toHaveBeenCalled();
  });
});

describe('useHapticFeedback without vibration support', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    vi.resetModules();
  });

  it('reports canVibrate false and no-ops when the API is missing', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'test' },
      configurable: true,
      writable: true,
    });
    vi.resetModules();

    const { useHapticFeedback } =
      await import('@/core/composables/haptic-feedback');
    const haptics = useHapticFeedback();

    expect(haptics.canVibrate).toBeFalsy();
    expect(() => haptics.vibrate('heavy')).not.toThrow();
  });

  it('swallows errors thrown by navigator.vibrate', async () => {
    const vibrate = vi.fn(() => {
      throw new Error('vibrate failed');
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate },
      configurable: true,
      writable: true,
    });
    vi.resetModules();

    const { useHapticFeedback } =
      await import('@/core/composables/haptic-feedback');
    const haptics = useHapticFeedback();

    expect(haptics.canVibrate).toBeTruthy();
    expect(() => haptics.vibrateSuccess()).not.toThrow();
    expect(vibrate).toHaveBeenCalled();
  });

  it('invokes every named pattern helper', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate },
      configurable: true,
      writable: true,
    });
    vi.resetModules();

    const { useHapticFeedback } =
      await import('@/core/composables/haptic-feedback');
    const h = useHapticFeedback();

    h.vibrateLight();
    h.vibrateMedium();
    h.vibrateHeavy();
    h.vibrateSuccess();
    h.vibrateError();
    h.vibrateSelect();
    h.vibrateEliminate();

    expect(vibrate).toHaveBeenCalledTimes(7);
  });
});
