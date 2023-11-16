<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { provideApolloClient, useSubscription } from "@vue/apollo-composable";
import { apolloClient } from '@/client';
import gql from 'graphql-tag';

const { result } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription onQuoteGenerated {
        quoteGenerated
    }
`));

const quotesReceived = ref<string[]>([]);

const reversedQuotes = computed(() => [...quotesReceived.value].reverse());

watch(
    result,
    async (data) => {
        if (!quotesReceived.value.includes(data.quoteGenerated)) {
            quotesReceived.value.push(data.quoteGenerated);

            while (quotesReceived.value.length > 100) {
                quotesReceived.value.shift();
            }
        }
    }
);
</script>

<template>
  <v-expand-transition>
    <v-sheet
      v-if="quotesReceived.length > 0"
      :elevation="3"
      color="black"
      class="terminal px-2 ma-4 align-left justify-center"
    >
      <p class="mb-4">
        Last Quotes found ✏️
      </p>

      <p
        class="terminal-entry"
        v-for="(quoteReceived, index) in reversedQuotes"
        :key="index"
      >
        (📨) {{ quoteReceived }}
      </p>
    </v-sheet>
  </v-expand-transition>
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
