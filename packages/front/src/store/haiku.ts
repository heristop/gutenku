import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HaikuValue } from '@gutenku/shared';
import { gql, type CombinedError } from '@urql/vue';
import { urqlClient } from '@/client';

interface CraftingMessage {
  text: string;
  timestamp: number;
  emoji: string;
}

interface Stats {
  haikusGenerated: number;
  cachedHaikus: number;
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
    const optionDescriptionTemperature = ref(0.3);
    const optionSelectionCount = ref(1);

    const stats = ref<Stats>({
      haikusGenerated: 0,
      cachedHaikus: 0,
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

    // Actions
    async function fetchNewHaiku(): Promise<void> {
      let subscriptionCleanup: (() => void) | null = null;

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
              craftingMessages.value = [
                {
                  text: result.data.quoteGenerated,
                  timestamp: Date.now(),
                  emoji: '✨',
                },
                ...craftingMessages.value,
              ];
            }
          });

        subscriptionCleanup = unsubscribe;

        const queryHaiku = gql`
        query Query(
          $useAi: Boolean
          $useCache: Boolean
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

        const variables = {
          useAi: optionUseAI.value,
          useCache: shouldUseCache.value,
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
          if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1);
          }
          history.value.push(newHaiku);
          if (history.value.length > MAX_HISTORY_SIZE) {
            history.value.shift();
          }
          historyIndex.value = history.value.length - 1;

          stats.value.haikusGenerated += 1;
          if (newHaiku.cacheUsed === true) {
            stats.value.cachedHaikus += 1;
          }
          if (typeof newHaiku.executionTime === 'number') {
            stats.value.totalExecutionTime += newHaiku.executionTime;
          }
          const bookTitle = newHaiku.book?.title?.trim();
          if (bookTitle) {
            if (!stats.value.books.includes(bookTitle)) {
              stats.value.books.push(bookTitle);
              stats.value.booksBrowsed = stats.value.books.length;
            }
            stats.value.bookCounts[bookTitle] =
              (stats.value.bookCounts[bookTitle] || 0) + 1;
          }
        }
      } catch (err: unknown) {
        error.value = 'network-error';

        const applyMaxAttemptsMessage = () => {
          error.value =
            'No haiku found matching your filters after maximum attempts. ' +
            'Please try again with a different filter or try several words.';
        };

        const combinedError = err as CombinedError;
        const graphErrors = combinedError?.graphQLErrors || null;

        if (
          graphErrors &&
          graphErrors.some(
            (graphError: { message: string }) =>
              graphError.message === 'max-attempts-error',
          )
        ) {
          applyMaxAttemptsMessage();
        } else if (
          err instanceof Error &&
          err.message === 'max-attempts-error'
        ) {
          applyMaxAttemptsMessage();
        }
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

    return {
      // State
      haiku,
      loading,
      firstLoaded,
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
      avgExecutionTime,
      canGoBack,
      canGoForward,
      historyLength,
      historyPosition,
      // Actions
      fetchNewHaiku,
      goBack,
      goForward,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: [
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
    },
  },
);
