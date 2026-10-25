<script lang="ts" setup>
import { onMounted, ref, computed, watch, shallowRef, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  Lightbulb,
  LightbulbOff,
  ChevronsUpDown,
  ChevronsDownUp,
  BookOpen,
  inkIconDataUri,
} from '@/core/components/icons/ink';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useHaikuHighlighter } from '@/features/haiku/composables/haiku-highlighter';
import { useTextCompacting } from '@/features/haiku/composables/text-compacting';
import { useBookRedaction } from '@/features/haiku/composables/book-redaction';
import { useBotDetection } from '@/core/composables/bot-detection';
import HighLightText from '@/features/haiku/components/HighLightText.vue';
import MarkerOverlay from '@/features/haiku/components/MarkerOverlay.vue';
import PretextChapter from '@/features/haiku/components/PretextChapter.vue';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';

const { t } = useI18n();

// Magnifier cursor over the page: the ink Search icon, in sumi or gofun white
const magnifierCursor = `url("${inkIconDataUri('Search', { color: '#27221f' })}") 10 10, zoom-in`;
const magnifierCursorDark = `url("${inkIconDataUri('Search', { color: '#ece6da' })}") 10 10, zoom-in`;

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading, craftingMessages } = storeToRefs(haikuStore);

// Shared with the poem signature, so revealing either reveals both
const { redacted: blackMarker, toggle } = useBookRedaction();
const isCompacted = ref(true);
const markerReady = ref(false);
const bookContentRef = ref<HTMLElement | null>(null);

// Spotlight: cursor position relative to .book-content for hover-to-reveal
const spotlight = shallowRef<{ x: number; y: number } | null>(null);
let spotlightRaf = 0;

function onSpotlightMove(e: MouseEvent) {
  if (!blackMarker.value || !bookContentRef.value) {
    return;
  }
  cancelAnimationFrame(spotlightRaf);
  spotlightRaf = requestAnimationFrame(() => {
    const rect = bookContentRef.value!.getBoundingClientRect();
    spotlight.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  });
}

function onSpotlightLeave() {
  cancelAnimationFrame(spotlightRaf);
  spotlight.value = null;
}

const { applyToAllHighlights } = useHaikuHighlighter();

const compactedTooltip = computed(() =>
  isCompacted.value
    ? t('haikuChapter.showFull')
    : t('haikuChapter.showCompacted'),
);
const { compactText } = useTextCompacting();

// Compute disclosure text
const revealHintId = useId();

const disclosureTextComputed = computed(() => {
  return blackMarker.value
    ? t('haikuChapter.disclosure.hidden')
    : t('haikuChapter.disclosure.visible');
});

// The visible hint only teaches the gesture: once a reader has revealed a
// page, the redaction speaks for itself (the sr-only live region stays)
const REVEALED_KEY = 'gutenku-chapter-revealed';
const hasRevealed = ref(true);

watch(blackMarker, (hidden) => {
  if (!hidden && !isBot.value && !hasRevealed.value) {
    hasRevealed.value = true;
    try {
      localStorage.setItem(REVEALED_KEY, '1');
    } catch {
      // Private mode: the hint simply returns next visit
    }
  }
});

function toggleCompactedView(): void {
  isCompacted.value = !isCompacted.value;
}

const pageNumber = computed(() => {
  if (!haiku.value?.book?.title || !haiku.value?.chapter?.title) {
    return 1;
  }

  const combined = haiku.value.book.title + haiku.value.chapter.title;
  let hash = 0;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash % 200) + 1;
});

function getCompactedText(): string {
  if (!haiku.value?.chapter.content || !haiku.value?.rawVerses) {
    return '';
  }

  return compactText(haiku.value.chapter.content, haiku.value.rawVerses);
}

const { isBot, detectBot } = useBotDetection();

watch(isBot, (botDetected) => {
  if (botDetected) {
    blackMarker.value = false;
  }
});

// Every haiku is a fresh puzzle: re-arm the redaction when one arrives, so a
// previous reveal does not leak the next chapter. Bots keep the text readable.
watch(haiku, () => {
  if (isBot.value) {
    return;
  }

  spotlight.value = null;
  blackMarker.value = true;
});

onMounted(async () => {
  detectBot();
  applyToAllHighlights();

  try {
    hasRevealed.value = localStorage.getItem(REVEALED_KEY) === '1';
  } catch {
    hasRevealed.value = false;
  }

  if (!import.meta.env.SSR) {
    await document.fonts.ready;
    markerReady.value = true;
  }
});

watch(
  [haiku, isCompacted],
  () => {
    applyToAllHighlights();
  },
  { flush: 'post' },
);

