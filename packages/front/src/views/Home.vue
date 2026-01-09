<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { withViewTransition } from '@/core/composables/view-transition';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { useGlobalStats } from '@/core/composables/global-stats';
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import PullToRefresh from '@/core/components/PullToRefresh.vue';
import Hero from '@/core/components/Hero.vue';
import { GAME_ENABLED, GamePreview } from '@/features/game';

const HaikuPreview = defineAsyncComponent(
  () => import('@/features/haiku/components/HaikuPreview.vue'),
);

const { t } = useI18n();
const { fetchGlobalStats } = useGlobalStats();

useSeoMeta({
  ogTitle: 'GutenKu - AI Haiku Generator & Literary Guessing Game',
  ogDescription:
    'Generate beautiful haikus from classic literature. Play GutenGuess - guess the book from emoji hints.',
  ogImage: 'https://gutenku.xyz/og-image.png',
  twitterImage: 'https://gutenku.xyz/og-image.png',
});

const showContent = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const { pullDistance, isRefreshing, shouldRelease, progress } =
  usePullToRefresh(containerRef, { onRefresh: fetchGlobalStats });

onMounted(() => {
  // Wait for next frame before triggering entrance
  requestAnimationFrame(() => {
    withViewTransition(() => {
      showContent.value = true;
    });
  });
});
</script>

<template>
  <div ref="containerRef" class="home-container">
    <PullToRefresh
      :pull-distance="pullDistance"
      :is-refreshing="isRefreshing"
      :should-release="shouldRelease"
      :progress="progress"
    />

    <InkBrushNav />

    <main
      class="home-content"
      :class="{ 'home-content--visible': showContent }"
      :aria-label="t('home.haikuContentLabel')"
    >
      <!-- SEO: H1 in sync content for crawlers -->
      <h1 class="sr-only">GutenKu - Haiku Generator from Classic Literature</h1>

      <!-- Introduction Section -->
      <div class="hero-wrapper">
        <Hero />
      </div>

      <!-- Preview Cards Grid -->
      <div
        id="preview-grid"
        tabindex="-1"
        class="preview-grid"
        :class="{ 'preview-grid--single': !GAME_ENABLED }"
      >
        <HaikuPreview />

        <component :is="GamePreview" v-if="GAME_ENABLED" />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  width: 100%;
  margin-inline: auto;
  padding: 1rem 0.5rem 0.5rem;

  @media (min-width: 600px) {
    padding: 1rem 1rem 0.5rem;
  }

  @media (min-width: 960px) {
    max-width: 900px;
  }

  @media (min-width: 1280px) {
    max-width: 1200px;
  }

  @media (min-width: 1920px) {
    max-width: 1800px;
  }
}

.hero-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.25rem;
  width: 100%;

  @media (min-width: 600px) {
    padding: 0.75rem;
  }
}

// Home content - hero visible immediately for LCP, only grid animates
.home-content {
  opacity: 1;
}

// Preview grid fades in after hero - content-visibility for below-fold optimization
.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0.5rem auto 4rem;
  padding: 0 1rem;
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
  content-visibility: auto;
  contain-intrinsic-size: auto 400px;

  .home-content--visible & {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding: 0 0.75rem;
    margin-top: 0;
    margin-bottom: 4.5rem;
  }

  &--single {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .preview-grid {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
