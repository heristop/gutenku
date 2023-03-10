<script lang="ts" setup>
import { ref } from 'vue';
import HighLightText from '@/components/HighLightText.vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}
</script>

<template>
  <v-card
    title="Disclose chapter where quotes were extracted:"
    v-if="haiku"
    :loading="loading"
    color="secondary"
    class="pa-10 align-center justify-center"
  >
    <v-row>
      <v-col>
        <v-btn
          color="primary"
          :icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
          data-cy="light-toggle-btn"
          size="small"
          @click="toggle()"
        />
      </v-col>
    </v-row>

    <v-row class="paragraphes pa-4">
      <v-col>
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
              <high-light-text
                :text="haiku.chapter.content"
                :lines="haiku.rawVerses"
              />
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
