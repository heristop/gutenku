import { describe, it, expect, vi, afterEach } from 'vitest';
import {
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
});
