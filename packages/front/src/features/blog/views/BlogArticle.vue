<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Loader2, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-vue-next';
import { useSeoMeta, useHead } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import BlogShareButtons from '../components/BlogShareButtons.vue';
import {
  useArticle,
  useReadingProgress,
  getAvailableLocalesForSlug,
} from '../composables';
import {
  SITE_URL,
  LOCALE_CONFIG,
  type SupportedLocale,
} from '@/locales/config';

const { t } = useI18n();
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const {
  article,
  content,
  loading,
  showContent,
  notFound,
  readingTime,
  formattedDate,
  nextArticle,
  prevArticle,
} = useArticle(slug);

const { readingProgress, showBackToTop, scrollToTop } = useReadingProgress();

const ogImage = computed(() => {
  if (!article.value) {
    return `${SITE_URL}/og-image.png`;
  }
  return article.value.image.startsWith('/')
    ? `${SITE_URL}${article.value.image}`
    : article.value.image;
});

const isoDate = computed(() => article.value?.date.toISOString() || '');

// Article stores its actual locale (may differ from UI locale if fallback)
const articleLocale = computed(() => article.value?.locale || 'en');

// Get OG locale from config
const ogLocale = computed(
  () =>
    LOCALE_CONFIG[articleLocale.value as SupportedLocale]?.ogLocale || 'en_US',
);

useSeoMeta({
  title: () =>
    article.value
      ? `${article.value.title} | GutenKu Blog`
      : 'Article Not Found | GutenKu Blog',
  description: () => article.value?.description || 'Article not found',
  ogTitle: () => article.value?.title || 'Article Not Found',
  ogDescription: () => article.value?.description || 'Article not found',
  ogImage,
  ogType: 'article',
  ogLocale,
  articlePublishedTime: isoDate,
  articleAuthor: ['Alexandre Mederic Mogère (@heristop)'],
  twitterCard: 'summary_large_image',
  twitterTitle: () => article.value?.title || 'Article Not Found',
  twitterDescription: () => article.value?.description || 'Article not found',
  twitterImage: ogImage,
});

useHead({
  htmlAttrs: {
    lang: computed(
      () =>
        LOCALE_CONFIG[articleLocale.value as SupportedLocale]?.htmlLang || 'en',
    ),
  },
  link: computed(() => {
    if (!article.value) {
      return [];
    }
    // Add hreflang for available translations
    const links: { rel: string; hreflang: string; href: string }[] = [];
    const availableLocales = getAvailableLocalesForSlug(slug.value);
    for (const loc of availableLocales) {
      const localeConfig = LOCALE_CONFIG[loc];
      links.push({
        rel: 'alternate',
        hreflang: localeConfig.htmlLang,
        href: `${SITE_URL}/blog/${slug.value}`,
      });
    }
    // x-default points to English version
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${SITE_URL}/blog/${slug.value}`,
    });
    return links;
  }),
  script: computed(() =>
    article.value
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.value.title,
              description: article.value.description,
              image: ogImage.value,
              datePublished: isoDate.value,
              inLanguage:
                LOCALE_CONFIG[articleLocale.value as SupportedLocale]
                  ?.htmlLang || 'en',
              author: {
                '@type': 'Person',
                name: 'Alexandre Mederic Mogère (@heristop)',
              },
              publisher: {
                '@type': 'Organization',
                name: 'GutenKu',
                logo: {
                  '@type': 'ImageObject',
                  url: `${SITE_URL}/android-chrome-512x512.png`,
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${SITE_URL}/blog/${article.value.slug}`,
              },
            }),
          },
        ]
      : [],
  ),
});
</script>

