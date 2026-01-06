import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import type { HaikuValue } from '@gutenku/shared';
import { gql, type CombinedError } from '@urql/vue';
import { Sparkles, type LucideIcon } from 'lucide-vue-next';
import { urqlClient } from '@/client';
import type { PersistenceOptions } from 'pinia-plugin-persistedstate';

// SSR-safe persist config - only enable on client
const getPersistConfig = (): PersistenceOptions | false => {
  if (import.meta.env.SSR) {
    return false;
  }
  return {
    storage: localStorage,
    pick: [
      'optionDrawerOpened',
      'optionTheme',
      'optionMinSentimentScore',
      'optionMinMarkovScore',
      'optionMinPosScore',
      'optionMinTrigramScore',
      'optionMinTfidfScore',
      'optionMinPhoneticsScore',
      'stats',
    ],
  };
};

export interface CraftingMessage {
  id: string;
  text: string;
  timestamp: number;
  icon: LucideIcon;
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
    // State
    const haiku = ref<HaikuValue>(null as unknown as HaikuValue);
    const loading = ref(false);
    const firstLoaded = ref(false);
    const isDailyHaiku = ref(false);
    const error = ref('');
    const craftingMessages = ref<CraftingMessage[]>([]);
    const history = ref<HaikuValue[]>([]);
    const historyIndex = ref(-1);

    // Options state
    const optionDrawerOpened = ref(false);
    const optionUseCache = ref(true);
    const optionUseAI = ref(false);
    const optionImageAI = ref(false);
    const optionTheme = ref('random');
    const optionFilter = ref('');
    const optionMinSentimentScore = ref(0.1);
    const optionMinMarkovScore = ref(0.1);
    const optionMinPosScore = ref(0);
    const optionMinTrigramScore = ref(0);
    const optionMinTfidfScore = ref(0);
    const optionMinPhoneticsScore = ref(0);
    const optionDescriptionTemperature = ref(0.7);
    const optionSelectionCount = ref(1);

    const stats = ref<Stats>({
      haikusGenerated: 0,
      dailyHaikuViews: 0,
      booksBrowsed: 0,
      totalExecutionTime: 0,
      books: [],
      bookCounts: {},
    });

    // Getters
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

    // Helper: Add haiku to history
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

    // Helper: Update stats for new haiku
    function updateStats(newHaiku: HaikuValue): void {
      const isDaily = isDailyHaiku.value;

      // Track daily haiku views
      if (isDaily) {
        stats.value.dailyHaikuViews += 1;
      } else if (newHaiku.cacheUsed !== true) {
        // Track crafted haikus (non-cached, non-daily)
        stats.value.haikusGenerated += 1;
        if (typeof newHaiku.executionTime === 'number') {
          stats.value.totalExecutionTime += newHaiku.executionTime;
        }
      }

      // Always track books (for both daily and crafted haikus)
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

    // Helper: Handle fetch error
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

    // Actions
    async function fetchNewHaiku(): Promise<void> {
      let subscriptionCleanup: (() => void) | null = null;

      // Track if this fetch is for the daily haiku
      const fetchingDaily = shouldUseDaily.value;

      try {
        loading.value = true;
        error.value = '';
        craftingMessages.value = [];

        // Subscribe to crafting messages
        const subscriptionQuery = gql`
          subscription QuoteGenerated {
            quoteGenerated
          }
        `;

        const { unsubscribe } = urqlClient
          .subscription(subscriptionQuery, {})
          .subscribe((result) => {
            if (result.data?.quoteGenerated) {
              const existingMessages = craftingMessages.value.map((m) => ({
                ...m,
                id: m.id || crypto.randomUUID(),
              }));
              craftingMessages.value = [
                {
                  id: crypto.randomUUID(),
                  text: result.data.quoteGenerated,
                  timestamp: Date.now(),
                  icon: markRaw(Sparkles),
                },
                ...existingMessages,
              ];
            }
          });

        subscriptionCleanup = unsubscribe;

        const queryHaiku = gql`
          query Query(
            $useAi: Boolean
            $useCache: Boolean
            $useDaily: Boolean
            $date: String
            $useImageAI: Boolean
            $theme: String
            $filter: String
            $sentimentMinScore: Float
            $markovMinScore: Float
            $posMinScore: Float
            $trigramMinScore: Float
            $tfidfMinScore: Float
            $phoneticsMinScore: Float
            $descriptionTemperature: Float
            $selectionCount: Int
          ) {
            haiku(
              useAI: $useAi
              useCache: $useCache
              useDaily: $useDaily
              date: $date
              useImageAI: $useImageAI
              theme: $theme
              filter: $filter
              sentimentMinScore: $sentimentMinScore
              markovMinScore: $markovMinScore
              posMinScore: $posMinScore
              trigramMinScore: $trigramMinScore
              tfidfMinScore: $tfidfMinScore
              phoneticsMinScore: $phoneticsMinScore
              descriptionTemperature: $descriptionTemperature
              selectionCount: $selectionCount
            ) {
              book {
                reference
                title
                author
                emoticons
              }
              chapter {
                content
                title
              }
              verses
              rawVerses
              image
              title
              description
              hashtags
              translations {
                fr
                jp
                es
              }
              cacheUsed
              executionTime
            }
          }
        `;

        // Get today's date in UTC (YYYY-MM-DD format)
        const today = new Date().toISOString().split('T')[0];

        const variables = {
          useAi: optionUseAI.value,
          useCache: shouldUseCache.value,
          useDaily: shouldUseDaily.value,
          date: shouldUseDaily.value ? today : undefined,
          useImageAI:
            optionImageAI.value && import.meta.env.DEV ? true : undefined,
          theme: optionTheme.value,
          filter: optionFilter.value,
          sentimentMinScore: optionMinSentimentScore.value,
          markovMinScore: optionMinMarkovScore.value,
          posMinScore: optionMinPosScore.value,
          trigramMinScore: optionMinTrigramScore.value,
          tfidfMinScore: optionMinTfidfScore.value,
          phoneticsMinScore: optionMinPhoneticsScore.value,
          descriptionTemperature: optionDescriptionTemperature.value,
          selectionCount: import.meta.env.DEV
            ? optionSelectionCount.value
            : undefined,
          appendImg: true,
        };

        const result = await urqlClient
          .query<{ haiku: HaikuValue | null }>(queryHaiku, variables)
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        const newHaiku = result.data?.haiku ?? null;
        haiku.value = (newHaiku ??
          (null as unknown as HaikuValue)) as HaikuValue;

        if (newHaiku) {
          isDailyHaiku.value = fetchingDaily;
          addToHistory(newHaiku);
          updateStats(newHaiku);
        }
      } catch (err: unknown) {
        handleFetchError(err);
      } finally {
        if (subscriptionCleanup) {
          subscriptionCleanup();
        }
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
      optionMinSentimentScore.value = 0.1;
      optionMinMarkovScore.value = 0.1;
      optionMinPosScore.value = 0;
      optionMinTrigramScore.value = 0;
      optionMinTfidfScore.value = 0;
      optionMinPhoneticsScore.value = 0;
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
      optionFilter,
      optionMinSentimentScore,
      optionMinMarkovScore,
      optionMinPosScore,
      optionMinTrigramScore,
      optionMinTfidfScore,
      optionMinPhoneticsScore,
      optionDescriptionTemperature,
      optionSelectionCount,
      stats,
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
    };
  },
  {
    persist: getPersistConfig(),
  },
);
