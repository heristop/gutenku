import { markRaw, type Ref } from 'vue';
import type { HaikuValue, HaikuVersion } from '@gutenku/shared';
import type { CombinedError } from '@urql/vue';
import { Leaf } from '@lucide/vue';
import { urqlClient } from '@/client';
import {
  HAIKU_VERSION_QUERY,
  DAILY_HAIKU_QUERY,
  ITERATIVE_HAIKU_SUBSCRIPTION,
} from './queries';
import {
  type CachedDailyHaiku,
  type CraftingMessage,
  type GenerationProgress,
  type Stats,
  MAX_HISTORY_SIZE,
  getTodayUTC,
} from './haiku.types';

export interface HaikuStoreState {
  haiku: Ref<HaikuValue>;
  loading: Ref<boolean>;
  firstLoaded: Ref<boolean>;
  isDailyHaiku: Ref<boolean>;
  error: Ref<string>;
  craftingMessages: Ref<CraftingMessage[]>;
  history: Ref<HaikuValue[]>;
  historyIndex: Ref<number>;
  optionTheme: Ref<string>;
  optionIterations: Ref<number>;
  optionUseAI: Ref<boolean>;
  isGenerating: Ref<boolean>;
  generationProgress: Ref<GenerationProgress>;
  stats: Ref<Stats>;
  cachedVersion: Ref<string | null>;
  cachedDailyHaiku: Ref<CachedDailyHaiku | null>;
  shouldUseDaily: Ref<boolean>;
}

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

