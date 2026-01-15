import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import { useVibrate } from '@vueuse/core';

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

interface UsePullToRefreshOptions {
  threshold?: number;
  maxPull?: number;
  onRefresh: () => void | Promise<void>;
  disabled?: Ref<boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentOrElement = HTMLElement | { $el: HTMLElement } | null;

function getElement(ref: ComponentOrElement): HTMLElement | Document {
  if (!ref) {
    return document;
  }

  if ('$el' in ref && ref.$el instanceof HTMLElement) {
    return ref.$el;
  }

  if (ref instanceof HTMLElement) {
    return ref;
  }
  return document;
}

function getClientY(e: TouchEvent | MouseEvent): number {
  return 'touches' in e ? e.touches[0].clientY : e.clientY;
}

export function usePullToRefresh(
  containerRef: Ref<ComponentOrElement>,
  options: UsePullToRefreshOptions,
) {
  const { threshold = 80, maxPull = 120, onRefresh, disabled } = options;

  const isPulling = ref(false);
  const pullDistance = ref(0);
  const isRefreshing = ref(false);
  const startY = ref(0);
  const canPull = ref(false);

  const { vibrate, isSupported: vibrationSupported } = useVibrate({
    pattern: [20],
  });

  const progress = computed(() =>
    Math.min((pullDistance.value / threshold) * 100, 100),
  );

  const shouldRelease = computed(() => pullDistance.value >= threshold);

  function triggerVibration() {
    if (hasUserTapped && vibrationSupported.value) {
      vibrate();
    }
  }

  let hasVibratedAtThreshold = false;

  function handlePointerStart(e: TouchEvent | MouseEvent) {
    if (disabled?.value || isRefreshing.value) {
      return;
    }

    if (globalThis.scrollY <= 0) {
      canPull.value = true;
      startY.value = getClientY(e);
      hasVibratedAtThreshold = false;
      document.documentElement.style.overscrollBehaviorY = 'contain';
    }
  }

  function handlePointerMove(e: TouchEvent | MouseEvent) {
    if (!canPull.value || disabled?.value || isRefreshing.value) {
      return;
    }

    const currentY = getClientY(e);
    const diff = currentY - startY.value;

    if (diff > 0 && globalThis.scrollY <= 0) {
      isPulling.value = true;
      pullDistance.value = Math.min(diff * 0.5, maxPull);

      if (pullDistance.value >= threshold && !hasVibratedAtThreshold) {
        triggerVibration();
        hasVibratedAtThreshold = true;
      }

      if (pullDistance.value < threshold) {
        hasVibratedAtThreshold = false;
      }

      if (pullDistance.value > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  }

  async function handlePointerEnd() {
    document.documentElement.style.overscrollBehaviorY = '';

    if (!isPulling.value) {
      return;
    }

    canPull.value = false;

    if (shouldRelease.value && !isRefreshing.value) {
      isRefreshing.value = true;
      triggerVibration();

      try {
        await onRefresh();
      } finally {
        isRefreshing.value = false;
      }
    }

    isPulling.value = false;
    pullDistance.value = 0;
  }

  onMounted(() => {
    const container = getElement(containerRef.value);

    container.addEventListener(
      'touchstart',
      handlePointerStart as EventListener,
      { passive: true },
    );
    container.addEventListener(
      'touchmove',
      handlePointerMove as EventListener,
      { passive: false },
    );
    container.addEventListener('touchend', handlePointerEnd as EventListener, {
      passive: true,
    });

    container.addEventListener(
      'mousedown',
      handlePointerStart as EventListener,
    );
    container.addEventListener('mousemove', handlePointerMove as EventListener);
    container.addEventListener('mouseup', handlePointerEnd as EventListener);
    container.addEventListener('mouseleave', handlePointerEnd as EventListener);
  });

  onUnmounted(() => {
    const container = getElement(containerRef.value);

    container.removeEventListener(
      'touchstart',
      handlePointerStart as EventListener,
    );
    container.removeEventListener(
      'touchmove',
      handlePointerMove as EventListener,
    );
    container.removeEventListener(
      'touchend',
      handlePointerEnd as EventListener,
    );

    container.removeEventListener(
      'mousedown',
      handlePointerStart as EventListener,
    );
    container.removeEventListener(
      'mousemove',
      handlePointerMove as EventListener,
    );
    container.removeEventListener('mouseup', handlePointerEnd as EventListener);
    container.removeEventListener(
      'mouseleave',
      handlePointerEnd as EventListener,
    );
  });

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    progress,
    shouldRelease,
  };
}
