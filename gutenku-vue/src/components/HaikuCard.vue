<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { fetchText } = useHaikuStore();
const { haiku, loading, error, useAI } = storeToRefs(useHaikuStore());

const networkError = computed(() => {
    return '' !== error.value;
});

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
    class="pa-10 mb-6"
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

    <v-card-actions class="justify-end">
      <v-tooltip
        text="Use AI to improve the revelant of generated Haiku"
        location="bottom right"
      >
        <template #activator="{ props }">
          <v-switch
            v-bind="props"
            v-model="useAI"
            data-cy="switch-api-btn"
            color="secondary"
            hide-details
            label="🤖"
          />
        </template>
      </v-tooltip>

      <v-btn
        data-cy="fetch-btn"
        class="ms-2"
        :prepend-icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
        @click="fetchText()"
      >
        Generate
      </v-btn>

      <v-btn
        data-cy="copy-btn"
        class="ms-2"
        prepend-icon="mdi-content-copy"
        variant="text"
        @click="copy()"
      >
        Copy
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-snackbar
    v-model="copied"
    :timeout="2000"
  >
    <v-icon data-cy="copy-success-icon">
      mdi-check-circle
    </v-icon> Haiku copied!

    <template #actions>
      <v-btn
        variant="text"
        @click="copied = false"
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
</style>
