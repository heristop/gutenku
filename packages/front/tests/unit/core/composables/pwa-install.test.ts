import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { withSetup } from '../../helpers/with-setup';
import {
  LEGACY_STORAGE_KEYS,
  PWA_PROMPT_STORAGE_KEY,
  dayKey,
  initialPromptState,
  type PwaPromptState,
} from '@/core/composables/pwa-install-gate';

const capacitor = vi.hoisted(() => ({ isNative: false }));
vi.mock('@/utils/capacitor', () => ({
  get isNative() {
    return capacitor.isNative;
  },
}));

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 9, 24, 12).getTime();
const IOS_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IOS_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1';
const DESKTOP_FIREFOX =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:130.0) Gecko/20100101 Firefox/130.0';

function engagedState(patch: Partial<PwaPromptState> = {}): PwaPromptState {
  return {
    ...initialPromptState(),
    visitDays: [dayKey(NOW - 2 * DAY), dayKey(NOW - DAY), dayKey(NOW)],
    haikuViews: 3,
    ...patch,
  };
}

function seedState(state: PwaPromptState) {
  localStorage.setItem(PWA_PROMPT_STORAGE_KEY, JSON.stringify(state));
}

function storedState(): PwaPromptState {
  return JSON.parse(localStorage.getItem(PWA_PROMPT_STORAGE_KEY)!);
}

function installEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  return Object.assign(new Event('beforeinstallprompt'), {
    prompt: vi.fn().mockResolvedValue(null),
    userChoice: Promise.resolve({ outcome }),
  });
}

