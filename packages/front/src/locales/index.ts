/**
 * locales/index.ts
 *
 * Vue I18n configuration for internationalization
 */

import { createI18n } from 'vue-i18n';

import en from './en.json';

export type MessageSchema = typeof en;
export type AvailableLocales = 'en';

export const i18n = createI18n<[MessageSchema], AvailableLocales>({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  },
  missingWarn: false,
  fallbackWarn: false,
});

export default i18n;
