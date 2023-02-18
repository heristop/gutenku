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
    <div v-if="haiku">
      <p
        class="pa-4"
        v-for="sentence in haiku.verses"
        :key="sentence"
      >
        {{ sentence }}
      </p>
    </div>

    <video
      v-show="networkError"
      width="640"
      height="396"
      autoplay
      loop
      muted
    >
      <source
        src="@/assets/img/writing.mp4"
        type="video/mp4"
      >
    </video>

    <v-card-actions
      v-if="haiku"
      class="justify-end"
    >
      <v-tooltip
        :text="$t('tooltipAISwitch')"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-switch
            v-bind="props"
            v-model="useAI"
            color="secondary"
            hide-details
            :label="$t('switchAi')"
          />
        </template>
      </v-tooltip>

      <v-btn
        data-cy="fetch-btn"
        class="ms-2"
        :prepend-icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
        @click="fetchText()"
      >
        {{
          $t('btnGenerate')
        }}
      </v-btn>

      <v-btn
        data-cy="copy-btn"
        class="ms-2"
        prepend-icon="mdi-content-copy"
        variant="text"
        @click="copy()"
      >
        {{
          $t('btnCopy')
        }}
      </v-btn>
    </v-card-actions>
  </v-card>

  <v-snackbar
    v-model="copied"
    :timeout="2000"
  >
    <v-icon>mdi-check-circle</v-icon> {{ $t('copiedMessage') }}

    <template #actions>
      <v-btn
        variant="text"
        @click="copied = false"
      >
        {{ $t('closeModal') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>
