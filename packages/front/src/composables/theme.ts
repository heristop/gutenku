import { ref, computed, watch, onMounted } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';

const isDarkMode = ref(false);
const isSystemDark = ref(false);
const themePreference = ref<'light' | 'dark' | 'system'>('light');
const systemPreferenceEnabled = ref(false);

const THEME_STORAGE_KEY = 'gutenku-theme-preference';
const SYSTEM_PREF_STORAGE_KEY = 'gutenku-system-preference-enabled';

const supportsViewTransition = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

const applyThemeChange = (
  newTheme: 'light' | 'dark',
  vuetifyTheme: ReturnType<typeof useVuetifyTheme>,
) => {
  const themeName = newTheme === 'dark' ? 'gutenkuDarkTheme' : 'gutenkuTheme';
  const updateDOM = () => {
    vuetifyTheme.change(themeName);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (supportsViewTransition()) {
    (
      document as Document & {
        startViewTransition: (callback: () => void) => void;
      }
    ).startViewTransition(updateDOM);
  } else {
    updateDOM();
    document.documentElement.style.setProperty(
      '--theme-transition',
      'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    );
  }
};

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();

  const updateSystemTheme = () => {
    isSystemDark.value = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
  };

  const actualTheme = computed(() => {
    if (!systemPreferenceEnabled.value && themePreference.value === 'system') {
      return 'light';
    }

    switch (themePreference.value) {
      case 'dark':
        return 'dark';
      case 'light':
        return 'light';
      case 'system':
      default:
        return isSystemDark.value ? 'dark' : 'light';
    }
  });

  watch(
    actualTheme,
    (newTheme) => {
      isDarkMode.value = newTheme === 'dark';
      applyThemeChange(newTheme, vuetifyTheme);
    },
    { immediate: true },
  );

  const saveThemePreference = (preference: 'light' | 'dark' | 'system') => {
    themePreference.value = preference;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  const saveSystemPreferenceEnabled = (enabled: boolean) => {
    systemPreferenceEnabled.value = enabled;
    localStorage.setItem(SYSTEM_PREF_STORAGE_KEY, enabled.toString());
  };

  const loadThemePreference = () => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as
      | 'light'
      | 'dark'
      | 'system'
      | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      themePreference.value = saved;
    }
  };

  const loadSystemPreferenceEnabled = () => {
    const saved = localStorage.getItem(SYSTEM_PREF_STORAGE_KEY);
    if (saved !== null) {
      systemPreferenceEnabled.value = saved === 'true';
    }
  };

  const toggleTheme = () => {
    const newPreference = isDarkMode.value ? 'light' : 'dark';
    saveThemePreference(newPreference);
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    saveThemePreference(theme);
  };

  onMounted(() => {
    loadThemePreference();
    loadSystemPreferenceEnabled();

    updateSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  });

  return {
    isDarkMode: computed(() => isDarkMode.value),
    themePreference: computed(() => themePreference.value),
    actualTheme,
    isSystemDark: computed(() => isSystemDark.value),
    systemPreferenceEnabled: computed(() => systemPreferenceEnabled.value),

    toggleTheme,
    setTheme,
    saveSystemPreferenceEnabled,
  };
}
