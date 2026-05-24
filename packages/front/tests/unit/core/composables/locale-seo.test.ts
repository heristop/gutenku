import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, reactive } from 'vue';
import { SITE_URL } from '@/locales/config';

const localeRef = ref('en');
// Single reactive route object so `route.path` reads stay reactive in computeds
const route = reactive<{ path: string }>({ path: '/blog' });

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: localeRef }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
}));

describe('useLocaleSeo', () => {
  beforeEach(() => {
    localeRef.value = 'en';
    route.path = '/blog';
  });

  it('builds hreflang links for all locales plus x-default', async () => {
    const { useLocaleSeo } = await import('@/core/composables/locale-seo');
    const { hreflangLinks } = useLocaleSeo();

    // 3 locales + x-default
    expect(hreflangLinks.value).toHaveLength(4);
    const langs = hreflangLinks.value.map((l) => l.hreflang);
    expect(langs).toContain('en');
    expect(langs).toContain('fr');
    expect(langs).toContain('ja');
    expect(langs).toContain('x-default');
    expect(hreflangLinks.value[0].href).toBe(`${SITE_URL}/blog`);
  });

  it('exposes the og locale for the current locale', async () => {
    const { useLocaleSeo } = await import('@/core/composables/locale-seo');
    const { ogLocale, htmlLang } = useLocaleSeo();

    expect(ogLocale.value).toBe('en_US');
    expect(htmlLang.value).toBe('en');
  });

  it('lists og locale alternates excluding the current locale', async () => {
    localeRef.value = 'fr';
    const { useLocaleSeo } = await import('@/core/composables/locale-seo');
    const { ogLocaleAlternates, ogLocale } = useLocaleSeo();

    expect(ogLocale.value).toBe('fr_FR');
    expect(ogLocaleAlternates.value).toEqual(['en_US', 'ja_JP']);
  });

  it('reacts to route path changes', async () => {
    const { useLocaleSeo } = await import('@/core/composables/locale-seo');
    const { hreflangLinks } = useLocaleSeo();

    route.path = '/about';
    expect(hreflangLinks.value[0].href).toBe(`${SITE_URL}/about`);
  });
});
