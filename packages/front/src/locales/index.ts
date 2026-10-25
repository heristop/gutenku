import { watch, type WritableComputedRef } from 'vue';
import { createI18n } from 'vue-i18n';
import {
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  type SupportedLocale,
} from './config';
import enMessages from './en.json';
// The locales subpath, not the game barrel: a static import of the barrel
// would pull the whole game view into the entry chunk of every page.
import { gameLocales, loadGameLocale } from '@/features/game/locales';

const STORAGE_KEY = 'gutenku-locale';

// English is the prerendered locale and the fallback, so it ships with the
// entry chunk. The other languages are separate chunks, fetched for the
// reader who uses them (before mount when stored, or on switching).
const lazyLocaleModules = import.meta.glob<{
  default: Record<string, unknown>;
}>(['./*.json', '!./en.json']);

const messages: Record<string, Record<string, unknown>> = {
  [DEFAULT_LOCALE]: { ...enMessages, ...gameLocales[DEFAULT_LOCALE] },
};

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
  messages: messages as Record<SupportedLocale, MessageSchema>,
  missingWarn: false,
  fallbackWarn: false,
});

/**
 * The global locale ref. With `legacy: false` it is a ref at runtime, though
 * the legacy-shaped typings above describe it as a plain string.
 */
export const globalLocale = i18n.global
  .locale as unknown as WritableComputedRef<SupportedLocale>;

const loadedLocales = new Set<string>([DEFAULT_LOCALE]);
const pendingLocales = new Map<string, Promise<void>>();

/** Fetches and registers a locale's messages once; resolves when usable. */
export function loadLocaleMessages(locale: SupportedLocale): Promise<void> {
  if (loadedLocales.has(locale)) {
    return Promise.resolve();
  }

  let pending = pendingLocales.get(locale);

  if (!pending) {
    const loadMain = lazyLocaleModules[`./${locale}.json`];

    pending = Promise.all([loadMain?.(), loadGameLocale(locale)])
      .then(([main, game]) => {
        i18n.global.setLocaleMessage(locale, {
          ...main?.default,
          ...game,
        } as MessageSchema);
        loadedLocales.add(locale);
      })
      .finally(() => pendingLocales.delete(locale));
    pendingLocales.set(locale, pending);
  }

  return pending;
}

// A switch to a language not loaded yet reads the English fallback for the
// moment its chunk takes to arrive.
if (!import.meta.env.SSR) {
  watch(globalLocale, (locale) => {
    loadLocaleMessages(locale).catch(() => {
      // Offline with the chunk uncached: the English fallback stays.
    });
  });
}

export {
  type SupportedLocale,
  SUPPORTED_LOCALES,
  LOCALE_CONFIG,
  DEFAULT_LOCALE,
};
export default i18n;
