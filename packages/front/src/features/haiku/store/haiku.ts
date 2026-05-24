import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { HaikuValue } from '@gutenku/shared';
import {
  type CachedDailyHaiku,
  type CraftingMessage,
  type GenerationProgress,
  type OptionGroup,
  type Stats,
  CLASSIC_THEMES,
  IMAGE_AI_THEMES,
  getPersistConfig,
} from './haiku.types';
import { createHaikuActions } from './haiku.actions';

export type {
  CachedDailyHaiku,
  CraftingMessage,
  GenerationProgress,
  OptionGroup,
  Stats,
};

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

    const actions = createHaikuActions({
      haiku,
      loading,
      firstLoaded,
      isDailyHaiku,
      error,
      craftingMessages,
      history,
      historyIndex,
      optionTheme,
      optionIterations,
      optionUseAI,
      isGenerating,
      generationProgress,
      stats,
      cachedVersion,
      cachedDailyHaiku,
      shouldUseDaily,
    });

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
      ...actions,
    };
  },
  {
    persist: getPersistConfig(),
  },
);
