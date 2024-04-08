<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const { fetchNewHaiku } = useHaikuStore();
const { haiku, loading, optionTheme } = storeToRefs(useHaikuStore());

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
};
</script>

<template>
  <v-card
    v-if="haiku"
    :loading="loading"
    class="pa-4 mb-6 align-center justify-center"
    color="accent"
    variant="tonal"
  >
    <v-sheet class="canvas pa-2" elevation="3">
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
        v-model="optionTheme"
        @update:model-value="fetchNewHaiku()"
        label="Theme"
        :items="['random', 'colored', 'greentea', 'watermark', 'landscape']"
        variant="underlined"
        class="text-primary"
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
