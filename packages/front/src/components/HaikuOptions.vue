<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import HaikuLogs from '@/components/HaikuLogs.vue';

const { fetchNewHaiku } = useHaikuStore();
const {
    haiku,
    loading,
    optionFilter,
    optionMinSentimentScore,
    optionMinMarkovScore,
    optionDescriptionTemperature,
    optionUseAI,
    optionUseCache,
} = storeToRefs(useHaikuStore());

const hasDescription = computed(() => {
    return haiku.value?.description && optionUseAI.value;
});

const sentimenticon = computed(() => {
    if (optionMinSentimentScore.value > 0) {
        return 'mdi-emoticon-outline';
    }

    if (optionMinSentimentScore.value < 0) {
        return 'mdi-emoticon-sad-outline';
    }

    return 'mdi-emoticon-neutral-outline';
});

function getThermometer(temperature: number) {
    if (temperature > 0.7) {
        return 'mdi-thermometer-high';
    }

    if (temperature < 0.3) {
        return 'mdi-thermometer-low';
    }

    return 'mdi-thermometer';
}

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
  <v-sheet
    color="secondary"
    class="text-center"
  >
    <v-sheet
      class="mt-6"
      color="secondary"
    >
      <v-tooltip
        :disabled="loading"
        text="Display a new Haiku"
        aria-label="Display a new Haiku"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :disabled="loading"
            :icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'"
            @click="fetchNewHaiku()"
            alt="Generate a new Haiku"
            color="primary"
            data-cy="options-fetch-btn"
            size="small"
          />
        </template>
      </v-tooltip>
    </v-sheet>

    <v-card-text>
      <v-switch
        v-model="advancedMode"
        data-cy="switch-cache-btn"
        color="white"
        hide-details
        label="Advanced Mode"
      />

      <v-expand-transition>
        <v-sheet
          v-show="advancedMode"
          class="px-6 py-4 mb-4"
          color="primary"
          elevation="3"
          rounded
        >
          <v-text-field
            v-model="optionFilter"
            placeholder="Enter a word"
            color="primary"
            label="Filter in quotes"
            variant="underlined"
            @keydown.enter="fetchNewHaiku"
          />
        </v-sheet>
      </v-expand-transition>

      <v-expand-transition>
        <v-sheet
          v-show="advancedMode"
          class="pa-2 py-4 mb-4"
          color="primary"
          elevation="3"
          rounded
        >
          <v-tooltip
            text="A numerical measure of the text's emotional tone: positive values indicate positive emotions, negative values indicate negative emotions, and neutral indicates no strong emotions."
            location="bottom"
            max-width="300"
          >
            <template #activator="{ props }">
              <span v-bind="props">Sentiment Score <v-icon class="icon">
                {{ sentimenticon }} </v-icon></span>
            </template>
          </v-tooltip>

          <v-slider
            v-model="optionMinSentimentScore"
            label="Min"
            thumb-label
            color="accent"
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
            color="accent"
            :min="0"
            :max="1"
            :step="0.05"
            hide-details
            class="ma-6"
          />

          <haiku-logs v-if="false === optionUseCache" />
        </v-sheet>
        />
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
            color="white"
            hide-details
            label="IA Boost Selection"
          />
        </template>
      </v-tooltip>

      <v-expand-transition>
        <v-sheet
          v-show="optionUseAI"
          class="pa-2 py-4"
          color="primary"
          elevation="3"
          rounded
        >
          <v-tooltip
            text="This temperature setting influences the randomness of the description generated for the selected haiku. A lower value will produce a more concise and deterministic description, while a higher value allows for a more creative and unpredictable explanation."
            location="bottom"
            max-width="300"
          >
            <template #activator="{ props }">
              <span v-bind="props">Description Temperature <v-icon class="icon">
                {{ getThermometer(optionDescriptionTemperature) }}
              </v-icon></span>
            </template>
          </v-tooltip>

          <v-slider
            v-model="optionDescriptionTemperature"
            label="Temp"
            thumb-label
            color="accent"
            :min="0"
            :max="0.40"
            :step="0.05"
            hide-details
            class="ma-6"
          />
        </v-sheet>
      </v-expand-transition>
    </v-card-text>

    <v-expand-transition>
      <v-sheet
        v-if="hasDescription"
        data-cy="🤖-description"
        class="pa-8 mx-4 mb-4"
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
  </v-sheet>
</template>

<style>
.v-switch .v-switch__thumb {
  background-color: rgb(var(--v-theme-accent)) !important;
}

.v-switch__track {
  background-color: white !important;
}
</style>
