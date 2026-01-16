export const SITE_URL = import.meta.env.VITE_APP_URL || 'https://gutenku.xyz';

export const LOCALE_CONFIG = {
  en: {
    label: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    browserCodes: ['en', 'en-US', 'en-GB', 'en-AU'],
  },
  fr: {
    label: 'Français',
    htmlLang: 'fr',
    ogLocale: 'fr_FR',
    browserCodes: ['fr', 'fr-FR', 'fr-CA', 'fr-BE'],
  },
  ja: {
    label: '日本語',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    browserCodes: ['ja', 'ja-JP'],
  },
} as const;

export type SupportedLocale = keyof typeof LOCALE_CONFIG;
export const SUPPORTED_LOCALES = Object.keys(
  LOCALE_CONFIG,
) as SupportedLocale[];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
