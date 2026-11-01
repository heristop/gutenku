import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/locales/config';

export function useLocaleSeo() {
  const { locale } = useI18n();

  const currentLocale = computed(() => locale.value as SupportedLocale);

  // Language is a client-side preference, not a separate crawlable URL.
  // Add hreflang only when each translation has its own stable URL.
  const hreflangLinks = computed<
    Array<{ rel: string; hreflang: string; href: string }>
  >(() => []);

  const ogLocale = computed(() => LOCALE_CONFIG[currentLocale.value].ogLocale);

  const ogLocaleAlternates = computed(() =>
    SUPPORTED_LOCALES.filter((loc) => loc !== currentLocale.value).map(
      (loc) => LOCALE_CONFIG[loc].ogLocale,
    ),
  );

  const htmlLang = computed(() => LOCALE_CONFIG[currentLocale.value].htmlLang);

  return {
    hreflangLinks,
    ogLocale,
    ogLocaleAlternates,
    htmlLang,
  };
}
