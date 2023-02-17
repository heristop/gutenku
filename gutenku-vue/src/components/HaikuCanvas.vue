<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

const { fetchText } = useHaikuStore();
const { haiku, loading } = storeToRefs(useHaikuStore())

const haikuImage = computed(() => {
    if (!haiku.value) {
        return;
    }

    return `data:image/png;base64,${haiku.value.image}`;
});
</script>

<template>
  <v-card
    v-if="haiku"
    class="mx-auto pa-4 justify-center"
    :title="$t('titleCanvasBlock')"
    :loading="loading"
  >
    <img
      alt="canvas"
      :lazy-src="haikuImage"
      :srcset="haikuImage"
      width="300"
      aspectRatio="1"
    >

    <v-card-actions class="justify-end">
      <v-btn
        size="small"
        data-cy="fetch-btn"
        :disabled="loading"
        class="ms-2"
        :prepend-icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
        @click="fetchText()"
      >
        {{ $t('btnGenerate') }}
      </v-btn>

      <v-btn
        size="small"
        data-cy="send-btn"
        disabled
        class="ms-2"
        prepend-icon="mdi-instagram"
      >
        {{ $t('btnSend') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
