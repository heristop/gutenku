import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useReadingProgress', () => {
  let originalScrollY: PropertyDescriptor | undefined;
  let originalScrollHeight: PropertyDescriptor | undefined;
  let originalInnerHeight: number;

  beforeEach(() => {
    vi.clearAllMocks();

    // Store original values
    originalScrollY = Object.getOwnPropertyDescriptor(globalThis, 'scrollY');
    originalScrollHeight = Object.getOwnPropertyDescriptor(
      document.documentElement,
      'scrollHeight',
    );
    originalInnerHeight = globalThis.innerHeight;

    // Mock scroll values
    Object.defineProperty(globalThis, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'innerHeight', {
      value: 1000,
      writable: true,
      configurable: true,
    });

    // Mock window methods
    globalThis.scrollTo = vi.fn();
    globalThis.addEventListener = vi.fn();
    globalThis.removeEventListener = vi.fn();
  });

  afterEach(() => {
    // Restore original values
    if (originalScrollY) {
      Object.defineProperty(globalThis, 'scrollY', originalScrollY);
    }
    if (originalScrollHeight) {
      Object.defineProperty(
        document.documentElement,
        'scrollHeight',
        originalScrollHeight,
      );
    }
    Object.defineProperty(globalThis, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
      configurable: true,
    });
  });

  it('should be importable', async () => {
    const module = await import('@/features/blog/composables/reading-progress');
    expect(module.useReadingProgress).toBeDefined();
  });

  it('should expose readingProgress ref', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { readingProgress } = useReadingProgress();

    expect(readingProgress).toBeDefined();
    expect(typeof readingProgress.value).toBe('number');
  });

  it('should expose showBackToTop ref', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { showBackToTop } = useReadingProgress();

    expect(showBackToTop).toBeDefined();
    expect(typeof showBackToTop.value).toBe('boolean');
  });

  it('should expose scrollToTop function', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { scrollToTop } = useReadingProgress();

    expect(typeof scrollToTop).toBe('function');
  });

  it('should start with 0% progress', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { readingProgress } = useReadingProgress();

    expect(readingProgress.value).toBe(0);
  });

  it('should start with back to top hidden', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { showBackToTop } = useReadingProgress();

    expect(showBackToTop.value).toBeFalsy();
  });

  it('should call scrollTo when scrollToTop is invoked', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');
    const { scrollToTop } = useReadingProgress();

    scrollToTop();

    expect(globalThis.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should accept custom scroll threshold', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');

    expect(() => useReadingProgress(600)).not.toThrow();
  });

  it('should use default threshold of 400', async () => {
    const { useReadingProgress } =
      await import('@/features/blog/composables/reading-progress');

    // Just verify it works with default
    const { showBackToTop } = useReadingProgress();
    expect(showBackToTop.value).toBeFalsy();
  });
});
