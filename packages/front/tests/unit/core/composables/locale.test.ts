import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

const localeRef = ref('en');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ locale: localeRef }),
}));

describe('useLocale', () => {
  beforeEach(() => {
    localeRef.value = 'en';
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('exposes the current locale', async () => {
    const { useLocale } = await import('@/core/composables/locale');
    const { currentLocale } = useLocale();

    expect(currentLocale.value).toBe('en');
  });

  it('exposes the available locales from config', async () => {
    const { useLocale } = await import('@/core/composables/locale');
    const { availableLocales } = useLocale();

    expect(availableLocales).toEqual(['en', 'fr', 'ja']);
  });

  it('returns the human label for a locale', async () => {
    const { useLocale } = await import('@/core/composables/locale');
    const { getLocaleLabel } = useLocale();

    expect(getLocaleLabel('en')).toBe('English');
    expect(getLocaleLabel('fr')).toBe('Français');
    expect(getLocaleLabel('ja')).toBe('日本語');
  });

  it('setLocale updates i18n, localStorage and html lang', async () => {
    const { useLocale } = await import('@/core/composables/locale');
    const { setLocale, currentLocale } = useLocale();

    setLocale('fr');

    expect(localeRef.value).toBe('fr');
    expect(currentLocale.value).toBe('fr');
    expect(localStorage.getItem('gutenku-locale')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  it('writes through the computed setter', async () => {
    const { useLocale } = await import('@/core/composables/locale');
    const { currentLocale } = useLocale();

    currentLocale.value = 'ja';

    expect(localeRef.value).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
  });
});
