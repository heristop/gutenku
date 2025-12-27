import { ref, type Ref } from 'vue';

/**
 * Debounces callback execution.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function and pending state
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300,
): { debouncedFn: (...args: Parameters<T>) => void; isPending: Ref<boolean> } {
  const isPending = ref(false);
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    isPending.value = true;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      callback(...args);
      isPending.value = false;
      timeout = null;
    }, delay);
  };

  return { debouncedFn, isPending };
}
