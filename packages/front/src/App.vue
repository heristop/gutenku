<script lang="ts" setup>
import { onMounted } from 'vue';
import PwaInstallBanner from '@/core/components/ui/PwaInstallBanner.vue';

onMounted(() => {
  // Defer analytics to idle callback (client-side only)
  if ('requestIdleCallback' in globalThis) {
    requestIdleCallback(() => import('./analytics-setup'));
    return;
  }

  setTimeout(() => import('./analytics-setup'), 2000);
});
</script>

<template>
  <router-view />
  <client-only>
    <PwaInstallBanner />
  </client-only>
</template>
