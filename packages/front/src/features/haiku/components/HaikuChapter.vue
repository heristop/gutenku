<script lang="ts" setup>
import {
  onMounted,
  ref,
  computed,
  watch,
  onUnmounted,
  nextTick,
  shallowRef,
} from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  Lightbulb,
  LightbulbOff,
  ChevronsUpDown,
  ChevronsDownUp,
  BookOpen,
  Sparkles,
} from 'lucide-vue-next';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useHaikuHighlighter } from '@/features/haiku/composables/haiku-highlighter';
import { useTextCompacting } from '@/features/haiku/composables/text-compacting';
import { useBotDetection } from '@/core/composables/bot-detection';
import { useLongPress } from '@/core/composables/touch-gestures';
import HighLightText from '@/features/haiku/components/HighLightText.vue';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';

const { t } = useI18n();

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading, craftingMessages, isDailyHaiku } =
  storeToRefs(haikuStore);

const blackMarker = ref(true);
const isCompacted = ref(true);
const chapterRef = ref<{ $el: HTMLElement } | null>(null);
const bookContentRef = ref<HTMLElement | null>(null);

const cardPosition = shallowRef({ top: 0, left: 0, width: 0 });
const chapterEl = computed(() => chapterRef.value?.$el as HTMLElement | null);

// Throttle rect updates to ~60fps max to prevent layout thrashing
const updateCardRect = useDebounceFn(() => {
  if (chapterEl.value) {
    const rect = chapterEl.value.getBoundingClientRect();
    cardPosition.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
    };
  }
}, 16);

// Use CSS custom properties for smoother updates
const craftingStyle = computed(() => {
  if (!cardPosition.value.width) {
    return {};
  }
  return {
    '--crafting-top': `${cardPosition.value.top + 16}px`,
    '--crafting-left': `${cardPosition.value.left + cardPosition.value.width / 2}px`,
    '--crafting-width': `${Math.min(cardPosition.value.width - 64, 400)}px`,
  };
});

watch(loading, (isLoading) => {
  if (isLoading) {
    nextTick(updateCardRect);
  }
});

watch(
  craftingMessages,
  (messages) => {
    if (messages.length > 0 && !cardPosition.value.width) {
      nextTick(updateCardRect);
    }
  },
  { immediate: true },
);

let resizeObserver: ResizeObserver | null = null;
let scrollListener: (() => void) | null = null;

const { applyToAllHighlights } = useHaikuHighlighter();

const compactedTooltip = computed(() =>
  isCompacted.value
    ? t('haikuChapter.showFull')
    : t('haikuChapter.showCompacted'),
);
const { compactText } = useTextCompacting();

// Long press for mobile, click for desktop
const { isPressed, progress, isTouchDevice } = useLongPress(bookContentRef, {
  delay: 500,
  onLongPress: () => {
    blackMarker.value = !blackMarker.value;
  },
});

// Compute disclosure text based on device type
const disclosureTextComputed = computed(() => {
  if (isTouchDevice.value) {
    return blackMarker.value
      ? t('haikuChapter.disclosure.hidden')
      : t('haikuChapter.disclosure.visible');
  }
  return blackMarker.value
    ? t('haikuChapter.disclosure.hiddenDesktop')
    : t('haikuChapter.disclosure.visibleDesktop');
});

function toggle(): void {
  blackMarker.value = !blackMarker.value;
}

function handleClick(): void {
  // On desktop (non-touch), toggle on click
  if (!isTouchDevice.value) {
    toggle();
  }
}

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