watch(loading, (isLoading) => {
  if (!isLoading && craftingMessages.value.length > 0) {
    haikuStore.craftingMessages = [];
  }
});
</script>

<template>
  <ZenCard
    v-if="haiku"
    id="book-page"
    variant="book"
    :loading="loading"
    :aria-label="t('haikuChapter.ariaLabel')"
    tabindex="-1"
    class="book-page"
    :class="{ 'is-loading': loading }"
  >
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ disclosureTextComputed }}
    </div>

    <div class="book-header">
      <div v-if="!hasRevealed" class="disclosure-text" aria-hidden="true">
        {{ disclosureTextComputed }}
      </div>
      <div class="header-controls">
        <ZenTooltip
          :text="t('haikuChapter.discloseHide')"
          position="bottom"
          :disabled="!blackMarker"
        >
          <ZenButton
            variant="text"
            size="sm"
            class="toggle-btn stabilo-toggle"
            :aria-label="t('haikuChapter.discloseHide')"
            data-cy="light-toggle-btn"
            @click.stop="toggle()"
            @touchend.stop
          >
            <template #icon-left>
              <Lightbulb v-if="blackMarker" :size="20" />
              <LightbulbOff v-else :size="20" />
            </template>
          </ZenButton>
        </ZenTooltip>

        <ZenTooltip :text="compactedTooltip" position="bottom">
          <ZenButton
            variant="text"
            size="sm"
            class="toggle-btn expand-toggle"
            :aria-label="compactedTooltip"
            @click="toggleCompactedView()"
          >
            <template #icon-left>
              <ChevronsUpDown v-if="isCompacted" :size="20" />
              <ChevronsDownUp v-else :size="20" />
            </template>
          </ZenButton>
        </ZenTooltip>
      </div>
    </div>

    <!-- The hint describes the excerpt; its text stays its name -->
    <span :id="revealHintId" class="sr-only">{{ disclosureTextComputed }}</span>
    <button
      ref="bookContentRef"
      type="button"
      class="book-content"
      :aria-expanded="!blackMarker"
      :aria-describedby="revealHintId"
      @click="toggle"
      @contextmenu.prevent
      @mousemove="onSpotlightMove"
      @mouseleave="onSpotlightLeave"
    >
      <h2
        :class="{
          'marker-text-hidden': blackMarker && markerReady,
          'stabilo-hidden': blackMarker && !markerReady,
          'stabilo-visible': !blackMarker,
        }"
        class="book-title"
      >
        {{ haiku.book.title }}
        <MarkerOverlay
          v-if="markerReady"
          :text="haiku.book.title"
          :hidden="blackMarker"
          :delay="0"
          :spotlight="spotlight"
        />
      </h2>

      <div
        :class="{
          'marker-text-hidden': blackMarker && markerReady,
          'stabilo-hidden': blackMarker && !markerReady,
          'stabilo-visible': !blackMarker,
        }"
        class="book-author"
      >
        <span class="by-prefix">{{ $t('common.by') }}</span>
        {{ haiku.book.author }}
        <MarkerOverlay
          v-if="markerReady"
          :text="`${$t('common.by')} ${haiku.book.author}`"
          :hidden="blackMarker"
          :delay="40"
          :spotlight="spotlight"
        />
      </div>

      <div class="chapter-content" :class="{ expandable: !isCompacted }">
        <div v-if="haiku.chapter.content" class="chapter-sheet">
          <p
            :class="{
              'stabilo-hidden': blackMarker && !markerReady,
              'stabilo-visible': !blackMarker,
            }"
            class="chapter-text"
          >
            <PretextChapter
              v-if="markerReady"
              :text="isCompacted ? getCompactedText() : haiku.chapter.content"
              :verses="haiku.rawVerses"
              :hidden="blackMarker"
              :delay="80"
              :spotlight="spotlight"
            />
            <high-light-text
              v-else
              :text="isCompacted ? getCompactedText() : haiku.chapter.content"
              :lines="haiku.rawVerses"
            />
          </p>
        </div>
      </div>
    </button>

    <div class="page-number">— {{ pageNumber }} —</div>

    <!-- Book Footer Links -->
    <div v-if="haiku.book.reference" class="book-footer">
      <a
        :href="`https://www.gutenberg.org/ebooks/${haiku.book.reference}`"
        target="_blank"
        rel="noopener noreferrer"
        class="book-footer__link"
        :aria-label="t('haikuChapter.readOnGutenberg')"
        @click.stop
      >
        <BookOpen :size="16" class="book-footer__icon" />
        <span>{{ t('haikuChapter.readOnGutenberg') }}</span>
      </a>
    </div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.book-page {
  // The bars sit a step under the ink, so the poem above stays the darkest
  // thing. Mixed with the paper, not made translucent: the marker strokes lie
  // over the words and must still hide them
  --haiku-redaction-ink: color-mix(
    in oklch,
    var(--gk-ink) 78%,
    var(--gk-paper-raised)
  );

  position: relative;
  cursor: pointer;
  border-radius: var(--gk-radius-paper);
  background: var(--gk-paper-raised);
  box-shadow: var(--gk-lift);
  overflow: visible;

  &.zen-card {
    padding: 1.5rem 1.25rem 1.25rem;
  }

  &.is-loading {
    pointer-events: none;
    cursor: default;
  }
}

