<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Search } from '@/core/components/icons/ink';

// The day's card, tipped into the slip like a plate in a book: a small leaf
// beside the poem, never a second poem. Pressed, the slip opens it at reading
// size (the sheet lives in the slip, so it outlasts a turn of the page).
defineProps<{
  /** Absolute URL of the drawn card (a 2000×2500 JPEG). */
  src: string;
  alt: string;
}>();

const emit = defineEmits<{
  open: [];
  // The image could not be drawn: the slip takes the plate away
  failed: [];
}>();

const { t } = useI18n();

// The card is drawn 4:5; the browser keeps its room before it arrives
const CARD_WIDTH = 2000;
const CARD_HEIGHT = 2500;
</script>

<template>
  <div class="daily-card">
    <button
      type="button"
      class="daily-card__plate"
      :aria-label="t('home.daily.card.open')"
      aria-haspopup="dialog"
      data-cy="daily-card"
      @click="emit('open')"
    >
      <img
        class="daily-card__img"
        :src="src"
        :alt="alt"
        :width="CARD_WIDTH"
        :height="CARD_HEIGHT"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        draggable="false"
        @error="emit('failed')"
      />
      <!-- A small key on the corner: indigo, because the plate can be pressed -->
      <span class="daily-card__key" aria-hidden="true">
        <Search :size="12" />
      </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.daily-card {
  // The plate: the card's own paper is its leaf, so no second mat around it
  &__plate {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    border-radius: 2px;
    // The room it keeps while the image arrives is a leaf of deeper paper
    background: var(--gk-paper-deep);
    box-shadow: var(--gk-lift);
    cursor: zoom-in;
    touch-action: manipulation;
    transition: transform var(--gk-dur-press) var(--gk-ease-out);

    // Gives under the finger, like the keys beside it
    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 3px;
    }
  }

  &__img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 5;
    border-radius: inherit;
    object-fit: cover;
    // Dimmed against night paper, like every tipped-in plate
    filter: var(--gk-plate-filter);
  }

  // A ghost key in miniature, set on the plate's corner
  &__key {
    position: absolute;
    top: -0.375rem;
    right: -0.375rem;
    display: grid;
    place-items: center;
    inline-size: 1.25rem;
    block-size: 1.25rem;
    border-radius: var(--gk-radius-control);
    background: var(--gk-paper-raised);
    box-shadow: inset 0 0 0 1.5px var(--gk-ink);
    color: var(--gk-indigo);
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      box-shadow var(--gk-dur-fast) var(--gk-ease-out);
  }

  @media (hover: hover) {
    &__plate:hover &__key {
      background: var(--gk-indigo-fill);
      box-shadow: inset 0 0 0 1.5px var(--gk-indigo-fill);
      color: var(--gk-on-indigo-fill);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .daily-card__plate,
  .daily-card__key {
    transition: none;
  }

  .daily-card__plate:active {
    transform: none;
  }
}

@media (forced-colors: active) {
  .daily-card__plate {
    border: 1px solid CanvasText;
  }
}
</style>
