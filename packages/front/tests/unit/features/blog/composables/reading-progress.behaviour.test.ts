import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReadingProgress } from '@/features/blog/composables/reading-progress';
import { withSetup } from '../../../helpers/with-setup';

function setScroll(scrollY: number, scrollHeight: number, innerHeight: number) {
  Object.defineProperty(globalThis.window, 'scrollY', {
    value: scrollY,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis.window, 'innerHeight', {
    value: innerHeight,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
}

describe('useReadingProgress', () => {
  beforeEach(() => {
    setScroll(0, 2000, 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with zero progress and hidden back-to-top', () => {
    const { result, unmount } = withSetup(() => useReadingProgress());
    expect(result.readingProgress.value).toBe(0);
    expect(result.showBackToTop.value).toBeFalsy();
    unmount();
  });

  it('updates progress and shows back-to-top on scroll', () => {
    const { result, unmount } = withSetup(() => useReadingProgress(400));

    setScroll(500, 2000, 1000); // docHeight = 1000, progress = 50%
    globalThis.window.dispatchEvent(new Event('scroll'));

    expect(result.readingProgress.value).toBe(50);
    expect(result.showBackToTop.value).toBeTruthy();
    unmount();
  });

  it('clamps progress to zero when document is not scrollable', () => {
    const { result, unmount } = withSetup(() => useReadingProgress());

    setScroll(0, 800, 1000); // docHeight negative -> 0
    globalThis.window.dispatchEvent(new Event('scroll'));

    expect(result.readingProgress.value).toBe(0);
    unmount();
  });

  it('scrollToTop calls window.scrollTo smoothly', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    const { result, unmount } = withSetup(() => useReadingProgress());
    result.scrollToTop();

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    unmount();
    vi.unstubAllGlobals();
  });

  it('removes the scroll listener on unmount', () => {
    const { result, unmount } = withSetup(() => useReadingProgress(400));
    unmount();

    setScroll(500, 2000, 1000);
    globalThis.window.dispatchEvent(new Event('scroll'));

    // value stays at the initial 0 because the listener was detached
    expect(result.readingProgress.value).toBe(0);
  });
});
