<script lang="ts" setup>
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { haiku, loading, useAI } = storeToRefs(useHaikuStore());
</script>

<template>
  <v-card
    v-if="haiku && haiku.description && useAI"
    :loading="loading"
    class="mx-auto pa-10 mb-6 justify-center"
    title="🤖"
    data-cy="🤖-card"
    color="primary"
  >
    <p>
      “{{ haiku.title }}”
    </p>

    <p>~~~</p>

    <p>
      {{ haiku.description }}
    </p>
  </v-card>
</template>
