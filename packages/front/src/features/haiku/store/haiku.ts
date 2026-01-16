import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import type { HaikuValue, HaikuVersion } from '@gutenku/shared';
import type { CombinedError } from '@urql/vue';
import { Leaf, type LucideIcon } from 'lucide-vue-next';
import { urqlClient } from '@/client';
import type { PersistenceOptions } from 'pinia-plugin-persistedstate';
import {
  HAIKU_VERSION_QUERY,
  DAILY_HAIKU_QUERY,
  ITERATIVE_HAIKU_SUBSCRIPTION,
} from './queries';

interface CachedDailyHaiku {
  haiku: HaikuValue;
  date: string;
}

function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

export interface GenerationProgress {
  current: number;
  total: number;
  bestScore: number;
  stopReason?: string;
}

const getPersistConfig = (): PersistenceOptions | false => {
  if (import.meta.env.SSR) {
    return false;
  }
  return {
    storage: localStorage,
    pick: [
      'optionDrawerOpened',
      'optionTheme',
      'optionIterations',
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

export interface CraftingMessage {
  id: string;
  text: string;
  timestamp: number;
  icon: LucideIcon;
  verses?: string[];
  score?: number;
}

interface Stats {
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

const CLASSIC_THEMES = ['colored', 'greentea', 'watermark'];
const IMAGE_AI_THEMES = [
  'nihonga',
  'sumie',
  'ukiyoe',
  'zengarden',
  'wabisabi',
  'bookzen',
];
const MAX_HISTORY_SIZE = 10;

export const useHaikuStore = defineStore(
  'haiku',
  () => {
    const haiku = ref<HaikuValue>(null as unknown as HaikuValue);
    const loading = ref(false);
    const firstLoaded = ref(false);
    const isDailyHaiku = ref(false);
    const error = ref('');
    const craftingMessages = ref<CraftingMessage[]>([]);
    const history = ref<HaikuValue[]>([]);
    const historyIndex = ref(-1);

    const optionDrawerOpened = ref(false);
    const optionUseCache = ref(true);
    const optionUseAI = ref(false);
    const optionImageAI = ref(false);
    const optionTheme = ref('random');
    const optionIterations = ref(10);

    const isGenerating = ref(false);
    const generationProgress = ref<GenerationProgress>({
      current: 0,
      total: 0,
      bestScore: 0,
    });
    let generationUnsubscribe: (() => void) | null = null;

    const stats = ref<Stats>({
      haikusGenerated: 0,
      dailyHaikuViews: 0,
      booksBrowsed: 0,
      totalExecutionTime: 0,
      books: [],
      bookCounts: {},
    });

    const cachedVersion = ref<string | null>(null);
    const cachedDailyHaiku = ref<CachedDailyHaiku | null>(null);

    const networkError = computed(() => error.value === 'network-error');
    const notificationError = computed(() => error.value !== '');

    const themeOptions = computed<OptionGroup[]>(() =>
      optionImageAI.value && import.meta.env.DEV
        ? [
            { group: 'random', options: ['random'] },
            { group: 'ai', options: IMAGE_AI_THEMES },
            { group: 'classic', options: CLASSIC_THEMES },
          ]
        : [
            { group: 'random', options: ['random'] },
            { group: 'classic', options: CLASSIC_THEMES },
          ],
    );

    const imageAIThemes = computed(() => IMAGE_AI_THEMES);
    const shouldUseCache = computed(() => !firstLoaded.value);
    const shouldUseDaily = computed(() => !firstLoaded.value);

    const avgExecutionTime = computed(() =>
      stats.value.haikusGenerated > 0
        ? stats.value.totalExecutionTime / stats.value.haikusGenerated
        : 0,
    );

    const canGoBack = computed(() => historyIndex.value > 0);
    const canGoForward = computed(
      () => historyIndex.value < history.value.length - 1,
    );
    const historyLength = computed(() => history.value.length);
    const historyPosition = computed(() => historyIndex.value + 1);

    function addToHistory(newHaiku: HaikuValue): void {
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      history.value.push(newHaiku);

      if (history.value.length > MAX_HISTORY_SIZE) {
        history.value.shift();
      }
      historyIndex.value = history.value.length - 1;
    }

    function updateStats(newHaiku: HaikuValue): void {
      const isDaily = isDailyHaiku.value;

      if (isDaily) {
        stats.value.dailyHaikuViews += 1;
      }

      if (!isDaily && newHaiku.cacheUsed !== true) {
        stats.value.haikusGenerated += 1;

        if (typeof newHaiku.executionTime === 'number') {
          stats.value.totalExecutionTime += newHaiku.executionTime;
        }
      }

      const bookTitle = newHaiku.book?.title?.trim();

      if (!bookTitle) {
        return;
      }

      if (!stats.value.books.includes(bookTitle)) {
        stats.value.books.push(bookTitle);
        stats.value.booksBrowsed = stats.value.books.length;
      }

      stats.value.bookCounts[bookTitle] =
        (stats.value.bookCounts[bookTitle] || 0) + 1;
    }

    async function checkHaikuVersion(date: string): Promise<boolean> {
      try {
        const result = await urqlClient
          .query<{ haikuVersion: HaikuVersion }>(HAIKU_VERSION_QUERY, { date })
          .toPromise();

        if (result.error || !result.data?.haikuVersion) {
          return false;
        }

        const serverVersion = result.data.haikuVersion.version;
        return cachedVersion.value === serverVersion;
      } catch {
        return false;
      }
    }

    function tryUseCachedDailyHaiku(today: string): boolean {
      if (cachedDailyHaiku.value?.date === today && cachedVersion.value) {
        haiku.value = cachedDailyHaiku.value.haiku;
        isDailyHaiku.value = true;
        addToHistory(cachedDailyHaiku.value.haiku);
        updateStats(cachedDailyHaiku.value.haiku);

        return true;
      }

      return false;
    }

    async function cacheDailyHaiku(
      newHaiku: HaikuValue,
      date: string,
    ): Promise<void> {
      try {
        const result = await urqlClient
          .query<{ haikuVersion: HaikuVersion }>(HAIKU_VERSION_QUERY, { date })
          .toPromise();

        if (result.data?.haikuVersion) {
          cachedVersion.value = result.data.haikuVersion.version;
          cachedDailyHaiku.value = { haiku: newHaiku, date };
        }
      } catch {
        // Ignore cache errors
      }
    }

    function handleFetchError(err: unknown): void {
      error.value = 'network-error';

      const isMaxAttemptsError = (e: unknown): boolean => {
        const combinedError = e as CombinedError;
        const graphErrors = combinedError?.graphQLErrors;

        if (graphErrors?.some((g) => g.message === 'max-attempts-error')) {
          return true;
        }
        return e instanceof Error && e.message === 'max-attempts-error';
      };

      if (isMaxAttemptsError(err)) {
        error.value =
          'No haiku found matching your filters after maximum attempts. ' +
          'Please try again with a different filter or try several words.';
      }
    }

    function processNewHaiku(
      newHaiku: HaikuValue | null,
      fetchingDaily: boolean,
      today: string,
    ): void {
      haiku.value = newHaiku ?? (null as unknown as HaikuValue);

      if (newHaiku) {
        isDailyHaiku.value = fetchingDaily;
        addToHistory(newHaiku);
        updateStats(newHaiku);

        if (fetchingDaily) {
          cacheDailyHaiku(newHaiku, today);
        }
      }
    }

    async function fetchNewHaiku(): Promise<void> {
      const fetchingDaily = shouldUseDaily.value;
      const today = getTodayUTC();

      if (fetchingDaily && cachedDailyHaiku.value?.date === today) {
        const isValid = await checkHaikuVersion(today);
        if (isValid && tryUseCachedDailyHaiku(today)) {
          firstLoaded.value = true;
          return;
        }
      }

      if (fetchingDaily) {
        await fetchDailyHaiku(today);
        return;
      }

      await fetchIterativeHaiku();
    }

    async function fetchDailyHaiku(today: string): Promise<void> {
      try {
        loading.value = true;
        error.value = '';
        craftingMessages.value = [];

        const variables = {
          useCache: true,
          useDaily: true,
          date: today,
          theme: optionTheme.value,
        };

        const result = await urqlClient
          .query<{ haiku: HaikuValue | null }>(DAILY_HAIKU_QUERY, variables)
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        processNewHaiku(result.data?.haiku ?? null, true, today);
      } catch (err: unknown) {
        handleFetchError(err);
      } finally {
        firstLoaded.value = true;
        loading.value = false;
      }
    }

    async function fetchIterativeHaiku(): Promise<void> {
      const today = getTodayUTC();

      try {
        loading.value = true;
        isGenerating.value = true;
        error.value = '';
        craftingMessages.value = [];
        generationProgress.value = {
          current: 0,
          total: optionIterations.value,
          bestScore: 0,
        };

        const variables = {
          iterations: optionIterations.value,
          theme: optionTheme.value,
        };

        await new Promise<void>((resolve, reject) => {
          let lastDisplayedScore = -Infinity;
          let lastDisplayedVerses = '';

          interface HaikuGenerationResult {
            data?: {
              haikuGeneration?: {
                currentIteration: number;
                totalIterations: number;
                bestScore: number;
                isComplete: boolean;
                stopReason?: string;
                bestHaiku?: HaikuValue;
              };
            };
            error?: Error;
          }

          const { unsubscribe } = urqlClient
            .subscription(ITERATIVE_HAIKU_SUBSCRIPTION, variables)
            .subscribe((result: HaikuGenerationResult) => {
              if (result.error) {
                reject(result.error);
                return;
              }

              const progress = result.data?.haikuGeneration;

              if (progress) {
                generationProgress.value = {
                  current: progress.currentIteration,
                  total: progress.totalIterations,
                  bestScore: progress.bestScore,
                  stopReason: progress.stopReason,
                };

                if (progress.bestHaiku?.verses) {
                  const versesText = progress.bestHaiku.verses.join(' / ');

                  if (
                    progress.bestScore > lastDisplayedScore &&
                    versesText !== lastDisplayedVerses
                  ) {
                    lastDisplayedScore = progress.bestScore;
                    lastDisplayedVerses = versesText;
                    craftingMessages.value = [
                      {
                        id: crypto.randomUUID(),
                        text: versesText,
                        verses: progress.bestHaiku.verses,
                        score: progress.bestScore,
                        timestamp: Date.now(),
                        icon: markRaw(Leaf),
                      },
                      ...craftingMessages.value,
                    ];
                  }
                }

                if (progress.isComplete) {
                  if (progress.bestHaiku) {
                    processNewHaiku(progress.bestHaiku, false, today);
                  }
                  resolve();
                }
              }
            });

          generationUnsubscribe = () => {
            unsubscribe();
            resolve();
          };
        });
      } catch (err: unknown) {
        handleFetchError(err);
      } finally {
        generationUnsubscribe = null;
        isGenerating.value = false;
        firstLoaded.value = true;
        loading.value = false;
      }
    }

    function goBack(): boolean {
      if (historyIndex.value <= 0) {
        return false;
      }
      historyIndex.value--;
      haiku.value = history.value[historyIndex.value];
      return true;
    }

    function goForward(): boolean {
      if (historyIndex.value >= history.value.length - 1) {
        return false;
      }
      historyIndex.value++;
      haiku.value = history.value[historyIndex.value];
      return true;
    }

    function resetConfigToDefaults(): void {
      optionIterations.value = 10;
    }

    function stopGeneration(): void {
      if (generationUnsubscribe) {
        generationUnsubscribe();
        generationUnsubscribe = null;
      }
      isGenerating.value = false;
    }

    return {
      // State
      haiku,
      loading,
      firstLoaded,
      isDailyHaiku,
      error,
      craftingMessages,
      history,
      historyIndex,
      optionDrawerOpened,
      optionUseCache,
      optionUseAI,
      optionImageAI,
      optionTheme,
      optionIterations,
      isGenerating,
      generationProgress,
      stats,
      cachedVersion,
      cachedDailyHaiku,
      // Getters
      networkError,
      notificationError,
      themeOptions,
      imageAIThemes,
      shouldUseCache,
      shouldUseDaily,
      avgExecutionTime,
      canGoBack,
      canGoForward,
      historyLength,
      historyPosition,
      // Actions
      fetchNewHaiku,
      goBack,
      goForward,
      resetConfigToDefaults,
      stopGeneration,
    };
  },
  {
    persist: getPersistConfig(),
  },
);
