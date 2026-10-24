import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isViewTransitionRunning,
  runViewTransition,
  supportsViewTransition,
  withViewTransition,
} from '@/core/composables/view-transition';

describe('view-transition', () => {
  afterEach(() => {
    delete (document as unknown as Record<string, unknown>).startViewTransition;
    vi.restoreAllMocks();
  });

  describe('supportsViewTransition', () => {
    it('returns false when the API is unavailable', () => {
      expect(supportsViewTransition()).toBeFalsy();
    });

    it('returns false when reduced motion is preferred', () => {
      (document as unknown as Record<string, unknown>).startViewTransition =
        vi.fn();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
        matches: true,
      } as MediaQueryList);

      expect(supportsViewTransition()).toBeFalsy();
    });

    it('returns true when supported and motion is allowed', () => {
      (document as unknown as Record<string, unknown>).startViewTransition =
        vi.fn();
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);

      expect(supportsViewTransition()).toBeTruthy();
    });
  });

  describe('withViewTransition', () => {
    it('runs callback directly when not supported', () => {
      const cb = vi.fn();
      withViewTransition(cb);
      expect(cb).toHaveBeenCalledOnce();
    });

    it('runs callback through startViewTransition when supported', () => {
      const start = vi.fn((cb: () => void) => cb());
      (document as unknown as Record<string, unknown>).startViewTransition =
        start;
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const cb = vi.fn();
      withViewTransition(cb);

      expect(start).toHaveBeenCalledOnce();
      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe('runViewTransition', () => {
    it('never nests: a second call while one runs skips it and updates directly', async () => {
      let finish: () => void = () => {};
      const skipTransition = vi.fn(() => finish());
      const start = vi.fn((cb: () => void) => {
        cb();

        return {
          ready: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          finished: new Promise<void>((resolve) => {
            finish = resolve;
          }),
          skipTransition,
        };
      });
      (document as unknown as Record<string, unknown>).startViewTransition =
        start;
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);

      const first = vi.fn();
      const second = vi.fn();

      await runViewTransition(first, 'page');
      expect(isViewTransitionRunning()).toBeTruthy();
      expect(document.documentElement.dataset.gkVt).toBe('page');

      await runViewTransition(second, 'theme');

      expect(start).toHaveBeenCalledOnce();
      expect(skipTransition).toHaveBeenCalledOnce();
      expect(second).toHaveBeenCalledOnce();

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      expect(isViewTransitionRunning()).toBeFalsy();
      expect(document.documentElement.dataset.gkVt).toBeUndefined();
    });

    it('swallows a rejected (skipped) transition', async () => {
      const skipped = () => {
        const promise = Promise.reject(
          new DOMException('Skipped', 'AbortError'),
        );
        promise.catch(() => {});

        return promise;
      };
      (document as unknown as Record<string, unknown>).startViewTransition =
        vi.fn((cb: () => void) => {
          cb();

          return {
            ready: skipped(),
            updateCallbackDone: Promise.resolve(),
            finished: skipped(),
            skipTransition: vi.fn(),
          };
        });
      vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
        matches: false,
      } as MediaQueryList);

      await expect(runViewTransition(vi.fn(), 'page')).resolves.toBeUndefined();
    });
  });
});
