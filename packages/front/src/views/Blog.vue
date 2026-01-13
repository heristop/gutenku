<script lang="ts" setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { marked } from 'marked';
import { Loader2, ArrowUp, Twitter, Linkedin, Link } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import { useToast } from '@/core/composables/toast';

// Import all markdown files from content directory
const articles = import.meta.glob('../../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Get the latest article (sorted by filename which contains date)
function getLatestArticle() {
  const sortedPaths = Object.keys(articles).sort().reverse();
  const latestPath = sortedPaths[0];

  if (!latestPath) {
    return { content: '', date: new Date(), filename: '' };
  }

  // Extract date from filename (format: YYYY-MM-DD-title.md)
  const filename = latestPath.split('/').pop() || '';
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? new Date(dateMatch[1]) : new Date();

  return {
    content: articles[latestPath],
    date,
    filename,
  };
}

const latestArticle = getLatestArticle();

const { locale } = useI18n();
const { showToast } = useToast();
const content = ref('');
const loading = ref(true);
const showContent = ref(false);
const readingProgress = ref(0);
const showBackToTop = ref(false);

// Reading time calculation (average 200 words per minute)
const readingTime = computed(() => {
  const wordCount = latestArticle.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return minutes;
});

const formattedDate = computed(() => {
  return latestArticle.date.toLocaleDateString(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Scroll handling for progress bar and back to top
function handleScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  showBackToTop.value = scrollTop > 400;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Share functions
async function copyLink() {
  try {
    await navigator.clipboard.writeText(globalThis.location.href);
    showToast({ message: 'Link copied!', type: 'success' });
  } catch {
    showToast({ message: 'Failed to copy', type: 'error' });
  }
}

function shareOnTwitter() {
  const url = encodeURIComponent(globalThis.location.href);
  const text = encodeURIComponent('GutenKu - AI Haiku Generator from Classic Literature');
  globalThis.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(globalThis.location.href);
  globalThis.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

onMounted(async () => {
  content.value = await marked(latestArticle.content);
  loading.value = false;

  // Trigger fade-in animation after content loads
  setTimeout(() => {
    showContent.value = true;
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="blog-page">
    <!-- Reading progress bar -->
    <div class="blog-page__progress" :style="{ width: `${readingProgress}%` }" />

    <InkBrushNav />

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

        <!-- Share section -->
        <footer class="blog-page__share">
          <p class="blog-page__share-label">Share this article</p>
          <div class="blog-page__share-buttons">
            <button
              type="button"
              class="blog-page__share-btn"
              aria-label="Share on Twitter"
              @click="shareOnTwitter"
            >
              <Twitter :size="18" />
            </button>
            <button
              type="button"
              class="blog-page__share-btn"
              aria-label="Share on LinkedIn"
              @click="shareOnLinkedIn"
            >
              <Linkedin :size="18" />
            </button>
            <button
              type="button"
              class="blog-page__share-btn"
              aria-label="Copy link"
              @click="copyLink"
            >
              <Link :size="18" />
            </button>
          </div>
        </footer>
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
  padding: 0.75rem;
  position: relative;

  @media (min-width: 375px) {
    padding: 1rem;
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
      var(--gutenku-zen-primary),
      var(--gutenku-zen-accent)
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

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 0.875rem 0;
      font-size: 0.85rem;
      display: block;
      overflow-x: auto;

      @media (min-width: 375px) {
        font-size: 0.9rem;
      }

      @media (min-width: 600px) {
        margin: 1rem 0;
        font-size: inherit;
        display: table;
      }

      th,
      td {
        border: 1px solid var(--gutenku-paper-border);
        padding: 0.375rem 0.5rem;
        text-align: left;
        white-space: nowrap;

        @media (min-width: 600px) {
          padding: 0.5rem;
          white-space: normal;
        }
      }

      th {
        background: var(--gutenku-paper-bg-aged);
        font-weight: 600;
      }
    }
  }

  &__share {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--gutenku-paper-border);
    text-align: center;

    @media (min-width: 375px) {
      margin-top: 1.75rem;
      padding-top: 1.375rem;
    }

    @media (min-width: 600px) {
      margin-top: 2rem;
      padding-top: 1.5rem;
    }
  }

  &__share-label {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    margin: 0 0 0.75rem;

    @media (min-width: 375px) {
      font-size: 0.85rem;
      margin: 0 0 0.875rem;
    }

    @media (min-width: 600px) {
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }
  }

  &__share-buttons {
    display: flex;
    justify-content: center;
    gap: 0.625rem;

    @media (min-width: 375px) {
      gap: 0.75rem;
    }
  }

  &__share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-full);
    background: transparent;
    color: var(--gutenku-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;

    @media (min-width: 375px) {
      width: 2.5rem;
      height: 2.5rem;
    }

    &:hover {
      color: var(--gutenku-zen-primary);
      border-color: var(--gutenku-zen-primary);
      background: oklch(0.45 0.1 195 / 0.1);
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
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

  &__share-btn {
    &:hover {
      background: oklch(0.6 0.1 195 / 0.2);
    }
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

    &__share-btn,
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
