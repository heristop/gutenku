import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';

let observerCallback:
  | ((entries: Array<{ isIntersecting: boolean }>) => void)
  | null = null;
const stopMock = vi.fn();

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((_target, cb) => {
    observerCallback = cb;
    return { stop: stopMock };
  }),
}));

// onMounted runs the callback immediately so the composable becomes "ready"
vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue');
  return {
    ...actual,
    onMounted: (cb: () => void) => cb(),
  };
});

describe('useInView (intersection behaviour)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    observerCallback = null;
    stopMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flips to in-view after a delay once intersecting (ready path)', async () => {
    const { useInView } = await import('@/features/haiku/composables/in-view');
    const target = ref<HTMLElement | null>(null);
    const { isInView } = useInView(target, { delay: 100 });

    // nextTick inside onMounted sets isReady; flush microtasks
    await Promise.resolve();
    await Promise.resolve();

    observerCallback?.([{ isIntersecting: true }]);
    expect(isInView.value).toBeFalsy(); // waits for delay

    vi.advanceTimersByTime(100);
    expect(isInView.value).toBeTruthy();
    expect(stopMock).toHaveBeenCalled();
  });

  it('ignores non-intersecting entries', async () => {
    const { useInView } = await import('@/features/haiku/composables/in-view');
    const target = ref<HTMLElement | null>(null);
    const { isInView } = useInView(target);

    observerCallback?.([{ isIntersecting: false }]);
    vi.advanceTimersByTime(500);
    expect(isInView.value).toBeFalsy();
  });

  it('defers an early intersection until the composable is ready', async () => {
    vi.useRealTimers();
    const { useInView } = await import('@/features/haiku/composables/in-view');
    const target = ref<HTMLElement | null>(null);
    const { isInView } = useInView(target, { delay: 0 });

    // Intersect immediately, before the onMounted nextTick marks it ready
    observerCallback?.([{ isIntersecting: true }]);
    expect(isInView.value).toBeFalsy(); // pending, not yet flipped

    // let nextTick + the zero-delay setTimeout run
    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });
    expect(isInView.value).toBeTruthy();
    expect(stopMock).toHaveBeenCalled();
  });
});
