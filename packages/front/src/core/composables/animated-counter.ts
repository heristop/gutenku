import { ref, watch, onUnmounted, type Ref } from 'vue';

export interface AnimatedCounterOptions {
  duration?: number;
  easing?: (x: number) => number;
  startValue?: number;
}

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

export function useAnimatedCounter(
  target: Ref<number>,
  options: AnimatedCounterOptions = {},
) {
  const { duration = 2000, easing = easeOutQuart, startValue = 0 } = options;

  const count = ref(startValue);
  const isAnimating = ref(false);
  let animationFrame: number | null = null;

  function animate() {
    if (target.value === 0) {
      return;
    }

    isAnimating.value = true;
    const startTime = performance.now();
    const from = count.value;
    const to = target.value;

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      count.value = Math.floor(from + (to - from) * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(update);
      } else {
        isAnimating.value = false;
        animationFrame = null;
      }
    }

    animationFrame = requestAnimationFrame(update);
  }

  function stop() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      isAnimating.value = false;
    }
  }

  watch(target, (newValue, oldValue) => {
    if (newValue !== oldValue && newValue > 0) {
      animate();
    }
  });

  onUnmounted(stop);

  return {
    count,
    isAnimating,
    animate,
    stop,
  };
}