describe('usePwaInstall', () => {
  const originalNavigator = globalThis.navigator;
  const originalMatchMedia = globalThis.matchMedia;
  let mediaMatches: Set<string>;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers({ now: NOW });
    localStorage.clear();
    sessionStorage.clear();
    capacitor.isNative = false;
    mediaMatches = new Set();
    globalThis.matchMedia = vi.fn((query: string) => ({
      matches: mediaMatches.has(query),
    })) as unknown as typeof matchMedia;
    setNavigator({ userAgent: IOS_SAFARI });
  });

  afterEach(() => {
    vi.useRealTimers();
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

  async function mountComposable() {
    const { usePwaInstall } = await import('@/core/composables/pwa-install');

    return withSetup(() => usePwaInstall());
  }

  describe('where it may appear', () => {
    it('offers iOS instructions on iOS Safari only', async () => {
      const safari = await mountComposable();
      expect(safari.result.isIos.value).toBeTruthy();
      expect(safari.result.canInstall.value).toBeTruthy();
      safari.unmount();

      vi.resetModules();
      setNavigator({ userAgent: IOS_CHROME });
      const chrome = await mountComposable();
      expect(chrome.result.isIos.value).toBeTruthy();
      expect(chrome.result.canInstall.value).toBeFalsy();
      chrome.unmount();
    });

    it('stays silent on desktop browsers without beforeinstallprompt', async () => {
      setNavigator({ userAgent: DESKTOP_FIREFOX });
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      expect(result.isIos.value).toBeFalsy();
      expect(result.canInstall.value).toBeFalsy();
      expect(result.shouldShowBanner.value).toBeFalsy();
      unmount();
    });

    it('never shows in standalone display mode', async () => {
      mediaMatches.add('(display-mode: standalone)');
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      expect(result.isInstalled.value).toBeTruthy();
      expect(result.shouldShowBanner.value).toBeFalsy();
      unmount();
    });

    it('never shows from the iOS home screen', async () => {
      setNavigator({ userAgent: IOS_SAFARI, standalone: true });
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      expect(result.shouldShowBanner.value).toBeFalsy();
      unmount();
    });

    it('never shows inside the native Capacitor app', async () => {
      capacitor.isNative = true;
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      expect(result.canInstall.value).toBeFalsy();
      expect(result.shouldShowBanner.value).toBeFalsy();
      unmount();
    });

    it('respects prefers-reduced-data and Save-Data', async () => {
      seedState(engagedState());
      mediaMatches.add('(prefers-reduced-data: reduce)');
      const media = await mountComposable();
      expect(media.result.shouldShowBanner.value).toBeFalsy();
      media.unmount();

      vi.resetModules();
      mediaMatches.clear();
      setNavigator({ userAgent: IOS_SAFARI, connection: { saveData: true } });
      const saveData = await mountComposable();
      expect(saveData.result.shouldShowBanner.value).toBeFalsy();
      saveData.unmount();
    });

    it('treats a missing matchMedia as a browser tab', async () => {
      globalThis.matchMedia = undefined as unknown as typeof matchMedia;
      const { result, unmount } = await mountComposable();

      expect(result.isInstalled.value).toBeFalsy();
      unmount();
    });
  });

  describe('engagement gate', () => {
    it('stays hidden on a first visit, however busy', async () => {
      const { result, unmount } = await mountComposable();

      for (let i = 0; i < 10; i++) {
        result.trackHaikuView();
      }
      result.trackGameCompleted();

      expect(storedState().visitDays).toEqual([dayKey(NOW)]);
      expect(result.shouldShowBanner.value).toBeFalsy();
      unmount();
    });

    it('records today as a visit day once', async () => {
      seedState(engagedState({ visitDays: [dayKey(NOW - 3 * DAY)] }));
      const first = await mountComposable();
      first.unmount();
      vi.resetModules();
      const second = await mountComposable();

      expect(storedState().visitDays).toEqual([
        dayKey(NOW - 3 * DAY),
        dayKey(NOW),
      ]);
      second.unmount();
    });

    it('shows on the third day once three haiku were read', async () => {
      seedState(engagedState({ haikuViews: 2 }));
      const { result, unmount } = await mountComposable();

      expect(result.shouldShowBanner.value).toBeFalsy();
      result.trackHaikuView();
      expect(result.shouldShowBanner.value).toBeTruthy();
      unmount();
    });

    it('counts a completed game, not a started one', async () => {
      seedState(engagedState({ haikuViews: 0 }));
      const { result, unmount } = await mountComposable();

      result.trackGamePlayed();
      expect(result.shouldShowBanner.value).toBeFalsy();
      result.trackGameCompleted();
      expect(result.shouldShowBanner.value).toBeTruthy();
      expect(storedState()).toMatchObject({
        gamesPlayed: 1,
        gameCompleted: true,
      });
      unmount();
    });
  });

  describe('once per session and backoff', () => {
    it('shows at most once per session', async () => {
      seedState(engagedState());
      const first = await mountComposable();

      first.result.markShown();
      expect(first.result.shouldShowBanner.value).toBeFalsy();
      first.unmount();

      // A reload in the same tab
      vi.resetModules();
      const reload = await mountComposable();
      expect(reload.result.shouldShowBanner.value).toBeFalsy();
      reload.unmount();

      // A new session
      sessionStorage.clear();
      vi.resetModules();
      const next = await mountComposable();
      expect(next.result.shouldShowBanner.value).toBeTruthy();
      next.unmount();
    });

    it('backs off 14 days, then 45, then for good', async () => {
      seedState(engagedState());

      async function dismissedThenDueAfter(days: number) {
        vi.resetModules();
        const { result, unmount } = await mountComposable();
        expect(result.shouldShowBanner.value).toBeTruthy();
        result.dismiss();
        expect(result.shouldShowBanner.value).toBeFalsy();
        unmount();

        vi.setSystemTime(Date.now() + (days - 1) * DAY);
        vi.resetModules();
        const early = await mountComposable();
        expect(early.result.shouldShowBanner.value).toBeFalsy();
        early.unmount();

        vi.setSystemTime(Date.now() + DAY);
      }

      await dismissedThenDueAfter(14);
      await dismissedThenDueAfter(45);

      vi.resetModules();
      const third = await mountComposable();
      third.result.dismiss();
      third.unmount();

      vi.setSystemTime(Date.now() + 1000 * DAY);
      vi.resetModules();
      const years = await mountComposable();
      expect(years.result.shouldShowBanner.value).toBeFalsy();
      expect(storedState().dismissCount).toBe(3);
      years.unmount();
    });

    it('stops for good on "Don\'t ask again"', async () => {
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      result.optOut();
      expect(result.shouldShowBanner.value).toBeFalsy();
      expect(storedState().optedOut).toBeTruthy();
      unmount();
    });

    it('keeps an earlier dismissal from the legacy keys', async () => {
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.dismissal,
        JSON.stringify({ dismissedAt: NOW - 60 * DAY, count: 1 }),
      );
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.engagement,
        JSON.stringify({ haikuViewCount: 8, gamePlayedCount: 0 }),
      );
      localStorage.setItem(
        LEGACY_STORAGE_KEYS.firstVisit,
        String(NOW - 60 * DAY),
      );
      const { result, unmount } = await mountComposable();

      expect(result.shouldShowBanner.value).toBeFalsy();
      expect(storedState()).toMatchObject({
        haikuViews: 8,
        dismissCount: 1,
        dismissedAt: NOW,
      });
      expect(localStorage.getItem(LEGACY_STORAGE_KEYS.dismissal)).toBeNull();
      unmount();
    });
  });

  describe('beforeinstallprompt', () => {
    beforeEach(() => {
      setNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 15) Chrome/130' });
    });

    it('holds the event back from the browser and enables Install', async () => {
      const { result, unmount } = await mountComposable();
      const event = installEvent();
      const preventDefault = vi.spyOn(event, 'preventDefault');

      expect(result.canInstall.value).toBeFalsy();
      globalThis.dispatchEvent(event);

      expect(preventDefault).toHaveBeenCalled();
      expect(result.canInstall.value).toBeTruthy();
      await expect(result.showPrompt()).resolves.toBeTruthy();
      expect(event.prompt).toHaveBeenCalled();
      expect(result.hasNativePrompt.value).toBeFalsy();
      expect(storedState().installed).toBeTruthy();
      unmount();
    });

    it('ignores the event once installed', async () => {
      mediaMatches.add('(display-mode: standalone)');
      const { result, unmount } = await mountComposable();
      const event = installEvent();
      const preventDefault = vi.spyOn(event, 'preventDefault');

      globalThis.dispatchEvent(event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(result.hasNativePrompt.value).toBeFalsy();
      unmount();
    });

    it('resolves false when the visitor declines or prompting fails', async () => {
      const { result, unmount } = await mountComposable();

      await expect(result.showPrompt()).resolves.toBeFalsy();

      globalThis.dispatchEvent(installEvent('dismissed'));
      await expect(result.showPrompt()).resolves.toBeFalsy();

      const failing = installEvent();
      failing.prompt.mockRejectedValue(new Error('prompt failed'));
      globalThis.dispatchEvent(failing);
      await expect(result.showPrompt()).resolves.toBeFalsy();
      expect(storedState().installed).toBeFalsy();
      unmount();
    });

    it('never asks again after appinstalled', async () => {
      seedState(engagedState());
      const { result, unmount } = await mountComposable();

      globalThis.dispatchEvent(installEvent());
      expect(result.shouldShowBanner.value).toBeTruthy();

      globalThis.dispatchEvent(new Event('appinstalled'));
      expect(result.hasNativePrompt.value).toBeFalsy();
      expect(result.isInstalled.value).toBeTruthy();
      expect(result.shouldShowBanner.value).toBeFalsy();
      expect(storedState().installed).toBeTruthy();
      unmount();
    });

    it('keeps listening while any caller is mounted', async () => {
      const { usePwaInstall } = await import('@/core/composables/pwa-install');
      const banner = withSetup(() => usePwaInstall());
      const page = withSetup(() => usePwaInstall());

      page.unmount();
      globalThis.dispatchEvent(installEvent());

      expect(banner.result.hasNativePrompt.value).toBeTruthy();
      banner.unmount();
    });
  });
});

