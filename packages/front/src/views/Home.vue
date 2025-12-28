<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSubscription, gql } from '@urql/vue';
import { RefreshCw } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useEmojiMapping } from '@/composables/emoji-mapping';
import { withViewTransition } from '@/composables/view-transition';
import { useKeyboardShortcuts } from '@/composables/keyboard-shortcuts';
import { useClipboard } from '@/composables/clipboard';
import { useShare } from '@/composables/share';
import { useImageDownload } from '@/composables/image-download';
import { useToast } from '@/composables/toast';
import { usePullToRefresh } from '@/composables/pull-to-refresh';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';
import AppFooter from '@/components/AppFooter.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import HaikuCrafting from '@/components/HaikuCrafting.vue';
import HaikuProcess from '@/components/HaikuProcess.vue';
import HaikuTitle from '@/components/HaikuTitle.vue';
import SocialNetworkPanel from '@/components/SocialNetworkPanel.vue';
import AppLoading from '@/components/AppLoading.vue';
import ZenSkeleton from '@/components/ZenSkeleton.vue';
import PullToRefresh from '@/components/PullToRefresh.vue';
import KeyboardHelp from '@/components/KeyboardHelp.vue';

const ConfigPanel = defineAsyncComponent({
  loader: () => import('@/components/ConfigPanel.vue'),
  loadingComponent: ZenSkeleton,
});
const StatsPanel = defineAsyncComponent({
  loader: () => import('@/components/StatsPanel.vue'),
  loadingComponent: ZenSkeleton,
});
const ToolbarPanel = defineAsyncComponent({
  loader: () => import('@/components/ToolbarPanel.vue'),
  loadingComponent: ZenSkeleton,
});
const DiscordPreviewCard = defineAsyncComponent({
  loader: () => import('@/components/DiscordPreviewCard.vue'),
  loadingComponent: ZenSkeleton,
});

const isDev = import.meta.env.DEV;

const { t, tm } = useI18n();
const { error: showError } = useToast();

const haikuStore = useHaikuStore();
const { fetchNewHaiku, goBack, goForward } = haikuStore;
const { haiku, error, firstLoaded, networkError, loading, optionUseAI } =
  storeToRefs(haikuStore);

const showKeyboardHelp = ref(false);

// Watch for errors and show toast
watch(error, (newError) => {
  if (newError) {
    showError(newError);
    haikuStore.error = '';
  }
});

const { getEmoji, formatWithEmoji } = useEmojiMapping();

const { copy } = useClipboard();
const { share } = useShare();
const { download } = useImageDownload();

useKeyboardShortcuts({
  onGenerate: () => {
    if (!loading.value) {
      fetchNewHaiku();
    }
  },
  onCopy: () => {
    if (haiku.value?.verses) {
      copy(haiku.value.verses.join('\n'));
    }
  },
  onDownload: () => {
    if (haiku.value?.image) {
      const bookTitle = haiku.value.book?.title || 'haiku';
      const chapterTitle = haiku.value.chapter?.title || '';
      download(`data:image/png;base64,${haiku.value.image}`, {
        filename: `${bookTitle}_${chapterTitle}`,
      });
    }
  },
  onShare: () => {
    if (haiku.value) {
      share(haiku.value);
    }
  },
  onPrevious: () => {
    goBack();
  },
  onNext: () => {
    goForward();
  },
  onHelp: () => {
    showKeyboardHelp.value = true;
  },
});

const showContent = ref(false);

watch(firstLoaded, (loaded) => {
  if (loaded) {
    withViewTransition(() => {
      showContent.value = true;
    });
  }
});

const subscriptionResult = useSubscription<{ quoteGenerated: string }>({
  query: gql`
    subscription onQuoteGenerated {
      quoteGenerated
    }
  `,
});

const quotesReceivedSet = ref(new Set<string>());
const latestMessage = ref<string>('');
const messageHistory = ref<
  Array<{ text: string; timestamp: number; emoji: string }>
>([]);
const recentlyReceivedMessage = ref(false);
let recentMessageTimeout: ReturnType<typeof setTimeout> | null = null;

const MAX_HISTORY = 5;
const MAX_QUOTES = 10;
const MESSAGE_DISPLAY_DELAY = 2000;

// Clear message history when loading starts (new generation)
watch(loading, (isLoading) => {
  if (isLoading) {
    messageHistory.value = [];
    quotesReceivedSet.value.clear();
    latestMessage.value = '';
    recentlyReceivedMessage.value = false;
    if (recentMessageTimeout) {
      clearTimeout(recentMessageTimeout);
      recentMessageTimeout = null;
    }
  }
});

watch(
  () => subscriptionResult.data.value,
  (data) => {
    const quote = data?.quoteGenerated;
    if (quote && !quotesReceivedSet.value.has(quote)) {
      quotesReceivedSet.value.add(quote);
      latestMessage.value = quote;
      recentlyReceivedMessage.value = true;

      // Keep showing crafting messages briefly after receiving
      if (recentMessageTimeout) {
        clearTimeout(recentMessageTimeout);
      }
      recentMessageTimeout = setTimeout(() => {
        recentlyReceivedMessage.value = false;
      }, MESSAGE_DISPLAY_DELAY);

      const newEntry = {
        text: quote,
        timestamp: Date.now(),
        emoji: getEmoji(quote),
      };
      messageHistory.value = [newEntry, ...messageHistory.value].slice(0, MAX_HISTORY);

      if (quotesReceivedSet.value.size > MAX_QUOTES) {
        const iterator = quotesReceivedSet.value.values();
        quotesReceivedSet.value.delete(iterator.next().value as string);
      }
    }
  },
);

