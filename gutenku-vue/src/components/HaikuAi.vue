<script lang="ts" setup>
import { useHaikuStore } from '../store/haiku';
import { storeToRefs } from 'pinia';

const { haiku, loading } = storeToRefs(useHaikuStore());
</script>

<template>
  <v-card
    v-if="haiku && haiku.meaning"
    class="mx-auto pa-10 mb-6 justify-center meaning-card"
    :title="$t('titleAICard')"
    :loading="loading"
    color="primary"
  >
    <p>
      {{ haiku.meaning }}
    </p>
  </v-card>
</template>
