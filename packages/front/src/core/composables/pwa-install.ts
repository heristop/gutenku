import { ref, computed, readonly, onMounted, onUnmounted } from 'vue';
import { useLocalStorage } from '@vueuse/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaEngagement {
  haikuViewCount: number;
  gamePlayedCount: number;
}

interface PwaDismissal {
  dismissedAt: number;
  count: number;
}

const STORAGE_KEY_ENGAGEMENT = 'gutenku-pwa-engagement';
const STORAGE_KEY_DISMISSAL = 'gutenku-pwa-dismissal';
const DISMISSAL_COOLDOWN_DAYS = 14;
const REQUIRED_HAIKU_VIEWS = 2;
const REQUIRED_GAME_PLAYS = 1;

// Shared state across components
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
let eventListenerAttached = false;

export function usePwaInstall() {
  const engagement = useLocalStorage<PwaEngagement>(STORAGE_KEY_ENGAGEMENT, {
    haikuViewCount: 0,
    gamePlayedCount: 0,
  });

  const dismissal = useLocalStorage<PwaDismissal>(STORAGE_KEY_DISMISSAL, {
    dismissedAt: 0,
    count: 0,
  });

  const isIos = computed(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in globalThis)
    );
  });

  const isInStandaloneMode = computed(() => {
    if (globalThis.matchMedia === undefined) {
      return false;
    }
    return (
      globalThis.matchMedia('(display-mode: standalone)').matches ||
      (globalThis.navigator as Navigator & { standalone?: boolean })
        .standalone === true
    );
  });

  const isInstalled = computed(() => isInStandaloneMode.value);

  const hasNativePrompt = computed(() => deferredPrompt.value !== null);

  const canInstall = computed(() => {
    if (isInstalled.value) {
      return false;
    }
    return hasNativePrompt.value || isIos.value;
  });

  const isDismissalCooldownActive = computed(() => {
    if (dismissal.value.dismissedAt === 0) {
      return false;
    }
    const cooldownMs = DISMISSAL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissal.value.dismissedAt < cooldownMs;
  });

  const hasEnoughEngagement = computed(() => {
    return (
      engagement.value.haikuViewCount >= REQUIRED_HAIKU_VIEWS ||
      engagement.value.gamePlayedCount >= REQUIRED_GAME_PLAYS
    );
  });

  const shouldShowBanner = computed(() => {
    return (
      canInstall.value &&
      hasEnoughEngagement.value &&
      !isDismissalCooldownActive.value
    );
  });

  function handleBeforeInstallPrompt(event: Event) {
    // Only capture event if we might show the banner
    if (isInStandaloneMode.value || isDismissalCooldownActive.value) {
      return;
    }
    event.preventDefault();
    deferredPrompt.value = event as BeforeInstallPromptEvent;
  }

  function handleAppInstalled() {
    deferredPrompt.value = null;
  }

  async function showPrompt(): Promise<boolean> {
    if (!deferredPrompt.value) {
      return false;
    }

    try {
      await deferredPrompt.value.prompt();
      const { outcome } = await deferredPrompt.value.userChoice;
      deferredPrompt.value = null;

      return outcome === 'accepted';
    } catch {
      return false;
    }
  }

  function dismiss() {
    dismissal.value = {
      dismissedAt: Date.now(),
      count: dismissal.value.count + 1,
    };
  }

  function trackHaikuView() {
    engagement.value = {
      ...engagement.value,
      haikuViewCount: engagement.value.haikuViewCount + 1,
    };
  }

  function trackGamePlayed() {
    engagement.value = {
      ...engagement.value,
      gamePlayedCount: engagement.value.gamePlayedCount + 1,
    };
  }

  onMounted(() => {
    if (globalThis.addEventListener !== undefined && !eventListenerAttached) {
      globalThis.addEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      globalThis.addEventListener('appinstalled', handleAppInstalled);
      eventListenerAttached = true;
    }
  });

  onUnmounted(() => {
    if (globalThis.removeEventListener !== undefined && eventListenerAttached) {
      globalThis.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      globalThis.removeEventListener('appinstalled', handleAppInstalled);
      eventListenerAttached = false;
    }
  });

  return {
    isIos: readonly(isIos),
    isInstalled: readonly(isInstalled),
    canInstall: readonly(canInstall),
    hasNativePrompt: readonly(hasNativePrompt),
    shouldShowBanner: readonly(shouldShowBanner),
    hasEnoughEngagement: readonly(hasEnoughEngagement),

    showPrompt,
    dismiss,
    trackHaikuView,
    trackGamePlayed,
  };
}