// Show crafting when loading with messages OR recently received messages
const showCrafting = computed(() => {
  const hasMessages = messageHistory.value.length > 0;
  return hasMessages && (loading.value || recentlyReceivedMessage.value);
});

const literaryLoadingMessages = computed(() => {
  const messages = tm('home.loadingMessages');
  return Object.keys(messages)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => t(`home.loadingMessages.${key}`));
});

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    if (loading.value && quotesReceivedSet.value.size > 0) {
      return latestMessage.value ? formatWithEmoji(latestMessage.value) : '';
    }

    const messages = literaryLoadingMessages.value;
    const index = Math.floor(Date.now() / 2500) % messages.length;
    return messages[index];
  }
  return t('home.readyMessage');
});

onMounted(fetchNewHaiku);

// Pull-to-refresh for mobile
const pageRef = useTemplateRef<HTMLElement>('pageRef');
const {
  isPulling,
  pullDistance,
  isRefreshing,
  progress,
  shouldRelease,
  isMobile,
} = usePullToRefresh(pageRef, {
  onRefresh: fetchNewHaiku,
  disabled: loading,
});
</script>

<template>
  <v-container
    v-if="false === firstLoaded || networkError"
    class="d-flex justify-center align-center"
  >
    <v-btn
      variant="plain"
      color="accent"
      size="x-large"
      href="https://gutenku.xyz"
    >
      gutenku.xyz
    </v-btn>

    <ZenTooltip
      v-if="networkError"
      :text="t('common.refresh')"
      position="bottom"
    >
      <v-btn
        color="primary"
        density="compact"
        :aria-label="t('common.refresh')"
        @click="$router.go(0)"
      >
        <RefreshCw :size="20" />
      </v-btn>
    </ZenTooltip>
  </v-container>

  <v-container ref="pageRef" class="fill-height pa-2 pa-sm-4">
    <!-- Pull-to-refresh indicator (mobile only) -->
    <PullToRefresh
      v-if="isMobile"
      :pull-distance="pullDistance"
      :is-refreshing="isRefreshing"
      :should-release="shouldRelease"
      :progress="progress"
    />

    <div class="d-flex text-center fill-height justify-center align-center">
      <!-- Screen reader announcements for loading states -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        <span v-if="loading">{{ loadingLabel }}</span>
        <span v-else-if="firstLoaded">{{ t('home.haikuReady') }}</span>
      </div>

      <v-sheet v-if="!showContent && !networkError">
        <app-loading :text="loadingLabel" :splash="true" />
      </v-sheet>

      <v-sheet v-show="networkError" role="alert">
        <app-loading :splash="true" error :text="t('home.networkError')" />
      </v-sheet>

      <main
        id="main-content"
        v-if="showContent && false === networkError"
        class="w-100"
        :aria-busy="loading"
        :aria-label="t('home.haikuContentLabel')"
      >
        <v-row justify="center" no-gutters>
          <v-col cols="12" lg="10" xl="9" class="pa-0">
            <v-row no-gutters>
              <v-col
                cols="12"
                sm="8"
                class="d-sm-none mx-auto h-100 align-center justify-center order-0 pa-1"
              >
                <haiku-title class="d-sm-none mb-2" />

                <haiku-process class="d-sm-none" />

                <social-network-panel class="d-sm-none mb-6" />

                <toolbar-panel class="d-sm-none mb-0" />
              </v-col>

              <v-col
                cols="12"
                sm="8"
                md="8"
                class="h-100 align-center justify-center order-1 pa-1 pa-sm-3"
              >
                <haiku-title class="d-none d-sm-block" />

                <haiku-process class="d-none d-sm-block" />

                <div class="chapter-container d-none d-sm-block">
                  <haiku-crafting
                    v-if="showCrafting"
                    :messages="messageHistory"
                  />

                  <haiku-chapter v-else />
                </div>

                <discord-preview-card
                  v-if="isDev && optionUseAI"
                  class="d-none d-sm-block mt-6"
                />
              </v-col>

              <v-col
                cols="12"
                sm="4"
                md="4"
                class="h-100 align-center justify-center order-2 pa-1 pa-sm-3"
              >
                <social-network-panel class="d-none d-sm-block" />

                <!-- Desktop only: Toolbar (mobile version is in order-0 column) -->
                <toolbar-panel class="d-none d-sm-block mb-3 mb-sm-6" />

                <haiku-canvas class="mt-n4 mt-sm-0 mb-3" />

                <stats-panel class="mb-6" />

                <config-panel class="mb-6" />

                <div class="chapter-container d-sm-none mb-2">
                  <haiku-crafting
                    v-if="showCrafting"
                    :messages="messageHistory"
                  />

                  <haiku-chapter v-else />
                </div>

                <app-footer class="mt-6" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </main>
    </div>

    <!-- Keyboard shortcuts help modal -->
    <KeyboardHelp v-model="showKeyboardHelp" />
  </v-container>
</template>

<style lang="scss">
@use '@/assets/css/main.scss';

.chapter-container {
  min-height: 22rem;
}
</style>
