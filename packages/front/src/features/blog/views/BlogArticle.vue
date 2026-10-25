<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { ArrowUp, ArrowLeft, ArrowRight } from '@/core/components/icons/ink';
import { useSeoMeta, useHead } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import BlogShareButtons from '../components/BlogShareButtons.vue';
import ArticleColophon from '../components/ArticleColophon.vue';
import ArticleToc from '../components/ArticleToc.vue';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { useInkLoading } from '@/core/composables/ink-loading';
import {
  useArticle,
  useArticles,
  useReadingProgress,
  useTableOfContents,
  getAvailableLocalesForSlug,
  toRomanNumeral,
  addHeadingIds,
  TOC_MIN_HEADINGS,
} from '../composables';
import {
  SITE_URL,
  LOCALE_CONFIG,
  type SupportedLocale,
} from '@/locales/config';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
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

const { showBackToTop, scrollToTop } = useReadingProgress();

// The site-wide quill reports the article render; no local loader
useInkLoading(loading);

// Asides (blockquotes) move into a margin column only when the article has any
const hasNotes = computed(() => content.value.includes('<blockquote'));

// Contents: every h2/h3 gets a stable id; the list shows from 3 sections
const outline = computed(() => addHeadingIds(content.value));
const tocHeadings = computed(() =>
  outline.value.headings.length >= TOC_MIN_HEADINGS
    ? outline.value.headings
    : [],
);
const hasToc = computed(() => tocHeadings.value.length > 0);
const bodyEl = ref<HTMLElement | null>(null);
const {
  activeId: tocActiveId,
  progress: tocProgress,
  scrollToHeading,
} = useTableOfContents(tocHeadings, bodyEl);

// Issue number: position of the article counted from the first one published
const { articles } = useArticles();
const issueNumber = computed(() => {
  const index = articles.value.findIndex((a) => a.slug === slug.value);

  return index === -1 ? 0 : articles.value.length - index;
});

// Arrow key nav
function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement;

  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  ) {
    return;
  }

  if (e.key === 'ArrowLeft' && prevArticle.value) {
    router.push({
      name: 'BlogArticle',
      params: { slug: prevArticle.value.slug },
    });

    return;
  }

  if (e.key === 'ArrowRight' && nextArticle.value) {
    router.push({
      name: 'BlogArticle',
      params: { slug: nextArticle.value.slug },
    });
  }
}

onMounted(() => {
  globalThis.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleKeydown);
});

const ogImage = computed(() => {
  if (!article.value) {
    return `${SITE_URL}/og-image.png`;
  }

  return article.value.image.startsWith('/')
    ? `${SITE_URL}${article.value.image}`
    : article.value.image;
});

const isoDate = computed(() => article.value?.date.toISOString() || '');

