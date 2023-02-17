<script lang="ts" setup>
import { ref } from 'vue';
import HighlightText from '@/components/HighlightText.vue';
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}
</script>

<template>
  <v-card
    v-if="haiku"
    :loading="loading"
    class="paragraphes pa-10 align-center justify-centert"
  >
    <v-btn
      color="primary"
      :icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
      size="small"
      @click="toggle()"
    />

    <h3
      :class="{
        'dark-theme': blackMarker,
        'light-theme': !blackMarker
      }"
      class="ma-4 text-h5 text-center mb-4"
    >
      {{ haiku.book.title }}
    </h3>

    <div
      :class="{
        'dark-theme': blackMarker,
        'light-theme': !blackMarker
      }"
      class="text-center mb-6 author"
    >
      {{ haiku.book.author }}
    </div>

    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <p
          :class="{
            'dark-theme': blackMarker,
            'light-theme': !blackMarker
          }"
        >
          <highlight-text
            :text="haiku.chapter.content"
            :lines="haiku.raw_verses"
          />
        </p>
      </v-col>
    </v-row>
  </v-card>
</template>