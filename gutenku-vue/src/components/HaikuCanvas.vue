<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { haiku, loading } = storeToRefs(useHaikuStore())

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
    class="mx-auto pa-10 mb-6 justify-center order-last"
    :loading="loading"
  >
    <img
      @contextmenu.prevent
      alt="Haiku Generated"
      :src="haikuImage"
      height="300"
      aspectRatio="1"
    >

    <v-card-actions class="justify-end">
      <v-btn
        @click="downloadImage"
        data-cy="download-btn"
        class="ms-2"
        prepend-icon="mdi-download"
      >
        {{ $t('btnDownload') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
