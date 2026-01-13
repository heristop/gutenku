<script lang="ts" setup>
import { Loader2, ArrowUp } from 'lucide-vue-next';
import { useSeoMeta } from '@unhead/vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import BlogShareButtons from '../components/BlogShareButtons.vue';
import { useArticle, useReadingProgress } from '../composables';

const { article, content, loading, showContent, readingTime, formattedDate } =
  useArticle();
const { readingProgress, showBackToTop, scrollToTop } = useReadingProgress();

// Dynamic meta tags based on latest article
const baseUrl = 'https://gutenku.xyz';
const ogImage = article.image.startsWith('/')
  ? `${baseUrl}${article.image}`
  : article.image;

useSeoMeta({
  title: `${article.title} | GutenKu Blog`,
  description: article.description,
  ogTitle: article.title,
  ogDescription: article.description,
  ogImage,
  ogType: 'article',
  twitterCard: 'summary_large_image',
  twitterTitle: article.title,
  twitterDescription: article.description,
  twitterImage: ogImage,
});
</script>

<template>
  <div class="blog-page">
    <!-- Reading progress bar -->
    <div
      class="blog-page__progress"
      :style="{ width: `${readingProgress}%` }"
    />

    <header class="blog-page__header">
      <p class="blog-page__date">{{ formattedDate }}</p>
      <h1 class="blog-page__title">From the Journal</h1>
      <p class="blog-page__author">Alexandre Mederic Mogère</p>
      <p class="blog-page__reading-time">{{ readingTime }} min read</p>
    </header>

    <!-- Ink brush divider -->
    <div class="blog-page__divider" aria-hidden="true" />

    <div v-if="loading" class="blog-page__loading">
      <Loader2 :size="32" class="blog-page__spinner" />
    </div>

    <Transition name="fade-up">
      <ZenCard v-if="!loading && showContent" class="blog-page__content">
        <article class="blog-page__article prose" v-html="content" />
        <BlogShareButtons />
      </ZenCard>
    </Transition>

    <!-- Back to top button -->
    <Transition name="fade-scale">
      <button
        v-if="showBackToTop"
        type="button"
        class="blog-page__back-to-top"
        aria-label="Back to top"
        @click="scrollToTop"
      >
        <ArrowUp :size="20" />
      </button>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.blog-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem;
  position: relative;

  @media (min-width: 375px) {
    padding: 0.5rem;
  }

  @media (min-width: 600px) {
    padding: 1.5rem;
  }

  &__progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--gutenku-zen-accent),
      var(--gutenku-zen-primary)
    );
    z-index: 1000;
    transition: width 0.1s ease-out;
  }

  &__header {
    text-align: center;
    margin-bottom: 1rem;
    position: relative;
    padding: 0 0.5rem;

    @media (min-width: 375px) {
      margin-bottom: 1.25rem;
    }

    @media (min-width: 600px) {
      margin-bottom: 1.5rem;
      padding: 0;
    }
  }

  &__date {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    text-transform: capitalize;
    letter-spacing: 0.02em;
    margin: 0 0 0.375rem;

    @media (min-width: 375px) {
      font-size: 0.8rem;
      margin: 0 0 0.5rem;
    }

    @media (min-width: 600px) {
      font-size: 0.875rem;
    }
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    margin: 0 0 0.375rem;

    @media (min-width: 375px) {
      font-size: 1.375rem;
      margin: 0 0 0.5rem;
    }

    @media (min-width: 600px) {
      font-size: 1.5rem;
    }
  }

  &__author {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    margin: 0 0 0.25rem;
    font-style: italic;

    @media (min-width: 375px) {
      font-size: 0.85rem;
    }

    @media (min-width: 600px) {
      font-size: 0.9rem;
    }
  }

  &__reading-time {
    font-size: 0.7rem;
    color: var(--gutenku-text-muted);
    margin: 0;
    opacity: 0.8;

    @media (min-width: 375px) {
      font-size: 0.75rem;
    }

    @media (min-width: 600px) {
      font-size: 0.8rem;
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

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  &__spinner {
    animation: spin 1s linear infinite;
    color: var(--gutenku-zen-primary);
  }

  &__content {
    padding: 1rem;
    margin-bottom: 2rem;

    @media (min-width: 375px) {
      padding: 1.25rem;
      margin-bottom: 2.5rem;
    }

    @media (min-width: 600px) {
      padding: 2rem;
      margin-bottom: 3rem;
    }
  }

  &__article {
    line-height: 1.7;
    color: var(--gutenku-text-primary);
    font-size: 0.9rem;

    @media (min-width: 375px) {
      font-size: 0.95rem;
      line-height: 1.75;
    }

    @media (min-width: 600px) {
      font-size: 1rem;
      line-height: 1.8;
    }

    // Drop cap for first paragraph
    :deep(p:first-of-type::first-letter) {
      float: left;
      font-size: 2.75rem;
      line-height: 0.8;
      font-weight: 700;
      color: var(--gutenku-zen-primary);
      margin-right: 0.375rem;
      margin-top: 0.1rem;

      @media (min-width: 375px) {
        font-size: 3rem;
        margin-right: 0.4rem;
      }

      @media (min-width: 600px) {
        font-size: 3.5rem;
        margin-right: 0.5rem;
      }
    }

    :deep(h1) {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: var(--gutenku-text-primary);

      @media (min-width: 375px) {
        font-size: 1.5rem;
        margin-bottom: 0.875rem;
      }

      @media (min-width: 600px) {
        font-size: 1.75rem;
        margin-bottom: 1rem;
      }
    }

    :deep(h2) {
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--gutenku-text-primary);

      @media (min-width: 375px) {
        font-size: 1.3rem;
        margin-top: 1.75rem;
        margin-bottom: 0.625rem;
      }

      @media (min-width: 600px) {
        font-size: 1.4rem;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
      }
    }

    :deep(h3) {
      font-size: 1.05rem;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.375rem;
      color: var(--gutenku-text-primary);

      @media (min-width: 375px) {
        font-size: 1.1rem;
        margin-top: 1.375rem;
        margin-bottom: 0.4rem;
      }

      @media (min-width: 600px) {
        font-size: 1.15rem;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
      }
    }

    :deep(p) {
      margin-bottom: 0.875rem;

      @media (min-width: 600px) {
        margin-bottom: 1rem;
      }
    }

    :deep(em) {
      font-style: italic;
      color: var(--gutenku-text-muted);
    }

    :deep(strong) {
      font-weight: 600;
      color: var(--gutenku-zen-primary);
    }

    :deep(a) {
      color: var(--gutenku-zen-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(blockquote) {
      border-left: 2px solid var(--gutenku-zen-primary);
      padding-left: 0.75rem;
      margin: 1rem 0;
      font-style: italic;
      color: var(--gutenku-text-muted);

      @media (min-width: 375px) {
        border-left-width: 3px;
        padding-left: 0.875rem;
        margin: 1.25rem 0;
      }

      @media (min-width: 600px) {
        padding-left: 1rem;
        margin: 1.5rem 0;
      }
    }

    :deep(code) {
      background: var(--gutenku-paper-bg-aged);
      padding: 0.15rem 0.3rem;
      border-radius: var(--gutenku-radius-xs);
      font-size: 0.85em;
      font-family: monospace;
      word-break: break-word;

      @media (min-width: 375px) {
        padding: 0.2rem 0.35rem;
        font-size: 0.875em;
      }

      @media (min-width: 600px) {
        padding: 0.2rem 0.4rem;
        font-size: 0.9em;
      }
    }

    :deep(pre) {
      background: var(--gutenku-paper-bg-aged);
      padding: 0.75rem;
      border-radius: var(--gutenku-radius-sm);
      overflow-x: auto;
      margin: 0.875rem 0;
      font-size: 0.8rem;

      @media (min-width: 375px) {
        padding: 0.875rem;
        margin: 1rem 0;
        font-size: 0.85rem;
      }

      @media (min-width: 600px) {
        padding: 1rem;
        font-size: 0.9rem;
      }

      code {
        background: none;
        padding: 0;
        word-break: normal;
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 0.875rem 0;
      padding-left: 1.25rem;

      @media (min-width: 375px) {
        padding-left: 1.375rem;
      }

      @media (min-width: 600px) {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }
    }

    :deep(li) {
      margin-bottom: 0.375rem;

      @media (min-width: 600px) {
        margin-bottom: 0.5rem;
      }
    }

    :deep(hr) {
      border: none;
      height: 2px;
      margin: 1.5rem auto;
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

      @media (min-width: 375px) {
        margin: 1.75rem auto;
        max-width: 175px;
      }

      @media (min-width: 600px) {
        margin: 2rem auto;
        max-width: 200px;
      }
    }

    :deep(img) {
      display: block;
      max-width: 80%;
      max-height: 240px;
      object-fit: cover;
      object-position: center;
      margin: 1rem auto;
      border-radius: var(--gutenku-radius-md);
      box-shadow: 0 4px 16px oklch(0 0 0 / 0.08);

      @media (min-width: 600px) {
        max-width: 75%;
        max-height: 280px;
        margin: 1.5rem auto;
        border-radius: var(--gutenku-radius-lg);
      }
    }

    :deep(.mermaid-diagram) {
      display: block;
      margin: 1.5rem auto;
      text-align: center;
      overflow-x: auto;
      // CSS containment to isolate from parent styles
      contain: layout style;

      svg {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
      }

      // Target foreignObject labels specifically to prevent drop cap bleeding
      foreignObject {
        div,
        span,
        p {
          float: none !important;
          font-size: 14px !important;
          font-family: 'JMH Typewriter', monospace !important;
          line-height: 1.4 !important;
        }

        // Prevent first-letter pseudo-element from applying
        p::first-letter,
        div::first-letter,
        span::first-letter {
          float: none !important;
          font-size: inherit !important;
          font-weight: normal !important;
          margin: 0 !important;
          color: inherit !important;
        }
      }

      @media (min-width: 600px) {
        margin: 2rem auto;
      }
    }

    :deep(.promo-band) {
      background: linear-gradient(
        145deg,
        oklch(0.96 0.015 90 / 0.6) 0%,
        oklch(0.93 0.02 100 / 0.4) 50%,
        oklch(0.96 0.015 90 / 0.6) 100%
      );
      padding: 1.5rem;
      margin: 0.5rem 0;
      text-align: center;
      border-radius: var(--gutenku-radius-lg);

      @media (min-width: 600px) {
        padding: 2rem;
        margin: 1rem 0;
      }

      p:first-child {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--gutenku-zen-primary);
        margin-bottom: 1rem;

        &::first-letter {
          float: none !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          margin: 0 !important;
        }
        letter-spacing: 0.01em;

        @media (min-width: 600px) {
          font-size: 1.3rem;
        }
      }

      p:not(:first-child) {
        font-size: 0.95rem;
        color: var(--gutenku-text-primary);
        line-height: 1.7;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      a {
        color: var(--gutenku-zen-primary);
        font-weight: 700;
        text-decoration: none;
        background: linear-gradient(
          to bottom,
          transparent 60%,
          oklch(0.7 0.1 170 / 0.3) 60%
        );
        transition: background 0.2s ease;

        &:hover {
          background: linear-gradient(
            to bottom,
            transparent 40%,
            oklch(0.7 0.1 170 / 0.5) 40%
          );
        }
      }

      img {
        max-width: 100% !important;
        max-height: none !important;
        margin: 1.5rem auto 0 !important;
        border-radius: var(--gutenku-radius-lg);
        box-shadow:
          0 4px 6px oklch(0 0 0 / 0.05),
          0 10px 30px oklch(0 0 0 / 0.1);
      }
    }

    :deep(table) {
      width: auto;
      max-width: 100%;
      border-collapse: collapse;
      margin: 1.5rem auto;
      font-size: 0.9rem;
      display: table;
      background: linear-gradient(
        135deg,
        oklch(0.97 0.01 90 / 0.6) 0%,
        oklch(0.95 0.015 80 / 0.4) 100%
      );
      border-radius: var(--gutenku-radius-md);
      box-shadow: 0 2px 8px oklch(0 0 0 / 0.06);

      @media (min-width: 600px) {
        margin: 2rem auto;
        font-size: 1rem;
      }

      th,
      td {
        border: none;
        border-bottom: 1px solid oklch(0.7 0.02 90 / 0.3);
        padding: 0.75rem 1rem;
        text-align: left;
        vertical-align: middle;

        @media (min-width: 600px) {
          padding: 1rem 1.5rem;
        }

        // First column - labels
        &:first-child {
          font-weight: 500;
          color: var(--gutenku-zen-primary);
          white-space: nowrap;
        }

        // Second column - values
        &:last-child {
          font-style: italic;
        }
      }

      tr:last-child td {
        border-bottom: none;
      }

      // Hide header row
      thead {
        display: none;
      }

      // Style code elements as formula pills
      code {
        background: var(--gutenku-zen-primary);
        color: white;
        padding: 0.25rem 0.6rem;
        border-radius: 2rem;
        font-size: 0.9em;
        font-family: inherit;
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }

  &__back-to-top {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: none;
    border-radius: var(--gutenku-radius-full);
    background: var(--gutenku-zen-primary);
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px oklch(0 0 0 / 0.2);
    transition: all 0.2s ease;
    z-index: 100;

    @media (min-width: 375px) {
      bottom: 1.25rem;
      right: 1.25rem;
      width: 2.75rem;
      height: 2.75rem;
    }

    @media (min-width: 600px) {
      bottom: 2rem;
      right: 2rem;
      width: 3rem;
      height: 3rem;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px oklch(0 0 0 / 0.25);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: 2px;
    }
  }
}

// Animations
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

// Fade up transition
.fade-up-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

// Fade scale transition for back to top
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

// Dark theme
[data-theme='dark'] .blog-page {
  &__divider {
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(0.6 0.03 195 / 0.25) 20%,
      oklch(0.6 0.03 195 / 0.4) 50%,
      oklch(0.6 0.03 195 / 0.25) 80%,
      transparent 100%
    );
  }

  &__article :deep(hr) {
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(0.6 0.03 195 / 0.25) 20%,
      oklch(0.6 0.03 195 / 0.4) 50%,
      oklch(0.6 0.03 195 / 0.25) 80%,
      transparent 100%
    );
  }

  &__back-to-top {
    background: var(--gutenku-zen-accent);
    color: oklch(0.12 0.02 195);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .blog-page {
    &__progress {
      transition: none;
    }

    &__divider {
      animation: none;
      opacity: 1;
      transform: scaleX(1);
    }

    &__back-to-top {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }

  .fade-up-enter-active {
    transition: opacity 0.3s ease;
  }

  .fade-up-enter-from {
    transform: none;
  }

  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    transform: none;
  }
}
</style>
