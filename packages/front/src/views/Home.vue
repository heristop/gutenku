<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { provideApolloClient, useSubscription } from '@vue/apollo-composable';
import { apolloClient } from '@/client';
import gql from 'graphql-tag';
import { useHaikuStore } from '@/store/haiku';
import AppFooter from '@/components/AppFooter.vue';
import ConfigPanel from '@/components/ConfigPanel.vue';
import HaikuCanvas from '@/components/HaikuCanvas.vue';
import HaikuChapter from '@/components/HaikuChapter.vue';
import HaikuCrafting from '@/components/HaikuCrafting.vue';
import HaikuTitle from '@/components/HaikuTitle.vue';
import ToolbarPanel from '@/components/ToolbarPanel.vue';
import SocialNetworkPanel from '@/components/SocialNetworkPanel.vue';
import StatsPanel from '@/components/StatsPanel.vue';
import AppLoading from '@/components/AppLoading.vue';

const { fetchNewHaiku } = useHaikuStore();
const { error, firstLoaded, networkError, notificationError, loading } =
  storeToRefs(useHaikuStore());

// GraphQL subscription for real-time quotes
const { result } = provideApolloClient(apolloClient)(() =>
  useSubscription(gql`
    subscription onQuoteGenerated {
      quoteGenerated
    }
  `),
);

const quotesReceived = ref<string[]>([]);
const latestMessage = ref<string>('');
const messageHistory = ref<
  Array<{ text: string; timestamp: number; emoji: string }>
>([]);

watch(result, async (data: { quoteGenerated: string }) => {
  if (
    data?.quoteGenerated &&
    !quotesReceived.value.includes(data.quoteGenerated)
  ) {
    quotesReceived.value.push(data.quoteGenerated);
    latestMessage.value = data.quoteGenerated;

    // Add to message history with emoji and timestamp
    const logLower = data.quoteGenerated.toLowerCase();
    const emojiMap: Record<string, string> = {
      extracting: '🔍',
      reading: '📖',
      analyzing: '🎭',
      generating: '✨',
      creating: '🎨',
      crafting: '📝',
      processing: '⚙️',
      searching: '🔍',
      loading: '📚',
      found: '✨',
      quote: '📝',
      selecting: '🎯',
      evaluating: '🧠',
      weaving: '🕸️',
      finalizing: '🏁',
    };

    const emoji = Object.keys(emojiMap).find((key) => logLower.includes(key));
    const selectedEmoji = emoji ? emojiMap[emoji] : '✨';

    messageHistory.value.unshift({
      text: data.quoteGenerated,
      timestamp: Date.now(),
      emoji: selectedEmoji,
    });

    // Keep only last 5 messages for display
    while (messageHistory.value.length > 5) {
      messageHistory.value.pop();
    }

    // Keep only last 10 quotes for performance
    while (quotesReceived.value.length > 10) {
      quotesReceived.value.shift();
    }
  }
});

// Dynamic loading messages with personality
const literaryLoadingMessages = [
  '🔍 Our poetic robots are diving into classic literature...',
  '📚 Scanning through the greatest works ever written...',
  '🎭 Absorbing the emotional essence of timeless stories...',
  '✨ Weaving seventeen syllables of pure magic...',
  '🎨 Selecting the perfect artistic theme for your poem...',
  '🖼️ Creating a visual masterpiece for your haiku...',
  '📝 Adding the final touches to your literary art...',
];

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    // Priority 1: Use real-time GraphQL subscription logs if available and loading
    if (loading.value && quotesReceived.value.length > 0) {
      const latestLog = quotesReceived.value[quotesReceived.value.length - 1];
      // Add emojis to make subscription messages more engaging
      const emojiMap: Record<string, string> = {
        extracting: '🔍',
        reading: '📖',
        analyzing: '🎭',
        generating: '✨',
        creating: '🎨',
        crafting: '📝',
        processing: '⚙️',
        searching: '🔍',
        loading: '📚',
        found: '✨',
        quote: '📝',
      };

      // Find matching emoji for the log message
      const logLower = latestLog.toLowerCase();
      const emoji = Object.keys(emojiMap).find((key) => logLower.includes(key));
      const prefix = emoji ? emojiMap[emoji] : '✨';

      return `${prefix} ${latestLog}`;
    }

    // Priority 2: Fallback to rotating personality messages
    const index =
      Math.floor(Date.now() / 2500) % literaryLoadingMessages.length;
    return literaryLoadingMessages[index];
  }
  return 'Ready to create poetry';
});

onMounted(fetchNewHaiku);
</script>

<template>
  <v-container
    class="d-flex justify-center align-center"
    v-if="false === firstLoaded || networkError"
  >
    <v-btn
      variant="plain"
      color="accent"
      size="x-large"
      href="https://gutenku.xyz"
    >
      gutenku.xyz
    </v-btn>

    <v-tooltip
      v-if="networkError"
      text="Refresh"
      aria-label="Refresh"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          color="primary"
          density="compact"
          icon="mdi-refresh"
          alt="Refresh"
          @click="$router.go(0)"
        />
      </template>
    </v-tooltip>
  </v-container>

  <v-container class="fill-height pa-2 pa-sm-4">
    <div class="d-flex text-center fill-height justify-center align-center">
      <v-sheet v-if="false === firstLoaded">
        <app-loading
          :text="loadingLabel"
          :splash="true"
        />
      </v-sheet>

      <v-sheet v-show="networkError">
        <app-loading
          :splash="true"
          error
          text="Cannot connect to the server :("
        />
      </v-sheet>

      <div
        v-if="firstLoaded && false === networkError"
        class="w-100"
      >
        <v-row
          justify="center"
          no-gutters
        >
          <v-col
            cols="12"
            lg="10"
            xl="9"
            class="pa-0"
          >
            <v-row no-gutters>
              <v-col
                cols="12"
                sm="8"
                class="d-sm-none mx-auto h-100 align-center justify-center order-0 pa-1"
              >
                <haiku-title class="d-sm-none mb-2" />

                <social-network-panel class="mb-sm-3 mb-0" />
              </v-col>

              <v-col
                cols="12"
                sm="8"
                md="8"
                class="h-100 align-center justify-center order-1 pa-1 pa-sm-3"
              >
                <haiku-title class="d-none d-sm-block" />

                <haiku-crafting
                  v-if="loading && messageHistory.length > 0"
                  :messages="messageHistory"
                  class="d-none d-sm-block"
                />

                <haiku-chapter
                  v-else
                  class="d-none d-sm-block"
                />
              </v-col>

              <v-col
                cols="12"
                sm="4"
                md="4"
                class="h-100 align-center justify-center order-2 pa-1 pa-sm-3"
              >
                <social-network-panel class="d-none d-sm-block" />

                <toolbar-panel class="mb-3 mb-sm-6" />

                <haiku-canvas class="mb-3" />

                <config-panel class="mb-6" />

                <stats-panel class="mb-6" />

                <haiku-crafting
                  v-if="loading && messageHistory.length > 0"
                  :messages="messageHistory"
                  class="d-sm-none mb-2"
                />

                <haiku-chapter
                  v-else
                  class="d-sm-none mb-2"
                />

                <app-footer class="mt-6" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-snackbar
          v-model="notificationError"
          :timeout="4000"
          color="primary"
        >
          {{ error }}

          <template #actions>
            <v-btn
              @click="error = ''"
              alt="Close"
              icon="mdi-close"
              size="small"
            />
          </template>
        </v-snackbar>
      </div>
    </div>
  </v-container>
</template>

<style lang="scss">
@import '@/assets/css/main.scss';
</style>
