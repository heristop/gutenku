<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

const { haiku, loading, error } = storeToRefs(useHaikuStore())

const networkError = computed(() => {
    return '' !== error.value;
});
</script>

<template>
  <v-card
    :loading="loading"
    class="pa-10 mb-6"
    color="primary"
  >
    <div
      class="pa-4"
      v-if="haiku"
    >
      <p
        class="pa-2 ma-2"
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

    <v-card-actions class="justify-end">
      <v-btn
        class="ms-2"
        icon="mdi-thumb-up"
        variant="text"
        disabled
      />
      <v-btn
        class="ms-2"
        icon="mdi-thumb-down"
        variant="text"
        disabled
      />
    </v-card-actions>
  </v-card>
</template>
