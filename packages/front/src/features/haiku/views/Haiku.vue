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
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useToast } from '@/core/composables/toast';
import { usePwaInstall } from '@/core/composables/pwa-install';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { closeWSClient } from '@/client';
import HaikuTitle from '@/features/haiku/components/HaikuTitle.vue';
import AppLoading from '@/core/components/AppLoading.vue';
import SumieCat from '@/core/components/decorative/SumieCat.vue';

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

const StatsPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/StatsPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const ScoringCard = defineAsyncComponent(
  () => import('@/features/haiku/components/ScoringCard.vue'),
);

const SocialPreviewCard = defineAsyncComponent(
  () => import('@/features/haiku/components/SocialPreviewCard.vue'),
);

const PullToRefresh = defineAsyncComponent(
  () => import('@/core/components/PullToRefresh.vue'),
);

const isDev = import.meta.env.DEV;

const { t, tm } = useI18n();
const { error: showError } = useToast();

useSeoMeta({
  ogTitle: 'Haiku Generator - GutenKu',
  ogDescription:
    'Haiku Generator powered by AI. Create beautiful zen poetry from classic literature. No signup required.',
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

// Close WebSocket to prevent blocking bfcache
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

    <div v-if="networkError" class="haiku-page__error" role="alert">
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
        <!-- Cat wrapper for mobile - shows above main content -->
        <div class="haiku-cat-wrapper haiku-cat-wrapper--mobile">
          <SumieCat v-if="loading || !haiku" />
        </div>

        <article class="haiku-grid__main" :aria-label="t('haiku.articleLabel')">
          <HaikuTitle class="haiku-section__title" />

          <HaikuChapter v-if="haiku" class="haiku-section__chapter" />

          <div v-if="!haiku" class="haiku-section__chapter book-skeleton">
            <div class="book-skeleton__spine" aria-hidden="true" />
            <div class="book-skeleton__texture" aria-hidden="true" />

            <header class="book-skeleton__header">
              <span class="book-skeleton__icon" aria-hidden="true">
                <Feather :size="20" />
              </span>
              <h2 class="book-skeleton__title">{{ t('skeleton.title') }}</h2>
              <p class="book-skeleton__subtitle">
                {{ t('skeleton.subtitle') }}
              </p>
            </header>

            <div
              class="book-skeleton__haiku"
              aria-busy="true"
              :aria-label="loadingLabel"
            >
              <span class="book-skeleton__line book-skeleton__line--short" />
              <span class="book-skeleton__line book-skeleton__line--long" />
              <span class="book-skeleton__line book-skeleton__line--short" />
            </div>

            <div class="book-skeleton__prose">
              <ZenSkeleton variant="text" :lines="4" />
            </div>
          </div>
        </article>

        <aside
          class="haiku-grid__sidebar haiku-page__sidebar"
          :aria-label="t('haiku.controlsLabel')"
        >
          <!-- Cat wrapper for desktop - shows above toolbar -->
          <div class="toolbar-wrapper haiku-cat-wrapper--desktop">
            <SumieCat v-if="loading || !haiku" />
            <ToolbarPanel class="haiku-section__toolbar" />
          </div>

          <SocialPreviewCard
            v-if="isDev && optionUseAI"
            class="haiku-section__preview"
          />

          <HaikuCanvas class="haiku-section__canvas" />

          <ScoringCard
            v-if="haiku?.quality"
            :quality="haiku.quality"
            :visible="!loading"
            class="haiku-section__scoring"
          />

          <StatsPanel class="haiku-section__stats" />
        </aside>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.haiku-page {
  min-height: 100vh;
  view-transition-name: haiku-page;
  width: 100%;
  margin-inline: auto;
  padding: 0.5rem 0.5rem 2rem;

  @media (min-width: 600px) {
    max-width: 900px;
    padding: 1rem 1rem 2rem;
  }
}

.haiku-section__chapter {
  background: var(--gutenku-paper-bg) !important;
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

.haiku-section__title {
  margin-bottom: var(--gutenku-space-6);
}

.haiku-section__canvas {
  margin-top: var(--gutenku-space-4);
}

.haiku-section__scoring {
  margin-top: var(--gutenku-space-4);
}

.haiku-section__stats {
  margin-top: var(--gutenku-space-6);
}

.haiku-section__toolbar {
  @media (max-width: 960px) {
    display: none;
  }
}

.haiku-section__preview {
  margin-top: var(--gutenku-space-4);
}

// Book skeleton - mimics HaikuChapter book page style
.book-skeleton {
  position: relative;
  background: var(--gutenku-paper-bg);
  border-radius: var(--gutenku-radius-sm);
  padding: 2rem 1.5rem 2rem 2rem;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 2px 4px -1px oklch(0 0 0 / 0.15),
    0 4px 5px 0 oklch(0 0 0 / 0.1),
    0 1px 10px 0 oklch(0 0 0 / 0.08);

  // Entrance animation
  animation: skeleton-emerge 0.6s ease-out;

  // Book spine effect
  &__spine {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      oklch(0 0 0 / 0.12) 0%,
      oklch(0 0 0 / 0.06) 50%,
      oklch(0 0 0 / 0.12) 100%
    );
    z-index: 1;
  }

  // Paper texture overlay
  &__texture {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 20% 50%,
        oklch(0.5 0.02 60 / 0.03) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        oklch(0.6 0.02 45 / 0.02) 0%,
        transparent 40%
      );
    z-index: 0;
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    padding-bottom: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid oklch(0 0 0 / 0.08);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--gutenku-zen-accent) 50%,
        transparent 100%
      );
      opacity: 0.4;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gutenku-zen-primary);
    opacity: 0.7;
    animation: icon-float 3s ease-in-out infinite;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.05em;
    margin: 0;
  }

  &__subtitle {
    font-size: 0.85rem;
    color: var(--gutenku-text-muted);
    font-style: italic;
    margin: 0;
  }

  // Haiku skeleton lines (5-7-5 structure)
  &__haiku {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
    padding: 1.5rem 0;
  }

  &__line {
    height: 1.25rem;
    border-radius: var(--gutenku-radius-xs);
    background: linear-gradient(
      90deg,
      var(--gutenku-zen-mist) 0%,
      var(--gutenku-zen-water) 50%,
      var(--gutenku-zen-mist) 100%
    );
    background-size: 200% 100%;
    transform-origin: center;

    // Wow: Ink bloom + float + shimmer
    animation:
      ink-bloom 0.8s ease-out forwards,
      haiku-float 3s ease-in-out infinite 0.8s,
      zen-shimmer 2s ease-in-out infinite 0.8s;

    &--short {
      width: 35%;
    }

    &--long {
      width: 50%;
    }

    // Staggered delays for each line
    &:nth-child(1) {
      animation-delay: 0.1s, 0.9s, 0.9s;
    }

    &:nth-child(2) {
      animation-delay: 0.25s, 1.05s, 1.05s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s, 1.2s, 1.2s;
    }
  }

  &__prose {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding-top: 1rem;
    opacity: 0.6;
  }
}