export function createHaikuActions(state: HaikuStoreState) {
  let generationUnsubscribe: (() => void) | null = null;

  function addToHistory(newHaiku: HaikuValue): void {
    if (state.historyIndex.value < state.history.value.length - 1) {
      state.history.value = state.history.value.slice(
        0,
        state.historyIndex.value + 1,
      );
    }
    state.history.value.push(newHaiku);

    if (state.history.value.length > MAX_HISTORY_SIZE) {
      state.history.value.shift();
    }
    state.historyIndex.value = state.history.value.length - 1;
  }

  function updateStats(newHaiku: HaikuValue): void {
    const isDaily = state.isDailyHaiku.value;

    if (isDaily) {
      state.stats.value.dailyHaikuViews += 1;
    }

    if (!isDaily && newHaiku.cacheUsed !== true) {
      state.stats.value.haikusGenerated += 1;

      if (typeof newHaiku.executionTime === 'number') {
        state.stats.value.totalExecutionTime += newHaiku.executionTime;
      }
    }

    const bookTitle = newHaiku.book?.title?.trim();

    if (!bookTitle) {
      return;
    }

    if (!state.stats.value.books.includes(bookTitle)) {
      state.stats.value.books.push(bookTitle);
      state.stats.value.booksBrowsed = state.stats.value.books.length;
    }

    state.stats.value.bookCounts[bookTitle] =
      (state.stats.value.bookCounts[bookTitle] || 0) + 1;
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

      return state.cachedVersion.value === serverVersion;
    } catch {
      return false;
    }
  }

  function tryUseCachedDailyHaiku(today: string): boolean {
    if (
      state.cachedDailyHaiku.value?.date === today &&
      state.cachedVersion.value
    ) {
      state.haiku.value = state.cachedDailyHaiku.value.haiku;
      state.isDailyHaiku.value = true;
      addToHistory(state.cachedDailyHaiku.value.haiku);
      updateStats(state.cachedDailyHaiku.value.haiku);

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
        state.cachedVersion.value = result.data.haikuVersion.version;
        state.cachedDailyHaiku.value = { haiku: newHaiku, date };
      }
    } catch {
      // Ignore cache errors
    }
  }

  function isMaxAttemptsError(e: unknown): boolean {
    const combinedError = e as CombinedError;
    const graphErrors = combinedError?.graphQLErrors;

    if (graphErrors?.some((g) => g.message === 'max-attempts-error')) {
      return true;
    }

    return e instanceof Error && e.message === 'max-attempts-error';
  }

  function handleFetchError(err: unknown): void {
    state.error.value = 'network-error';

    if (isMaxAttemptsError(err)) {
      state.error.value =
        'No haiku found matching your filters after maximum attempts. ' +
        'Please try again with a different filter or try several words.';
    }
  }

  function processNewHaiku(
    newHaiku: HaikuValue | null,
    fetchingDaily: boolean,
    today: string,
  ): void {
    state.haiku.value = newHaiku ?? (null as unknown as HaikuValue);

    if (newHaiku) {
      state.isDailyHaiku.value = fetchingDaily;
      addToHistory(newHaiku);
      updateStats(newHaiku);

      if (fetchingDaily) {
        cacheDailyHaiku(newHaiku, today);
      }
    }
  }

  async function fetchDailyHaiku(today: string): Promise<void> {
    try {
      state.loading.value = true;
      state.error.value = '';
      state.craftingMessages.value = [];

      const variables = {
        useCache: true,
        useDaily: true,
        date: today,
        theme: state.optionTheme.value,
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
      state.firstLoaded.value = true;
      state.loading.value = false;
    }
  }

  function handleIterativeProgress(
    progress: NonNullable<
      NonNullable<HaikuGenerationResult['data']>['haikuGeneration']
    >,
    tracking: { lastDisplayedScore: number; lastDisplayedVerses: string },
  ): void {
    state.generationProgress.value = {
      current: progress.currentIteration,
      total: progress.totalIterations,
      bestScore: progress.bestScore,
      stopReason: progress.stopReason,
    };

    if (!progress.bestHaiku?.verses) {
      return;
    }

    const versesText = progress.bestHaiku.verses.join(' / ');

    if (
      progress.bestScore > tracking.lastDisplayedScore &&
      versesText !== tracking.lastDisplayedVerses
    ) {
      tracking.lastDisplayedScore = progress.bestScore;
      tracking.lastDisplayedVerses = versesText;
      state.craftingMessages.value = [
        {
          id: crypto.randomUUID(),
          text: versesText,
          verses: progress.bestHaiku.verses,
          score: progress.bestScore,
          timestamp: Date.now(),
          icon: markRaw(Leaf),
        },
        ...state.craftingMessages.value,
      ];
    }
  }

  async function fetchIterativeHaiku(): Promise<void> {
    const today = getTodayUTC();

    try {
      state.loading.value = true;
      state.isGenerating.value = true;
      state.error.value = '';
      state.craftingMessages.value = [];
      state.generationProgress.value = {
        current: 0,
        total: state.optionIterations.value,
        bestScore: 0,
      };

      const variables = {
        iterations: state.optionIterations.value,
        theme: state.optionTheme.value,
        useAI: state.optionUseAI.value,
      };

      await new Promise<void>((resolve, reject) => {
        const tracking = {
          lastDisplayedScore: -Infinity,
          lastDisplayedVerses: '',
        };

        const { unsubscribe } = urqlClient
          .subscription(ITERATIVE_HAIKU_SUBSCRIPTION, variables)
          .subscribe((result: HaikuGenerationResult) => {
            if (result.error) {
              reject(result.error);

              return;
            }

            const progress = result.data?.haikuGeneration;

            if (progress) {
              handleIterativeProgress(progress, tracking);

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
      state.isGenerating.value = false;
      state.firstLoaded.value = true;
      state.loading.value = false;
    }
  }

  async function fetchNewHaiku(): Promise<void> {
    const fetchingDaily = state.shouldUseDaily.value;
    const today = getTodayUTC();

    if (fetchingDaily && state.cachedDailyHaiku.value?.date === today) {
      const isValid = await checkHaikuVersion(today);

      if (isValid && tryUseCachedDailyHaiku(today)) {
        state.firstLoaded.value = true;

        return;
      }
    }

    if (fetchingDaily) {
      await fetchDailyHaiku(today);

      return;
    }

    await fetchIterativeHaiku();
  }

  function goBack(): boolean {
    if (state.historyIndex.value <= 0) {
      return false;
    }
    state.historyIndex.value--;
    state.haiku.value = state.history.value[state.historyIndex.value];

    return true;
  }

  function goForward(): boolean {
    if (state.historyIndex.value >= state.history.value.length - 1) {
      return false;
    }
    state.historyIndex.value++;
    state.haiku.value = state.history.value[state.historyIndex.value];

    return true;
  }

  function resetConfigToDefaults(): void {
    state.optionIterations.value = 10;
  }

  function stopGeneration(): void {
    if (generationUnsubscribe) {
      generationUnsubscribe();
      generationUnsubscribe = null;
    }
    state.isGenerating.value = false;
  }

  return {
    fetchNewHaiku,
    goBack,
    goForward,
    resetConfigToDefaults,
    stopGeneration,
  };
}
