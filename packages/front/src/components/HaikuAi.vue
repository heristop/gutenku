<script lang="ts" setup>
import { computed } from 'vue';
import { useHaikuStore } from '@/store/haiku';
import { storeToRefs } from 'pinia';
import AppLoading from '@/components/AppLoading.vue';

const { haiku, loading, useAI } = storeToRefs(useHaikuStore());

const hasDescription = computed(() => {
    return haiku.value?.description && useAI.value;
});
</script>

<template>
  <v-card
    :loading="loading"
    class="mx-auto pa-4 mb-6"
    color="third"
  >
    <v-card-title>🤖 ⚙️</v-card-title>

    <v-card-text>
      <v-switch
        v-model="useAI"
        data-cy="switch-api-btn"
        color="primary"
        hide-details
        label="Activate this option to select a haiku with a better moment of insight"
      />
    </v-card-text>

    <app-loading
      v-if="loading"
      :color="hasDescription ? 'white' : 'primary'"
    />

    <v-sheet
      v-if="hasDescription"
      transition="fade-transition"
      data-cy="🤖-description"
      class="pa-4"
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
  </v-card>
</template>
