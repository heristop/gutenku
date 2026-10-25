<script lang="ts" setup>
import { nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { scrollBehavior } from '@/router';
import {
  isViewTransitionRunning,
  markPageNavigated,
  runViewTransition,
  skipActiveViewTransition,
  supportsViewTransition,
} from '@/core/composables/view-transition';

const router = useRouter();

// Longest the page may stay frozen on its old snapshot while the new route
// renders. Past this the transition captures whatever is there.
const MAX_FREEZE_MS = 500;

if (!import.meta.env.SSR) {
  // main.ts builds the router through ViteSSG without a scroll policy
  if (!router.options.scrollBehavior) {
    router.options.scrollBehavior = scrollBehavior;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  // Set while a page transition waits for the new route to render
  let releaseSnapshot: (() => void) | null = null;

  const isPageChange = (
    to: { path: string },
    from: { path: string; matched: unknown[] },
  ) => from.matched.length > 0 && to.path !== from.path;

  // Runs after lazy route chunks have loaded, so the transition only covers
  // the DOM swap, never a network wait.
  const stopBeforeResolve = router.beforeResolve((to, from) => {
    if (!isPageChange(to, from)) {
      return;
    }

    // A fast second click: finish the running change at once, no new one
    if (isViewTransitionRunning()) {
      skipActiveViewTransition();

      return;
    }

    if (!supportsViewTransition()) {
      return;
    }

    return new Promise<void>((resolveGuard) => {
      // If the browser never calls the update (skipped before capture), the
      // navigation still goes through.
      const guardTimer = setTimeout(resolveGuard, MAX_FREEZE_MS);

      runViewTransition(
        () =>
          new Promise<void>((done) => {
            const freezeTimer = setTimeout(done, MAX_FREEZE_MS);
            releaseSnapshot = () => {
              clearTimeout(freezeTimer);
              done();
            };
            clearTimeout(guardTimer);
            resolveGuard();
          }),
        'page',
      );
    });
  });

  const stopAfterEach = router.afterEach(async (to, from, failure) => {
    if (!failure && isPageChange(to, from)) {
      markPageNavigated();
    }

    // vue-router scrolls on its own nextTick; this one lands after it, so the
    // new snapshot is taken at the right scroll position.
    await nextTick();
    releaseSnapshot?.();
    releaseSnapshot = null;

    if (failure || !isPageChange(to, from)) {
      return;
    }

    // Move focus to the new page unless the page already placed it inside
    const main = document.getElementById('main-content');
    const focused = document.activeElement;

    if (main && !(focused && focused !== main && main.contains(focused))) {
      main.focus({ preventScroll: true });
    }
  });

  onBeforeUnmount(() => {
    stopBeforeResolve();
    stopAfterEach();
    releaseSnapshot?.();
  });
}
</script>

<template>
  <main id="main-content" class="gutenku-app-background" tabindex="-1">
    <router-view />
  </main>
</template>

<style lang="scss" scoped>
.gutenku-app-background {
  flex: 1;
  display: flex;
  flex-direction: column;
  // The page is what changes on navigation: nav, spine and footer stay put
  view-transition-name: gk-page;

  // A landmark that receives focus on route change, not a control
  &:focus {
    outline: none;
  }
}
</style>
