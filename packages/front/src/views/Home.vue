<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { ChevronDown } from 'lucide-vue-next';
import { withViewTransition } from '@/core/composables/view-transition';
import { useGlobalStats } from '@/core/composables/global-stats';
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import Hero from '@/core/components/Hero.vue';
import { GAME_ENABLED, GamePreview } from '@/features/game';
import { SITE_URL } from '@/locales/config';

const HaikuPreview = defineAsyncComponent(
  () => import('@/features/haiku/components/HaikuPreview.vue'),
);

const { t } = useI18n();
const { fetchGlobalStats } = useGlobalStats();

useSeoMeta({
  ogTitle: 'GutenKu - AI Haiku Generator & Literary Guessing Game',
  ogDescription:
    'Generate beautiful haikus from classic literature. Play GutenGuess - guess the book from emoji hints.',
  ogImage: `${SITE_URL}/og-image.png`,
  twitterImage: `${SITE_URL}/og-image.png`,
});

const showContent = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    withViewTransition(() => {
      showContent.value = true;
    });
  });
});
</script>

<template>
  <div class="home-container">
    <main
      class="home-content"
      :class="{ 'home-content--visible': showContent }"
      :aria-label="t('home.haikuContentLabel')"
    >
      <h1 class="home-title">
        GutenKu <span class="home-title__separator">—</span> Haiku Generator
        from Classic Literature
      </h1>

      <div class="hero-wrapper">
        <Hero />
      </div>

      <div class="scroll-indicator" aria-hidden="true">
        <ChevronDown :size="24" />
      </div>

      <div
        id="preview-grid"
        tabindex="-1"
        class="preview-grid"
        :class="{ 'preview-grid--single': !GAME_ENABLED }"
      >
        <component :is="GamePreview" v-if="GAME_ENABLED" />

        <HaikuPreview />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin-inline: auto;
  padding: 0 0.5rem 0.25rem;

  @media (min-width: 600px) {
    padding: 0 1rem 0.25rem;
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
  margin: 0 auto 0.75rem;
  padding: 0;
  width: 100%;

  @media (min-width: 600px) {
    max-width: 800px;
    padding: 0.25rem;
    margin-bottom: 0.5rem;
  }
}

.home-content {
  opacity: 1;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 900px;
  margin: 0.25rem auto 1.5rem;
  padding: 0 1rem;
  opacity: 0;
  border-radius: var(--gutenku-radius-lg);
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
    padding: 0;
    margin-top: 0;
    margin-bottom: 2rem;
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

.scroll-indicator {
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0 1rem;
    color: var(--gutenku-zen-primary);
    opacity: 0.6;
    animation: scroll-bounce 2s ease-in-out infinite;

    [data-theme='dark'] & {
      color: var(--gutenku-zen-accent);
      opacity: 0.8;
    }
  }
}

@keyframes scroll-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-indicator {
    animation: none;
  }
}

// Screen reader only
.home-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
