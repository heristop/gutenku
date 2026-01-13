import { createI18n } from 'vue-i18n';
import {
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type SupportedLocale,
} from './config';
import { gameLocales } from '@/features/game';

const STORAGE_KEY = 'gutenku-locale';

// Dynamic imports - auto-discovers all JSON locale files
const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
  './*.json',
  { eager: true }
);

// Build messages object dynamically
const messages = SUPPORTED_LOCALES.reduce(
  (acc, locale) => {
    const mainMessages = localeModules[`./${locale}.json`]?.default || {};
    const gameMessages = gameLocales[locale] || {};
    acc[locale] = { ...mainMessages, ...gameMessages };
    return acc;
  },
  {} as Record<SupportedLocale, Record<string, unknown>>
);

function getInitialLocale(): SupportedLocale {
  // SSR/SSG guard - browser APIs not available
  if (globalThis.window === undefined) {
    return DEFAULT_LOCALE;
  }

  // Check localStorage first
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
    return saved as SupportedLocale;
  }

  // Auto-detect from browser language
  const browserLang = navigator.language;
  for (const locale of SUPPORTED_LOCALES) {
    const config = LOCALE_CONFIG[locale];
    if (config.browserCodes.some((code) => browserLang.startsWith(code))) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export type MessageSchema = (typeof messages)[typeof DEFAULT_LOCALE];

export const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
  missingWarn: false,
  fallbackWarn: false,
});

export { type SupportedLocale, SUPPORTED_LOCALES, LOCALE_CONFIG, DEFAULT_LOCALE };
export default i18n;
