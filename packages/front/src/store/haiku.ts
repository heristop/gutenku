import { defineStore } from 'pinia';
import type { HaikuValue } from '@gutenku/shared';
import { gql, type CombinedError } from '@urql/vue';
import { urqlClient } from '@/client';

const THEME_OPTIONS = ['random', 'colored', 'greentea', 'watermark'];

const MAX_HISTORY_SIZE = 10;

export const useHaikuStore = defineStore({
  id: 'haiku',
  state: () => ({
    haiku: null as unknown as HaikuValue,
    loading: false as boolean,
    firstLoaded: false as boolean,
    error: '' as string,
    history: [] as HaikuValue[],
    historyIndex: -1 as number,
    optionDrawerOpened: false as boolean,
    optionUseCache: true as boolean,
    optionUseAI: false as boolean,
    optionImageAI: false as boolean,
    optionTheme: 'random' as string,
    optionFilter: '' as string,
    optionMinSentimentScore: 0.1 as number,
    optionMinMarkovScore: 0.1 as number,
    optionMinPosScore: 0 as number,
    optionMinTrigramScore: 0 as number,
    optionMinTfidfScore: 0 as number,
    optionMinPhoneticsScore: 0 as number,
    optionDescriptionTemperature: 0.3 as number,
    optionSelectionCount: 1 as number,
    stats: {
      haikusGenerated: 0 as number,
      cachedHaikus: 0 as number,
      booksBrowsed: 0 as number,
      totalExecutionTime: 0 as number,
      books: [] as string[],
      bookCounts: {} as Record<string, number>,
    },
  }),
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
  getters: {
    networkError: (state) => 'network-error' === state.error,
    notificationError: (state) => '' !== state.error,
    themeOptions: (state) =>
      state.optionImageAI && import.meta.env.DEV
        ? ['openai', ...THEME_OPTIONS]
        : THEME_OPTIONS,
    shouldUseCache: (state) => !state.firstLoaded,
    avgExecutionTime: (state) =>
      state.stats.haikusGenerated > 0
        ? state.stats.totalExecutionTime / state.stats.haikusGenerated
        : 0,
    canGoBack: (state) => state.historyIndex > 0,
    canGoForward: (state) => state.historyIndex < state.history.length - 1,
    historyLength: (state) => state.history.length,
    historyPosition: (state) => state.historyIndex + 1,
  },
  actions: {
    async fetchNewHaiku(): Promise<void> {
      try {
        this.loading = true;
        this.error = '';

        const queryHaiku = gql`
          query Query(
            $useAi: Boolean
            $useCache: Boolean
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
          useAi: this.optionUseAI,
          useCache: this.shouldUseCache,
          theme: this.optionTheme,
          filter: this.optionFilter,
          sentimentMinScore: this.optionMinSentimentScore,
          markovMinScore: this.optionMinMarkovScore,
          posMinScore: this.optionMinPosScore,
          trigramMinScore: this.optionMinTrigramScore,
          tfidfMinScore: this.optionMinTfidfScore,
          phoneticsMinScore: this.optionMinPhoneticsScore,
          descriptionTemperature: this.optionDescriptionTemperature,
          selectionCount: import.meta.env.DEV
            ? this.optionSelectionCount
            : undefined,
          appendImg: true,
        };

        const result = await urqlClient
          .query<{ haiku: HaikuValue | null }>(queryHaiku, variables)
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        const haiku = result.data?.haiku ?? null;

        this.haiku = (haiku ?? (null as unknown as HaikuValue)) as HaikuValue;

        if (haiku) {
          if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
          }
          this.history.push(haiku);
          if (this.history.length > MAX_HISTORY_SIZE) {
            this.history.shift();
          }
          this.historyIndex = this.history.length - 1;

          this.stats.haikusGenerated += 1;
          if (true === haiku.cacheUsed) {
            this.stats.cachedHaikus += 1;
          }
          if (typeof haiku.executionTime === 'number') {
            this.stats.totalExecutionTime += haiku.executionTime;
          }
          const bookTitle = haiku.book?.title?.trim();
          if (bookTitle) {
            if (!this.stats.books.includes(bookTitle)) {
              this.stats.books.push(bookTitle);
              this.stats.booksBrowsed = this.stats.books.length;
            }
            this.stats.bookCounts[bookTitle] =
              (this.stats.bookCounts[bookTitle] || 0) + 1;
          }
        }
      } catch (error: unknown) {
        this.error = 'network-error';

        const applyMaxAttemptsMessage = () => {
          this.error =
            'No haiku found matching your filters after maximum attempts. ';
          this.error +=
            'Please try again with a different filter or try several words.';
        };

        const combinedError = error as CombinedError;
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
          error instanceof Error &&
          error.message === 'max-attempts-error'
        ) {
          applyMaxAttemptsMessage();
        }
      } finally {
        this.firstLoaded = true;
        this.loading = false;
      }
    },
    goBack(): boolean {
      if (this.historyIndex <= 0) {
        return false;
      }
      this.historyIndex--;
      this.haiku = this.history[this.historyIndex];
      return true;
    },
    goForward(): boolean {
      if (this.historyIndex >= this.history.length - 1) {
        return false;
      }
      this.historyIndex++;
      this.haiku = this.history[this.historyIndex];
      return true;
    },
  },
});
