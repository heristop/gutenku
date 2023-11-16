<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import AppLoading from '@/components/AppLoading.vue';

const { fetchNewHaiku } = useHaikuStore();
const { haiku, loading, error, networkError, notificationError, optionUseCache } = storeToRefs(useHaikuStore());

const displayBtnLabel = computed(() => {
    if (true === optionUseCache.value) {
        return loading.value ? 'Extracting' : 'Extract';
    }

    return loading.value ? 'Generating' : 'Generate';
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
    class="pa-4 mb-sm-6 mb-0"
    color="primary"
    image="@/assets/img/haiku_card.webp"
  >
    <v-card-title class="text-third">
      Haiku Card
    </v-card-title>

    <v-card-text v-if="haiku">
      <p
        class="pt-6"
        v-for="sentence in haiku.verses "
        :key="sentence"
      >
        <mark class="highlighted-quote">{{ sentence }}</mark>
      </p>
    </v-card-text>

    <v-icon
      v-show="networkError || notificationError"
      color="accent"
      class="text-error py-10"
    >
      mdi-robot-dead-outline
    </v-icon>

    <app-loading
      v-if="loading"
      color="accent"
    />

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
            @click="fetchNewHaiku()"
            alt="Generate a new Haiku"
            color="accent"
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
            color="accent"
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
        alt="Close"
        icon="mdi-close"
        size="small"
      />
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

mark.highlighted-quote {
  color: #fff; 
  padding: 2px 6px; 
  background-color: rgba(255,255,255,0.05);
  font-size: 1.1em;
}
</style>