onMounted(() => {
  detectBot();
  applyToAllHighlights();

  // Use ResizeObserver for efficient layout updates
  if (chapterEl.value) {
    resizeObserver = new ResizeObserver(updateCardRect);
    resizeObserver.observe(chapterEl.value);
  }

  // Only listen to scroll when loading (for fixed positioning)
  scrollListener = () => {
    if (loading.value) {
      updateCardRect();
    }
  };
  window.addEventListener('scroll', scrollListener, { passive: true });
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

onUnmounted(() => {
  resizeObserver?.disconnect();
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
  }
});
</script>

<template>
  <ZenCard
    v-if="haiku"
    id="book-page"
    ref="chapterRef"
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

    <Teleport to="body">
      <Transition name="crafting-fade">
        <div
          v-if="craftingMessages.length > 0 && cardPosition.width"
          class="crafting-messages-teleported"
          :style="craftingStyle"
          role="log"
          aria-live="polite"
        >
          <TransitionGroup name="message-slide" tag="div" class="messages-list">
            <div
              v-for="(msg, index) in craftingMessages.slice(0, 6)"
              :key="msg.id || `msg-${msg.timestamp}-${index}`"
              class="crafting-message"
              :class="{ latest: index === 0 }"
            >
              <span class="message-icon" aria-hidden="true">
                <component :is="msg.icon" :size="16" />
              </span>
              <span class="message-text">{{ msg.text }}</span>
            </div>
          </TransitionGroup>
        </div>
      </Transition>
    </Teleport>

    <div class="book-header">
      <div
        v-if="isDailyHaiku && haiku?.cacheUsed"
        class="daily-header"
        role="status"
        :aria-label="t('haiku.dailyHaiku')"
      >
        <div class="daily-header__line" />
        <div class="daily-header__badge">
          <Sparkles :size="14" />
          <span>{{ t('haiku.dailyHaiku') }}</span>
          <Sparkles :size="14" />
        </div>
        <div class="daily-header__line" />
      </div>

      <div class="disclosure-text" aria-hidden="true">
        {{ disclosureTextComputed }}
      </div>
      <div class="header-controls">
        <ZenTooltip
          :text="t('haikuChapter.discloseHide')"
          position="bottom"
          :disabled="!blackMarker"
        >
          <ZenButton
            variant="ghost"
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
            variant="ghost"
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

    <button
      ref="bookContentRef"
      type="button"
      class="book-content"
      :class="{ 'is-pressing': isPressed }"
      :aria-expanded="!blackMarker"
      :aria-label="disclosureTextComputed"
      @click="handleClick"
      @contextmenu.prevent
    >
      <!-- Long press progress indicator (mobile only) -->
      <Transition name="long-press-fade">
        <div v-if="isPressed && isTouchDevice" class="long-press-indicator">
          <div class="long-press-indicator__glow" />
          <svg viewBox="0 0 100 100" class="progress-ring">
            <circle class="progress-ring__background" cx="50" cy="50" r="42" />
            <circle
              class="progress-ring__progress"
              cx="50"
              cy="50"
              r="42"
              :style="{ strokeDashoffset: 264 - (264 * progress) / 100 }"
            />
          </svg>
          <div class="long-press-indicator__icon">
            <Lightbulb v-if="blackMarker" :size="24" />
            <LightbulbOff v-else :size="24" />
          </div>
        </div>
      </Transition>
      <h2
        :class="{
          'stabilo-hidden': blackMarker,
          'stabilo-visible': !blackMarker,
        }"
        class="book-title"
      >
        {{ haiku.book.title }}
      </h2>

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
    </button>

    <a
      v-if="haiku.book.reference"
      :href="`https://www.gutenberg.org/ebooks/${haiku.book.reference}`"
      target="_blank"
      rel="noopener noreferrer"
      class="gutenberg-link"
      :aria-label="t('haikuChapter.readOnGutenberg')"
      @click.stop
    >
      <BookOpen :size="16" />
      <span>{{ t('haikuChapter.readOnGutenberg') }}</span>
    </a>

    <div class="page-number">— {{ pageNumber }} —</div>
  </ZenCard>
</template>

<style lang="scss" scoped>
.book-page {
  position: relative;
  margin-bottom: 1.5rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  border-radius: var(--gutenku-radius-sm);
  background: var(--gutenku-paper-bg);
  overflow: visible;

  &.is-loading {
    pointer-events: none;
    cursor: default;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.15),
      0 2px 6px oklch(0 0 0 / 0.1);
  }

  &:active {
    transform: translateY(-1px) scale(0.99);
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  [data-theme='dark'] & {
    &:hover {
      box-shadow:
        0 4px 12px oklch(0 0 0 / 0.25),
        0 2px 6px oklch(0 0 0 / 0.15);
    }
  }
}

