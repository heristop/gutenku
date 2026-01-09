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
import { Feather } from 'lucide-vue-next';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useToast } from '@/core/composables/toast';
import { usePwaInstall } from '@/core/composables/pwa-install';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { closeWSClient } from '@/client';
import HaikuTitle from '@/features/haiku/components/HaikuTitle.vue';
import AppLoading from '@/core/components/AppLoading.vue';

// Async components with SSR-safe loading
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

const PullToRefresh = defineAsyncComponent(
  () => import('@/core/components/PullToRefresh.vue'),
);

// Note: PullToRefresh is async because it's not needed during SSR

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

// Pull-to-refresh (SSR-safe: browser APIs accessed in onMounted)
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

          <div
            v-if="!haiku && loading"
            class="haiku-section__chapter haiku-section__placeholder"
          >
            <div class="placeholder-header">
              <span class="placeholder-header__icon" aria-hidden="true">
                <Feather :size="24" />
              </span>
              <span class="placeholder-header__content">
                <span class="placeholder-header__title">{{
                  t('toolbar.title')
                }}</span>
                <span class="placeholder-header__subtitle">{{
                  t('toolbar.subtitle')
                }}</span>
              </span>
            </div>
            <ZenSkeleton variant="title" :lines="1" />
            <ZenSkeleton variant="text" :lines="5" />
          </div>

          <SocialPreviewCard
            v-if="isDev && optionUseAI"
            class="haiku-section__preview"
          />
        </article>

        <aside
          class="haiku-grid__sidebar haiku-page__sidebar"
          :aria-label="t('haiku.controlsLabel')"
        >
          <ToolbarPanel class="haiku-section__toolbar" />

          <HaikuCanvas class="haiku-section__canvas" />

          <StatsPanel class="haiku-section__stats" />

          <ConfigPanel />
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

.haiku-section__preview {
  margin-top: var(--gutenku-space-4);
}

.haiku-section__placeholder {
  background: var(--gutenku-zen-paper);
  border-radius: var(--gutenku-radius-lg);
  padding: 2rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: var(--gutenku-shadow-sm);
}

.placeholder-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--gutenku-zen-primary);
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.025em;
  }

  &__subtitle {
    font-size: 0.875rem;
    color: var(--gutenku-text-muted);
    margin-top: 0.125rem;
  }
}

[data-theme='dark'] .placeholder-header {
  &__icon {
    color: var(--gutenku-zen-accent);
  }
}
</style>
