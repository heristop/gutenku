import {
  ref,
  computed,
  readonly,
  watch,
  onMounted,
  onUnmounted,
  type Ref,
} from 'vue';
import { getActivePinia } from 'pinia';
import { useIdle, useIntervalFn, useLocalStorage } from '@vueuse/core';
import { isNative } from '@/utils/capacitor';
import {
  PWA_PROMPT_STORAGE_KEY,
  initialPromptState,
  isPromptDue,
  migrateLegacyState,
  withVisit,
  type PwaPromptState,
} from '@/core/composables/pwa-install-gate';

/** Idle time on Home or Haiku before the invitation may slide in. */
export const IDLE_PAUSE_MS = 20_000;
/** Breathing room once a finished game's colophon has been closed. */
export const GAME_PAUSE_MS = 1500;
const MOMENT_TICK_MS = 1000;
const IDLE_ROUTES = new Set(['Home', 'Haiku']);
const GAME_ROUTE = 'Game';
const SESSION_SHOWN_KEY = 'gutenku-pwa-prompted';

/** Anything on screen that already asks for attention. */
export const PROMPT_BLOCKERS = [
  '[aria-modal="true"]',
  'dialog[open]',
  '.zen-toast',
  '.hint-toast',
  '.how-it-works',
  '.cookie-consent',
].join(',');

const INSTALLED_DISPLAY_MODES = [
  'standalone',
  'fullscreen',
  'minimal-ui',
  'window-controls-overlay',
];
const IOS_DEVICE = /iPad|iPhone|iPod/;
// iOS browsers other than Safari, and in-app webviews, cannot add to Home
const IOS_NOT_SAFARI =
  /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type NavigatorExtras = Navigator & {
  standalone?: boolean;
  connection?: { saveData?: boolean };
};

// Shared across every caller
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
let promptState: Ref<PwaPromptState> | null = null;
let listenerUsers = 0;

function matchesMedia(query: string): boolean {
  return globalThis.matchMedia?.(query)?.matches ?? false;
}

function readSessionFlag(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(SESSION_SHOWN_KEY) === '1';
  } catch {
    return false;
  }
}

const shownThisSession = ref(readSessionFlag());

function usePromptState(): Ref<PwaPromptState> {
  if (globalThis.localStorage === undefined) {
    return ref(initialPromptState());
  }

  if (!promptState) {
    const migrated =
      localStorage.getItem(PWA_PROMPT_STORAGE_KEY) === null
        ? migrateLegacyState(localStorage, Date.now())
        : null;
    // Written synchronously so a dismissal survives an immediate reload. Not
    // listening to storage events: our own write would echo back and pause
    // the next one.
    promptState = useLocalStorage(
      PWA_PROMPT_STORAGE_KEY,
      migrated ?? initialPromptState(),
      { mergeDefaults: true, flush: 'sync', listenToStorageChanges: false },
    );
    promptState.value = withVisit(promptState.value, Date.now());
  }

  return promptState;
}

/** Reads the game store through Pinia, so core never imports the game. */
export function isDailyGameComplete(): boolean {
  const game = getActivePinia()?.state.value.game as
    | { currentGame?: { isComplete?: boolean } | null }
    | undefined;

  return game?.currentGame?.isComplete === true;
}

