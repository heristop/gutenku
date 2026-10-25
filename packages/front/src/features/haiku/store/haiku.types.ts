import { getCurrentPublicationDate, type HaikuValue } from '@gutenku/shared';
import type { LucideIcon } from '@/core/components/icons/ink';
import type { PersistenceOptions } from 'pinia-plugin-persistedstate';

export interface CachedDailyHaiku {
  haiku: HaikuValue;
  date: string;
}

export interface GenerationProgress {
  current: number;
  total: number;
  bestScore: number;
  stopReason?: string;
}

export interface CraftingMessage {
  id: string;
  text: string;
  timestamp: number;
  icon: LucideIcon;
  verses?: string[];
  score?: number;
}

export interface Stats {
  haikusGenerated: number;
  dailyHaikuViews: number;
  booksBrowsed: number;
  totalExecutionTime: number;
  books: string[];
  bookCounts: Record<string, number>;
}

export interface OptionGroup {
  group: string;
  options: string[];
}

export const CLASSIC_THEMES = [
  'catalogue',
  'greentea',
  'watermark',
  'exlibris',
  'frontispiece',
];
export const IMAGE_AI_THEMES = [
  'nihonga',
  'sumie',
  'ukiyoe',
  'zengarden',
  'wabisabi',
  'bookzen',
];
export const MAX_HISTORY_SIZE = 10;

/** The daily haiku's day: the publication date, which turns at 10:00 UTC. */
export function getDailyHaikuDate(): string {
  return getCurrentPublicationDate();
}

export const getPersistConfig = (): PersistenceOptions | false => {
  if (import.meta.env.SSR) {
    return false;
  }

  return {
    storage: localStorage,
    pick: [
      'optionDrawerOpened',
      'optionTheme',
      'stats',
      'cachedVersion',
      'cachedDailyHaiku',
    ],
    afterHydrate: (ctx) => {
      const store = ctx.store;

      // A theme saved before it was retired falls back to the random draw
      if (
        store.optionTheme !== 'random' &&
        ![...CLASSIC_THEMES, ...IMAGE_AI_THEMES].includes(store.optionTheme)
      ) {
        store.optionTheme = 'random';
      }

      // Check if cached daily haiku is from today, clear if stale
      if (store.cachedDailyHaiku && store.cachedVersion) {
        const today = getDailyHaikuDate();

        if (store.cachedDailyHaiku.date !== today) {
          store.cachedDailyHaiku = null;
          store.cachedVersion = null;
        }
      }
    },
  };
};
