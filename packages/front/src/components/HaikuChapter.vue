<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { load } from '@fingerprintjs/botd'
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import HighLightText from '@/components/HighLightText.vue';

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}

onMounted(() => {
    const botdPromise = load();

    botdPromise.then((botd) => {
        if (true === botd.detect().bot) {
            blackMarker.value = false;
        }
    });
})
</script>

<template>
  <v-card
    v-if="haiku"
    :loading="loading"
    color="secondary"
    class="pa-4 align-center justify-center"
  >
    Disclose chapter where quotes were extracted
    <v-row>
      <v-col>
        <v-tooltip
          :disabled="!blackMarker"
          text="Disclose / Hide"
          location="bottom"
          aria-label="Disclose / Hide"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="blackMarker ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off'"
              @click="toggle()"
              color="primary"
              alt="Disclose / Hide"
              aria-label="Disclose / Hide"
              title="Disclose / Hide"
              data-cy="light-toggle-btn"
              size="small"
            />
          </template>
        </v-tooltip>
      </v-col>
    </v-row>

    <v-row
      class="book"
      @click="toggle()"
    >
      <v-col>
        <h1
          :class="{
            'dark-theme': blackMarker,
            'light-theme': !blackMarker
          }"
          class="ma-4 text-h5 text-center mb-4"
        >
          {{ haiku.book.title }}
        </h1>

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
            <v-expand-transition>
              <v-sheet
                v-if="haiku.chapter.content"
                class="overflow-y-auto chapter"
                max-height="400"
                min-height="200"
              >
                <v-card-text>
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
                </v-card-text>
              </v-sheet>
            </v-expand-transition>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>
