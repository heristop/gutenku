<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import HighLightText from '@/components/HighLightText.vue';
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';

const { haiku, loading } = storeToRefs(useHaikuStore());

const blackMarker = ref(true);

const { name } = useDisplay();

const panel = ref();

function toggle(): void {
    blackMarker.value = !blackMarker.value;
}

onMounted(() => {
    console.log(name.value);

    if (false === ['xs'].includes(name.value)) {
        panel.value = ['chapter'];
    }
});
</script>

<template>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel value="chapter">
      <v-expansion-panel-title color="secondary">
        Disclose chapter where quotes were extracted
      </v-expansion-panel-title>
      <v-expansion-panel-text eager>
        <v-sheet
          v-if="haiku"
          :loading="loading"
          color="secondary"
          class="pa-10 align-center justify-center"
          elevation="3"
          rounded
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

          <v-row class="paragraphes">
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
                  <v-sheet
                    class="overflow-y-auto"
                    max-height="450"
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
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-sheet>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