.book-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;

  // Ink wash separator
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }

  .daily-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 2.25rem;
    animation: daily-fade-in 0.5s ease-out 0.2s both;
  }

  .daily-header__line {
    flex: 1;
    max-width: 8rem;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent, oklch(0.5 0.08 195)) 100%
    );

    &:last-child {
      background: linear-gradient(
        90deg,
        var(--gutenku-zen-accent, oklch(0.5 0.08 195)) 0%,
        transparent 100%
      );
    }
  }

  .daily-header__badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.875rem;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gutenku-zen-primary, oklch(0.4 0.08 195));
    white-space: nowrap;
    background: oklch(0.5 0.08 195 / 0.08);
    border-radius: 100px;
    border: 1px solid oklch(0.5 0.08 195 / 0.15);
  }

  .disclosure-text {
    font-size: 0.9rem;
    color: var(--gutenku-text-muted);
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }

  .header-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    align-items: center;
  }

  .toggle-btn.zen-btn {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.12) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-water) !important;
    border: 1.5px solid oklch(0.45 0.1 195 / 0.2) !important;
    color: var(--gutenku-zen-primary) !important;
    border-radius: 50% !important;
    width: 2.75rem !important;
    height: 2.75rem !important;
    min-width: 2.75rem !important;
    min-height: 2.75rem !important;
    padding: 0 !important;
    box-shadow:
      0 2px 8px oklch(0.45 0.08 195 / 0.12),
      inset 0 1px 0 oklch(1 0 0 / 0.15);
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center center;
    cursor: pointer !important;

    &:hover:not(:disabled):not([aria-disabled='true']) {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.2) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-primary) !important;
      border-color: var(--gutenku-zen-primary) !important;
      transform: scale(1.05);
      box-shadow:
        0 6px 20px oklch(0.45 0.1 195 / 0.28),
        0 0 0 3px oklch(0.45 0.1 195 / 0.1),
        inset 0 1px 0 oklch(1 0 0 / 0.2);
    }

    &:active:not(:disabled):not([aria-disabled='true']) {
      transform: scale(0.95);
    }

    :deep(svg) {
      transition: color 0.3s ease;
    }

    &:hover:not(:disabled):not([aria-disabled='true']) :deep(svg) {
      transform: none;
      color: white !important;
    }

    &.expand-toggle {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.12) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-water) !important;
      border: 1.5px solid oklch(0.45 0.1 195 / 0.2) !important;

      &:hover:not(:disabled):not([aria-disabled='true']) {
        background:
          radial-gradient(
            circle at 30% 30%,
            oklch(1 0 0 / 0.2) 0%,
            transparent 50%
          ),
          var(--gutenku-zen-primary) !important;
        border-color: var(--gutenku-zen-primary) !important;
      }

      :deep(svg) {
        color: var(--gutenku-zen-primary) !important;
      }

      &:hover:not(:disabled):not([aria-disabled='true']) :deep(svg) {
        transform: none;
        color: white !important;
      }
    }
  }
}

@media (max-width: 768px) {
  .book-header {
    .toggle-btn.zen-btn {
      width: 2.5rem !important;
      height: 2.5rem !important;
      min-width: 2.5rem !important;
      min-height: 2.5rem !important;
    }
  }
}

// Dark mode for toggle buttons
[data-theme='dark'] .book-header {
  .toggle-btn.zen-btn {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.08) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.7) !important;
    border-color: oklch(0.5 0.08 195 / 0.3) !important;
    color: var(--gutenku-zen-accent) !important;
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.08);

    :deep(svg) {
      color: var(--gutenku-zen-accent) !important;
    }

    &:hover:not(:disabled):not([aria-disabled='true']) {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.12) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent) !important;
      border-color: var(--gutenku-zen-accent) !important;
      box-shadow:
        0 6px 20px oklch(0.6 0.1 195 / 0.4),
        0 0 0 3px oklch(0.6 0.1 195 / 0.2),
        inset 0 1px 0 oklch(1 0 0 / 0.1);

      :deep(svg) {
        transform: none;
        color: oklch(0.12 0.02 195) !important;
      }
    }
  }
}

