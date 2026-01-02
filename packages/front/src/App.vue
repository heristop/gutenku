<script lang="ts" setup>
import { onMounted } from 'vue';
import PwaInstallBanner from '@/components/ui/PwaInstallBanner.vue';

onMounted(() => {
  // Defer analytics to idle callback
  if ('requestIdleCallback' in globalThis) {
    requestIdleCallback(() => import('./analytics-setup'));
  } else {
    setTimeout(() => import('./analytics-setup'), 2000);
  }
});
</script>

<template>
  <router-view />
  <PwaInstallBanner />
</template>
