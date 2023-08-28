<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const { fetchText } = useHaikuStore();
const {
    haiku,
    loading,
    optionFilter,
    optionMinSentimentScore,
    optionMinMarkovScore,
    optionUseAI,
    optionUseCache,
} = storeToRefs(useHaikuStore());

const hasDescription = computed(() => {
    return haiku.value?.description && optionUseAI.value;
});

const advancedMode = computed({
    get: () => false == optionUseCache.value,
    set: (newValue) => {
        optionUseCache.value = !optionUseCache.value;
        if (true === newValue) {
            optionUseAI.value = false;
        }
    }
});
</script>

<template>
  <v-card
    :loading="loading"
    class="mx-auto pa-4 mb-6"
    color="third"
  >
    <v-card-title>⚙️ 🤖</v-card-title>

    <v-card-text>
      <v-switch
        v-model="advancedMode"
        data-cy="switch-cache-btn"
        color="primary"
        hide-details
        label="Advanced Mode"
        class="text-primary"
      />

      <v-expand-transition>
        <v-sheet
          v-show="advancedMode"
          class="px-6 py-4 mb-4"
          color="secondary"
          elevation="3"
        >
          <v-text-field
            v-model="optionFilter"
            placeholder="Enter a word"
            color="primary"
            label="Filter in quotes"
            variant="underlined"
            @keydown.enter="fetchText"
          />
        </v-sheet>
      </v-expand-transition>

      <v-expand-transition>
        <v-sheet
          v-show="advancedMode"
          class="pa-2 py-4 mb-4"
          color="secondary"
          elevation="3"
        >
          <v-tooltip
            text="A numerical measure of the text's emotional tone: positive values indicate positive emotions, negative values indicate negative emotions, and neutral indicates no strong emotions."
            location="bottom"
            max-width="300"
          >
            <template #activator="{ props }">
              <span v-bind="props">Sentiment Score <v-icon class="icon">
                mdi-emoticon-outline
              </v-icon></span>
            </template>
          </v-tooltip>

          <v-slider
            v-model="optionMinSentimentScore"
            label="Min"
            thumb-label
            color="third"
            :min="-1"
            :max="0.2"
            :step="0.05"
            hide-details
            class="ma-6"
          />

          <v-tooltip
            text="A score representing the likelihood of transitioning from one quote to another, used to generate a natural flow between quotes."
            location="bottom"
            max-width="300"
          >
            <template #activator="{ props }">
              <span v-bind="props">Markov Chain Score <v-icon class="icon">
                mdi-link-variant
              </v-icon></span>
            </template>
          </v-tooltip>

          <v-slider
            v-model="optionMinMarkovScore"
            label="Min"
            thumb-label
            color="third"
            :min="0"
            :max="1"
            :step="0.05"
            hide-details
            class="ma-6"
          />
        </v-sheet>
      </v-expand-transition>

      <v-tooltip
        text="Uses GPT-4 to select and describe haikus with the most insightful moments."
        location="bottom"
        max-width="300"
      >
        <template #activator="{ props }">
          <v-switch
            v-bind="props"
            :disabled="advancedMode"
            v-model="optionUseAI"
            data-cy="switch-api-btn"
            color="primary"
            hide-details
            label="IA Boost Selection"
            class="text-primary"
          />
        </template>
      </v-tooltip>
    </v-card-text>

    <v-expand-transition>
      <v-sheet
        v-if="hasDescription"
        data-cy="🤖-description"
        class="pa-4 mb-4"
        color="primary"
        elevation="3"
      >
        <b>
          “{{ haiku.title }}”
        </b>

        <p class="text-body-1">
          ~~~
        </p>

        <p>
          {{ haiku.description }}
        </p>
      </v-sheet>
    </v-expand-transition>
  </v-card>
</template>
