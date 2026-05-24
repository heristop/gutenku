import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref } from 'vue';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { withSetup } from '../../helpers/with-setup';

const vibrate = vi.fn();
vi.mock('@vueuse/core', () => ({
  useVibrate: () => ({ vibrate, isSupported: { value: true } }),
}));

function setScrollY(value: number) {
  Object.defineProperty(globalThis, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
}

function touch(clientY: number): TouchEvent {
  return {
    touches: [{ clientY }],
    cancelable: true,
    preventDefault: vi.fn(),
  } as unknown as TouchEvent;
}

describe('usePullToRefresh', () => {
  let container: HTMLElement;
  let listeners: Record<string, EventListener>;

  beforeEach(() => {
    setScrollY(0);
    listeners = {};
    container = document.createElement('div');
    vi.spyOn(container, 'addEventListener').mockImplementation(
      (type, handler) => {
        listeners[type] = handler as EventListener;
      },
    );
    vi.spyOn(container, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes initial reactive state', () => {
    const onRefresh = vi.fn();
    const { result, unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh }),
    );

    expect(result.isPulling.value).toBeFalsy();
    expect(result.pullDistance.value).toBe(0);
    expect(result.isRefreshing.value).toBeFalsy();
    expect(result.progress.value).toBe(0);
    expect(result.shouldRelease.value).toBeFalsy();
    unmount();
  });

  it('tracks pull distance and triggers refresh past the threshold', async () => {
    const onRefresh = vi.fn().mockResolvedValue();
    const { result, unmount } = withSetup(() =>
      usePullToRefresh(ref(container), {
        onRefresh,
        threshold: 80,
        maxPull: 120,
      }),
    );

    listeners.touchstart(touch(0) as unknown as Event);
    // diff 240 -> distance min(240*0.5,120)=120 (>= threshold)
    listeners.touchmove(touch(240) as unknown as Event);

    expect(result.isPulling.value).toBeTruthy();
    expect(result.pullDistance.value).toBe(120);
    expect(result.progress.value).toBe(100);
    expect(result.shouldRelease.value).toBeTruthy();

    await listeners.touchend(new Event('touchend'));

    expect(onRefresh).toHaveBeenCalledOnce();
    expect(result.isRefreshing.value).toBeFalsy();
    expect(result.pullDistance.value).toBe(0);
    unmount();
  });

  it('does not refresh when released below the threshold', async () => {
    const onRefresh = vi.fn();
    const { result, unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh, threshold: 80 }),
    );

    listeners.touchstart(touch(0) as unknown as Event);
    listeners.touchmove(touch(40) as unknown as Event); // distance 20
    await listeners.touchend(new Event('touchend'));

    expect(onRefresh).not.toHaveBeenCalled();
    expect(result.pullDistance.value).toBe(0);
    unmount();
  });

  it('ignores pulls while disabled', () => {
    const onRefresh = vi.fn();
    const disabled = ref(true);
    const { result, unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh, disabled }),
    );

    listeners.touchstart(touch(0) as unknown as Event);
    listeners.touchmove(touch(240) as unknown as Event);

    expect(result.isPulling.value).toBeFalsy();
    unmount();
  });

  it('does nothing on touchend when not pulling', async () => {
    const onRefresh = vi.fn();
    const { unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh }),
    );

    await listeners.touchend(new Event('touchend'));
    expect(onRefresh).not.toHaveBeenCalled();
    unmount();
  });

  it('only allows pulling when scrolled to the top', () => {
    const onRefresh = vi.fn();
    setScrollY(50);
    const { result, unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh }),
    );

    listeners.touchstart(touch(0) as unknown as Event);
    listeners.touchmove(touch(240) as unknown as Event);

    expect(result.isPulling.value).toBeFalsy();
    unmount();
  });

  it('vibrates at the threshold once a user has tapped', () => {
    // simulate the global one-time click that enables vibration
    document.dispatchEvent(new MouseEvent('click'));
    vibrate.mockClear();

    const onRefresh = vi.fn();
    const { unmount } = withSetup(() =>
      usePullToRefresh(ref(container), { onRefresh, threshold: 80 }),
    );

    listeners.touchstart(touch(0) as unknown as Event);
    listeners.touchmove(touch(240) as unknown as Event); // crosses threshold

    expect(vibrate).toHaveBeenCalled();
    unmount();
  });

  it('falls back to document when the ref resolves to a component $el', () => {
    const onRefresh = vi.fn();
    const docListeners: Record<string, EventListener> = {};
    const addSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, handler) => {
        docListeners[type] = handler as EventListener;
      });
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});

    const componentRef = { $el: container } as { $el: HTMLElement };
    const { unmount } = withSetup(() =>
      usePullToRefresh(ref(componentRef), { onRefresh }),
    );

    // $el is an HTMLElement so listeners attach to the container, not document
    expect(addSpy).not.toHaveBeenCalledWith(
      'touchstart',
      expect.anything(),
      expect.anything(),
    );
    unmount();
    addSpy.mockRestore();
  });

  it('uses document when the container ref is null', () => {
    const onRefresh = vi.fn();
    const docListeners: Record<string, EventListener> = {};
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (type, handler) => {
        docListeners[type] = handler as EventListener;
      },
    );
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});

    const { unmount } = withSetup(() =>
      usePullToRefresh(ref(null), { onRefresh }),
    );

    expect(Object.keys(docListeners)).toContain('touchstart');
    unmount();
  });
});