const articleLocale = computed(() => article.value?.locale || 'en');

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
  articleAuthor: ['Alexandre Mogère (@heristop)'],
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
                name: 'Alexandre Mogère (@heristop)',
                url: 'https://www.instagram.com/heristop/',
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
  <div
    class="blog-article"
    :class="{
      'blog-article--notes': hasNotes,
      'blog-article--toc': hasToc,
    }"
  >
    <div v-if="notFound && !loading" class="blog-article__not-found">
      <div class="blog-article__not-found-card">
        <h1>{{ t('blog.notFound') }}</h1>
        <p>{{ t('blog.notFoundDescription') }}</p>
        <RouterLink :to="{ name: 'Blog' }" class="blog-article__back-link">
          <ArrowLeft :size="18" aria-hidden="true" />
          <span>{{ t('blog.backToBlog') }}</span>
        </RouterLink>
      </div>
    </div>

    <div v-else class="blog-article__layout">
      <header class="blog-article__header">
        <RouterLink :to="{ name: 'Blog' }" class="blog-article__back-to-blog">
          <ArrowLeft :size="14" aria-hidden="true" />
          <span>{{ t('blog.allArticles') }}</span>
        </RouterLink>
        <h1
          class="blog-article__title"
          :style="{ viewTransitionName: `blog-title-${slug}` }"
        >
          {{ article?.title }}
        </h1>
        <div class="blog-article__meta">
          <InkStamp
            v-if="issueNumber"
            :label="toRomanNumeral(issueNumber)"
            tone="ink"
            :size="38"
            :tilt="3"
          />
          <span v-if="issueNumber" class="sr-only">
            {{ t('blog.issue', { number: issueNumber }) }}
          </span>
          <div class="blog-article__meta-text">
            <p class="blog-article__date">
              <time :datetime="isoDate">{{ formattedDate }}</time>
              <span aria-hidden="true"> · </span>
              <span class="blog-article__reading-time">{{
                t('blog.minRead', { min: readingTime })
              }}</span>
            </p>
            <p class="blog-article__author">
              Alexandre Mogère (<a
                href="https://www.instagram.com/heristop/"
                target="_blank"
                rel="noopener"
                >@heristop</a
              >)
            </p>
          </div>
        </div>
        <ArticleToc
          v-if="hasToc"
          class="blog-article__toc-disclosure"
          variant="disclosure"
          :headings="tocHeadings"
          :active-id="tocActiveId"
          @navigate="scrollToHeading"
        />
      </header>

      <BrushRule class="blog-article__divider" aria-hidden="true" />

      <Transition name="fade-up">
        <div
          v-if="!loading && showContent"
          class="blog-article__content"
          :class="{ 'blog-article__content--notes': hasNotes }"
        >
          <article
            ref="bodyEl"
            class="blog-article__body prose"
            v-html="outline.html"
          />
          <BlogShareButtons :title="article?.title ?? ''" />

          <ArticleColophon
            v-if="article && issueNumber"
            :issue="issueNumber"
            :date="article.date"
          />

          <nav class="blog-article__nav" :aria-label="t('blog.articleNav')">
            <RouterLink
              v-if="prevArticle"
              :to="{ name: 'BlogArticle', params: { slug: prevArticle.slug } }"
              class="blog-article__nav-link blog-article__nav-link--prev"
            >
              <ArrowLeft :size="14" aria-hidden="true" />
              <div class="blog-article__nav-content">
                <span class="blog-article__nav-label">{{
                  t('blog.newerArticle')
                }}</span>
                <span class="blog-article__nav-title">{{
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
                <span class="blog-article__nav-title">{{
                  nextArticle.title
                }}</span>
              </div>
              <ArrowRight :size="14" aria-hidden="true" />
            </RouterLink>
            <div v-else class="blog-article__nav-spacer" />
          </nav>
          <i18n-t
            v-if="prevArticle || nextArticle"
            keypath="blog.keyboardNavHint"
            tag="p"
            scope="global"
            class="blog-article__keyboard-hint"
          >
            <template #prev>
              <kbd class="blog-article__key">
                <ArrowLeft :size="14" aria-hidden="true" />
                <span class="sr-only">{{ t('blog.keyPrev') }}</span>
              </kbd>
            </template>
            <template #next>
              <kbd class="blog-article__key">
                <ArrowRight :size="14" aria-hidden="true" />
                <span class="sr-only">{{ t('blog.keyNext') }}</span>
              </kbd>
            </template>
          </i18n-t>
        </div>
      </Transition>

      <Transition name="fade-scale">
        <ArticleToc
          v-if="hasToc && !loading && showContent"
          class="blog-article__toc-rail"
          variant="rail"
          :headings="tocHeadings"
          :active-id="tocActiveId"
          :progress="tocProgress"
          @navigate="scrollToHeading"
        />
      </Transition>

      <Transition name="fade-scale">
        <button
          v-if="showBackToTop"
          type="button"
          class="blog-article__back-to-top"
          :aria-label="t('blog.backToTop')"
          :title="t('blog.backToTop')"
          @click="scrollToTop"
        >
          <ArrowUp :size="20" aria-hidden="true" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$note-width: 12.5rem;
// Contents rail: needs the sheet (with its notes column) plus this much
// on the right, which first fits at 1280px for articles with notes
$toc-width: 13rem;
$toc-gap: 2.5rem;
$toc-desktop: 1280px;

.blog-article {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  // Phones keep the page gutter the article list and the other cards keep
  padding: 1rem var(--gk-gutter) 1.5rem;
  position: relative;
  color: var(--gk-ink);
  font-family: var(--gk-font);

  @media (min-width: 600px) {
    padding: 1.5rem 1.5rem 2.5rem;
  }

  // With side notes, header and divider line up with the shifted reading column
  @media (min-width: 1100px) {
    &--notes &__header,
    &--notes &__divider {
      max-width: calc(62ch + #{$note-width} + 8.5rem);
      padding-right: calc(2.5rem + #{$note-width} + 3.5rem);
    }
  }

  // With a contents rail the page becomes three columns: the sheet stays
  // centred while the margins allow it, and slides left only as far as the
  // rail needs. The rail sits beside the notes column, never over it.
  @media (min-width: $toc-desktop) {
    &--toc {
      max-width: none;
    }

    &--toc &__layout {
      display: grid;
      grid-template-columns:
        minmax(0, 1fr)
        auto
        minmax(#{$toc-width + $toc-gap}, 1fr);
    }

    &--toc &__header,
    &--toc &__divider,
    &--toc &__content {
      grid-column: 2;
    }

    &--toc &__content {
      grid-row: 3;
    }
  }

  &__toc-rail {
    display: none;

    @media (min-width: $toc-desktop) {
      display: block;
      grid-column: 3;
      grid-row: 3;
      align-self: start;
      position: sticky;
      top: 1.5rem;
      box-sizing: border-box;
      width: calc(#{$toc-width} + 0.75rem);
      // Top of the rail lines up with the first line of the body
      margin: 2.25rem 0 0 calc(#{$toc-gap} - 0.5rem);
    }
  }

  &__toc-disclosure {
    @media (min-width: $toc-desktop) {
      display: none;
    }
  }

  &__not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  &__not-found-card {
    max-width: 36rem;
    padding: 2rem;
    text-align: center;
    background: var(--gk-paper-raised);
    border-radius: var(--gk-radius-paper);
    box-shadow: var(--gk-lift);

    h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 400;
      letter-spacing: -0.03em;
    }

    p {
      margin: 0 0 1.5rem;
      color: var(--gk-ink-soft);
    }
  }

  &__back-link,
  &__back-to-blog {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.75rem;
    font-size: 0.875rem;
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

  // Header aligns with the reading column
  &__header {
    max-width: calc(62ch + 5rem);
    margin: 0 auto;
    padding: 0 0.5rem;

    @media (min-width: 600px) {
      padding: 0 2.5rem;
    }
  }

  &__title {
    max-width: 20ch;
    margin: 0.75rem 0 1.25rem;
    font-size: clamp(2rem, 5.5vw, 3rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.035em;
    text-wrap: balance;
    overflow-wrap: break-word;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  &__meta-text {
    display: grid;
    gap: 0.125rem;
  }

  &__date,
  &__author {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
  }

  &__date {
    text-transform: capitalize;
  }

  &__reading-time {
    text-transform: none;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  &__author a {
    color: var(--gk-indigo);
    text-underline-offset: 0.2em;
  }

  // One brush stroke under the header: without a label the primitive's
  // second stroke would leave an empty gap in the middle
  &__divider {
    max-width: calc(62ch + 5rem);
    margin: 1.25rem auto 0;
    padding: 0.5rem 0.5rem 0;

    @media (min-width: 600px) {
      padding: 0.5rem 2.5rem 0;
    }

    :deep(.brush-rule__stroke--end) {
      display: none;
    }
  }

  // The sheet sizes to its composition: the 62ch measure plus padding, and a
  // notes column only when the article has asides
  &__content {
    --sheet-pad: 1.125rem;

    box-sizing: border-box;
    max-width: calc(62ch + 2 * var(--sheet-pad));
    margin: 0 auto;
    padding: 1.5rem var(--sheet-pad) 1.75rem;
    font-size: 1rem;
    background: var(--gk-paper-raised);
    border-radius: var(--gk-radius-paper);
    box-shadow: var(--gk-lift);
    counter-reset: note figure;

    @media (min-width: 600px) {
      --sheet-pad: 2.5rem;

      padding-block: 2.5rem 2rem;
    }

    > * {
      margin-inline: auto;
    }

    @media (min-width: 1100px) {
      &--notes {
        max-width: calc(62ch + #{$note-width} + 3.5rem + 2 * var(--sheet-pad));
        padding-right: calc(var(--sheet-pad) + #{$note-width} + 3.5rem);
      }
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: 0.5rem;
    max-width: 62ch;
    margin-top: 2rem;
    margin-inline: auto;
    padding-top: 1.25rem;
    border-top: var(--gk-rule);

    @media (min-width: 600px) {
      flex-direction: row;
      gap: 2rem;
    }
  }

  &__nav-spacer {
    display: none;
    flex: 1;

    @media (min-width: 600px) {
      display: block;
    }
  }

  &__nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0.5rem 0;
    color: var(--gk-indigo);
    text-decoration: none;

    &--prev {
      justify-content: flex-start;
    }

    &--next {
      justify-content: flex-end;
      text-align: right;

      .blog-article__nav-content {
        align-items: flex-end;
      }
    }

    svg {
      flex-shrink: 0;
      transition: transform var(--gk-dur-fast) var(--gk-ease-out);
    }

    @media (hover: hover) {
      &--prev:hover svg {
        transform: translateX(-3px);
      }

      &--next:hover svg {
        transform: translateX(3px);
      }

      &:hover .blog-article__nav-title {
        text-decoration-thickness: 1.5px;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__nav-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  &__nav-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
  }

  &__nav-title {
    font-size: 0.9375rem;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    line-height: 1.4;
    text-wrap: balance;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  &__keyboard-hint {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    // 62ch of the 1rem column, not of this smaller type
    max-width: calc(62ch * 16 / 14);
    margin: 1rem auto 0;
    font-size: 0.875rem;
    color: var(--gk-ink-soft);

    @media (hover: none) {
      display: none;
    }
  }

  // Typewriter key caps for the arrow keys
  &__key {
    display: inline-grid;
    place-items: center;
    min-width: 1.625rem;
    height: 1.625rem;
    padding: 0 0.25rem;
    font-family: inherit;
    color: var(--gk-ink);
    background: var(--gk-paper);
    border-radius: var(--gk-radius-control);
    box-shadow:
      inset 0 0 0 1px var(--gk-ink-faint),
      0 1px 0 var(--gk-ink-faint);
  }

  // Reading column: 62 characters, typewritten, ink drop cap
  &__body {
    max-width: 62ch;
    margin-inline: auto;
    font-size: 1rem;
    line-height: 1.8;
    color: var(--gk-ink);
    overflow-wrap: break-word;

    :deep(p.article-lead::first-letter) {
      float: left;
      padding: 0.35rem 0.6rem 0 0;
      font-size: 4.25em;
      font-weight: 700;
      line-height: 0.8;
      color: var(--gk-ink);
    }

    :deep(h1) {
      margin: 0 0 1rem;
      font-size: 1.75rem;
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }

    :deep(h2) {
      margin: 2.5rem 0 0.75rem;
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1.15;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }

    :deep(h3) {
      margin: 1.75rem 0 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    :deep(p),
    :deep(li) {
      line-height: 1.8;
    }

    :deep(p) {
      margin: 0 0 1.25rem;
    }

    // No sticky header to clear: sections land just under the top edge
    :deep(:is(h2, h3)) {
      scroll-margin-top: 2rem;
    }

    // Focused by the contents list for screen readers, not a control
    :deep(:is(h2, h3)[tabindex='-1']:focus) {
      outline: none;
    }

    :deep(strong) {
      font-weight: 700;
    }

    // Links: indigo with a typed underline. Overrides the global
    // .link-highlight stabilo (gradient) that main.scss extends onto them.
    :deep(a) {
      font-weight: inherit;
      color: var(--gk-indigo);
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.22em;
      border-radius: 0;
      transition: text-decoration-thickness var(--gk-dur-fast)
        var(--gk-ease-out);

      &::after {
        content: none;
      }

      @media (hover: hover) {
        &:hover {
          text-decoration-thickness: 2px;
        }
      }

      &:focus-visible {
        outline: 2px solid var(--gk-indigo);
        outline-offset: 2px;
        border-radius: var(--gk-radius-control);
      }
    }

    :deep(strong a),
    :deep(a strong) {
      font-weight: 700;
    }

    // Brush-rule section break
    :deep(hr) {
      height: 8px;
      margin: 2.5rem auto;
      max-width: 14rem;
      border: 0;
      background: var(--gk-ink);
      opacity: 0.5;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 8' preserveAspectRatio='none'%3E%3Cpath d='M0 4.6 C 40 3.2, 120 2.6, 200 3.6 L 200 4.4 C 120 5.6, 40 5.4, 0 4.9 Z'/%3E%3C/svg%3E")
        center / 100% 100% no-repeat;
    }

    // Asides: numbered in vermilion, moved into the margin on wide screens
    :deep(blockquote) {
      counter-increment: note;
      position: relative;
      margin: 1.5rem 0;
      padding: 0 0 0 1.25rem;
      border-left: var(--gk-rule);
      font-size: 0.875rem;
      line-height: 1.65;
      color: var(--gk-ink-soft);

      &::before {
        content: counter(note);
        margin-right: 0.375rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--gk-stamp-ink);
      }

      p {
        display: inline;
        margin: 0;
        line-height: inherit;
      }

      p + p {
        display: block;
        margin-top: 0.5rem;
      }

      em {
        font-style: italic;
      }

      @media (min-width: 1100px) {
        float: right;
        clear: right;
        width: $note-width;
        margin: 0.25rem calc(-#{$note-width} - 3.5rem) 1rem 0;
        padding: 0;
        border-left: 0;
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 1.25rem;
      padding-left: 1.5rem;
    }

    :deep(li) {
      margin-bottom: 0.375rem;
      padding-left: 0.25rem;
    }

    :deep(li::marker) {
      color: var(--gk-ink-soft);
    }

    :deep(ol > li::marker) {
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    :deep(code) {
      padding: 0.1rem 0.3rem;
      font-family: var(--gk-font);
      font-size: 0.9em;
      background: var(--gk-paper-deep);
      border-radius: var(--gk-radius-control);
    }

    :deep(pre) {
      max-width: 100%;
      margin: 1.25rem 0;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.875rem;
      background: var(--gk-paper-deep);
      border-radius: var(--gk-radius-control);
      box-shadow: inset 0 0 0 1px var(--gk-ink-faint);

      code {
        padding: 0;
        background: none;
      }
    }

    // Figures: plates mounted on the page, captions typewritten small
    :deep(figure) {
      counter-increment: figure;
      margin: 2rem 0;
    }

    :deep(img) {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
      border-radius: var(--gk-radius-control);
      box-shadow: 0 0 0 1.5px var(--gk-ink);
    }

    :deep(img.article-img),
    :deep(img.article-img--tall) {
      min-height: 0;
      object-fit: contain;
    }

    :deep(figcaption) {
      margin-top: 0.625rem;
      font-size: 0.875rem;
      line-height: 1.5;
      letter-spacing: 0.04em;
      color: var(--gk-ink-soft);

      &::before {
        content: counter(figure, lower-roman) '. ';
        font-weight: 700;
        color: var(--gk-ink);
      }
    }

    :deep(.katex-display) {
      margin: 1rem 0;
      overflow: auto hidden;
    }

    // A diagram is printed on the page like a plate: no box, no tint;
    // the inks come from the theme (see article-rendering.ts)
    :deep(.mermaid-diagram) {
      display: block;
      max-width: 34rem;
      margin: 2.25rem auto;
      overflow-x: auto;
      text-align: center;
      contain: layout style;

      svg {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 0 auto;
      }
    }

    :deep(.promo-band) {
      margin: 1.5rem 0;
      padding: 1.5rem;
      text-align: center;
      background: var(--gk-paper-deep);
      border-radius: var(--gk-radius-control);
      box-shadow: inset 0 0 0 1.5px var(--gk-ink);

      p:first-child {
        margin-bottom: 1rem;
        font-size: 1.25rem;
        font-weight: 700;

        &::first-letter {
          float: none !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          padding: 0 !important;
        }
      }

      img {
        margin-top: 1.5rem;
      }
    }

    // Ledger-style tables: dashed rules, ink rule top and bottom
    :deep(table) {
      width: 100%;
      margin: 1.5rem 0;
      border-collapse: collapse;
      border-block: var(--gk-rule);
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;

      td,
      th {
        padding: 0.625rem 0.75rem 0.625rem 0;
        text-align: left;
        vertical-align: top;
        border-bottom: 1px dashed var(--gk-ink-faint);

        &:first-child {
          font-weight: 700;
        }
      }

      // Column heads as typewritten labels
      th {
        padding-block: 0.5rem;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--gk-ink-soft);
        border-bottom: 1px solid var(--gk-ink-faint);
      }

      tr:last-child td {
        border-bottom: 0;
      }

      code {
        padding: 0;
        background: none;
        font-weight: 700;
        white-space: nowrap;
      }

      @media (max-width: 599px) {
        // Stacked rows on phones; the header row stays for screen readers
        thead {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip-path: inset(50%);
        }

        tr,
        td {
          display: block;
        }

        tr {
          padding: 0.5rem 0;
          border-bottom: 1px dashed var(--gk-ink-faint);
        }

        td {
          padding: 0.125rem 0;
          border: 0;
        }
      }
    }
  }

  &__back-to-top {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: none;
    border-radius: var(--gk-radius-control);
    background: var(--gk-indigo);
    color: var(--gk-on-indigo);
    cursor: pointer;
    box-shadow: 0 2px 0 var(--gk-indigo-edge);
    transition: transform var(--gk-dur-press) var(--gk-ease-out);
    z-index: 100;

    @media (max-width: 600px) {
      bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
      right: 1rem;
    }

    @media (min-width: 600px) {
      bottom: 2rem;
      right: 2rem;
    }

    &:active {
      transform: translateY(1px) scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }
  }
}

// A plate set straight in the text gets room on both sides
.prose > :deep(img),
.prose > :deep(p > img) {
  margin-block: 2rem;
}

.blog-article__body :deep(img) {
  filter: var(--gk-plate-filter);
}

.fade-up-enter-active {
  transition:
    opacity var(--gk-dur-base) var(--gk-ease-out),
    transform var(--gk-dur-base) var(--gk-ease-out);
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .blog-article__body :deep(a),
  .blog-article__nav-link svg,
  .blog-article__back-to-top {
    transition: none;
  }

  .fade-up-enter-from {
    transform: none;
  }
}

// Every page starts the same distance below the header's rule
.blog-article {
  padding-top: var(--gk-page-top);
}

// The back link keeps its 44px target; its words align with the rhythm
.blog-article__back-to-blog {
  margin-top: -0.75rem;
}
</style>
