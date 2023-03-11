<script lang="ts" setup>
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';
import AppLoading from '@/components/AppLoading.vue';

const { haiku, loading, useAI } = storeToRefs(useHaikuStore());
</script>

<template>
  <v-card
    :loading="loading"
    class="mx-auto pa-4 mb-6"
    color="third"
  >
    <app-loading v-if="loading" />

    <v-sheet
      class="pa-4"
      color="third"
    >
      <v-switch
        v-model="useAI"
        data-cy="switch-api-btn"
        color="primary"
        hide-details
        label="Boost the relevance of Haiku generated with AI"
      />
    </v-sheet>

    <v-sheet
      v-if="haiku && haiku.description && useAI"
      data-cy="🤖-description"
      class="pa-4"
      color="secondary"
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
