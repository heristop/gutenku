<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSubscription, gql } from '@urql/vue';
import { RefreshCw } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useEmojiMapping } from '@/composables/emoji-mapping';
import { withViewTransition } from '@/composables/view-transition';
import { useKeyboardShortcuts } from '@/composables/keyboard-shortcuts';
import { useClipboard } from '@/composables/clipboard';
import { useImageDownload } from '@/composables/image-download';
import { useToast } from '@/composables/toast';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t, tm } = useI18n();
const { error: showError } = useToast();
import AppFooter from '@/components/AppFooter.vue';
import ConfigPanel from '@/components/ConfigPanel.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import HaikuCrafting from '@/components/HaikuCrafting.vue';
import HaikuProcess from '@/components/HaikuProcess.vue';
import HaikuTitle from '@/components/HaikuTitle.vue';
import ToolbarPanel from '@/components/ToolbarPanel.vue';
import SocialNetworkPanel from '@/components/SocialNetworkPanel.vue';
import StatsPanel from '@/components/StatsPanel.vue';
import AppLoading from '@/components/AppLoading.vue';

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, error, firstLoaded, networkError, loading } =
  storeToRefs(haikuStore);

// Watch for errors and show toast
watch(error, (newError) => {
  if (newError) {
    showError(newError);
    haikuStore.error = '';
  }
});

const { getEmoji, formatWithEmoji } = useEmojiMapping();

const { copy } = useClipboard();
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

const quotesReceived = ref<string[]>([]);
const latestMessage = ref<string>('');
const messageHistory = ref<
  Array<{ text: string; timestamp: number; emoji: string }>
>([]);

watch(
  () => subscriptionResult.data.value,
  (data) => {
    if (
      data?.quoteGenerated &&
      !quotesReceived.value.includes(data.quoteGenerated)
    ) {
      quotesReceived.value.push(data.quoteGenerated);
      latestMessage.value = data.quoteGenerated;

      messageHistory.value.unshift({
        text: data.quoteGenerated,
        timestamp: Date.now(),
        emoji: getEmoji(data.quoteGenerated),
      });

      while (messageHistory.value.length > 5) {
        messageHistory.value.pop();
      }

      while (quotesReceived.value.length > 10) {
        quotesReceived.value.shift();
      }
    }
  },
);

const literaryLoadingMessages = computed(() => {
  const messages = tm('home.loadingMessages');
  return Object.keys(messages)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => t(`home.loadingMessages.${key}`));
});

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    if (loading.value && quotesReceived.value.length > 0) {
      const latestLog = quotesReceived.value.at(-1);
      return latestLog ? formatWithEmoji(latestLog) : '';
    }

    const messages = literaryLoadingMessages.value;
    const index = Math.floor(Date.now() / 2500) % messages.length;
    return messages[index];
  }
  return t('home.readyMessage');
});

onMounted(fetchNewHaiku);
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

  <v-container class="fill-height pa-2 pa-sm-4">
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

      <div
        v-if="showContent && false === networkError"
        class="w-100"
        :aria-busy="loading"
        role="region"
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

                <!-- Mobile: Toolbar moved up for visibility -->
                <toolbar-panel class="d-sm-none mb-3" />

                <social-network-panel class="mb-sm-3 mb-0" />
              </v-col>

              <v-col
                cols="12"
                sm="8"
                md="8"
                class="h-100 align-center justify-center order-1 pa-1 pa-sm-3"
              >
                <haiku-title class="d-none d-sm-block" />

                <haiku-process class="d-none d-sm-block" />

                <haiku-crafting
                  v-if="loading && messageHistory.length > 0"
                  :messages="messageHistory"
                  class="d-none d-sm-block"
                />

                <haiku-chapter v-else class="d-none d-sm-block" />
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

                <haiku-canvas class="mb-3" />

                <config-panel class="mb-6" />

                <stats-panel class="mb-6" />

                <haiku-crafting
                  v-if="loading && messageHistory.length > 0"
                  :messages="messageHistory"
                  class="d-sm-none mb-2"
                />

                <haiku-chapter v-else class="d-sm-none mb-2" />

                <app-footer class="mt-6" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<style lang="scss">
@use '@/assets/css/main.scss';
</style>
