<script lang="ts" setup>
import { useSeoMeta } from '@unhead/vue';
import { ArrowRight } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import { useArticles } from '../composables';

const { t } = useI18n();
const { articles, formatDate, getReadingTime } = useArticles();

useSeoMeta({
  title: 'Blog - GutenKu',
  description:
    'Articles about GutenKu, AI haiku generation, genetic algorithms, and classic literature.',
  ogTitle: 'GutenKu Blog',
  ogDescription:
    'Articles about GutenKu, AI haiku generation, genetic algorithms, and classic literature.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <div class="blog-index">
    <header class="blog-index__header">
      <h1 class="blog-index__title">{{ t('blog.title') }}</h1>
      <p class="blog-index__subtitle">
        {{ t('blog.subtitle') }}
      </p>
    </header>

    <!-- Ink brush divider -->
    <div class="blog-index__divider" aria-hidden="true" />

    <div class="blog-index__list">
      <ZenCard
        v-for="(article, index) in articles"
        :key="article.slug"
        v-motion
        class="blog-index__card"
        :initial="{ opacity: 0, y: 30, scale: 0.95 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: index * 100,
            duration: 500,
            ease: [0.25, 0.8, 0.25, 1],
          },
        }"
      >
        <article class="blog-index__article">
          <div class="blog-index__meta">
            <time class="blog-index__date">{{ formatDate(article.date) }}</time>
            <span class="blog-index__reading-time">
              {{ t('blog.minRead', { min: getReadingTime(article.content) }) }}
            </span>
          </div>

          <h2
            class="blog-index__article-title"
            :style="{ viewTransitionName: `blog-title-${article.slug}` }"
          >
            {{ article.title }}
          </h2>

          <p class="blog-index__description">{{ article.description }}</p>

          <RouterLink
            :to="{ name: 'BlogArticle', params: { slug: article.slug } }"
            class="blog-index__read-more"
          >
            <span class="link-highlight">{{ t('blog.readArticle') }}</span>
            <ArrowRight :size="14" />
          </RouterLink>
        </article>
      </ZenCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.blog-index {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem;
  padding-bottom: 2rem;

  @media (min-width: 375px) {
    padding: 0.5rem;
    padding-bottom: 2rem;
  }

  @media (min-width: 600px) {
    padding: 1.5rem;
    padding-bottom: 1.5rem;
  }

  &__header {
    text-align: center;
    margin-bottom: 1rem;
    padding: 0 0.5rem;

    @media (min-width: 375px) {
      margin-bottom: 1.25rem;
    }

    @media (min-width: 600px) {
      margin-bottom: 1.5rem;
      padding: 0;
    }
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    margin: 0 0 0.5rem;

    @media (min-width: 375px) {
      font-size: 1.75rem;
    }

    @media (min-width: 600px) {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    margin: 0;
    font-style: italic;

    @media (min-width: 600px) {
      font-size: 1rem;
    }
  }

  &__divider {
    height: 2px;
    margin: 1rem auto 1.5rem;
    max-width: 150px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.3)) 20%,
      var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.5)) 50%,
      var(--gutenku-zen-ink, oklch(0.35 0.02 260 / 0.3)) 80%,
      transparent 100%
    );
    border-radius: 1px;
    animation: divider-draw 1.2s ease-out forwards;
    transform-origin: center;

    @media (min-width: 375px) {
      margin: 1.25rem auto 1.75rem;
      max-width: 175px;
    }

    @media (min-width: 600px) {
      margin: 1.5rem auto 2rem;
      max-width: 200px;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media (min-width: 600px) {
      gap: 2rem;
    }
  }

  &__card {
    padding: 1.25rem;

    @media (min-width: 375px) {
      padding: 1.5rem;
    }

    @media (min-width: 600px) {
      padding: 2rem;
    }
  }

  &__article {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    @media (min-width: 600px) {
      gap: 1rem;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  &__date {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    text-transform: capitalize;

    @media (min-width: 600px) {
      font-size: 0.875rem;
    }
  }

  &__reading-time {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    opacity: 0.8;

    @media (min-width: 600px) {
      font-size: 0.8rem;
    }
  }

  &__article-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
    margin: 0;
    line-height: 1.3;

    @media (min-width: 375px) {
      font-size: 1.3rem;
    }

    @media (min-width: 600px) {
      font-size: 1.5rem;
    }
  }

  &__description {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    line-height: 1.6;
    margin: 0;

    @media (min-width: 600px) {
      font-size: 1rem;
      line-height: 1.7;
    }
  }

  &__read-more {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    align-self: flex-start;
    text-decoration: none;

    .link-highlight::after {
      height: 38%;
      top: 42%;
      background: linear-gradient(
        172deg,
        color-mix(in oklch, var(--gutenku-zen-secondary) 15%, transparent) 0%,
        color-mix(in oklch, var(--gutenku-zen-secondary) 35%, transparent) 45%,
        color-mix(in oklch, var(--gutenku-zen-secondary) 25%, transparent) 100%
      );
    }

    svg {
      color: var(--gutenku-zen-secondary);
      transition: transform 0.2s ease;
    }

    &:hover svg {
      transform: translateX(4px) translateY(-2px);
    }
  }
}

@keyframes divider-draw {
  0% {
    transform: scaleX(0);
    opacity: 0;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}

// Dark theme
[data-theme='dark'] .blog-index {
  &__header {
    position: relative;
    padding: 1rem 1.25rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    background: oklch(0.12 0.02 60 / 0.5);
    backdrop-filter: blur(12px);
    border-radius: 1rem;
    border: 1px solid var(--gutenku-paper-border);
    box-shadow: var(--gutenku-shadow-glass);

    @media (min-width: 375px) {
      padding: 1.25rem 1.5rem;
    }

    @media (min-width: 600px) {
      margin-left: 0;
      margin-right: 0;
      padding: 1.5rem 2rem;
    }
  }

  &__title {
    color: var(--gutenku-text-primary);
    text-shadow: 0 2px 8px oklch(0 0 0 / 0.3);
  }

  &__subtitle {
    color: var(--gutenku-text-accent);
  }

  &__divider {
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-secondary) 20%,
      var(--gutenku-zen-accent) 50%,
      var(--gutenku-zen-secondary) 80%,
      transparent 100%
    );
    opacity: 0.6;
  }
}
</style>
