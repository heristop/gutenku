<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { load } from '@fingerprintjs/botd';
import { storeToRefs } from 'pinia';
import { Lightbulb, LightbulbOff, ChevronsUpDown, ChevronsDownUp, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useHaikuHighlighter } from '@/composables/haiku-highlighter';
import { useTextCompacting } from '@/composables/text-compacting';
import { useTouchGestures } from '@/composables/touch-gestures';
import HighLightText from '@/components/HighLightText.vue';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading } = storeToRefs(haikuStore);

const blackMarker = ref(true);
const isCompacted = ref(true);
const chapterRef = ref<HTMLElement | null>(null);
const showSwipeHint = ref(true);

const { isSwiping, isTouchDevice } = useTouchGestures(chapterRef, {
  threshold: 60,
  onSwipeLeft: () => {
    if (!loading.value) {
      showSwipeHint.value = false;
      fetchNewHaiku();
    }
  },
  onSwipeRight: () => {
    if (!loading.value) {
      showSwipeHint.value = false;
      fetchNewHaiku();
    }
  },
  vibrate: true,
  vibrationPattern: [20],
});

const { applyToAllHighlights } = useHaikuHighlighter();

const disclosureText = computed(() =>
  blackMarker.value
    ? t('haikuChapter.disclosure.hidden')
    : t('haikuChapter.disclosure.visible'),
);

const compactedTooltip = computed(() =>
  isCompacted.value
    ? t('haikuChapter.showFull')
    : t('haikuChapter.showCompacted'),
);
const { compactText } = useTextCompacting();

function toggle(): void {
  blackMarker.value = !blackMarker.value;
}

function toggleCompactedView(): void {
  isCompacted.value = !isCompacted.value;
}

const pageNumber = computed(() => {
  if (!haiku.value?.book?.title || !haiku.value?.chapter?.title) {return 1;}

  // Hash book and chapter titles
  const combined = haiku.value.book.title + haiku.value.chapter.title;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % 200) + 1;
});

function getCompactedText(): string {
  if (!haiku.value?.chapter.content || !haiku.value?.rawVerses) {return '';}
  return compactText(haiku.value.chapter.content, haiku.value.rawVerses);
}

onMounted(() => {
  const botdPromise = load();

  botdPromise.then((botd) => {
    if (true === botd.detect().bot) {
      blackMarker.value = false;
    }
  });

  applyToAllHighlights();
});

watch(
  [haiku, isCompacted],
  () => {
    applyToAllHighlights();
  },
  { flush: 'post' },
);
</script>

<template>
  <v-card
    v-if="haiku"
    ref="chapterRef"
    :loading="loading"
    class="book-page gutenku-card"
    :class="{ 'is-swiping': isSwiping }"
  >
    <!-- Screen reader announcement for toggle state -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ disclosureText }}
    </div>

    <div class="book-header">
      <div class="disclosure-text" aria-hidden="true">
        {{ disclosureText }}
      </div>
      <div class="header-controls">
        <ZenTooltip
          :text="t('haikuChapter.discloseHide')"
          position="bottom"
          :disabled="!blackMarker"
        >
          <v-btn
            class="toggle-btn stabilo-toggle"
            :aria-label="t('haikuChapter.discloseHide')"
            data-cy="light-toggle-btn"
            icon
            variant="outlined"
            @click="toggle()"
          >
            <Lightbulb v-if="blackMarker" :size="20" />
            <LightbulbOff v-else :size="20" />
          </v-btn>
        </ZenTooltip>

        <ZenTooltip :text="compactedTooltip" position="bottom">
          <v-btn
            :class="{
              'icon-white': blackMarker,
              'icon-black': !blackMarker,
            }"
            class="toggle-btn expand-toggle"
            :aria-label="compactedTooltip"
            icon
            variant="outlined"
            @click="toggleCompactedView()"
          >
            <ChevronsUpDown v-if="isCompacted" :size="20" />
            <ChevronsDownUp v-else :size="20" />
          </v-btn>
        </ZenTooltip>
      </div>
    </div>

    <div
      class="book-content"
      role="button"
      tabindex="0"
      :aria-expanded="!blackMarker"
      :aria-label="disclosureText"
      @click="toggle()"
      @keydown.enter="toggle()"
      @keydown.space.prevent="toggle()"
    >
      <h2
        :class="{
          'stabilo-hidden': blackMarker,
          'stabilo-visible': !blackMarker,
        }"
        class="book-title"
      >
        {{ haiku.book.title }}
      </h2>

      <!-- Book Author -->
      <div
        :class="{
          'stabilo-hidden': blackMarker,
          'stabilo-visible': !blackMarker,
        }"
        class="book-author"
      >
        {{ haiku.book.author }}
      </div>

      <div class="chapter-content" :class="{ expandable: !isCompacted }">
        <div v-if="haiku.chapter.content" class="chapter-sheet">
          <p
            :class="{
              'stabilo-hidden': blackMarker,
              'stabilo-visible': !blackMarker,
            }"
            class="chapter-text"
          >
            <high-light-text
              :text="isCompacted ? getCompactedText() : haiku.chapter.content"
              :lines="haiku.rawVerses"
            />
          </p>
        </div>
      </div>
    </div>

    <div class="page-number">— {{ pageNumber }} —</div>

    <Transition name="fade">
      <div
        v-if="isTouchDevice && showSwipeHint && !loading"
        class="swipe-hint"
        aria-hidden="true"
      >
        <ChevronLeft :size="16" class="swipe-icon swipe-icon--left" />
        <span class="swipe-text">{{ t('haikuChapter.swipeHint') }}</span>
        <ChevronRight :size="16" class="swipe-icon swipe-icon--right" />
      </div>
    </Transition>
  </v-card>
