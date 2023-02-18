<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

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
    class="mx-auto pa-10 mb-6 justify-center order-last"
    :title="$t('titleCanvasCard')"
    :loading="loading"
  >
    <img
      alt="canvas"
      :src="haikuImage"
      download="some_name.png"
      height="300"
      aspectRatio="1"
    >

    <v-card-actions class="justify-end">
      <v-btn
        data-cy="send-btn"
        disabled
        class="ms-2"
        prepend-icon="mdi-instagram"
      >
        {{ $t('btnSendInstagram') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