.book-content {
  background: var(--gutenku-paper-bg);
  border: none;
  padding: 1rem 1.5rem;
  font: inherit;
  text-align: inherit;
  width: 100%;
  display: block;

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

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 4px;
  }

  &.is-pressing {
    transform: scale(0.995);
  }
}

.long-press-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  z-index: 100;
  pointer-events: none;

  &__glow {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      var(--gutenku-zen-water, oklch(0.85 0.05 195 / 0.15)) 0%,
      transparent 70%
    );
    animation: long-press-glow 0.5s ease-out;
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--gutenku-zen-primary, oklch(0.45 0.1 195));
    animation: long-press-icon-pulse 0.3s ease-out;

    svg {
      filter: drop-shadow(0 2px 4px oklch(0 0 0 / 0.15));
    }
  }

  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    filter: drop-shadow(0 2px 8px oklch(0.45 0.1 195 / 0.3));
  }

  .progress-ring__background {
    fill: oklch(1 0 0 / 0.5);
    stroke: var(--gutenku-zen-water, oklch(0.85 0.05 195 / 0.6));
    stroke-width: 3;
  }

  .progress-ring__progress {
    fill: none;
    stroke: var(--gutenku-zen-primary, oklch(0.45 0.1 195));
    stroke-width: 5;
    stroke-linecap: round;
    stroke-dasharray: 264;
    stroke-dashoffset: 264;
    transition: stroke-dashoffset 0.05s linear;
  }
}

@keyframes long-press-glow {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes long-press-icon-pulse {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.long-press-fade-enter-active {
  transition: all 0.15s ease-out;
}

.long-press-fade-leave-active {
  transition: all 0.2s ease-in;
}

.long-press-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}

.long-press-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

// Hide long press indicator on desktop
@media (pointer: fine) {
  .long-press-indicator {
    display: none;
  }
}

[data-theme='dark'] .long-press-indicator {
  &__glow {
    background: radial-gradient(
      circle,
      oklch(0.5 0.08 195 / 0.12) 0%,
      transparent 70%
    );
  }

  &__icon {
    color: var(--gutenku-zen-accent, oklch(0.65 0.1 195));
  }

  .progress-ring {
    filter: drop-shadow(0 2px 8px oklch(0.6 0.1 195 / 0.3));
  }

  .progress-ring__background {
    fill: oklch(0.15 0.02 195 / 0.5);
    stroke: oklch(0.3 0.05 195 / 0.6);
  }

  .progress-ring__progress {
    stroke: var(--gutenku-zen-accent, oklch(0.65 0.1 195));
  }
}

.book-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--gutenku-text-primary);
  text-align: center;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 1px 1px 2px oklch(0 0 0 / 0.1);
  transition: all 0.3s ease;

  &.stabilo-hidden {
    background: repeating-linear-gradient(
      transparent,
      transparent 0.1em,
      oklch(0 0 0 / 0.7) 0.1em,
      oklch(0 0 0 / 0.7) 1.3em,
      transparent 1.3em,
      transparent 1.4em
    );
    background-size: 100% 1.4em;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='35' viewBox='0 0 100 35'%3E%3Cpath d='M0,4 L8,3.7 L15,4.2 L23,3.9 L32,4.1 L42,3.8 L52,4.3 L62,3.9 L72,4.1 L82,3.8 L92,4.2 L100,4 L100,31 L92,31.3 L82,30.9 L72,31.2 L62,31 L52,31.4 L42,30.8 L32,31.3 L23,31 L15,31.2 L8,30.9 L0,31.1 Z' fill='white'/%3E%3C/svg%3E");
    mask-repeat: repeat;
    -webkit-mask-repeat: repeat;
    mask-size: 100px 35px;
    -webkit-mask-size: 100px 35px;
    color: transparent;
    text-shadow: 0 0 0 #000;
  }

  &.stabilo-visible {
    opacity: 1;
  }
}

