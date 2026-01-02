// Haptic feedback using Vibration API

type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'select'
  | 'eliminate';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [50, 50, 100], // Short-pause-long celebration
  error: [100, 30, 100, 30, 100], // Triple buzz for wrong
  select: 15,
  eliminate: [20, 20, 20], // Quick double tap
};

function canVibrate(): boolean {
  return 'vibrate' in navigator;
}

export function useHapticFeedback() {
  function vibrate(pattern: HapticPattern = 'light'): void {
    if (!canVibrate()) {
      return;
    }

    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail if vibration not supported
    }
  }

  function vibrateLight(): void {
    vibrate('light');
  }

  function vibrateMedium(): void {
    vibrate('medium');
  }

  function vibrateHeavy(): void {
    vibrate('heavy');
  }

  function vibrateSuccess(): void {
    vibrate('success');
  }

  function vibrateError(): void {
    vibrate('error');
  }

  function vibrateSelect(): void {
    vibrate('select');
  }

  function vibrateEliminate(): void {
    vibrate('eliminate');
  }

  return {
    vibrate,
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
    vibrateSuccess,
    vibrateError,
    vibrateSelect,
    vibrateEliminate,
    canVibrate: canVibrate(),
  };
}
