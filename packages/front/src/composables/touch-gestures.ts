import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { useSwipe, useVibrate, useMediaQuery } from '@vueuse/core';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface UseTouchGesturesOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  vibrate?: boolean;
  vibrationPattern?: number[];
}

export function useTouchGestures(
  elementRef: Ref<HTMLElement | null>,
  options: UseTouchGesturesOptions = {},
) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    vibrate: enableVibration = true,
    vibrationPattern = [15],
  } = options;

  const isTouchDevice = ref(false);
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');

  // Vibration support
  const { vibrate, isSupported: vibrationSupported } = useVibrate({
    pattern: vibrationPattern,
  });

  function triggerVibration() {
    if (enableVibration && vibrationSupported.value && isTouchDevice.value) {
      vibrate();
    }
  }

  // Swipe detection
  const { direction, isSwiping, lengthX, lengthY } = useSwipe(elementRef, {
    threshold,
    passive: true,
    onSwipeEnd: (_e, dir) => {
      if (dir === 'left' && onSwipeLeft) {
        triggerVibration();
        onSwipeLeft();
      } else if (dir === 'right' && onSwipeRight) {
        triggerVibration();
        onSwipeRight();
      } else if (dir === 'up' && onSwipeUp) {
        triggerVibration();
        onSwipeUp();
      } else if (dir === 'down' && onSwipeDown) {
        triggerVibration();
        onSwipeDown();
      }
    },
  });

  onMounted(() => {
    isTouchDevice.value =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  return {
    direction,
    isSwiping,
    lengthX,
    lengthY,
    isTouchDevice,
    hasCoarsePointer,
    triggerVibration,
    vibrationSupported,
  };
}

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
  onProgress?: (progress: number) => void;
  vibrate?: boolean;
}

export function useLongPress(
  elementRef: Ref<HTMLElement | null>,
  options: UseLongPressOptions,
) {
  const {
    delay = 400,
    onLongPress,
    onProgress,
    vibrate: enableVibration = true,
  } = options;

  const isPressed = ref(false);
  const progress = ref(0);
  const isTouchDevice = ref(false);

  const { vibrate, isSupported: vibrationSupported } = useVibrate({
    pattern: [25],
  });

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;

  function triggerVibration() {
    if (enableVibration && vibrationSupported.value && isTouchDevice.value) {
      vibrate();
    }
  }

  function startPress() {
    isPressed.value = true;
    progress.value = 0;
    startTime = Date.now();

    // Update progress every frame (60fps)
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress.value = Math.min((elapsed / delay) * 100, 100);
      onProgress?.(progress.value);
    }, 16);

    pressTimer = setTimeout(() => {
      triggerVibration();
      onLongPress();
      cancelPress();
    }, delay);
  }

  function cancelPress() {
    isPressed.value = false;
    progress.value = 0;

    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      startPress();
    }
  }

  function handlePointerUp() {
    cancelPress();
  }

  function handlePointerLeave() {
    cancelPress();
  }

  onMounted(() => {
    isTouchDevice.value =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (elementRef.value) {
      elementRef.value.addEventListener('pointerdown', handlePointerDown);
      elementRef.value.addEventListener('pointerup', handlePointerUp);
      elementRef.value.addEventListener('pointerleave', handlePointerLeave);
      elementRef.value.addEventListener('pointercancel', handlePointerUp);
    }
  });

  onUnmounted(() => {
    cancelPress();

    if (elementRef.value) {
      elementRef.value.removeEventListener('pointerdown', handlePointerDown);
      elementRef.value.removeEventListener('pointerup', handlePointerUp);
      elementRef.value.removeEventListener('pointerleave', handlePointerLeave);
      elementRef.value.removeEventListener('pointercancel', handlePointerUp);
    }
  });

  return {
    isPressed,
    progress,
    isTouchDevice,
  };
}
