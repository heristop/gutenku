import { onUnmounted, ref, watch, type Ref } from 'vue';

export interface CountUpOptions {
  /** Count duration in ms; kept at 400ms or less (the reward token) */
  duration?: number;
  /** Decimals kept while counting */
  decimals?: number;
}

const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

function prefersReducedMotion(): boolean {
  return (
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Shows a number as-is on first display and counts to the new value only when
 * it changes. Interruptible: a new target restarts from the number on screen.
 */
export function useCountUp(source: () => number, options: CountUpOptions = {}) {
  const { duration = 400, decimals = 0 } = options;
  const factor = 10 ** decimals;
  const round = (value: number) => Math.round(value * factor) / factor;

  const value: Ref<number> = ref(round(source() || 0));
  let frame = 0;

  function cancel() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function play(to: number, from = value.value) {
    cancel();

    if (
      typeof document === 'undefined' ||
      prefersReducedMotion() ||
      from === to
    ) {
      value.value = round(to);

      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      value.value = round(from + (to - from) * easeOutQuart(progress));
      frame = progress < 1 ? requestAnimationFrame(step) : 0;
    };
    frame = requestAnimationFrame(step);
  }

  watch(source, (next) => play(next || 0));

  onUnmounted(cancel);

  return { value, play };
}
