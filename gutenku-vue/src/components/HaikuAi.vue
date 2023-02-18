<script lang="ts" setup>
import { useHaikuStore } from '../store/haiku'
import { storeToRefs } from 'pinia'

const { haiku, loading } = storeToRefs(useHaikuStore());
</script>

<template>
  <v-card
    v-if="haiku && haiku.meaning"
    class="mx-auto pa-10 mb-6 justify-center meaning-card"
    :title="$t('titleMeaningCard')"
    :loading="loading"
    color="primary"
  >
    {{ haiku.meaning }}
  </v-card>
</template>

<style scoped>
.meaning-card {
    background: transparent url('/src/assets/img/pf-s100-a02-mockup_blue.jpg') no-repeat center/100% !important;
}
</style>