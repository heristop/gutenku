<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useHaikuStore } from '@/store/haiku';
import { storeToRefs } from 'pinia';
import { provideApolloClient, useSubscription } from "@vue/apollo-composable";
import gql from 'graphql-tag';
import { apolloClient } from '@/client';

const { fetchText } = useHaikuStore();
const { haiku, loading, error } = storeToRefs(useHaikuStore());

const networkError = computed(() => {
    return '' !== error.value;
});

const { result } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription onQuoteGenerated {
        quoteGenerated
    }
`));

const displayBtnLabel = computed(() => {
    if (true === haiku.value.useCache) {
        return loading.value ? 'Extracting' : 'Extract';
    }

    return loading.value ? 'Generating' : 'Generate';
});

const quotesReceived = ref<string[]>([]);

watch(
    result,
    data => {
        if (!quotesReceived.value.includes(data.quoteGenerated)) {
            quotesReceived.value.push(data.quoteGenerated);

            while (quotesReceived.value.length > 100) {
                quotesReceived.value.shift();
            }
        }
    }
);

watch(
    quotesReceived,
    async() => {
        await nextTick();

        const terminalElement = (ref("terminal") as any).value.$el;
        terminalElement.scrollTop = terminalElement.scrollHeight;
    }
);

const copied = ref(false);

async function copy() {
    try {
        await navigator.clipboard.writeText(haiku.value.verses.join("\n"));

        copied.value = true;
    } catch (err) {
        error.value = err as string;
    }
}
</script>

<template>
  <v-card
    :loading="loading"
    class="pa-10 mb-sm-6 mb-0"
    color="primary"
  >
    <v-sheet
      v-if="haiku"
      color="primary"
    >
      <p
        class="pa-4"
        v-for="sentence in haiku.verses"
        :key="sentence"
      >
        {{ sentence }}
      </p>
    </v-sheet>

    <v-icon
      v-show="networkError"
      color="third"
      class="text-error py-10"
    >
      mdi-robot-dead-outline
    </v-icon>

    <v-sheet
      v-if="quotesReceived.length > 0"
      :elevation="1"
      color="black"
      class="terminal pa-2 my-4 align-left justify-center"
      ref="terminal"
    >
      <p class="mb-4">Last 100 Pre-selected 5/7 syllables quotes:</p>

      <p
        class="terminal-entry"
        v-for="(quoteReceived, index) in quotesReceived"
        :key="index"
      >
        (📨) {{ quoteReceived }}
      </p>
    </v-sheet>

    <v-card-actions class="justify-end">
      <v-tooltip
        :disabled="loading"
        text="Display a new Haiku"
        aria-label="Display a new Haiku"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :disabled="loading"
            :prepend-icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
            @click="fetchText()"
            alt="Generate a new Haiku"
            color="third"
            data-cy="fetch-btn"
            class="ms-2"
          >
            {{ displayBtnLabel }}
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip
        text="Copy the Haiku"
        location="bottom"
        aria-label="Copy the Haiku"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="copy()"
            color="third"
            data-cy="copy-btn"
            class="ms-2"
            prepend-icon="mdi-content-copy"
            variant="text"
            alt="Copy the Haiku"
          >
            Copy
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>

  <v-snackbar
    v-model="copied"
    :timeout="2000"
    color="primary"
  >
    <v-icon data-cy="copy-success-icon">
      mdi-check-circle
    </v-icon> Haiku copied!

    <template #actions>
      <v-btn
        @click="copied = false"
        variant="text"
        alt="Close"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.text-error {
    font-size: 48px;
}

.terminal {
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  padding: 20px;
  border-radius: 5px;
  height: 200px;
  overflow-y: auto;
}

.terminal-entry {
  margin: 0;
  word-break: break-all;
  text-align: left;
}
</style>
