import { SUPPORTED_LOCALES } from '@/locales/config';

export { GAME_ENABLED } from './config';
export const GameView = null;
export const GamePreview = null;
export const GameCard = null;
export const useGameStore = null;

// Auto-generate empty locales from config - no hardcoding needed
export const gameLocales = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, {}])
) as Record<string, object>;