.book-author {
  font-size: 1.2rem;
  color: var(--gutenku-text-secondary);
  text-align: center;
  margin-bottom: 2.5rem;
  font-style: italic;
  transition: all 0.3s ease;

  &::before {
    content: 'by ';
    font-style: normal;
    opacity: 0.7;
  }

  &.stabilo-hidden {
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
  }

  &.stabilo-visible {
    opacity: 1;
  }
}

.gutenberg-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  font-size: 0.85rem;
  color: var(--gutenku-text-muted);
  text-decoration: none;
  margin-top: 1rem;
  margin-bottom: 3rem;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--gutenku-zen-primary);

    svg {
      transform: translateY(-1px);
    }
  }

  [data-theme='dark'] & {
    &:hover {
      color: var(--gutenku-zen-accent);
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
      font-size: 0.9rem;
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
          padding: 0.25rem 0.5rem;
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
          padding: 0.25rem 0.5rem;
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
    padding: 1.25rem 0.75rem 1.5rem 1rem;
    min-height: auto;
    margin-top: 0;
  }

  .book-title {
    font-size: 1.25rem;
  }

  .book-author {
    font-size: 1rem;
  }

  .chapter-content:not(.expandable) {
    max-height: 20rem;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .chapter-text {
    font-size: 0.85rem;
    line-height: 1.6;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes daily-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode for daily header
[data-theme='dark'] .book-header {
  .daily-header__line {
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent, oklch(0.6 0.08 195)) 100%
    );

    &:last-child {
      background: linear-gradient(
        90deg,
        var(--gutenku-zen-accent, oklch(0.6 0.08 195)) 0%,
        transparent 100%
      );
    }
  }

  .daily-header__badge {
    color: var(--gutenku-zen-accent, oklch(0.7 0.08 195));
    background: oklch(0.5 0.08 195 / 0.12);
    border-color: oklch(0.5 0.08 195 / 0.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-header .daily-header {
    animation: none;
    opacity: 1;
  }
}

.crafting-messages-teleported {
  position: fixed;
  top: var(--crafting-top);
  left: var(--crafting-left);
  transform: translateX(-50%);
  width: var(--crafting-width);
  z-index: 1000;
  will-change: top, left;
  padding: 0.75rem 1rem;
  background: var(--gutenku-paper-bg, #f5f0e8);
  border-radius: var(--gutenku-radius-md, 8px);
  border: 1px solid oklch(0.65 0.18 145 / 0.3);
  box-shadow: 0 4px 16px oklch(0 0 0 / 0.2);
  pointer-events: none;

  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .crafting-message {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--gutenku-paper-bg, #f5f0e8);
    border-radius: var(--gutenku-radius-sm, 4px);
    font-size: 0.85rem;
    line-height: 1.5;
    opacity: 0.6;
    transition: all 0.3s ease;

    &.latest {
      opacity: 1;
      background: oklch(0.65 0.18 145 / 0.12);
      box-shadow: 0 2px 8px oklch(0.65 0.18 145 / 0.15);
    }
  }

  .message-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    color: var(--gutenku-zen-primary);
    opacity: 0.8;
  }

  .message-text {
    flex: 1;
    color: var(--gutenku-text-primary, #2c2c2c);
    word-break: break-word;
  }
}

.crafting-fade-enter-active,
.crafting-fade-leave-active {
  transition: all 0.3s ease;
}

.crafting-fade-enter-from,
.crafting-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) !important;
}

.message-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-slide-leave-active {
  transition: all 0.2s ease;
}

.message-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.message-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.message-slide-move {
  transition: transform 0.3s ease;
}

[data-theme='dark'] .crafting-messages-teleported {
  background: var(--gutenku-paper-bg, #2a2520);
  box-shadow: 0 4px 20px oklch(0 0 0 / 0.4);

  .crafting-message {
    background: var(--gutenku-paper-bg, #2a2520);
  }

  .message-text {
    color: var(--gutenku-text-primary, #e8e0d0);
  }
}
</style>
