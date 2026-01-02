import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { useSwipe, useVibrate, useMediaQuery } from '@vueuse/core';

// Chrome requires a tap before vibrate() works
let hasUserTapped = false;
if (typeof document !== 'undefined') {
  document.addEventListener(
    'click',
    () => {
      hasUserTapped = true;
    },
    { once: true, capture: true },
  );
}

export type SwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface VibrationContext {
  enableVibration: boolean;
  vibrationSupported: { value: boolean };
  isTouchDevice: { value: boolean };
  vibrate: () => void;
}

function createVibrationTrigger(context: VibrationContext) {
  return () => {
    if (
      hasUserTapped &&
      context.enableVibration &&
      context.vibrationSupported.value &&
      context.isTouchDevice.value
    ) {
      context.vibrate();
    }
  };
}

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

  const triggerVibration = createVibrationTrigger({
    enableVibration,
    vibrationSupported,
    isTouchDevice,
    vibrate,
  });

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
      'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
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

  const triggerVibration = createVibrationTrigger({
    enableVibration,
    vibrationSupported,
    isTouchDevice,
    vibrate,
  });

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;

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

  // Single handler for all pointer end events (up, leave, cancel)
  const handlePointerEnd = () => cancelPress();

  onMounted(() => {
    isTouchDevice.value =
      'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;

    if (elementRef.value) {
      // Pointer events (primary)
      elementRef.value.addEventListener('pointerdown', handlePointerDown);
      elementRef.value.addEventListener('pointerup', handlePointerEnd);
      elementRef.value.addEventListener('pointerleave', handlePointerEnd);
      elementRef.value.addEventListener('pointercancel', handlePointerEnd);

      // Touch events fallback (iOS Safari - pointerleave is unreliable)
      elementRef.value.addEventListener('touchend', handlePointerEnd);
      elementRef.value.addEventListener('touchcancel', handlePointerEnd);
    }
  });

  onUnmounted(() => {
    cancelPress();

    if (elementRef.value) {
      elementRef.value.removeEventListener('pointerdown', handlePointerDown);
      elementRef.value.removeEventListener('pointerup', handlePointerEnd);
      elementRef.value.removeEventListener('pointerleave', handlePointerEnd);
      elementRef.value.removeEventListener('pointercancel', handlePointerEnd);
      elementRef.value.removeEventListener('touchend', handlePointerEnd);
      elementRef.value.removeEventListener('touchcancel', handlePointerEnd);
    }
  });

  return {
    isPressed,
    progress,
    isTouchDevice,
  };
}
