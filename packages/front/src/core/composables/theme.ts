import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';

export type ThemePreference = 'light' | 'dark' | 'auto';

const SYSTEM_PREF_STORAGE_KEY = 'gutenku-system-preference-enabled';

const supportsViewTransition = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

let isInitialized = false;

const colorMode = useColorMode({
  attribute: 'data-theme',
  selector: 'html',
  storageKey: 'gutenku-theme-preference',
  initialValue: 'light',
  disableTransition: false,
  onChanged: (mode, defaultHandler) => {
    // Skip view transition on initial page load
    if (!isInitialized) {
      isInitialized = true;
      defaultHandler(mode);
      return;
    }

    if (supportsViewTransition()) {
      (
        document as Document & {
          startViewTransition: (callback: () => void) => void;
        }
      ).startViewTransition(() => defaultHandler(mode));
    } else {
      defaultHandler(mode);
      document.documentElement.style.setProperty(
        '--theme-transition',
        'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      );
    }
  },
});

export function useTheme() {
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
    localStorage.setItem(SYSTEM_PREF_STORAGE_KEY, enabled.toString());
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
