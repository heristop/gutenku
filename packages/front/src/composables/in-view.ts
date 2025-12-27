import { useIntersectionObserver } from '@vueuse/core';
import { shallowRef, type Ref, onMounted } from 'vue';

export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export function useInView(
  target: Ref<HTMLElement | null | undefined>,
  options: UseInViewOptions = {},
) {
  const { threshold = 0.1, rootMargin = '0px', delay = 100 } = options;

  const isInView = shallowRef(false);
  let isReady = false;

  onMounted(() => {
    setTimeout(() => {
      isReady = true;
    }, 50);
  });

  useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting && !isInView.value) {
        if (isReady) {
          setTimeout(() => {
            isInView.value = true;
          }, delay);
        } else {
          setTimeout(() => {
            isInView.value = true;
          }, delay + 50);
        }
      }
    },
    { threshold, rootMargin },
  );

  return { isInView };
}
