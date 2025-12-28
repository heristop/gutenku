import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import { useVibrate, useMediaQuery } from '@vueuse/core';

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
  // Handle Vue component instance (has $el property)
  if ('$el' in ref && ref.$el instanceof HTMLElement) {
    return ref.$el;
  }
  // Handle direct HTMLElement
  if (ref instanceof HTMLElement) {
    return ref;
  }
  return document;
}

export function usePullToRefresh(
  containerRef: Ref<ComponentOrElement>,
  options: UsePullToRefreshOptions,
) {
  const { threshold = 80, maxPull = 120, onRefresh, disabled } = options;

  const isMobile = useMediaQuery('(max-width: 600px)');
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

  function handleTouchStart(e: TouchEvent) {
    if (!isMobile.value || disabled?.value || isRefreshing.value) {
      return;
    }

    // Only allow pull when at top of page
    if (globalThis.scrollY <= 0) {
      canPull.value = true;
      startY.value = e.touches[0].clientY;
      hasVibratedAtThreshold = false;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (
      !canPull.value ||
      !isMobile.value ||
      disabled?.value ||
      isRefreshing.value
    ) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.value;

    // Only pull down, not up
    if (diff > 0 && globalThis.scrollY <= 0) {
      isPulling.value = true;
      // Apply 0.5 resistance factor
      pullDistance.value = Math.min(diff * 0.5, maxPull);

      // Vibrate when crossing threshold
      if (pullDistance.value >= threshold && !hasVibratedAtThreshold) {
        triggerVibration();
        hasVibratedAtThreshold = true;
      } else if (pullDistance.value < threshold) {
        hasVibratedAtThreshold = false;
      }

      // Prevent default scrolling when pulling
      if (pullDistance.value > 10) {
        e.preventDefault();
      }
    }
  }

  async function handleTouchEnd() {
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

    // Animate back to 0
    isPulling.value = false;
    pullDistance.value = 0;
  }

  onMounted(() => {
    const container = getElement(containerRef.value);

    container.addEventListener(
      'touchstart',
      handleTouchStart as EventListener,
      {
        passive: true,
      },
    );
    container.addEventListener('touchmove', handleTouchMove as EventListener, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd as EventListener, {
      passive: true,
    });
  });

  onUnmounted(() => {
    const container = getElement(containerRef.value);

    container.removeEventListener(
      'touchstart',
      handleTouchStart as EventListener,
    );
    container.removeEventListener(
      'touchmove',
      handleTouchMove as EventListener,
    );
    container.removeEventListener('touchend', handleTouchEnd as EventListener);
  });

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    progress,
    shouldRelease,
    isMobile,
  };
}
