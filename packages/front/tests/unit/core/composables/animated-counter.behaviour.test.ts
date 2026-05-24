import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useAnimatedCounter } from '@/core/composables/animated-counter';

describe('useAnimatedCounter (animation behaviour)', () => {
  let rafCallbacks: FrameRequestCallback[];
  let now: number;

  beforeEach(() => {
    vi.useFakeTimers();
    rafCallbacks = [];
    now = 0;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      
return rafCallbacks.length;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function flushFrames(times: number, stepMs: number) {
    for (let i = 0; i < times; i++) {
      now += stepMs;
      const cbs = rafCallbacks;
      rafCallbacks = [];
      
for (const cb of cbs) {
        cb(now);
      }
    }
  }

  it('starts at the start value', () => {
    const target = ref(0);
    const { count } = useAnimatedCounter(target, { startValue: 5 });
    expect(count.value).toBe(5);
  });

  it('animates towards the target after the initial delay', async () => {
    const target = ref(0);
    const { count, isAnimating } = useAnimatedCounter(target, {
      duration: 1000,
      initialDelay: 100,
    });

    target.value = 100;
    await nextTick();

    // first animation deferred by initialDelay
    vi.advanceTimersByTime(100);
    expect(isAnimating.value).toBeTruthy();

    flushFrames(1, 1000); // jump to end of duration
    expect(count.value).toBe(100);
    expect(isAnimating.value).toBeFalsy();
  });

  it('snaps to zero target without animating', async () => {
    const target = ref(5);
    const { count, animate } = useAnimatedCounter(target, { initialDelay: 0 });

    target.value = 0;
    await nextTick();
    animate();

    expect(count.value).toBe(0);
  });

  it('runs subsequent animations immediately (no delay after first)', async () => {
    const target = ref(0);
    const { count } = useAnimatedCounter(target, {
      duration: 1000,
      initialDelay: 100,
    });

    target.value = 50;
    await nextTick();
    vi.advanceTimersByTime(100);
    flushFrames(1, 1000);
    expect(count.value).toBe(50);

    target.value = 80;
    await nextTick();
    flushFrames(1, 1000); // no delay this time
    expect(count.value).toBe(80);
  });

  it('stop cancels a pending animation frame and delay', async () => {
    const target = ref(0);
    const { stop, isAnimating } = useAnimatedCounter(target, {
      duration: 1000,
      initialDelay: 100,
    });

    target.value = 100;
    await nextTick();
    vi.advanceTimersByTime(100);
    expect(isAnimating.value).toBeTruthy();

    stop();
    expect(isAnimating.value).toBeFalsy();
  });
});
