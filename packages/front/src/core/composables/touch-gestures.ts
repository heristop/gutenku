import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue';
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

  const { vibrate, isSupported: vibrationSupported } = useVibrate({
    pattern: vibrationPattern,
  });

  const triggerVibration = createVibrationTrigger({
    enableVibration,
    vibrationSupported,
    isTouchDevice,
    vibrate,
  });

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

type GesturePhase = 'idle' | 'observing' | 'committed' | 'cancelled';

interface UseLongPressOptions {
  delay?: number;
  observationWindow?: number;
  scrollThreshold?: number;
  moveThreshold?: number;
  onObserving?: () => void;
  onCommit?: () => void;
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
    delay = 500,
    observationWindow = 80,
    scrollThreshold = 8,
    moveThreshold = 10,
    onObserving,
    onCommit,
    onLongPress,
    onShortPress,
    onProgress,
    vibrate: enableVibration = true,
  } = options;

  const isPressed = ref(false);
  const isObserving = ref(false);
  const progress = ref(0);
  const isTouchDevice = ref(false);
  const isTouching = ref(false);

  const { vibrate, isSupported: vibrationSupported } = useVibrate({
    pattern: [25],
  });

  const { vibrate: vibrateCommit } = useVibrate({
    pattern: [10],
  });

  const triggerVibration = createVibrationTrigger({
    enableVibration,
    vibrationSupported,
    isTouchDevice,
    vibrate,
  });

  const triggerCommitVibration = createVibrationTrigger({
    enableVibration,
    vibrationSupported,
    isTouchDevice,
    vibrate: vibrateCommit,
  });

  let observationTimer: ReturnType<typeof setTimeout> | null = null;
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  let startTime = 0;
  let longPressTriggered = false;
  let gesturePhase: GesturePhase = 'idle';
  let startX = 0;
  let startY = 0;

  function startLongPressTimer() {
    startTime = Date.now();
    longPressTriggered = false;

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress.value = Math.min((elapsed / delay) * 100, 100);
      onProgress?.(progress.value);
    }, 16);

    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      triggerVibration();
      onLongPress();
      cancelGesture();
    }, delay);
  }

  function cancelGesture() {
    gesturePhase = 'idle';
    isPressed.value = false;
    isObserving.value = false;
    isTouching.value = false;
    progress.value = 0;

    if (observationTimer) {
      clearTimeout(observationTimer);
      observationTimer = null;
    }
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function handleTouchStart(e: TouchEvent) {
    if (gesturePhase !== 'idle') {
      return;
    }

    const touch = e.touches[0];
    if (touch) {
      startX = touch.clientX;
      startY = touch.clientY;
    }

    gesturePhase = 'observing';
    isObserving.value = true;
    isTouching.value = true;
    onObserving?.();

    observationTimer = setTimeout(() => {
      if (gesturePhase === 'observing') {
        gesturePhase = 'committed';
        isObserving.value = false;
        isPressed.value = true;
        triggerCommitVibration();
        onCommit?.();
        startLongPressTimer();
      }
    }, observationWindow);
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) {
      return;
    }

    const dy = Math.abs(touch.clientY - startY);
    const dx = Math.abs(touch.clientX - startX);

    if (gesturePhase === 'observing' && dy > scrollThreshold) {
      cancelGesture();
      return;
    }

    if (
      gesturePhase === 'committed' &&
      (dx > moveThreshold || dy > moveThreshold)
    ) {
      cancelGesture();
    }
  }

  function handlePointerDown(e: PointerEvent) {
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      return;
    }
    if (gesturePhase === 'idle') {
      gesturePhase = 'committed';
      isPressed.value = true;
      startLongPressTimer();
    }
  }

  function handleTouchEnd() {
    if (gesturePhase === 'observing' && onShortPress) {
      onShortPress();
    } else if (
      gesturePhase === 'committed' &&
      !longPressTriggered &&
      onShortPress
    ) {
      onShortPress();
    }
    cancelGesture();
  }

  const handleEnd = () => cancelGesture();

  let currentEl: HTMLElement | null = null;

  function attachListeners(el: HTMLElement) {
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleEnd);
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointerup', handleEnd);
    el.addEventListener('pointerleave', handleEnd);
    el.addEventListener('pointercancel', handleEnd);
  }

  function detachListeners(el: HTMLElement) {
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchmove', handleTouchMove);
    el.removeEventListener('touchend', handleTouchEnd);
    el.removeEventListener('touchcancel', handleEnd);
    el.removeEventListener('pointerdown', handlePointerDown);
    el.removeEventListener('pointerup', handleEnd);
    el.removeEventListener('pointerleave', handleEnd);
    el.removeEventListener('pointercancel', handleEnd);
  }

  // Watch for element ref changes (handles template ref timing)
  watch(
    elementRef,
    (newEl, oldEl) => {
      // Detach from old element
      if (oldEl && currentEl) {
        detachListeners(currentEl);
        currentEl = null;
      }

      // Attach to new element
      if (newEl) {
        isTouchDevice.value =
          'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
        attachListeners(newEl);
        currentEl = newEl;
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cancelGesture();
    if (currentEl) {
      detachListeners(currentEl);
      currentEl = null;
    }
  });

  return {
    isPressed,
    isObserving,
    progress,
    isTouchDevice,
    isTouching,
  };
}