</template>

<style lang="scss" scoped>
.book-page {
  box-shadow:
    0 2px 4px -1px oklch(0 0 0 / 0.2),
    0 4px 5px 0 oklch(0 0 0 / 0.14),
    0 1px 10px 0 oklch(0 0 0 / 0.12);

  background: var(--gutenku-paper-bg);
  position: relative;
  padding: 3rem 2rem 2rem 3rem;
  margin-bottom: 1.5rem;
  min-height: 31.25rem;
  border-radius: var(--gutenku-radius-sm);
  overflow: visible;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow:
      0 8px 25px oklch(0 0 0 / 0.3),
      0 4px 10px oklch(0 0 0 / 0.2);

    background: color-mix(in oklch, var(--gutenku-paper-bg) 92%, white 8%);
  }

  &:active {
    transform: translateY(-1px) scale(0.99);
    transition: all 0.1s ease;
  }

  [data-theme='dark'] & {
    &:hover {
      background: color-mix(in oklch, var(--gutenku-paper-bg) 88%, white 12%);
      box-shadow:
        0 12px 35px oklch(0 0 0 / 0.4),
        0 6px 15px oklch(0 0 0 / 0.3);
    }
  }

}

.book-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--gutenku-border-visible);
  padding-bottom: 1rem;

  .disclosure-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    align-items: center;
  }

  .toggle-btn {
    background: var(--gutenku-btn-subtle-bg) !important;
    border: 1px solid var(--gutenku-border-visible);
    color: var(--gutenku-text-contrast) !important;
    border-radius: 50%;
    width: 2.5rem;   // 40px
    height: 2.5rem;  // 40px
    box-shadow: var(--gutenku-shadow-light);
    transition: var(--gutenku-transition-zen);
    cursor: pointer !important;

    &,
    *,
    .v-icon,
    .v-icon::before,
    .v-icon::after {
      cursor: pointer !important;
    }

    &:hover {
      background: var(--gutenku-btn-subtle-hover) !important;
      border-color: var(--gutenku-border-visible-hover);
      transform: translateY(-2px) scale(1.05);
      box-shadow: var(--gutenku-shadow-ink);
    }

    &:active {
      transform: translateY(0) scale(0.95);
      transition: var(--gutenku-transition-fast);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: 2px;
    }

    .v-icon {
      transition: var(--gutenku-transition-zen);
    }

    &:hover .v-icon {
      transform: rotate(12deg) scale(1.1);
    }

    &.expand-toggle {
      background: var(--gutenku-btn-expand-bg) !important;
      border: 1px solid var(--gutenku-border-visible);

      &:hover {
        background: var(--gutenku-btn-expand-hover) !important;
        border-color: var(--gutenku-border-visible-hover);
      }

      &.icon-white .v-icon {
        color: #ffffff !important;
        text-shadow: 0 1px 2px oklch(0 0 0 / 0.8);
      }

      &.icon-black .v-icon {
        color: #000000 !important;
        text-shadow: 0 1px 2px oklch(1 0 0 / 0.8);
      }
    }
  }
}

@media (max-width: 768px) {
  .book-header {
    .toggle-btn {
      width: 2.25rem;   // 36px
      height: 2.25rem;  // 36px
    }
  }
}

.book-content {
  position: relative;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--gutenku-radius-sm);

  &:hover {
    cursor:
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'),
      auto;
  }

  [data-theme='dark'] & {
    &:hover {
      cursor:
        url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>'),
        auto;
    }
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 4px;
  }
}

.book-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--gutenku-text-primary);
  text-align: center;
  margin: 2rem 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px oklch(0 0 0 / 0.1);

  &.stabilo-hidden {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.stabilo-visible {
    opacity: 1;
    filter: blur(0);
    transition: all 0.3s ease;
  }
}

