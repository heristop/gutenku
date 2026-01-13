import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  SITE_URL,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/locales/config';

/**
 * Composable for i18n SEO: hreflang links and og:locale meta
 */
export function useLocaleSeo() {
  const route = useRoute();
  const { locale } = useI18n();

  const currentLocale = computed(() => locale.value as SupportedLocale);

  // Generate hreflang alternate links for all supported locales
  const hreflangLinks = computed(() => {
    const path = route.path === '/' ? '' : route.path;

    const links: Array<{ rel: string; hreflang: string; href: string }> =
      SUPPORTED_LOCALES.map((loc) => ({
        rel: 'alternate',
        hreflang: LOCALE_CONFIG[loc].htmlLang,
        href: `${SITE_URL}${path}`,
      }));

    // Add x-default pointing to the default locale
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_URL}${path}`,
    });

    return links;
  });

  // Get og:locale for current locale
  const ogLocale = computed(() => LOCALE_CONFIG[currentLocale.value].ogLocale);

  // Get og:locale:alternate for other locales
  const ogLocaleAlternates = computed(() =>
    SUPPORTED_LOCALES.filter((loc) => loc !== currentLocale.value).map(
      (loc) => LOCALE_CONFIG[loc].ogLocale,
    ),
  );

  // HTML lang attribute value
  const htmlLang = computed(() => LOCALE_CONFIG[currentLocale.value].htmlLang);

  return {
    hreflangLinks,
    ogLocale,
    ogLocaleAlternates,
    htmlLang,
  };
}