.book-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin: 0 0 1.25rem;
  padding-bottom: 1rem;
  border-bottom: var(--gk-rule-faint);

  .disclosure-text {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
    margin-bottom: 0.5rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    align-items: center;
  }

  // Text keys: no ring, indigo icon (pressable), a faint wash on hover
  .toggle-btn.zen-btn {
    width: 2.75rem !important;
    height: 2.75rem !important;
    min-width: 2.75rem !important;
    min-height: 2.75rem !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: var(--gk-radius-control) !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--gk-indigo) !important;
    cursor: pointer !important;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    :deep(svg) {
      color: currentColor !important;
    }

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: var(--gk-ink-faint) !important;
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
}

.book-content {
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  font: inherit;
  text-align: inherit;
  width: 100%;
  display: block;

  position: relative;
  z-index: 2;
  cursor: pointer;
  border-radius: var(--gk-radius-paper);

  @media (hover: hover) {
    &:hover {
      cursor: v-bind(magnifierCursor);
    }

    [data-theme='dark'] &:hover {
      cursor: v-bind(magnifierCursorDark);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 4px;
  }
}

// Pretext-powered marker: text stays visible (ghosts through semi-opaque bars)
// MarkerOverlay SVG renders the bars on top at ~90% opacity
.marker-text-hidden {
  text-shadow: none !important;
  transition: color var(--gk-dur-base) var(--gk-ease-out);

  // Haiku verse highlights: clear windows through the redaction
  :deep(mark),
  :deep(.highlight) {
    background: var(--gutenku-paper-bg) !important;
    background-image: none !important;
    background-clip: border-box !important;
    color: var(--gutenku-text-primary) !important;
    padding: 0.25rem 0.5rem;
    border-radius: var(--gk-radius-control);
    font-weight: bold;
    position: relative;
    z-index: 20;
    text-shadow: none !important;
    box-shadow: inset 0 0 0 1px var(--gk-ink-faint);
    isolation: isolate;
    display: inline-block;
  }
}

.book-title {
  position: relative;
  margin-top: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gutenku-text-primary);
  text-align: center;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &.stabilo-hidden {
    background: repeating-linear-gradient(
      transparent,
      transparent 0.1em,
      var(--haiku-redaction-ink) 0.1em,
      var(--haiku-redaction-ink) 1.37em,
      transparent 1.37em,
      transparent 1.47em
    );
    background-size: 100% 1.47em;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    mask-repeat: repeat;
    -webkit-mask-repeat: repeat;
    mask-size: 100px 35px;
    -webkit-mask-size: 100px 35px;
    color: transparent;
    text-shadow: none;
  }

  &.stabilo-visible {
    opacity: 1;
  }
}

.book-author {
  position: relative;
  font-size: 1.2rem;
  color: var(--gutenku-text-secondary);
  text-align: center;
  margin-bottom: 1.5rem;
  font-style: italic;

  .by-prefix {
    font-style: normal;
  }

  &.stabilo-hidden {
    background: repeating-linear-gradient(
      transparent,
      transparent 0.1em,
      var(--haiku-redaction-ink) 0.1em,
      var(--haiku-redaction-ink) 1.16em,
      transparent 1.16em,
      transparent 1.26em
    );
    background-size: 100% 1.26em;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    mask-repeat: repeat;
    -webkit-mask-repeat: repeat;
    mask-size: 100px 35px;
    -webkit-mask-size: 100px 35px;
    color: transparent;
    text-shadow: none;
  }

  &.stabilo-visible {
    opacity: 1;
  }
}

