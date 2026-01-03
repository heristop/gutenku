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
  onShortPress?: () => void;
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
    onShortPress,
    onProgress,
    vibrate: enableVibration = true,
  } = options;

  const isPressed = ref(false);
  const progress = ref(0);
  const isTouchDevice = ref(false);
  const isTouching = ref(false); // Track active touch to prevent hover simulation

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
  let longPressTriggered = false;

  function startPress() {
    if (isPressed.value) {
      return;
    } // Prevent double-start

    isPressed.value = true;
    progress.value = 0;
    startTime = Date.now();
    longPressTriggered = false;

    // Update progress every frame (60fps)
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress.value = Math.min((elapsed / delay) * 100, 100);
      onProgress?.(progress.value);
    }, 16);

    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      triggerVibration();
      onLongPress();
      cancelPress();
    }, delay);
  }

  function cancelPress() {
    isPressed.value = false;
    isTouching.value = false;
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

  let startX = 0;
  let startY = 0;
  const moveThreshold = 10; // Cancel if finger moves more than 10px

  function handleTouchStart(e: TouchEvent) {
    // Prevent default touch behaviors
    if (e.cancelable) {
      e.preventDefault();
    }
    isTouching.value = true;

    // Track start position for movement detection
    const touch = e.touches[0];
    if (touch) {
      startX = touch.clientX;
      startY = touch.clientY;
    }

    startPress();
  }

  function handleTouchMove(e: TouchEvent) {
    // Cancel long press if finger moves too much
    if (!isPressed.value) {
      return;
    }

    const touch = e.touches[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - startX);
      const dy = Math.abs(touch.clientY - startY);
      if (dx > moveThreshold || dy > moveThreshold) {
        cancelPress();
      }
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (
      (e.pointerType === 'touch' || e.pointerType === 'pen') &&
      !isPressed.value
    ) {
      startPress();
    }
  }

  function handleTouchEnd() {
    // Detect short press: released before long press triggered
    if (isPressed.value && !longPressTriggered && onShortPress) {
      onShortPress();
    }
    cancelPress();
  }

  const handleEnd = () => cancelPress();

  onMounted(() => {
    isTouchDevice.value =
      'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;

    if (elementRef.value) {
      const el = elementRef.value;

      // Touch events (mobile)
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd);
      el.addEventListener('touchcancel', handleEnd);

      // Pointer events (pen/desktop)
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointerup', handleEnd);
      el.addEventListener('pointerleave', handleEnd);
      el.addEventListener('pointercancel', handleEnd);
    }
  });

  onUnmounted(() => {
    cancelPress();

    if (elementRef.value) {
      const el = elementRef.value;

      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleEnd);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handleEnd);
      el.removeEventListener('pointerleave', handleEnd);
      el.removeEventListener('pointercancel', handleEnd);
    }
  });

  return {
    isPressed,
    progress,
    isTouchDevice,
    isTouching,
  };
}
