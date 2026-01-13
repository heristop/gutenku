import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  SUPPORTED_LOCALES,
  LOCALE_CONFIG,
  type SupportedLocale,
} from '@/locales/config';

const STORAGE_KEY = 'gutenku-locale';

export function useLocale() {
  const { locale } = useI18n();

  const currentLocale = computed<SupportedLocale>({
    get: () => locale.value as SupportedLocale,
    set: (value: SupportedLocale) => {
      locale.value = value;
      localStorage.setItem(STORAGE_KEY, value);
      // SEO: Update HTML lang attribute
      document.documentElement.lang = LOCALE_CONFIG[value].htmlLang;
    },
  });

  // Derived from config - no hardcoding needed
  const availableLocales = SUPPORTED_LOCALES;

  // Get label from config instead of i18n
  function getLocaleLabel(loc: SupportedLocale): string {
    return LOCALE_CONFIG[loc].label;
  }

  function setLocale(value: SupportedLocale) {
    currentLocale.value = value;
  }

  return {
    currentLocale,
    availableLocales,
    getLocaleLabel,
    setLocale,
  };
}

export type { SupportedLocale };
