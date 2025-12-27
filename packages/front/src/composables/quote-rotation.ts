import { useIntervalFn } from '@vueuse/core';
import { ref } from 'vue';

export interface QuoteRotationOptions {
  intervalMs?: number;
  startDelay?: number;
  onRotate?: (index: number) => void;
}

export function useQuoteRotation(
  quotes: string[],
  options: QuoteRotationOptions = {},
) {
  const { intervalMs = 4000, startDelay = 0, onRotate } = options;

  const currentIndex = ref(0);
  const showQuote = ref(false);

  const { resume, isActive } = useIntervalFn(
    () => {
      currentIndex.value = (currentIndex.value + 1) % quotes.length;
      onRotate?.(currentIndex.value);
    },
    intervalMs,
    { immediate: false },
  );

  const start = () => {
    if (isActive.value) {
      return;
    }

    const beginRotation = () => {
      showQuote.value = true;
      resume();
    };

    if (startDelay > 0) {
      setTimeout(beginRotation, startDelay);
    } else {
      beginRotation();
    }
  };

  return {
    currentIndex,
    showQuote,
    start,
  };
}