describe('isDailyGameComplete', () => {
  it('reads the game store through Pinia', async () => {
    const { isDailyGameComplete } =
      await import('@/core/composables/pwa-install');
    const pinia = createPinia();
    setActivePinia(pinia);

    expect(isDailyGameComplete()).toBeFalsy();
    pinia.state.value.game = { currentGame: { isComplete: false } };
    expect(isDailyGameComplete()).toBeFalsy();
    pinia.state.value.game = { currentGame: { isComplete: true } };
    expect(isDailyGameComplete()).toBeTruthy();
  });
});

describe('usePwaPromptMoment', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers({ now: NOW });
    document.body.replaceChildren();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  async function mountMoment(route: string, eligible = true) {
    const { usePwaPromptMoment } =
      await import('@/core/composables/pwa-install');
    const eligibleRef = ref(eligible);
    const routeRef = ref<string>(route);
    const mounted = withSetup(() => usePwaPromptMoment(eligibleRef, routeRef));

    return { ...mounted, eligibleRef, routeRef };
  }

  it('waits for 20 seconds of idle on Home, never on load', async () => {
    const { result, unmount } = await mountMoment('Home');

    await vi.advanceTimersByTimeAsync(19_000);
    expect(result.isMoment.value).toBeFalsy();
    await vi.advanceTimersByTimeAsync(2000);
    expect(result.isMoment.value).toBeTruthy();
    unmount();
  });

  it('restarts the idle wait on activity', async () => {
    const { result, unmount } = await mountMoment('Haiku');

    await vi.advanceTimersByTimeAsync(15_000);
    globalThis.dispatchEvent(new Event('keydown'));
    await vi.advanceTimersByTimeAsync(15_000);
    expect(result.isMoment.value).toBeFalsy();
    await vi.advanceTimersByTimeAsync(6000);
    expect(result.isMoment.value).toBeTruthy();
    unmount();
  });

  it('waits while a dialog, toast or first-run strip is open', async () => {
    const blockers = [
      Object.assign(document.createElement('div'), { className: 'zen-toast' }),
      Object.assign(document.createElement('section'), {
        className: 'how-it-works',
      }),
    ];
    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    blockers.push(dialog);

    const { result, unmount } = await mountMoment('Home');

    for (const blocker of blockers) {
      document.body.append(blocker);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(result.isMoment.value).toBeFalsy();
      blocker.remove();
    }

    await vi.advanceTimersByTimeAsync(21_000);
    expect(result.isMoment.value).toBeTruthy();
    unmount();
  });

  it('never interrupts a game in progress', async () => {
    const { result, unmount } = await mountMoment('Game');

    await vi.advanceTimersByTimeAsync(120_000);
    expect(result.isMoment.value).toBeFalsy();
    unmount();
  });

  it('follows a finished game once its colophon closes', async () => {
    const colophon = document.createElement('div');
    colophon.setAttribute('aria-modal', 'true');
    document.body.append(colophon);
    const { getActivePinia } = await import('pinia');
    getActivePinia()!.state.value.game = { currentGame: { isComplete: true } };

    const { result, unmount } = await mountMoment('Game');

    await vi.advanceTimersByTimeAsync(10_000);
    expect(result.isMoment.value).toBeFalsy();

    colophon.remove();
    await vi.advanceTimersByTimeAsync(3000);
    expect(result.isMoment.value).toBeTruthy();
    unmount();
  });

  it('stays out of other pages and of ineligible visitors', async () => {
    const blog = await mountMoment('Blog');
    await vi.advanceTimersByTimeAsync(60_000);
    expect(blog.result.isMoment.value).toBeFalsy();
    blog.unmount();

    const ineligible = await mountMoment('Home', false);
    await vi.advanceTimersByTimeAsync(60_000);
    expect(ineligible.result.isMoment.value).toBeFalsy();

    ineligible.eligibleRef.value = true;
    await nextTick();
    await vi.advanceTimersByTimeAsync(21_000);
    expect(ineligible.result.isMoment.value).toBeTruthy();
    ineligible.unmount();
  });
});
