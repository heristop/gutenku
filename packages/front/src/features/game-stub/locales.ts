import { SUPPORTED_LOCALES } from '@/locales/config';

// Auto-generate empty locales from config - no hardcoding needed
export const gameLocales = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, {}]),
) as Record<string, Record<string, unknown>>;

export async function loadGameLocale(
  _locale: string,
): Promise<Record<string, unknown>> {
  return {};
}
