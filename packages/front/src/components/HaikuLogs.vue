<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue';
import { provideApolloClient, useSubscription } from "@vue/apollo-composable";
import gql from 'graphql-tag';
import { apolloClient } from '@/client';

const { result } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription onQuoteGenerated {
        quoteGenerated
    }
`));

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
    async () => {
        await nextTick();

        const terminalElement = (ref("terminal") as any).value.$el;
        terminalElement.scrollTop = terminalElement.scrollHeight;
    }
);
</script>

<template>
  <v-expand-transition>
    <v-sheet
      v-if="quotesReceived.length > 0"
      :elevation="3"
      color="black"
      class="terminal pa-2 ma-4 my-4 mt-12 align-left justify-center"
      ref="terminal"
    >
      <p class="mb-4">
        ✏️ Last 100 Pre-selected Quotes:
      </p>

      <p
        class="terminal-entry"
        v-for="(quoteReceived, index) in quotesReceived"
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
