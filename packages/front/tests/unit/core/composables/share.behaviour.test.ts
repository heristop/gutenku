import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { HaikuValue } from '@gutenku/shared';

const copy = vi.fn().mockResolvedValue(true);
const copied = { value: true };

vi.mock('@/core/composables/clipboard', () => ({
  useClipboard: () => ({ copy, copied }),
}));

// A tiny valid base64 string ("AAAA" -> 3 bytes)
const haikuWithImage: HaikuValue = {
  verses: ['line one', 'line two', 'line three'],
  title: 'Imaged Haiku',
  image: 'AAAA',
  book: { title: 'Book', author: 'Author' },
  chapter: { title: 'Ch' },
} as unknown as HaikuValue;

function setNavigator(nav: Record<string, unknown>) {
  Object.defineProperty(globalThis, 'navigator', {
    value: nav,
    configurable: true,
    writable: true,
  });
}

describe('useShare native share branches', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
    copied.value = true;
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    vi.useRealTimers();
  });

  it('shares an image file when the platform can share files', async () => {
    vi.useFakeTimers();
    const share = vi.fn().mockResolvedValue();
    setNavigator({
      share,
      canShare: vi.fn().mockReturnValue(true),
    });

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare, shared } = useShare();

    const result = await doShare(haikuWithImage);

    expect(result).toBeTruthy();
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ files: expect.any(Array) }),
    );
    expect(shared.value).toBeTruthy();

    // shared resets after the timeout
    vi.advanceTimersByTime(2000);
    expect(shared.value).toBeFalsy();
  });

  it('shares text only when files cannot be shared', async () => {
    const share = vi.fn().mockResolvedValue();
    setNavigator({
      share,
      canShare: vi.fn().mockReturnValue(false),
    });

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare } = useShare();

    const result = await doShare(haikuWithImage);

    expect(result).toBeTruthy();
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.any(String),
        title: 'Imaged Haiku',
      }),
    );
    expect(share.mock.calls[0][0]).not.toHaveProperty('files');
  });

  it('returns false silently when the user aborts the share', async () => {
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    setNavigator({
      share: vi.fn().mockRejectedValue(abortErr),
      canShare: vi.fn().mockReturnValue(false),
    });

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare } = useShare();

    const result = await doShare(haikuWithImage);

    expect(result).toBeFalsy();
    expect(copy).not.toHaveBeenCalled();
  });

  it('falls back to clipboard when the native share throws a real error', async () => {
    setNavigator({
      share: vi.fn().mockRejectedValue(new Error('share failed')),
      canShare: vi.fn().mockReturnValue(false),
    });

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare } = useShare();

    const result = await doShare(haikuWithImage);

    expect(result).toBeTruthy();
    expect(copy).toHaveBeenCalled();
  });

  it('copies to clipboard when no native share API exists', async () => {
    setNavigator({});

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare, canNativeShare } = useShare();

    expect(canNativeShare.value).toBeFalsy();
    const result = await doShare(haikuWithImage);

    expect(result).toBeTruthy();
    expect(copy).toHaveBeenCalled();
  });

  it('treats an absent navigator as non-shareable (SSR guard)', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { useShare } = await import('@/core/composables/share');
    const { canNativeShare } = useShare();

    // typeof navigator === 'undefined' branch
    expect(canNativeShare.value).toBeFalsy();
  });

  it('shares text only when canShare is unavailable on the platform', async () => {
    // navigator.share present but no canShare -> canShareFiles() returns false
    setNavigator({ share: vi.fn().mockResolvedValue() });

    const { useShare } = await import('@/core/composables/share');
    const { share: doShare } = useShare();

    const result = await doShare(haikuWithImage);
    expect(result).toBeTruthy();
  });
});
