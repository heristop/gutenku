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
import { GAME_ENABLED, GamePreview } from '@/features/game';

const Hero = defineAsyncComponent({
  loader: () => import('@/core/components/Hero.vue'),
  loadingComponent: ZenSkeleton,
});

const HaikuPreview = defineAsyncComponent(() => import('@/features/haiku/components/HaikuPreview.vue'));

const { t } = useI18n();
const { fetchGlobalStats } = useGlobalStats();

useSeoMeta({
  ogTitle: 'GutenKu - AI Haiku Generator & Literary Guessing Game',
  ogDescription: 'Generate beautiful haikus from classic literature. Play GutenGuess - guess the book from emoji hints.',
  ogImage: 'https://gutenku.xyz/og-image.png',
  twitterImage: 'https://gutenku.xyz/og-image.png',
});

const showContent = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const { pullDistance, isRefreshing, shouldRelease, progress } = usePullToRefresh(
  containerRef,
  { onRefresh: fetchGlobalStats },
);

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
      <!-- Introduction Section -->
      <div class="hero-wrapper">
        <Hero />
      </div>

      <!-- Preview Cards Grid -->
      <div
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

.home-content {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease-out,
    transform 0.5s ease-out;

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  max-width: 900px;
  margin: 0.5rem auto 4rem;
  padding: 0 1rem;

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
  .home-content {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
