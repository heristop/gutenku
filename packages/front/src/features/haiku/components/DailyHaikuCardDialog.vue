<script lang="ts" setup>
import { onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ChevronLeft,
  ChevronRight,
  Download,
} from '@/core/components/icons/ink';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenModal from '@/core/components/ui/ZenModal.vue';

// The card at reading size. It belongs to the slip, not to one day's leaf, so
// turning the page (keys or arrows) swaps the card while the sheet stays open.
const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  /** The day's card, or null for a day that has none. */
  src: string | null;
  alt: string;
  /** The haiku's title, heading the sheet. */
  heading: string;
  /** The day, under the heading. */
  meta: string;
  /** Name the card is saved under. */
  filename: string;
  previousLabel: string;
  nextLabel: string;
  hasPrevious: boolean;
  hasNext: boolean;
}>();

const emit = defineEmits<{
  previous: [];
  next: [];
}>();

const { t } = useI18n();

const CARD_WIDTH = 2000;
const CARD_HEIGHT = 2500;

// The ends stay focusable (aria-disabled): a disabled button would drop focus
// out of the sheet the moment the last day is reached
function step(direction: 'previous' | 'next'): void {
  const allowed = direction === 'previous' ? props.hasPrevious : props.hasNext;

  if (!allowed) {
    return;
  }

  if (direction === 'previous') {
    emit('previous');

    return;
  }

  emit('next');
}

// Arrow keys turn the page from anywhere in the sheet, its close key included
function onKeydown(event: KeyboardEvent): void {
  const direction = { ArrowLeft: 'previous', ArrowRight: 'next' }[event.key] as
    | 'previous'
    | 'next'
    | undefined;

  if (
    !direction ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return;
  }

  event.preventDefault();
  step(direction);
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeydown);

    return;
  }

  document.removeEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <ZenModal v-model="open" :title="t('home.daily.card.title')" :max-width="480">
    <template #header>
      <h3 class="card-sheet__heading">{{ heading }}</h3>
      <p class="card-sheet__meta" aria-live="polite">{{ meta }}</p>
    </template>

    <div class="card-sheet">
      <img
        v-if="src"
        :key="src"
        class="card-sheet__full"
        :src="src"
        :alt="alt"
        :width="CARD_WIDTH"
        :height="CARD_HEIGHT"
        decoding="async"
        data-cy="daily-card-full"
      />
      <p v-else class="card-sheet__none" data-cy="daily-card-none">
        {{ t('home.daily.card.none') }}
      </p>
    </div>

    <template #actions>
      <div class="card-sheet__actions">
        <nav class="card-sheet__pager" :aria-label="t('home.daily.nav.label')">
          <button
            type="button"
            class="card-sheet__step"
            :aria-disabled="!hasPrevious"
            :aria-label="previousLabel"
            aria-keyshortcuts="ArrowLeft"
            data-cy="daily-card-prev"
            @click="step('previous')"
          >
            <ChevronLeft :size="18" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="card-sheet__step"
            :aria-disabled="!hasNext"
            :aria-label="nextLabel"
            aria-keyshortcuts="ArrowRight"
            data-cy="daily-card-next"
            @click="step('next')"
          >
            <ChevronRight :size="18" aria-hidden="true" />
          </button>
        </nav>
        <ZenButton
          v-if="src"
          variant="ghost"
          :href="src"
          :download="filename"
          data-cy="daily-card-download"
        >
          <template #icon-left>
            <Download :size="18" />
          </template>
          {{ t('home.daily.card.download') }}
        </ZenButton>
      </div>
    </template>
  </ZenModal>
</template>

<style lang="scss" scoped>
// The opened sheet: title, then its day underneath, then the card
.card-sheet {
  &__heading {
    margin: 0;
    font-family: var(--gk-font);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--gk-ink);
    text-wrap: balance;
  }

  &__meta {
    margin: 0.25rem 0 0;
    font-family: var(--gk-font);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  // Whole on any screen: the sheet's header, keys and margins take ~15rem
  &__full {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: max(12rem, calc(100vh - 15rem));
    max-height: max(12rem, calc(100dvh - 15rem));
    margin-inline: auto;
    aspect-ratio: 4 / 5;
    border-radius: 2px;
    background: var(--gk-paper-deep);
    filter: var(--gk-plate-filter);
  }

  &__none {
    margin: 2rem 0;
    font-family: var(--gk-font);
    text-align: center;
    color: var(--gk-ink-soft);
  }

  // The page keys on the left, the download on the right
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    inline-size: 100%;
  }

  &__pager {
    display: flex;
    gap: 0.25rem;
  }

  // The slip's own page keys, in the sheet
  &__step {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: 2.75rem;
    block-size: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: var(--gk-radius-control);
    background: transparent;
    color: var(--gk-indigo);
    cursor: pointer;
    touch-action: manipulation;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover:not([aria-disabled='true']) {
        background: var(--gk-ink-faint);
      }
    }

    &:active:not([aria-disabled='true']) {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: -2px;
    }

    // Still focusable at the end of the archive, only quieter
    &[aria-disabled='true'] {
      color: var(--gk-ink-faint);
      cursor: default;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-sheet__step {
    transition: none;
  }

  .card-sheet__step:active:not([aria-disabled='true']) {
    transform: none;
  }
}
</style>
