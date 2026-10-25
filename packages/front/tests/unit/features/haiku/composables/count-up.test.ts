import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { useCountUp } from '@/features/haiku/composables/count-up';
import { withSetup } from '../../../helpers/with-setup';

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches }));
}

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows the initial number as-is without animating', () => {
    const source = ref(42);
    const { result } = withSetup(() => useCountUp(() => source.value));

    expect(result.value.value).toBe(42);
  });

  it('treats a falsy source as zero', () => {
    const { result } = withSetup(() => useCountUp(() => Number.NaN));

    expect(result.value.value).toBe(0);
  });

  it('rounds to the requested decimals', () => {
    const { result } = withSetup(() =>
      useCountUp(() => 1.23456, { decimals: 2 }),
    );

    expect(result.value.value).toBe(1.23);
  });

  it('counts to the new value and lands exactly on it', async () => {
    const source = ref(0);
    const { result } = withSetup(() => useCountUp(() => source.value));

    source.value = 100;
    await nextTick();
    vi.advanceTimersByTime(100);

    expect(result.value.value).toBeGreaterThan(0);
    expect(result.value.value).toBeLessThan(100);

    vi.advanceTimersByTime(400);

    expect(result.value.value).toBe(100);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('eases out: the first half covers most of the distance', async () => {
    const source = ref(0);
    const { result } = withSetup(() => useCountUp(() => source.value));

    source.value = 100;
    await nextTick();
    vi.advanceTimersByTime(208);

    expect(result.value.value).toBeGreaterThan(80);
  });

  it('honours a custom duration', async () => {
    const source = ref(0);
    const { result } = withSetup(() =>
      useCountUp(() => source.value, { duration: 100 }),
    );

    source.value = 10;
    await nextTick();
    vi.advanceTimersByTime(130);

    expect(result.value.value).toBe(10);
  });

  it('counts down as well as up, keeping decimals while counting', async () => {
    const source = ref(10);
    const { result } = withSetup(() =>
      useCountUp(() => source.value, { decimals: 1 }),
    );

    source.value = 0;
    await nextTick();
    vi.advanceTimersByTime(50);

    const mid = result.value.value;

    expect(mid).toBeLessThan(10);
    expect(mid).toBeGreaterThan(0);
    expect(Math.round(mid * 10) / 10).toBe(mid);

    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(0);
  });

  it('restarts from the number on screen when the target changes mid-count', async () => {
    const source = ref(0);
    const { result } = withSetup(() => useCountUp(() => source.value));

    source.value = 100;
    await nextTick();
    vi.advanceTimersByTime(100);

    const onScreen = result.value.value;

    source.value = 0;
    await nextTick();
    vi.advanceTimersByTime(16);

    expect(result.value.value).toBeLessThanOrEqual(onScreen);
    expect(result.value.value).toBeGreaterThan(0);

    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(0);
  });

  it('counts a falsy next source to zero', async () => {
    const source = ref<number | null>(5);
    const { result } = withSetup(() =>
      useCountUp(() => source.value as number),
    );

    source.value = null;
    await nextTick();
    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(0);
  });

  it('jumps straight to the value under reduced motion', async () => {
    stubReducedMotion(true);
    const source = ref(0);
    const { result } = withSetup(() => useCountUp(() => source.value));

    source.value = 77;
    await nextTick();

    expect(result.value.value).toBe(77);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('animates when matchMedia is unavailable', async () => {
    vi.stubGlobal('matchMedia', null);
    const source = ref(0);
    const { result } = withSetup(() => useCountUp(() => source.value));

    source.value = 20;
    await nextTick();

    expect(result.value.value).toBe(0);

    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(20);
  });

  it('skips the animation when the target equals what is shown', () => {
    const { result } = withSetup(() => useCountUp(() => 5));

    result.play(5);

    expect(result.value.value).toBe(5);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('plays from an explicit starting value', () => {
    const { result } = withSetup(() => useCountUp(() => 0));

    result.play(50, 40);
    vi.advanceTimersByTime(16);

    expect(result.value.value).toBeGreaterThanOrEqual(40);

    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(50);
  });

  it('rounds the target when jumping', () => {
    const { result } = withSetup(() => useCountUp(() => 0, { decimals: 1 }));

    stubReducedMotion(true);
    result.play(3.14159);

    expect(result.value.value).toBe(3.1);
  });

  it('jumps when there is no document (server render)', () => {
    const { result } = withSetup(() => useCountUp(() => 0));

    const missing: unknown = undefined;

    vi.stubGlobal('document', missing);
    result.play(9);

    expect(result.value.value).toBe(9);
  });

  it('stops the running animation on unmount', async () => {
    const source = ref(0);
    const { result, unmount } = withSetup(() => useCountUp(() => source.value));

    source.value = 100;
    await nextTick();
    vi.advanceTimersByTime(50);

    const frozen = result.value.value;

    unmount();

    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(500);

    expect(result.value.value).toBe(frozen);
  });

  it('unmounts cleanly when nothing is animating', () => {
    const { unmount } = withSetup(() => useCountUp(() => 1));

    expect(() => unmount()).not.toThrow();
  });
});
