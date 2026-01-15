import { useIntersectionObserver } from '@vueuse/core';
import { shallowRef, type Ref, onMounted, nextTick } from 'vue';

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
  let pendingIntersection = false;

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting && !isInView.value) {
        if (isReady) {
          setTimeout(() => {
            isInView.value = true;
            stop();
          }, delay);
          return;
        }

        pendingIntersection = true;
      }
    },
    { threshold, rootMargin },
  );

  onMounted(() => {
    nextTick(() => {
      isReady = true;
      if (pendingIntersection && !isInView.value) {
        setTimeout(() => {
          isInView.value = true;
          stop();
        }, delay);
      }
    });
  });

  return { isInView };
}
