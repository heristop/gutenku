<script lang="ts" setup>
import { useSeoMeta } from '@unhead/vue';
import { ArrowRight, Rss } from '@/core/components/icons/ink';
import { hasPageNavigated } from '@/core/composables/view-transition';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { toRomanNumeral, useArticles } from '../composables';

const { t } = useI18n();
const { articles, formatDate, getReadingTime } = useArticles();

// A fresh load sets the entries down one after another; arriving from another
// page (or back from an article, whose title morphs home) they are simply there
const quiet = hasPageNavigated();

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

    <ol v-else class="blog-index__list" :class="{ 'is-quiet': quiet }">
      <li
        v-for="(article, index) in articles"
        :key="article.slug"
        class="blog-index__card"
        :style="{ '--entry-index': index }"
      >
        <article class="blog-index__article">
          <!-- The issue number sits in the gutter, as in a book's contents -->
          <div class="blog-index__issue">
            <InkStamp
              :label="toRomanNumeral(issueNumber(index))"
              tone="ink"
              :size="34"
              :tilt="3"
              :stamp="!quiet"
            />
          </div>

          <h2
            class="blog-index__article-title"
            :style="{ viewTransitionName: `blog-title-${article.slug}` }"
          >
            <!-- Stretched over the whole entry: any tap on it reads it -->
            <RouterLink
              :to="{ name: 'BlogArticle', params: { slug: article.slug } }"
              class="blog-index__title-link"
            >
              {{ article.title }}
            </RouterLink>
          </h2>

          <div class="blog-index__meta">
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
            <ArrowRight
              :size="16"
              class="blog-index__onward"
              aria-hidden="true"
            />
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
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);

  // Phones: the sheet keeps the page gutter every other card has, and a
  // little more paper inside, so nothing runs to the glass
  @media (max-width: 599px) {
    width: auto;
    margin-inline: var(--gk-gutter);
    padding: 1.5rem 1.25rem 1rem;
  }

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

  // The whole entry is one target: a soft tint under it on hover, a deeper
  // one under the finger, and the focus ring drawn around all of it
  &__card {
    position: relative;
    padding: 1.75rem 0;
    border-bottom: var(--gk-rule-faint);

    &:last-child {
      border-bottom: 0;
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0.5rem -0.75rem;
      border-radius: var(--gk-radius-paper);
      background: var(--gk-paper-deep);
      opacity: 0;
      transition: opacity 150ms ease;
      pointer-events: none;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover::before {
        opacity: 0.55;
      }

      &:hover .blog-index__onward {
        opacity: 1;
        translate: 3px 0;
      }

      &:hover .blog-index__title-link {
        text-decoration: underline;
        text-decoration-thickness: 1.5px;
        text-underline-offset: 0.12em;
      }
    }

    &:active::before {
      opacity: 0.9;
      transition-duration: 0ms;
    }

    &:has(.blog-index__title-link:focus-visible)::before {
      opacity: 0.4;
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }

    @media (min-width: 600px) {
      padding: 2rem 0;

      &::before {
        inset: 0.75rem -1.25rem;
      }
    }
  }

  // Phones: the stamp opens the meta line. From 700px it moves to a gutter
  // beside the title, description and meta, like a contents page.
  &__article {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'title title'
      'issue meta'
      'desc desc';
    align-items: center;
    gap: 0.75rem 0.625rem;

    @media (min-width: 700px) {
      grid-template-columns: 3.25rem minmax(0, 1fr);
      grid-template-areas:
        'issue title'
        'issue meta'
        'issue desc';
      align-items: start;
      column-gap: 1.25rem;
    }
  }

  &__issue {
    grid-area: issue;
    display: flex;

    @media (min-width: 700px) {
      justify-content: center;
      padding-top: 0.125rem;
    }
  }

  &__meta {
    grid-area: meta;
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

  &__onward {
    margin-left: auto;
    color: var(--gk-ink-soft);
    opacity: 0.55;
    transition:
      opacity 150ms ease,
      translate 200ms var(--gk-ease-out);
  }

  &__article-title {
    grid-area: title;
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
    outline: none;

    &::after {
      content: '';
      position: absolute;
      inset: -1.75rem -0.75rem;
      z-index: 1;
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
    grid-area: desc;
    max-width: 62ch;
    margin: 0;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--gk-ink-soft);

    // Phones: three lines say enough to choose; the article says the rest
    @media (max-width: 600px) {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      font-size: 0.9375rem;
    }
  }
}

// A fresh load sets the entries down in reading order, 50ms apart
.blog-index__list:not(.is-quiet) .blog-index__card {
  animation: blog-entry-in 260ms var(--gk-ease-out) both;
  animation-delay: calc(80ms + var(--entry-index, 0) * 50ms);
}

// …and each issue is sealed as its entry lands (InkStamp's own press)
.blog-index__list:not(.is-quiet) .blog-index__issue :deep(.ink-stamp--press) {
  animation-delay: calc(200ms + var(--entry-index, 0) * 50ms);
}

@keyframes blog-entry-in {
  from {
    opacity: 0;
    translate: 0 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .blog-index__list .blog-index__card {
    animation: none;
  }

  .blog-index__card::before,
  .blog-index__onward {
    transition: none;
  }
}

// Every page starts the same distance below the header's rule
.blog-index {
  margin-top: var(--gk-page-top);
}
</style>
