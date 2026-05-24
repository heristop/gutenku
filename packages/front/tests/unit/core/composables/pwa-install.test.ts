import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withSetup } from '../../helpers/with-setup';

vi.mock('@/utils/capacitor', () => ({ isNative: false }));

const FIXED_NOW = 1_000_000_000_000;

describe('usePwaInstall', () => {
  const originalNavigator = globalThis.navigator;
  const originalMatchMedia = globalThis.matchMedia;

  beforeEach(() => {
    vi.resetModules();
    globalThis.localStorage.clear();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
    globalThis.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof matchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    globalThis.matchMedia = originalMatchMedia;
  });

  function setNavigator(nav: Record<string, unknown>) {
    Object.defineProperty(globalThis, 'navigator', {
      value: nav,
      configurable: true,
      writable: true,
    });
  }

  async function loadComposable() {
    const mod = await import('@/core/composables/pwa-install');
    
return mod.usePwaInstall;
  }

  it('detects iOS from the user agent', async () => {
    setNavigator({ userAgent: 'iPhone Safari' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.isIos.value).toBeTruthy();
    expect(result.canInstall.value).toBeTruthy(); // iOS can install
    unmount();
  });

  it('reports not-iOS for desktop user agents', async () => {
    setNavigator({ userAgent: 'Mozilla Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.isIos.value).toBeFalsy();
    expect(result.canInstall.value).toBeFalsy(); // no native prompt + not iOS
    unmount();
  });

  it('reports installed when in standalone display mode', async () => {
    setNavigator({ userAgent: 'iPhone' });
    globalThis.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof matchMedia;
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.isInstalled.value).toBeTruthy();
    expect(result.canInstall.value).toBeFalsy();
    unmount();
  });

  it('tracks engagement and computes hasEnoughEngagement', async () => {
    setNavigator({ userAgent: 'iPhone' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.hasEnoughEngagement.value).toBeFalsy();

    result.trackHaikuView();
    result.trackHaikuView();
    result.trackHaikuView();
    result.trackHaikuView();
    expect(result.hasEnoughEngagement.value).toBeTruthy();
    unmount();
  });

  it('tracks game plays towards engagement', async () => {
    setNavigator({ userAgent: 'iPhone' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    result.trackGamePlayed();
    result.trackGamePlayed();
    expect(result.hasEnoughEngagement.value).toBeTruthy();
    unmount();
  });

  it('shows the banner for an engaged returning iOS visitor', async () => {
    // first visit was 3 days ago
    localStorage.setItem(
      'gutenku-pwa-first-visit',
      String(FIXED_NOW - 3 * 24 * 60 * 60 * 1000),
    );
    localStorage.setItem(
      'gutenku-pwa-engagement',
      JSON.stringify({ haikuViewCount: 5, gamePlayedCount: 0 }),
    );
    setNavigator({ userAgent: 'iPhone' });

    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.shouldShowBanner.value).toBeTruthy();
    unmount();
  });

  it('hides the banner during the dismissal cooldown', async () => {
    localStorage.setItem(
      'gutenku-pwa-first-visit',
      String(FIXED_NOW - 5 * 24 * 60 * 60 * 1000),
    );
    localStorage.setItem(
      'gutenku-pwa-engagement',
      JSON.stringify({ haikuViewCount: 5, gamePlayedCount: 0 }),
    );
    localStorage.setItem(
      'gutenku-pwa-dismissal',
      JSON.stringify({ dismissedAt: FIXED_NOW - 1000, count: 1 }),
    );
    setNavigator({ userAgent: 'iPhone' });

    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.shouldShowBanner.value).toBeFalsy();

    // dismiss increments the count and refreshes dismissedAt
    result.dismiss();
    unmount();
  });

  it('returns false from showPrompt when no native prompt is available', async () => {
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.hasNativePrompt.value).toBeFalsy();
    await expect(result.showPrompt()).resolves.toBeFalsy();
    unmount();
  });

  it('captures the beforeinstallprompt event and resolves accepted prompts', async () => {
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    const promptFn = vi.fn().mockResolvedValue();
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: promptFn,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    globalThis.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(result.hasNativePrompt.value).toBeTruthy();
    expect(result.canInstall.value).toBeTruthy();

    await expect(result.showPrompt()).resolves.toBeTruthy();
    expect(promptFn).toHaveBeenCalled();
    // prompt consumed
    expect(result.hasNativePrompt.value).toBeFalsy();
    unmount();
  });

  it('returns false from showPrompt when the user dismisses', async () => {
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockResolvedValue(),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    });
    globalThis.dispatchEvent(event);

    await expect(result.showPrompt()).resolves.toBeFalsy();
    unmount();
  });

  it('ignores beforeinstallprompt during the dismissal cooldown', async () => {
    localStorage.setItem(
      'gutenku-pwa-dismissal',
      JSON.stringify({ dismissedAt: FIXED_NOW - 1000, count: 1 }),
    );
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    globalThis.dispatchEvent(event);

    // cooldown active -> event ignored, no native prompt captured
    expect(preventDefault).not.toHaveBeenCalled();
    expect(result.hasNativePrompt.value).toBeFalsy();
    unmount();
  });

  it('returns false from showPrompt when prompting rejects', async () => {
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockRejectedValue(new Error('prompt failed')),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    globalThis.dispatchEvent(event);

    await expect(result.showPrompt()).resolves.toBeFalsy();
    unmount();
  });

  it('is not standalone when matchMedia is unavailable', async () => {
    setNavigator({ userAgent: 'Chrome' });
    globalThis.matchMedia = undefined as unknown as typeof matchMedia;
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    expect(result.isInstalled.value).toBeFalsy();
    unmount();
  });

  it('clears the native prompt once the app is installed', async () => {
    setNavigator({ userAgent: 'Chrome' });
    const usePwaInstall = await loadComposable();
    const { result, unmount } = withSetup(() => usePwaInstall());

    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    globalThis.dispatchEvent(event);
    expect(result.hasNativePrompt.value).toBeTruthy();

    globalThis.dispatchEvent(new Event('appinstalled'));
    expect(result.hasNativePrompt.value).toBeFalsy();
    unmount();
  });
});
