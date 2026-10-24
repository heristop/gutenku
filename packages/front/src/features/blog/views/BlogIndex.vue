<script lang="ts" setup>
import { useSeoMeta } from '@unhead/vue';
import { Rss } from '@/core/components/icons/ink';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { toRomanNumeral, useArticles } from '../composables';

const { t } = useI18n();
const { articles, formatDate, getReadingTime } = useArticles();

// Issues are numbered from the first article ever published
function issueNumber(index: number): number {
  return articles.value.length - index;
}

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
      <a
        href="/feed.xml"
        class="blog-index__rss"
        target="_blank"
        rel="noopener"
        :title="t('blog.rss')"
      >
        <Rss :size="14" aria-hidden="true" />
        <span>{{ t('blog.rss') }}</span>
      </a>
    </header>

    <BrushRule class="blog-index__divider" aria-hidden="true" />

    <p v-if="!articles.length" class="blog-index__empty">
      {{ t('blog.empty') }}
    </p>

    <ol v-else class="blog-index__list">
      <li
        v-for="(article, index) in articles"
        :key="article.slug"
        class="blog-index__card"
      >
        <article class="blog-index__article">
          <h2
            class="blog-index__article-title"
            :style="{ viewTransitionName: `blog-title-${article.slug}` }"
          >
            <RouterLink
              :to="{ name: 'BlogArticle', params: { slug: article.slug } }"
              class="blog-index__title-link"
            >
              {{ article.title }}
            </RouterLink>
          </h2>

          <div class="blog-index__meta">
            <InkStamp
              :label="toRomanNumeral(issueNumber(index))"
              tone="ink"
              :size="34"
              :tilt="3"
            />
            <span class="sr-only">
              {{ t('blog.issue', { number: issueNumber(index) }) }}
            </span>
            <time
              class="blog-index__date"
              :datetime="article.date.toISOString()"
              >{{ formatDate(article.date) }}</time
            >
            <span aria-hidden="true">·</span>
            <span class="blog-index__reading-time">
              {{ t('blog.minRead', { min: getReadingTime(article.content) }) }}
            </span>
          </div>

          <p class="blog-index__description">{{ article.description }}</p>
        </article>
      </li>
    </ol>
  </div>
</template>

<style lang="scss" scoped>
.blog-index {
  max-width: 820px;
  margin: 0.5rem auto 3rem;
  padding: 1.5rem 1.125rem 1rem;
  background: var(--gk-paper);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);

  @media (min-width: 600px) {
    padding: 2.5rem 2.5rem 1.5rem;
  }

  &__header {
    display: grid;
    justify-items: start;
    gap: 0.875rem;
  }

  &__title {
    margin: 0;
    font-size: clamp(2.5rem, 7vw, 4rem);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.045em;
    text-wrap: balance;
  }

  &__subtitle {
    max-width: 52ch;
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    color: var(--gk-ink-soft);
  }

  &__rss {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.75rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.25em;

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  // A single stroke: the label-less primitive would leave a gap mid-rule
  &__divider {
    margin: 1rem 0 0.5rem;
    padding: 0;

    :deep(.brush-rule__stroke--end) {
      display: none;
    }
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__card {
    padding: 2rem 0;
    border-bottom: var(--gk-rule-faint);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__article {
    display: grid;
    gap: 0.75rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
  }

  &__date {
    text-transform: capitalize;
  }

  &__reading-time {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  &__article-title {
    margin: 0;
    max-width: 24ch;
    font-size: clamp(1.5rem, 3.6vw, 2.125rem);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  &__title-link {
    color: inherit;
    text-decoration: none;
    border-radius: var(--gk-radius-control);

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
        text-decoration-thickness: 1.5px;
        text-underline-offset: 0.12em;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }
  }

  &__empty {
    max-width: 52ch;
    margin: 0;
    padding: 2.5rem 0 2rem;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--gk-ink-soft);
  }

  &__description {
    max-width: 62ch;
    margin: 0;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--gk-ink-soft);
  }
}

// Every page starts the same distance below the header's rule
.blog-index {
  margin-top: var(--gk-page-top);
}
</style>
