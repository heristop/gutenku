<script lang="ts" setup>
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Check if View Transition API is supported
const supportsViewTransition = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

// Intercept link clicks to trigger View Transition
onBeforeMount(() => {
  if (!supportsViewTransition()) {
    return;
  }

  // Override router navigation to use View Transitions
  const originalPush = router.push.bind(router);
  const originalReplace = router.replace.bind(router);

  const navigateWithTransition = async (
    method: typeof originalPush,
    to: Parameters<typeof originalPush>[0]
  ) => {
    return new Promise((resolve) => {
      (document as Document & {
        startViewTransition: (cb: () => void) => { finished: Promise<void> }
      }).startViewTransition(() => {
        method(to).then(resolve);
      });
    });
  };

  router.push = (to) => navigateWithTransition(originalPush, to) as ReturnType<typeof originalPush>;
  router.replace = (to) => navigateWithTransition(originalReplace, to) as ReturnType<typeof originalReplace>;
});
</script>

<template>
  <main id="main-content" class="gutenku-app-background" tabindex="-1">
    <router-view />
  </main>
</template>

<style lang="scss" scoped>
.gutenku-app-background {
  transition: var(--gutenku-transition-zen);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
