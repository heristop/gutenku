import { computed, effectScope } from 'vue';
import { useColorMode } from '@vueuse/core';
import {
  prefersReducedMotion,
  runViewTransition,
} from '@/core/composables/view-transition';

export type ThemePreference = 'light' | 'dark' | 'auto';

const SYSTEM_PREF_STORAGE_KEY = 'gutenku-system-preference-enabled';

let isInitialized = false;

// Where the next theme change was asked for (the toggle's press point). The
// new theme spreads out from there; a change without one (the system
// switching to night) crossfades instead.
let pendingOrigin: { x: number; y: number } | null = null;

export function setThemeOrigin(x: number, y: number): void {
  pendingOrigin = { x, y };
}

// The new theme bleeds over the old one like ink dropped on paper: an
// irregular blot, feathered at its edge, widening from the press point until
// it covers the farthest corner of the window. The blot shape is the mask set
// on the new snapshot in main.scss; here only its size and place move.
const SPREAD_MS = 560;
// The blot's solid core spans 70% of its box; the rest is its ragged rim
const BLOT_CORE = 0.7;

function spreadFrom(origin: { x: number; y: number }) {
  return (): void => {
    const radius = Math.hypot(
      Math.max(origin.x, globalThis.innerWidth - origin.x),
      Math.max(origin.y, globalThis.innerHeight - origin.y),
    );
    const end = (radius * 2) / BLOT_CORE;
    const at = (size: number) =>
      `${origin.x - size / 2}px ${origin.y - size / 2}px`;
    const frames = {
      maskSize: ['0px 0px', `${end}px ${end}px`],
      maskPosition: [at(0), at(end)],
      webkitMaskSize: ['0px 0px', `${end}px ${end}px`],
      webkitMaskPosition: [at(0), at(end)],
    };

    document.documentElement.animate(frames as unknown as Keyframe[], {
      duration: SPREAD_MS,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    });
  };
}

// Lazy-initialized colorMode instance (SSR-safe)
let colorModeInstance: ReturnType<typeof useColorMode> | null = null;

function getColorMode() {
  if (import.meta.env.SSR) {
    // Return a mock for SSR
    return {
      value: 'light' as const,
      store: { value: 'light' as const },
      system: { value: 'light' as const },
    };
  }

  if (!colorModeInstance) {
    // Owned by the app, not by the first component that asks: the header's
    // preference key can unmount and remount (hydration, the mobile and
    // desktop navs), and its scope would take the theme watcher with it,
    // leaving the toggle changing the stored choice but not the page.
    colorModeInstance = effectScope(true).run(() =>
      useColorMode({
        attribute: 'data-theme',
        selector: 'html',
        storageKey: 'gutenku-theme-preference',
        // A first visit follows the reader's system
        initialValue: 'auto',
        // Element-level colour transitions would trail the switch; the view
        // transition below crossfades the whole page in one piece instead.
        disableTransition: true,
        onChanged: (mode, defaultHandler) => {
          // The initial applies (immediate, then once mounted) set the theme
          // without a transition
          if (!isInitialized) {
            defaultHandler(mode);

            return;
          }

          // From the toggle: the new theme spreads from the press point.
          // Otherwise a quiet crossfade. Instant under reduced motion or while
          // a page transition is still running. Under reduced motion the
          // change is a plain fade: no spread.
          const origin = prefersReducedMotion() ? null : pendingOrigin;
          pendingOrigin = null;
          const root = document.documentElement;

          if (origin) {
            root.dataset.gkVtSpread = '';
          }

          runViewTransition(() => defaultHandler(mode), 'theme', {
            onReady: origin ? spreadFrom(origin) : undefined,
          }).finally(() => {
            // Cleared after the animation ends (the transition's own cleanup
            // removes data-gk-vt); a stale flag only matters for the next one
            setTimeout(() => delete root.dataset.gkVtSpread, SPREAD_MS + 60);
          });
        },
      }),
    )!;
    // Both initial applies run before this (a microtask and the next tick)
    setTimeout(() => {
      isInitialized = true;
    }, 0);
  }

  return colorModeInstance;
}

export function useTheme() {
  // SSR fallback values
  if (import.meta.env.SSR) {
    return {
      isDarkMode: computed(() => false),
      themePreference: computed(() => 'light' as ThemePreference),
      actualTheme: computed(() => 'light' as const),
      isSystemDark: computed(() => false),
      systemPreferenceEnabled: computed(() => false),
      toggleTheme: () => {},
      setTheme: () => {},
      saveSystemPreferenceEnabled: () => {},
    };
  }

  const colorMode = getColorMode();

  const isDarkMode = computed(() => colorMode.value === 'dark');
  const themePreference = computed(
    () => colorMode.store.value as ThemePreference,
  );
  const actualTheme = computed(() => colorMode.value as 'light' | 'dark');
  const isSystemDark = computed(() => colorMode.system.value === 'dark');
  const systemPreferenceEnabled = computed(
    () => colorMode.store.value === 'auto',
  );

  const toggleTheme = () => {
    colorMode.value = isDarkMode.value ? 'light' : 'dark';
  };

  const setTheme = (theme: ThemePreference) => {
    colorMode.value = theme;
  };

  const saveSystemPreferenceEnabled = (enabled: boolean) => {
    if (enabled) {
      colorMode.value = 'auto';
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SYSTEM_PREF_STORAGE_KEY, enabled.toString());
    }
  };

  return {
    isDarkMode,
    themePreference,
    actualTheme,
    isSystemDark,
    systemPreferenceEnabled,
    toggleTheme,
    setTheme,
    saveSystemPreferenceEnabled,
  };
}
