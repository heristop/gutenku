<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '@/store/haiku';
import { storeToRefs } from 'pinia';

const { fetchText } = useHaikuStore();
const { haiku, loading, theme } = storeToRefs(useHaikuStore());

const haikuImage = computed(() => {
    if (!haiku.value) {
        return;
    }

    return `data:image/png;base64,${haiku.value.image}`;
});

const downloadImage = () => {
    const imageData = haikuImage.value as string;
    const downloadLink = document.createElement('a');
    const bookTitle = haiku.value.book.title;
    const chapterTitle = haiku.value.chapter.title;

    downloadLink.href = imageData;
    downloadLink.download = `${bookTitle}_${chapterTitle}`
        .toLowerCase()
        .replace(/[ ;.,]/g, '_');
    downloadLink.target = '_blank';
    downloadLink.click();
}
</script>

<template>
  <v-card
    v-if="haiku"
    :loading="loading"
    class="pa-4 mb-6 align-center justify-center"
    color="white"
  >
    <v-sheet
      class="canvas"
      elevation="3"
    >
      <v-img
        :src="haikuImage"
        :lazy-src="haikuImage"
        :alt="haiku.verses.join(', ')"
        aspect-ratio="1/1"
        cover
        @contextmenu.prevent
      />
    </v-sheet>

    <v-card-actions class="justify-end">
      <v-select
        v-model="theme"
        @update:model-value="fetchText()"
        label="Theme"
        :items="['colored', 'greentea','watermark']"
        variant="underlined"
      />

      <v-btn
        @click="downloadImage"
        data-cy="download-btn"
        class="ms-2"
        color="primary"
        prepend-icon="mdi-download"
      >
        Download
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.canvas {
  img {
    width: 100%;
  }
}
</style>
