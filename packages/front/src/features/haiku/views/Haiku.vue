<script lang="ts" setup>
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { storeToRefs } from 'pinia';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { withViewTransition } from '@/core/composables/view-transition';
import { useToast } from '@/core/composables/toast';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { usePwaInstall } from '@/core/composables/pwa-install';
import { closeWSClient } from '@/client';
import PullToRefresh from '@/core/components/PullToRefresh.vue';
import HaikuTitle from '@/features/haiku/components/HaikuTitle.vue';
import AppLoading from '@/core/components/AppLoading.vue';

const HaikuCanvas = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/HaikuCanvas.vue'),
  loadingComponent: ZenSkeleton,
});

const HaikuChapter = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/HaikuChapter.vue'),
  loadingComponent: ZenSkeleton,
  delay: 200,
});

const ToolbarPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/ToolbarPanel.vue'),
  loadingComponent: ZenSkeleton,
});

const ConfigPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/ConfigPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const StatsPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/StatsPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const SocialPreviewCard = defineAsyncComponent(
  () => import('@/features/haiku/components/SocialPreviewCard.vue'),
);

const isDev = import.meta.env.DEV;

const { t, tm } = useI18n();
const { error: showError } = useToast();

useSeoMeta({
  ogTitle: 'Free AI Haiku Generator - GutenKu',
  ogDescription:
    'Free haiku generator powered by AI. Create beautiful zen poetry from classic literature. No signup required.',
  ogImage: 'https://gutenku.xyz/og-image.png',
  twitterImage: 'https://gutenku.xyz/og-image.png',
});

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, error, firstLoaded, networkError, loading, optionUseAI } =
  storeToRefs(haikuStore);
const { trackHaikuView } = usePwaInstall();

watch(haiku, (newHaiku) => {
  if (newHaiku) {
    trackHaikuView();
  }
});

const containerRef = ref<HTMLElement | null>(null);
const { pullDistance, isRefreshing, shouldRelease, progress } =
  usePullToRefresh(containerRef, { onRefresh: fetchNewHaiku });

watch(error, (newError) => {
  if (newError && newError !== 'network-error') {
    showError(newError);
    haikuStore.error = '';
  }
});

const literaryLoadingMessages = computed(() => {
  const messages = tm('home.loadingMessages');
  return Object.keys(messages)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => t(`home.loadingMessages.${key}`));
});

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    const messages = literaryLoadingMessages.value;
    const index = Math.floor(Date.now() / 2500) % messages.length;
    return messages[index];
  }
  return t('home.readyMessage');
});

function handleRetry() {
  haikuStore.resetConfigToDefaults();
  fetchNewHaiku();
}

onMounted(fetchNewHaiku);

// Close WebSocket when leaving page to allow bfcache
onUnmounted(closeWSClient);
</script>

<template>
  <div ref="containerRef" class="haiku-page">
    <PullToRefresh
      :pull-distance="pullDistance"
      :is-refreshing="isRefreshing"
      :should-release="shouldRelease"
      :progress="progress"
    />

    <InkBrushNav />

    <div v-if="!firstLoaded && !networkError" class="haiku-page__loading">
      <AppLoading :text="loadingLabel" :splash="true" />
    </div>

    <div v-else-if="networkError" class="haiku-page__error" role="alert">
      <AppLoading
        :splash="true"
        error
        :text="t('home.networkError')"
        :on-retry="handleRetry"
        :retry-label="t('common.retryWithReset')"
      />
    </div>

    <main
      v-else
      id="main-content"
      class="haiku-page__content"
      :aria-busy="loading"
      :aria-label="t('home.haikuContentLabel')"
    >
      <div class="haiku-grid">
        <article class="haiku-grid__main" :aria-label="t('haiku.articleLabel')">
          <HaikuTitle class="haiku-section__title" />

          <HaikuChapter v-if="haiku" class="haiku-section__chapter" />
        </article>

        <aside
          class="haiku-grid__sidebar haiku-page__sidebar"
          :aria-label="t('haiku.controlsLabel')"
        >
          <HaikuCanvas class="haiku-section__canvas" />

          <ToolbarPanel class="haiku-section__toolbar" />

          <StatsPanel class="haiku-section__stats" />

          <ConfigPanel />

          <SocialPreviewCard
            v-if="isDev && optionUseAI"
            class="haiku-section__preview"
          />
        </aside>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.haiku-page {
  min-height: 100vh;
  view-transition-name: haiku-page;

  // Container layout
  width: 100%;
  margin-inline: auto;
  padding: 0.5rem 0.5rem 2rem;

  @media (min-width: 600px) {
    max-width: 900px;
    padding: 1rem 1rem 2rem;
  }
}

.haiku-page__loading,
.haiku-page__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.haiku-page__content {
  animation: fade-in 0.4s ease-out;
}

.haiku-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 960px) {
    flex-direction: row;
  }
}

.haiku-grid__main {
  flex: 1 1 100%;
  order: 1;

  @media (min-width: 960px) {
    flex: 0 0 calc(66.67% - 0.75rem);
  }
}

.haiku-grid__sidebar {
  flex: 1 1 100%;
  order: 2;

  @media (min-width: 960px) {
    flex: 0 0 calc(33.33% - 0.75rem);
  }
}

.haiku-page__sidebar {
  position: sticky;
  top: 1rem;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .haiku-grid {
    gap: 0;
  }

  .haiku-grid__main {
    margin-bottom: 0;
  }

  .haiku-page__sidebar {
    position: static;
  }

  .haiku-section__chapter {
    margin-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .haiku-page__content {
    animation: none;
  }
}

// Spacing for child components
.haiku-section__title {
  margin-bottom: var(--gutenku-space-6);
}

.haiku-section__chapter,
.haiku-section__toolbar,
.haiku-section__stats {
  margin-bottom: var(--gutenku-space-4);
}

.haiku-section__canvas {
  margin-bottom: 0;
}

.haiku-section__preview {
  margin-top: var(--gutenku-space-4);
}
</style>