<template>
  <div class="blog-article">
    <!-- Reading progress bar -->
    <div
      class="blog-article__progress"
      :style="{ width: `${readingProgress}%` }"
    />

    <!-- Not Found State -->
    <div v-if="notFound && !loading" class="blog-article__not-found">
      <ZenCard class="blog-article__not-found-card">
        <h1>{{ t('blog.notFound') }}</h1>
        <p>{{ t('blog.notFoundDescription') }}</p>
        <RouterLink :to="{ name: 'Blog' }" class="blog-article__back-link">
          <ArrowLeft :size="18" />
          <span>{{ t('blog.backToBlog') }}</span>
        </RouterLink>
      </ZenCard>
    </div>

    <template v-else>
      <header class="blog-article__header">
        <RouterLink
          :to="{ name: 'Blog' }"
          class="blog-article__back-to-blog link-highlight"
        >
          <ArrowLeft :size="14" />
          <span>{{ t('blog.allArticles') }}</span>
        </RouterLink>
        <p class="blog-article__date">{{ formattedDate }}</p>
        <h1
          class="blog-article__title"
          :style="{ viewTransitionName: `blog-title-${slug}` }"
        >
          {{ article?.title }}
        </h1>
        <p class="blog-article__author">
          Alexandre Mederic Mogère (<a
            href="https://www.instagram.com/heristop/"
            class="link-highlight"
            target="_blank"
            >@heristop</a
          >)
        </p>
        <p class="blog-article__reading-time">
          {{ t('blog.minRead', { min: readingTime }) }}
        </p>
      </header>

      <!-- Ink brush divider -->
      <div class="blog-article__divider" aria-hidden="true" />

      <div v-if="loading" class="blog-article__loading">
        <Loader2 :size="32" class="blog-article__spinner" />
      </div>

      <Transition name="fade-up">
        <ZenCard v-if="!loading && showContent" class="blog-article__content">
          <article class="blog-article__body prose" v-html="content" />
          <BlogShareButtons />

          <!-- Article navigation -->
          <nav class="blog-article__nav" aria-label="Article navigation">
            <RouterLink
              v-if="prevArticle"
              :to="{ name: 'BlogArticle', params: { slug: prevArticle.slug } }"
              class="blog-article__nav-link blog-article__nav-link--prev"
            >
              <ArrowLeft :size="14" />
              <div class="blog-article__nav-content">
                <span class="blog-article__nav-label">{{
                  t('blog.newerArticle')
                }}</span>
                <span class="blog-article__nav-title link-highlight">{{
                  prevArticle.title
                }}</span>
              </div>
            </RouterLink>
            <div v-else class="blog-article__nav-spacer" />

            <RouterLink
              v-if="nextArticle"
              :to="{ name: 'BlogArticle', params: { slug: nextArticle.slug } }"
              class="blog-article__nav-link blog-article__nav-link--next"
            >
              <div class="blog-article__nav-content">
                <span class="blog-article__nav-label">{{
                  t('blog.olderArticle')
                }}</span>
                <span class="blog-article__nav-title link-highlight">{{
                  nextArticle.title
                }}</span>
              </div>
              <ArrowRight :size="14" />
            </RouterLink>
            <div v-else class="blog-article__nav-spacer" />
          </nav>
        </ZenCard>
      </Transition>

      <!-- Back to top button -->
      <Transition name="fade-scale">
        <button
          v-if="showBackToTop"
          type="button"
          class="blog-article__back-to-top"
          aria-label="Back to top"
          @click="scrollToTop"
        >
          <ArrowUp :size="20" />
        </button>
      </Transition>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.blog-article {
  width: 100%;
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

  &__not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  &__not-found-card {
    text-align: center;
    padding: 2rem;

    h1 {
      font-size: 1.5rem;
      color: var(--gutenku-text-primary);
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--gutenku-text-muted);
      margin-bottom: 1.5rem;
    }
  }

  &__back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gutenku-zen-primary);
    text-decoration: none;
    font-weight: 600;

    &:hover {
      color: var(--gutenku-zen-accent);
    }
  }

  &__header {
    text-align: center;
    margin-bottom: 1rem;
    position: relative;
    padding: 0 1rem;

    @media (min-width: 375px) {
      margin-bottom: 1.25rem;
      padding: 0 1.25rem;
    }

    @media (min-width: 600px) {
      margin-bottom: 1.5rem;
      padding: 0;
    }
  }

  &__back-to-blog {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    text-decoration: none;
    margin-bottom: 1rem;

    svg {
      color: var(--gutenku-zen-secondary);
      transition: transform 0.2s ease;
    }

    &:hover svg {
      transform: translateX(-4px) translateY(-2px);
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
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--gutenku-zen-primary);
    margin: 0 0 0.5rem;
    overflow-wrap: break-word;
    word-break: break-word;
    max-width: 100%;

    @media (min-width: 375px) {
      font-size: 1.5rem;
      margin: 0 0 0.625rem;
    }

    @media (min-width: 600px) {
      font-size: 1.75rem;
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

  &__nav {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--gutenku-paper-border);
  }

  &__nav-spacer {
    flex: 1;
  }

  &__nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: var(--gutenku-radius-md);
    text-decoration: none;
    color: var(--gutenku-text-primary);
    transition: all 0.2s ease;
    flex: 1;
    max-width: 45%;

    svg {
      color: var(--gutenku-zen-secondary);
      transition: transform 0.2s ease;
    }

    &:hover {
      background: var(--gutenku-paper-bg-aged);
    }

    &--prev {
      justify-content: flex-start;

      &:hover svg {
        transform: translateX(-4px) translateY(-2px);
      }
    }

    &--next {
      justify-content: flex-end;
      text-align: right;

      &:hover svg {
        transform: translateX(4px) translateY(-2px);
      }
    }
  }

  &__nav-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    overflow: hidden;
  }

  &__nav-label {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__nav-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gutenku-zen-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (min-width: 600px) {
      font-size: 1rem;
    }
  }

  &__body {
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
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--gutenku-text-primary);

      @media (min-width: 375px) {
        font-size: 1.15rem;
        margin-top: 1.75rem;
        margin-bottom: 0.625rem;
      }

      @media (min-width: 600px) {
        font-size: 1.25rem;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
      }
    }

    :deep(h3) {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.375rem;
      color: var(--gutenku-text-primary);

      @media (min-width: 375px) {
        font-size: 1.05rem;
        margin-top: 1.375rem;
        margin-bottom: 0.4rem;
      }

      @media (min-width: 600px) {
        font-size: 1.1rem;
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
      -webkit-overflow-scrolling: touch;
      margin: 0.875rem 0;
      font-size: 0.8rem;
      max-width: 100%;
      box-sizing: border-box;

      // Mobile: wrap text instead of scrolling
      @media (max-width: 599px) {
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      @media (min-width: 375px) {
        padding: 0.875rem;
        margin: 1rem 0;
        font-size: 0.85rem;
      }

      @media (min-width: 600px) {
        padding: 1rem;
        font-size: 0.9rem;
        white-space: pre;
      }

      code {
        background: none;
        padding: 0;
        word-break: normal;

        @media (max-width: 599px) {
          word-break: break-word;
        }
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

    // Technical article images - full width, responsive
    :deep(img.article-img) {
      max-width: 100%;
      max-height: none;
      min-height: 400px;
      object-fit: contain;
      border-radius: var(--gutenku-radius-lg);

      @media (max-width: 768px) {
        min-height: auto;
      }
    }

    :deep(img.article-img--tall) {
      min-height: 500px;

      @media (max-width: 768px) {
        min-height: auto;
      }
    }

    :deep(.katex-display) {
      display: block;
      text-align: center;
      margin: 1rem 0;
      overflow-x: auto;
      overflow-y: hidden;

      .katex {
        font-size: 1.1em;
      }
    }

    :deep(.mermaid-diagram) {
      display: block;
      margin: 1.5rem auto;
      text-align: center;
      overflow-x: auto;
      contain: layout style;
      max-width: 380px;
      padding: 1.5rem 1rem;
      background: linear-gradient(
        135deg,
        oklch(0.97 0.01 90 / 0.8) 0%,
        oklch(0.95 0.015 80 / 0.6) 100%
      );
      border-radius: var(--gutenku-radius-lg);
      box-shadow: 0 2px 12px oklch(0 0 0 / 0.06);
      border: 1px solid oklch(0.85 0.02 90 / 0.5);

      @media (min-width: 600px) {
        max-width: 450px;
        padding: 2rem 1.5rem;
      }

      svg {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
      }

      foreignObject {
        div,
        span,
        p {
          float: none !important;
          font-size: 13px !important;
          font-family: 'JMH Typewriter', monospace !important;
          line-height: 1.4 !important;
        }

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

      // Mobile: Stack rows into cards
      @media (max-width: 599px) {
        display: block;
        width: 100%;
        background: none;
        box-shadow: none;

        thead {
          display: none;
        }

        tbody {
          display: block;
        }

        tr {
          display: block;
          margin-bottom: 0.375rem;
          padding: 0.5rem 0.625rem;
          border-radius: var(--gutenku-radius-sm);
          background: linear-gradient(
            135deg,
            oklch(0.97 0.01 90 / 0.6) 0%,
            oklch(0.95 0.015 80 / 0.4) 100%
          );
          box-shadow: 0 2px 8px oklch(0 0 0 / 0.06);
        }

        td {
          display: block;
          padding: 0.125rem 0;
          border: none !important;

          &:first-child {
            font-weight: 600;
            color: var(--gutenku-zen-primary);
            border-bottom: 1px solid oklch(0.7 0.02 90 / 0.3);
            padding-bottom: 0.25rem;
            margin-bottom: 0.25rem;
            white-space: normal;
          }

          &:last-child {
            font-style: italic;
          }
        }
      }

      // Desktop styles
      @media (min-width: 600px) {
        th,
        td {
          border: none;
          border-bottom: 1px solid oklch(0.7 0.02 90 / 0.3);
          padding: 1rem 1.5rem;
          text-align: left;
          vertical-align: middle;

          &:first-child {
            font-weight: 500;
            color: var(--gutenku-zen-primary);
            white-space: nowrap;
          }

          &:last-child {
            font-style: italic;
          }
        }

        tr:last-child td {
          border-bottom: none;
        }

        thead {
          display: none;
        }
      }

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
[data-theme='dark'] .blog-article {
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

  &__date {
    color: var(--gutenku-text-muted);
  }

  &__title {
    color: var(--gutenku-text-primary);
    text-shadow: 0 2px 8px oklch(0 0 0 / 0.3);
  }

  &__author {
    color: var(--gutenku-text-accent);
  }

  &__reading-time {
    color: var(--gutenku-text-secondary);
    opacity: 1;
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

  &__body :deep(hr) {
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

  &__body :deep(img) {
    filter: brightness(0.85);
    box-shadow: 0 4px 20px oklch(0 0 0 / 0.3);
  }

  &__body :deep(code) {
    background: oklch(0.25 0.02 50 / 0.6);
    color: oklch(0.9 0.03 70);
  }

  &__body :deep(pre) {
    background: oklch(0.18 0.02 50 / 0.7);
    border: 1px solid oklch(0.3 0.03 50 / 0.4);

    code {
      color: oklch(0.88 0.02 70);
    }
  }

  &__body :deep(blockquote) {
    border-left-color: oklch(0.6 0.08 50);
    background: oklch(0.18 0.02 50 / 0.3);
    padding: 0.75rem 1rem;
    border-radius: 0 var(--gutenku-radius-sm) var(--gutenku-radius-sm) 0;
    color: oklch(0.8 0.02 60);
  }

  &__body :deep(a) {
    color: oklch(0.75 0.12 195);

    &:hover {
      color: oklch(0.82 0.14 195);
    }
  }

  &__body :deep(.mermaid-diagram) {
    background: linear-gradient(
      135deg,
      oklch(0.18 0.02 195 / 0.7) 0%,
      oklch(0.15 0.025 200 / 0.6) 100%
    );
    border: 1px solid oklch(0.4 0.05 195 / 0.4);
    box-shadow: 0 4px 16px oklch(0 0 0 / 0.25);

    svg {
      filter: brightness(1.05);
    }
  }

  &__body :deep(.promo-band) {
    background: linear-gradient(
      145deg,
      oklch(0.25 0.02 195 / 0.8) 0%,
      oklch(0.22 0.025 200 / 0.7) 50%,
      oklch(0.25 0.02 195 / 0.8) 100%
    );
    border: 1px solid oklch(0.5 0.08 195 / 0.3);

    p:first-child {
      color: var(--gutenku-zen-accent);
    }

    p:not(:first-child) {
      color: oklch(0.8 0.02 195);
    }

    img {
      box-shadow:
        0 4px 6px oklch(0 0 0 / 0.2),
        0 10px 30px oklch(0 0 0 / 0.3);
    }
  }

  &__nav-title {
    color: var(--gutenku-zen-accent);
  }

  &__body :deep(table) {
    background: linear-gradient(
      135deg,
      oklch(0.22 0.025 55 / 0.8) 0%,
      oklch(0.18 0.03 45 / 0.7) 100%
    );
    border: 1px solid oklch(0.35 0.04 50 / 0.4);
    box-shadow: 0 2px 12px oklch(0 0 0 / 0.25);

    @media (max-width: 599px) {
      background: none;
      border: none;
      box-shadow: none;

      tr {
        background: linear-gradient(
          135deg,
          oklch(0.22 0.025 55 / 0.8) 0%,
          oklch(0.18 0.03 45 / 0.7) 100%
        );
        border: 1px solid oklch(0.35 0.04 50 / 0.4);
        box-shadow: 0 2px 12px oklch(0 0 0 / 0.25);
      }

      td {
        color: oklch(0.88 0.02 70);

        &:first-child {
          color: oklch(0.75 0.12 195);
          border-bottom-color: oklch(0.4 0.04 50 / 0.5);
        }

        &:last-child {
          color: oklch(0.78 0.02 60);
        }
      }
    }

    @media (min-width: 600px) {
      th,
      td {
        border-bottom-color: oklch(0.4 0.04 50 / 0.5);
        color: oklch(0.88 0.02 70);

        &:first-child {
          color: oklch(0.75 0.12 195);
        }

        &:last-child {
          color: oklch(0.78 0.02 60);
        }
      }
    }

    code {
      background: var(--gutenku-zen-accent);
      color: oklch(0.12 0.02 195);
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .blog-article {
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