export function usePwaInstall() {
  const state = usePromptState();

  const nav = (): NavigatorExtras | undefined =>
    globalThis.navigator as NavigatorExtras | undefined;

  const isIos = computed(() => {
    const ua = nav()?.userAgent ?? '';
    const isIpadOs = /Macintosh/.test(ua) && (nav()?.maxTouchPoints ?? 0) > 1;

    return (IOS_DEVICE.test(ua) || isIpadOs) && !('MSStream' in globalThis);
  });

  const isIosSafari = computed(
    () =>
      isIos.value &&
      /Safari/.test(nav()?.userAgent ?? '') &&
      !IOS_NOT_SAFARI.test(nav()?.userAgent ?? ''),
  );

  const isInstalled = computed(
    () =>
      state.value.installed ||
      nav()?.standalone === true ||
      INSTALLED_DISPLAY_MODES.some((mode) =>
        matchesMedia(`(display-mode: ${mode})`),
      ),
  );

  const prefersReducedData = computed(
    () =>
      matchesMedia('(prefers-reduced-data: reduce)') ||
      nav()?.connection?.saveData === true,
  );

  const hasNativePrompt = computed(() => deferredPrompt.value !== null);

  const canInstall = computed(
    () =>
      !isNative &&
      !isInstalled.value &&
      (hasNativePrompt.value || isIosSafari.value),
  );

  const shouldShowBanner = computed(
    () =>
      canInstall.value &&
      !prefersReducedData.value &&
      !shownThisSession.value &&
      isPromptDue(state.value, Date.now()),
  );

  function update(patch: Partial<PwaPromptState>) {
    state.value = { ...state.value, ...patch };
  }

  function handleBeforeInstallPrompt(event: Event) {
    if (isInstalled.value) {
      return;
    }
    // Keeps the browser's own mini-infobar away: we ask, rarely, or nobody does
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
  }

  function handleAppInstalled() {
    deferredPrompt.value = null;
    update({ installed: true });
  }

  async function showPrompt(): Promise<boolean> {
    if (!deferredPrompt.value) {
      return false;
    }

    try {
      await deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      deferredPrompt.value = null;

      if (outcome === 'accepted') {
        update({ installed: true });
      }

      return outcome === 'accepted';
    } catch {
      return false;
    }
  }

  function markShown() {
    shownThisSession.value = true;
    try {
      globalThis.sessionStorage?.setItem(SESSION_SHOWN_KEY, '1');
    } catch {
      // Private mode: the in-memory flag still holds for this page
    }
  }

  /** "Not now": steps through the backoff schedule. */
  function dismiss() {
    update({
      dismissCount: state.value.dismissCount + 1,
      dismissedAt: Date.now(),
    });
  }

  /** "Don't ask again". */
  function optOut() {
    update({ optedOut: true });
  }

  function trackHaikuView() {
    update({ haikuViews: state.value.haikuViews + 1 });
  }

  function trackGamePlayed() {
    update({ gamesPlayed: state.value.gamesPlayed + 1 });
  }

  function trackGameCompleted() {
    if (!state.value.gameCompleted) {
      update({ gameCompleted: true });
    }
  }

  onMounted(() => {
    if (listenerUsers++ === 0) {
      globalThis.addEventListener?.(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      globalThis.addEventListener?.('appinstalled', handleAppInstalled);
    }
  });

  onUnmounted(() => {
    if (--listenerUsers === 0) {
      globalThis.removeEventListener?.(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      globalThis.removeEventListener?.('appinstalled', handleAppInstalled);
    }
  });

  return {
    isIos: readonly(isIos),
    isInstalled: readonly(isInstalled),
    canInstall: readonly(canInstall),
    hasNativePrompt: readonly(hasNativePrompt),
    shouldShowBanner: readonly(shouldShowBanner),

    showPrompt,
    markShown,
    dismiss,
    optOut,
    trackHaikuView,
    trackGamePlayed,
    trackGameCompleted,
  };
}

/**
 * Turns true once, at a natural pause: after IDLE_PAUSE_MS without input on
 * Home or Haiku, or GAME_PAUSE_MS after a finished game's colophon closes.
 * Never mid-round, never over a dialog, toast or first-run strip.
 */
export function usePwaPromptMoment(
  eligible: Readonly<Ref<boolean>>,
  routeName: Readonly<Ref<unknown>>,
) {
  const isMoment = ref(false);
  const { lastActive } = useIdle(IDLE_PAUSE_MS);
  let quietSince = Date.now();

  function isInterrupted(): boolean {
    return (
      typeof document === 'undefined' ||
      document.hidden ||
      document.querySelector(PROMPT_BLOCKERS) !== null
    );
  }

  function tick() {
    const now = Date.now();
    const afterGame = routeName.value === GAME_ROUTE && isDailyGameComplete();
    const isIdlePage = IDLE_ROUTES.has(String(routeName.value));

    if (isInterrupted() || !(afterGame || isIdlePage)) {
      quietSince = now;

      return;
    }

    const calmSince = afterGame
      ? quietSince
      : Math.max(quietSince, lastActive.value);
    const pauseMs = afterGame ? GAME_PAUSE_MS : IDLE_PAUSE_MS;

    if (now - calmSince >= pauseMs) {
      isMoment.value = true;
      pause();
    }
  }

  const { pause, resume } = useIntervalFn(tick, MOMENT_TICK_MS, {
    immediate: false,
  });

  watch(routeName, () => {
    quietSince = Date.now();
  });

  watch(
    eligible,
    (ok) => {
      if (!ok || isMoment.value) {
        pause();

        return;
      }
      quietSince = Date.now();
      resume();
    },
    { immediate: true },
  );

  return { isMoment: readonly(isMoment) };
}
