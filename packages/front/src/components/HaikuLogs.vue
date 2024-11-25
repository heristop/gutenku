<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { provideApolloClient, useSubscription } from '@vue/apollo-composable';
import { apolloClient } from '@/client';
import gql from 'graphql-tag';

const { result } = provideApolloClient(apolloClient)(() =>
  useSubscription(gql`
    subscription onQuoteGenerated {
      quoteGenerated
    }
  `),
);

const quotesReceived = ref<string[]>([]);

const reversedQuotes = computed(() => [...quotesReceived.value].reverse());

watch(result, async (data) => {
  if (!quotesReceived.value.includes(data.quoteGenerated)) {
    quotesReceived.value.push(data.quoteGenerated);

    while (quotesReceived.value.length > 100) {
      quotesReceived.value.shift();
    }
  }
});
</script>

<template>
  <v-expand-transition>
    <v-sheet
      v-if="quotesReceived.length > 0"
      :elevation="3"
      color="black"
      class="terminal align-left justify-center mr-4"
    >
      <p class="mb-4 font-weight-bold">Last Quotes found ✏️</p>

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
.terminal {
  background-color: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  padding: 20px;
  border-radius: 5px;
}

.terminal-entry {
  margin: 0;
  word-break: break-all;
  text-align: left;
}
</style>
