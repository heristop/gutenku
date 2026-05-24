import type { HaikuValue } from '@gutenku/shared';
import type { LucideIcon } from '@lucide/vue';
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

export const CLASSIC_THEMES = ['colored', 'greentea', 'watermark'];
export const IMAGE_AI_THEMES = [
  'nihonga',
  'sumie',
  'ukiyoe',
  'zengarden',
  'wabisabi',
  'bookzen',
];
export const MAX_HISTORY_SIZE = 10;

export function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
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

      // Check if cached daily haiku is from today, clear if stale
      if (store.cachedDailyHaiku && store.cachedVersion) {
        const today = getTodayUTC();

        if (store.cachedDailyHaiku.date !== today) {
          store.cachedDailyHaiku = null;
          store.cachedVersion = null;
        }
      }
    },
  };
};
