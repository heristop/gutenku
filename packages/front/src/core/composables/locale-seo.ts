import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  SITE_URL,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/locales/config';

export function useLocaleSeo() {
  const route = useRoute();
  const { locale } = useI18n();

  const currentLocale = computed(() => locale.value as SupportedLocale);

  const hreflangLinks = computed(() => {
    const path = route.path;

    const links: Array<{ rel: string; hreflang: string; href: string }> =
      SUPPORTED_LOCALES.map((loc) => ({
        rel: 'alternate',
        hreflang: LOCALE_CONFIG[loc].htmlLang,
        href: `${SITE_URL}${path}`,
      }));

    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_URL}${path}`,
    });

    return links;
  });

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
