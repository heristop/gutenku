<script lang="ts" setup>
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { storeToRefs } from 'pinia';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import InkPlate from '@/core/components/ink/InkPlate.vue';
import PlateQuill from '@/core/components/ink/plates/PlateQuill.vue';
import ZenSkeleton from '@/core/components/ZenSkeleton.vue';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useToast } from '@/core/composables/toast';
import { usePwaInstall } from '@/core/composables/pwa-install';
import { usePullToRefresh } from '@/core/composables/pull-to-refresh';
import { closeWSClient } from '@/client';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import { CloudOff } from '@/core/components/icons/ink';
import {
  useInkLoading,
  useInkLoadingQuiet,
} from '@/core/composables/ink-loading';
import { SITE_URL } from '@/locales/config';

const HaikuCanvas = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/HaikuCanvas.vue'),
  loadingComponent: ZenSkeleton,
});

const HaikuChapter = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/HaikuChapter.vue'),
  loadingComponent: ZenSkeleton,
  delay: 200,
});

const ToolbarPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/ToolbarPanel.vue'),
  loadingComponent: ZenSkeleton,
});

const StatsPanel = defineAsyncComponent({
  loader: () => import('@/features/haiku/components/StatsPanel.vue'),
  loadingComponent: ZenSkeleton,
  delay: 300,
});

const ScoringCard = defineAsyncComponent(
  () => import('@/features/haiku/components/ScoringCard.vue'),
);

const SocialPreviewCard = defineAsyncComponent(
  () => import('@/features/haiku/components/SocialPreviewCard.vue'),
);

const PullToRefresh = defineAsyncComponent(
  () => import('@/core/components/PullToRefresh.vue'),
);

const HaikuPoem = defineAsyncComponent(
  () => import('@/features/haiku/components/HaikuPoem.vue'),
);

const isDev = import.meta.env.DEV;

const { t, tm } = useI18n();
const { error: showError } = useToast();

useSeoMeta({
  ogTitle: 'Haiku Generator - GutenKu',
  ogDescription:
    'Haiku Generator powered by AI. Create beautiful zen poetry from classic literature. No signup required.',
  ogImage: `${SITE_URL}/og-image.png`,
  twitterImage: `${SITE_URL}/og-image.png`,
});

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const {
  haiku,
  error,
  firstLoaded,
  networkError,
  loading,
  optionUseAI,
  isGenerating,
  aiError,
} = storeToRefs(haikuStore);

// The site-wide quill shows while the page's haiku is fetched. While one is
// crafted, the toolbar progress beside the pressed key is the one loading voice.
useInkLoading(loading);
useInkLoadingQuiet(isGenerating);
const { trackHaikuView } = usePwaInstall();

watch(haiku, (newHaiku) => {
  if (newHaiku) {
    trackHaikuView();
  }
});

const containerRef = ref<HTMLElement | null>(null);
const { pullDistance, isRefreshing, shouldRelease, progress } =
  usePullToRefresh(containerRef, { onRefresh: fetchNewHaiku });

watch(error, (newError) => {
  if (newError && newError !== 'network-error') {
    showError(newError);
    haikuStore.error = '';
  }
});

// A craft whose AI fell short (a rejected key, no credit) says why, once
watch(aiError, (code) => {
  if (code) {
    showError(t(`aiKey.errors.${code}`));
  }
});

const literaryLoadingMessages = computed(() => {
  const messages = tm('home.loadingMessages');

  return Object.keys(messages)
    .filter((key) => !Number.isNaN(Number(key)))
    .map((key) => t(`home.loadingMessages.${key}`));
});

const loadingLabel = computed(() => {
  if (!firstLoaded.value || loading.value) {
    const messages = literaryLoadingMessages.value;
    const index = Math.floor(Date.now() / 2500) % messages.length;

    return messages[index];
  }

  return t('home.readyMessage');
});

function handleRetry() {
  fetchNewHaiku();
}

onMounted(fetchNewHaiku);

// Close WebSocket to prevent blocking bfcache
onUnmounted(closeWSClient);
</script>

