import { ref, computed, watch, onMounted } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';

// Theme state
const isDarkMode = ref(false);
const isSystemDark = ref(false);
const themePreference = ref<'light' | 'dark' | 'system'>('light'); // Changed default from 'system' to 'light'
const systemPreferenceEnabled = ref(false); // New: system preference toggle (default: disabled)

// Storage keys
const THEME_STORAGE_KEY = 'gutenku-theme-preference';
const SYSTEM_PREF_STORAGE_KEY = 'gutenku-system-preference-enabled';

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();

  // Check system preference
  const updateSystemTheme = () => {
    isSystemDark.value = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
  };

  // Computed actual theme based on preference and system preference setting
  const actualTheme = computed(() => {
    // If system preference is disabled, ignore 'system' setting and treat as 'light'
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

  // Update isDarkMode based on actual theme
  watch(
    actualTheme,
    (newTheme) => {
      isDarkMode.value = newTheme === 'dark';

      // Update Vuetify theme
      vuetifyTheme.global.name =
        newTheme === 'dark' ? 'gutenkuDarkTheme' : 'gutenkuTheme';

      // Update CSS custom properties for smooth transitions
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.style.setProperty(
        '--theme-transition',
        'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      );
    },
    { immediate: true },
  );

  // Save preference to localStorage
  const saveThemePreference = (preference: 'light' | 'dark' | 'system') => {
    themePreference.value = preference;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  // Save system preference setting to localStorage
  const saveSystemPreferenceEnabled = (enabled: boolean) => {
    systemPreferenceEnabled.value = enabled;
    localStorage.setItem(SYSTEM_PREF_STORAGE_KEY, enabled.toString());
  };

  // Load preference from localStorage
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

  // Load system preference setting from localStorage
  const loadSystemPreferenceEnabled = () => {
    const saved = localStorage.getItem(SYSTEM_PREF_STORAGE_KEY);
    if (saved !== null) {
      systemPreferenceEnabled.value = saved === 'true';
    }
  };

  // Toggle between light and dark (skips system)
  const toggleTheme = () => {
    const newPreference = isDarkMode.value ? 'light' : 'dark';
    saveThemePreference(newPreference);
  };

  // Set specific theme
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    saveThemePreference(theme);
  };

  // Zen-inspired theme transition effect
  const triggerZenTransition = () => {
    const body = document.body;
    body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    // Add subtle scale animation for zen effect
    body.style.transform = 'scale(0.99)';

    setTimeout(() => {
      body.style.transform = 'scale(1)';
    }, 100);

    setTimeout(() => {
      body.style.transition = '';
      body.style.transform = '';
    }, 600);
  };

  // Toggle with zen transition
  const toggleThemeWithTransition = () => {
    triggerZenTransition();
    setTimeout(toggleTheme, 50);
  };

  // Initialize on mount
  onMounted(() => {
    // Load saved preferences
    loadThemePreference();
    loadSystemPreferenceEnabled();

    // Check system preference
    updateSystemTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateSystemTheme);

    // Cleanup listener when component unmounts
    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme);
    };
  });

  return {
    // State
    isDarkMode: computed(() => isDarkMode.value),
    themePreference: computed(() => themePreference.value),
    actualTheme,
    isSystemDark: computed(() => isSystemDark.value),
    systemPreferenceEnabled: computed(() => systemPreferenceEnabled.value),

    // Actions
    toggleTheme,
    toggleThemeWithTransition,
    setTheme,
    saveSystemPreferenceEnabled,

    // Utilities
    triggerZenTransition,
  };
}
