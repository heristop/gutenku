import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHapticFeedback } from '@/core/composables/haptic-feedback';

describe('useHapticFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all haptic functions', () => {
    const haptic = useHapticFeedback();

    expect(haptic.vibrate).toBeInstanceOf(Function);
    expect(haptic.vibrateLight).toBeInstanceOf(Function);
    expect(haptic.vibrateMedium).toBeInstanceOf(Function);
    expect(haptic.vibrateHeavy).toBeInstanceOf(Function);
    expect(haptic.vibrateSuccess).toBeInstanceOf(Function);
    expect(haptic.vibrateError).toBeInstanceOf(Function);
    expect(haptic.vibrateSelect).toBeInstanceOf(Function);
    expect(haptic.vibrateEliminate).toBeInstanceOf(Function);
  });

  it('should report canVibrate status', () => {
    const haptic = useHapticFeedback();
    expect(typeof haptic.canVibrate).toBe('boolean');
  });

  it('should call navigator.vibrate with correct pattern for light', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateLight();

    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('should call navigator.vibrate with correct pattern for medium', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateMedium();

    expect(navigator.vibrate).toHaveBeenCalledWith(25);
  });

  it('should call navigator.vibrate with correct pattern for heavy', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateHeavy();

    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it('should call navigator.vibrate with correct pattern for success', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateSuccess();

    expect(navigator.vibrate).toHaveBeenCalledWith([50, 50, 100]);
  });

  it('should call navigator.vibrate with correct pattern for error', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateError();

    expect(navigator.vibrate).toHaveBeenCalledWith([100, 30, 100, 30, 100]);
  });

  it('should call navigator.vibrate with correct pattern for select', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateSelect();

    expect(navigator.vibrate).toHaveBeenCalledWith(15);
  });

  it('should call navigator.vibrate with correct pattern for eliminate', () => {
    const haptic = useHapticFeedback();
    haptic.vibrateEliminate();

    expect(navigator.vibrate).toHaveBeenCalledWith([20, 20, 20]);
  });

  it('should use light as default pattern', () => {
    const haptic = useHapticFeedback();
    haptic.vibrate();

    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('should handle vibration errors gracefully', () => {
    const originalVibrate = navigator.vibrate;
    (navigator as Navigator & { vibrate: () => void }).vibrate = () => {
      throw new Error('Vibration not supported');
    };

    const haptic = useHapticFeedback();
    expect(() => haptic.vibrateLight()).not.toThrow();

    (navigator as Navigator & { vibrate: typeof originalVibrate }).vibrate =
      originalVibrate;
  });
});