<template>
  <div ref="containerRef" class="haiku-page">
    <PullToRefresh
      :pull-distance="pullDistance"
      :is-refreshing="isRefreshing"
      :should-release="shouldRelease"
      :progress="progress"
    />

    <section
      id="main-content"
      class="haiku-page__content"
      :aria-busy="loading"
      :aria-label="t('home.haikuContentLabel')"
    >
      <HaikuPoem v-if="haiku" class="haiku-section__poem haiku-enter" />
      <BrushRule
        v-else
        as="h1"
        :label="t('haiku.poem.label')"
        class="haiku-section__heading"
      />
      <div class="haiku-grid">
        <!-- Mobile-only toolbar placement (before chapter) -->
        <div class="haiku-grid__toolbar-mobile">
          <ToolbarPanel />
        </div>

        <article
          class="haiku-grid__main haiku-enter"
          style="--enter-index: 1"
          :aria-label="t('haiku.articleLabel')"
        >
          <div v-if="networkError" class="haiku-page__error" role="alert">
            <CloudOff
              :size="32"
              class="haiku-page__error-icon"
              aria-hidden="true"
            />
            <p class="haiku-page__error-text">{{ t('home.networkError') }}</p>
            <ZenButton @click="handleRetry">
              {{ t('common.retry') }}
            </ZenButton>
          </div>

          <HaikuChapter v-if="haiku" class="haiku-section__chapter" />

          <div
            v-else-if="!networkError"
            class="haiku-section__chapter book-skeleton"
          >
            <header class="book-skeleton__header">
              <InkPlate class="book-skeleton__plate">
                <PlateQuill />
              </InkPlate>
              <h2 class="book-skeleton__title">{{ t('skeleton.title') }}</h2>
              <p class="book-skeleton__subtitle">
                {{ t('skeleton.subtitle') }}
              </p>
            </header>

            <div
              class="book-skeleton__haiku"
              role="status"
              aria-busy="true"
              :aria-label="loadingLabel"
            >
              <span class="book-skeleton__line book-skeleton__line--short" />
              <span class="book-skeleton__line book-skeleton__line--long" />
              <span class="book-skeleton__line book-skeleton__line--short" />
            </div>

            <div class="book-skeleton__prose">
              <ZenSkeleton variant="text" :lines="4" />
            </div>
          </div>
        </article>

        <div
          role="group"
          class="haiku-grid__sidebar haiku-page__sidebar haiku-enter"
          style="--enter-index: 2"
          :aria-label="t('haiku.controlsLabel')"
        >
          <div class="haiku-grid__toolbar-desktop">
            <ToolbarPanel class="haiku-section__toolbar" />
          </div>

          <SocialPreviewCard
            v-if="isDev && optionUseAI"
            class="haiku-section__preview"
          />

          <HaikuCanvas class="haiku-section__canvas" />

          <ScoringCard
            v-if="haiku?.quality"
            :quality="haiku.quality"
            :visible="!loading"
            class="haiku-section__scoring"
          />

          <StatsPanel class="haiku-section__stats" />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
// One gutter for the whole spread: cards sit 1.5rem apart on desktop and
// 1rem apart on phones, in both directions, so the page reads as one sheet set
.haiku-page {
  --haiku-gutter: var(--gk-gutter);

  width: 100%;
  margin-inline: auto;
  padding: 0.5rem 0.5rem 2rem;
  font-family: var(--gk-font);

  @media (min-width: 600px) {
    max-width: 900px;
    padding: 1rem 1rem 2.5rem;
  }

  @media (min-width: 1100px) {
    max-width: 1120px;
  }
}

// A closed library is said once, in place of the chapter: no overlay, no frame
.haiku-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.haiku-page__error-icon {
  color: var(--gk-ink-soft);
}

.haiku-page__error-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--gk-ink);
  text-wrap: balance;
}

.haiku-section__poem {
  margin-bottom: var(--haiku-gutter);
}

.haiku-section__heading {
  max-width: 320px;
  margin: 0 auto 0.75rem;
  padding: 0.5rem 0 0;
}

.haiku-grid {
  display: flex;
  flex-direction: column;
  gap: var(--haiku-gutter);

  @media (min-width: 960px) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.haiku-grid__main {
  flex: 1 1 100%;
  order: 1;
  min-width: 0;

  @media (min-width: 960px) {
    flex: 0 0 calc(66.67% - var(--haiku-gutter) / 2);
  }
}

.haiku-grid__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--haiku-gutter);
  flex: 1 1 100%;
  order: 2;
  min-width: 0;

  @media (min-width: 960px) {
    flex: 0 0 calc(33.33% - var(--haiku-gutter) / 2);
  }
}

// Below 960px the crafter moves above the chapter, so the action comes first
.haiku-grid__toolbar-mobile {
  display: none;
  order: 0;

  @media (max-width: 959px) {
    display: block;
  }
}

.haiku-grid__toolbar-desktop {
  @media (max-width: 959px) {
    display: none;
  }
}

// First load: each column settles once, a short fade-up, three sheets at most.
// `backwards` fill keeps the resting state untransformed and fully visible.
.haiku-enter {
  animation: haiku-sheet-in var(--gk-dur-base) var(--gk-ease-out) backwards;
  animation-delay: calc(var(--enter-index, 0) * 60ms);
}

@keyframes haiku-sheet-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

// Book skeleton: a blank leaf with ruled lines where the haiku will be typed
.book-skeleton {
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 1.75rem 1.5rem;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 1.25rem;
    border-bottom: var(--gk-rule-faint);
    text-align: center;
  }

  &__plate {
    width: clamp(7.5rem, 30vw, 11rem);
    margin-bottom: 0.75rem;
    rotate: -1.5deg;
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--gk-ink);
  }

  &__subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
  }

  // Haiku skeleton lines (5-7-5), indented like the poem
  &__haiku {
    display: grid;
    gap: 1.25rem;
    padding: 2rem 0 1.5rem;
  }

  &__line {
    display: block;
    height: 1.25rem;
    border-bottom: 1.5px solid var(--gk-ink-faint);

    &--short {
      width: 40%;
    }

    &--long {
      width: 58%;
      margin-left: 2.4em;
    }

    &:nth-child(3) {
      margin-left: 1.2em;
    }
  }

  &__prose {
    margin-top: auto;
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .haiku-enter {
    animation-name: haiku-sheet-fade;
  }

  @keyframes haiku-sheet-fade {
    from {
      opacity: 0;
    }
  }
}

// Every page starts the same distance below the header's rule
.haiku-page {
  padding-top: var(--gk-page-top);
}

// The first section label starts on the rhythm, not 8px under it
.haiku-page__content > .brush-rule:first-child {
  padding-top: 0;
}
</style>