// Book footer - links below page number
.book-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.75rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.25em;
    background: none;
    border: 0;
    padding: 0.25rem 0.5rem;
    margin: 0;
    cursor: pointer;
    border-radius: var(--gk-radius-control);
    transition: text-decoration-color var(--gk-dur-fast) var(--gk-ease-out);
    -webkit-appearance: none;
    appearance: none;

    @media (hover: hover) {
      &:hover {
        text-decoration-thickness: 1.5px;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }
}

.chapter-content {
  max-width: 100%;
  margin: 0 auto;

  &:not(.expandable) {
    overflow: visible;
  }

  &.expandable {
    height: 25rem;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .chapter-sheet {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;

    .chapter-text {
      font-size: 0.9375rem;
      line-height: 1.8;
      color: var(--gutenku-text-primary);
      text-align: justify;
      margin: 0;
      padding: 0.5rem 0 1.5rem;
      position: relative;
      transition: opacity var(--gk-dur-base) var(--gk-ease-out);

      &.stabilo-hidden {
        position: relative;

        :deep(*:not(br):not(:empty):not(mark):not(.highlight)) {
          background: repeating-linear-gradient(
            transparent,
            transparent 0.1em,
            var(--haiku-redaction-ink) 0.1em,
            var(--haiku-redaction-ink) 1.16em,
            transparent 1.16em,
            transparent 1.26em
          );
          background-size: 100% 1.26em;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
          -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
          mask-repeat: repeat;
          -webkit-mask-repeat: repeat;
          mask-size: 100px 35px;
          -webkit-mask-size: 100px 35px;
          color: transparent;
          text-shadow: none;
          display: inline;
        }

        :deep(mark) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 0.25rem 0.5rem;
          border-radius: var(--gk-radius-control);
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: inset 0 0 0 1px var(--gk-ink-faint);
          isolation: isolate;
          display: inline-block;
        }

        :deep(.highlight) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 0.25rem 0.5rem;
          border-radius: var(--gk-radius-control);
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: inset 0 0 0 1px var(--gk-ink-faint);
          isolation: isolate;
          display: inline-block;
        }

        :deep(br),
        :deep(:empty) {
          background: none !important;
        }

        &::before {
          display: none !important;
        }
      }

      &.stabilo-visible {
        opacity: 1;

        &::before {
          display: none;
        }

        :deep(mark) {
          background: var(--gk-stamp-wash) !important;
          background-size: 100% 100% !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          color: var(--gk-ink) !important;
          // Negative margin cancels the padding's advance width, so revealing
          // a verse never re-flows the pretext-measured line it sits on
          padding: 2px 8px;
          margin: 0 -8px;
          border-radius: 0;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: inset 0 -1.5px 0 var(--gk-stamp);
          isolation: isolate;
          display: inline-block;
          transform: var(--unique-transform, none);
        }

        :deep(.highlight) {
          background: var(--gk-stamp-wash) !important;
          background-size: 100% 100% !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          color: var(--gk-ink) !important;
          // Negative margin cancels the padding's advance width, so revealing
          // a verse never re-flows the pretext-measured line it sits on
          padding: 2px 8px;
          margin: 0 -8px;
          border-radius: 0;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: inset 0 -1.5px 0 var(--gk-stamp);
          isolation: isolate;
          display: inline-block;
          transform: var(--unique-transform, none);
        }
      }
    }
  }
}

.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-size: 0.875rem;
  color: var(--gk-ink-soft);
  font-variant-numeric: tabular-nums;
  z-index: 3;
}

@media (max-width: 768px) {
  .book-page.zen-card {
    padding: 1.25rem 0.75rem;
    min-height: auto;
  }

  .book-header {
    margin: 0 0 1rem;
  }

  .book-content {
    padding: 0.5rem 0.5rem 0.75rem;
  }

  .book-title {
    font-size: 1.25rem;
  }

  .book-author {
    font-size: 1rem;
  }

  // The folio drops under the Gutenberg link instead of colliding with it
  .page-number {
    position: static;
    margin-top: 0.25rem;
    text-align: center;
  }

  .chapter-content:not(.expandable) {
    max-height: 20rem;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .chapter-text {
    font-size: 0.875rem;
    line-height: 1.7;
  }
}

// Night paper: the marker stays sumi-dark instead of turning into a light block
[data-theme='dark'] .book-page {
  --haiku-redaction-ink: color-mix(in oklch, var(--gk-paper-deep), black 55%);
}

@media (prefers-reduced-motion: reduce) {
  .book-header .toggle-btn.zen-btn {
    transition: none !important;
  }

  .book-header .toggle-btn.zen-btn:active:not(:disabled) {
    transform: none;
  }

  .chapter-content.expandable,
  .chapter-content:not(.expandable) {
    scroll-behavior: auto;
  }
}
</style>