.book-author {
  font-size: 1.2rem;
  color: var(--gutenku-text-secondary);
  text-align: center;
  margin-bottom: 2.5rem;
  font-style: italic;

  &::before {
    content: 'by ';
    font-style: normal;
    opacity: 0.7;
  }

  &.stabilo-hidden {
    opacity: 0.3;
    filter: blur(2px);
    transition: all 0.3s ease;
  }

  &.stabilo-visible {
    opacity: 1;
    filter: blur(0);
    transition: all 0.3s ease;
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
      font-size: 1rem;
      line-height: 1.8;
      color: var(--gutenku-text-primary);
      text-align: justify;
      margin: 0;
      padding: 1.5rem 0;
      position: relative;
      transition: opacity 0.3s ease;

      &.stabilo-hidden {
        position: relative;
        transition: all 0.5s ease;

        :deep(*:not(br):not(:empty):not(mark):not(.highlight)) {
          background: repeating-linear-gradient(
            transparent,
            transparent 0.1em,
            oklch(0 0 0 / 0.7) 0.1em,
            oklch(0 0 0 / 0.7) 1.1em,
            transparent 1.1em,
            transparent 1.2em
          );
          background-size: 100% 1.2em;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
          -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
          mask-repeat: repeat;
          -webkit-mask-repeat: repeat;
          mask-size: 100px 35px;
          -webkit-mask-size: 100px 35px;
          color: transparent;
          text-shadow: 0 0 0 #000;
          display: inline;
        }

        :deep(mark) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 0.25rem 0.5rem;  // 4px 8px
          border-radius: var(--gutenku-radius-sm);
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: 0 2px 4px oklch(0 0 0 / 0.1);
          isolation: isolate;
          display: inline-block;
        }

        :deep(.highlight) {
          background: var(--gutenku-paper-bg) !important;
          background-image: none !important;
          background-clip: border-box !important;
          color: var(--gutenku-text-primary) !important;
          padding: 0.25rem 0.5rem;  // 4px 8px
          border-radius: var(--gutenku-radius-sm);
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: none !important;
          box-shadow: 0 2px 4px oklch(0 0 0 / 0.1);
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
        filter: blur(0);
        transition: all 0.5s ease;

        &::before {
          display: none;
        }

        :deep(mark) {
          background: var(--unique-highlighter-bg, #ffd700) !important;
          background-size: 100% 100% !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          color: #2c2c2c !important;
          padding: 2px 8px;
          border-radius: 0;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px oklch(0 0 0 / 0.1) !important;
          box-shadow: none;
          isolation: isolate;
          display: inline-block;
          transform: var(--unique-transform, none);
          transition: transform 0.2s ease;
        }

        :deep(.highlight) {
          background: var(--unique-highlighter-bg, #ffd700) !important;
          background-size: 100% 100% !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          color: #2c2c2c !important;
          padding: 2px 8px;
          border-radius: 0;
          font-weight: bold;
          position: relative;
          z-index: 20;
          text-shadow: 0 1px 2px oklch(0 0 0 / 0.1) !important;
          box-shadow: none;
          isolation: isolate;
          display: inline-block;
          transform: var(--unique-transform, none);
          transition: transform 0.2s ease;
        }
      }
    }
  }
}

// Page number
.page-number {
  position: absolute;
  bottom: 1rem;
  right: 2rem;
  font-size: 0.8rem;
  color: var(--gutenku-text-muted);
  z-index: 3;
}

@media (max-width: 768px) {
  .book-page {
    padding: 2rem 1.5rem 1.5rem 2rem;
    min-height: 25rem;  // 400px
  }

  .book-title {
    font-size: 1.5rem;
  }

  .book-author {
    font-size: 1rem;
  }

  .chapter-text {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}

// Swipe visual feedback
.book-page.is-swiping {
  transform: scale(0.98);
  opacity: 0.9;
  transition: all 0.15s ease;
}

// Swipe hint indicator
.swipe-hint {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: oklch(0 0 0 / 0.06);
  border-radius: 2rem;
  font-size: 0.7rem;
  color: var(--gutenku-text-muted);
  z-index: 10;
  pointer-events: none;

  .swipe-text {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .swipe-icon {
    opacity: 0.6;

    &--left {
      animation: swipe-bounce-left 1.5s ease-in-out infinite;
    }

    &--right {
      animation: swipe-bounce-right 1.5s ease-in-out infinite;
    }
  }
}

@keyframes swipe-bounce-left {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-4px);
  }
}

@keyframes swipe-bounce-right {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}

// Fade transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Dark theme swipe hint
[data-theme='dark'] .swipe-hint {
  background: oklch(1 0 0 / 0.08);
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .swipe-icon--left,
  .swipe-icon--right {
    animation: none;
  }

  .book-page.is-swiping {
    transform: none;
  }
}

// Screen reader only
.sr-only {
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