// Dark mode adjustments
[data-theme='dark'] .book-skeleton {
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.4),
    0 2px 4px oklch(0 0 0 / 0.3);

  &__spine {
    background: linear-gradient(
      to bottom,
      oklch(1 0 0 / 0.08) 0%,
      oklch(1 0 0 / 0.03) 50%,
      oklch(1 0 0 / 0.08) 100%
    );
  }

  &__icon {
    color: var(--gutenku-zen-accent);
  }

  &__header {
    border-bottom-color: oklch(1 0 0 / 0.1);
  }
}

// Keyframe animations
@keyframes skeleton-emerge {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ink-bloom {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes haiku-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes zen-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes icon-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-2px) rotate(3deg);
    opacity: 1;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .book-skeleton {
    animation: none;

    &__line {
      animation: none;
      opacity: 0.7;
      transform: scaleX(1);
    }

    &__icon {
      animation: none;
    }
  }
}

// Wrapper for ToolbarPanel to position cat above
.toolbar-wrapper {
  position: relative;
  overflow: visible;
}

// Cat wrappers - show appropriate one based on screen size
.haiku-cat-wrapper {
  position: relative;
  height: 48px;
  overflow: visible;

  @media (max-width: 767px) {
    height: 40px;
  }
}

.haiku-cat-wrapper--mobile {
  display: block;
  order: -1; // Show at top on mobile
  margin-bottom: 0.5rem;

  @media (min-width: 961px) {
    display: none;
  }
}

.haiku-cat-wrapper--desktop {
  :deep(.sumi-cat-container) {
    display: none;

    @media (min-width: 961px) {
      display: block;
    }
  }
}
</style>
