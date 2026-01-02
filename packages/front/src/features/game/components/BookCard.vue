<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, X } from 'lucide-vue-next';
import { useHapticFeedback } from '@/core/composables/haptic-feedback';
import { useLongPress } from '@/core/composables/touch-gestures';
import type { BookValue } from '@gutenku/shared';

export type CardState = 'normal' | 'eliminated' | 'selected' | 'correct' | 'wrong';

const props = withDefaults(defineProps<{
  book: BookValue;
  state?: CardState;
  disabled?: boolean;
  spotlight?: boolean;
}>(), {
  state: 'normal',
  disabled: false,
  spotlight: false,
});

const emit = defineEmits<{
  select: [book: BookValue];
  eliminate: [book: BookValue];
}>();

const { t } = useI18n();
const { vibrateSelect, vibrateEliminate } = useHapticFeedback();

// Long-press to eliminate on touch devices
const buttonRef = ref<HTMLElement | null>(null);
const longPressProgress = ref(0);

const { isPressed } = useLongPress(buttonRef, {
  delay: 500,
  onLongPress: () => {
    if (props.disabled || props.state === 'correct' || props.state === 'wrong' || props.state === 'eliminated') {
      return;
    }
    vibrateEliminate();
    emit('eliminate', props.book);
  },
  onProgress: (progress) => {
    longPressProgress.value = progress;
  },
});

// Reset progress when released
watch(isPressed, (pressed) => {
  if (!pressed) {
    longPressProgress.value = 0;
  }
});

const accessibleLabel = computed(() => {
  const baseLabel = `${props.book.title} ${t('common.by')} ${props.book.author}`;
  const stateLabels: Record<CardState, string> = {
    normal: '',
    eliminated: t('game.cardState.eliminated'),
    selected: t('game.cardState.selected'),
    correct: t('game.cardState.correct'),
    wrong: t('game.cardState.wrong'),
  };
  const stateLabel = stateLabels[props.state];
  return stateLabel ? `${baseLabel}, ${stateLabel}` : baseLabel;
});

const hasError = ref(false);

const coverUrl = computed(() => {
  if (hasError.value) {
    return '/covers/default.webp';
  }
  return `/covers/${props.book.reference}.webp`;
});

function handleImageError() {
  hasError.value = true;
}

const cardClasses = computed(() => [
  'book-card',
  `book-card--${props.state}`,
  {
    'book-card--disabled': props.disabled,
    'book-card--spotlight': props.spotlight,
  },
]);

function handleClick() {
  if (props.disabled || props.state === 'correct' || props.state === 'wrong') {
    return;
  }
  vibrateSelect();
  emit('select', props.book);
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault();
  if (props.disabled || props.state === 'correct' || props.state === 'wrong') {
    return;
  }
  vibrateEliminate();
  emit('eliminate', props.book);
}
</script>

<template>
  <button
    ref="buttonRef"
    :class="cardClasses"
    :disabled="disabled"
    :aria-label="accessibleLabel"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <!-- Long-press progress indicator (touch only) -->
    <div
      v-if="isPressed && longPressProgress > 0"
      class="book-card__long-press-indicator"
      :style="{ '--progress': `${longPressProgress}%` }"
    />

    <!-- Cover image -->
    <div class="book-card__cover">
      <img
        :src="coverUrl"
        :alt="book.title"
        class="book-card__image"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- Sepia tint overlay -->
      <div class="book-card__tint" aria-hidden="true" />

      <!-- State overlays -->
      <Transition name="overlay">
        <div
          v-if="state === 'eliminated'"
          class="book-card__overlay book-card__overlay--eliminated"
        >
          <span class="book-card__eliminated-text">X</span>
        </div>
      </Transition>

      <Transition name="overlay">
        <div
          v-if="state === 'correct'"
          class="book-card__overlay book-card__overlay--correct"
        >
          <Check :size="32" :stroke-width="3" />
        </div>
      </Transition>

      <Transition name="overlay">
        <div
          v-if="state === 'wrong'"
          class="book-card__overlay book-card__overlay--wrong"
        >
          <X :size="32" :stroke-width="3" />
        </div>
      </Transition>

      <!-- Selection indicator -->
      <div v-if="state === 'selected'" class="book-card__selection-ring" />

      <!-- Hover tooltip -->
      <div class="book-card__tooltip">
        <span class="book-card__tooltip-title">{{ book.title }}</span>
        <span class="book-card__tooltip-author">{{ book.author }}</span>
      </div>
    </div>

    <!-- Title -->
    <div class="book-card__title">
      {{ book.title }}
    </div>
  </button>
</template>

<style lang="scss" scoped>
// Long-press progress indicator for touch elimination
.book-card__long-press-indicator {
  position: absolute;
  inset: 0;
  border-radius: var(--gutenku-radius-sm);
  pointer-events: none;
  z-index: 20;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--progress, 0%);
    background: linear-gradient(
      to top,
      oklch(0.5 0.15 25 / 0.6) 0%,
      oklch(0.6 0.15 25 / 0.3) 100%
    );
    transition: height 16ms linear;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid oklch(0.5 0.15 25 / 0.6);
    border-radius: inherit;
    animation: long-press-pulse 0.3s ease-in-out infinite;
  }
}

@keyframes long-press-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.book-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  padding-bottom: 0.25rem;
  width: 100%;
  max-width: 90px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  @media (min-width: 600px) {
    max-width: 100px;
    padding-bottom: 0.375rem;
  }

  &:focus-visible {
    .book-card__cover {
      box-shadow:
        0 0 0 2px var(--gutenku-zen-accent),
        var(--gutenku-shadow-zen);
    }
  }

  &:hover:not(:disabled):not(.book-card--disabled) {
    transform: translateY(-2px);

    .book-card__cover {
      box-shadow:
        0 4px 12px oklch(0 0 0 / 0.15),
        0 2px 4px oklch(0 0 0 / 0.1);
    }
  }

  &:active:not(:disabled):not(.book-card--disabled) {
    transform: translateY(-1px) scale(0.98);
  }
}

.book-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--gutenku-radius-sm);
  overflow: hidden;
  background: var(--gutenku-zen-water);
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.1);
  transition: box-shadow 0.2s ease;
}

.book-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Warm sepia tint overlay for vintage zen aesthetic
.book-card__tint {
  position: absolute;
  inset: 0;
  background: oklch(0.6 0.06 55 / 0.18);
  pointer-events: none;
  mix-blend-mode: multiply;
}

[data-theme='dark'] .book-card__tint {
  background: oklch(0.45 0.05 50 / 0.18);
  mix-blend-mode: multiply;
}

.book-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.book-card__overlay--eliminated {
  background: oklch(0.3 0 0 / 0.7);
}

.book-card__eliminated-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: oklch(0.7 0 0);
}

.book-card__overlay--correct {
  background: oklch(0.5 0.2 145 / 0.85);
  color: white;
  animation: celebrate 0.5s ease-out;
}

.book-card__overlay--wrong {
  background: oklch(0.5 0.2 25 / 0.85);
  color: white;
  animation: shake 0.4s ease-out;
}

// Dark mode overlays - brighter for visibility
[data-theme='dark'] .book-card__overlay--correct {
  background: oklch(0.55 0.22 145 / 0.9);
  box-shadow: inset 0 0 20px oklch(0.7 0.2 145 / 0.3);
}

[data-theme='dark'] .book-card__overlay--wrong {
  background: oklch(0.55 0.22 25 / 0.9);
  box-shadow: inset 0 0 20px oklch(0.7 0.2 25 / 0.3);
}

.book-card__selection-ring {
  position: absolute;
  inset: -2px;
  border: 2px solid var(--gutenku-zen-accent);
  border-radius: calc(var(--gutenku-radius-sm) + 2px);
  animation: pulse 1.5s ease-in-out infinite;
}

.book-card__title {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--gutenku-text-primary);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  min-height: 2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  opacity: 0.92;

  @media (min-width: 600px) {
    font-size: 0.8rem;
    line-height: 1.3;
    min-height: 2.5rem;
    -webkit-line-clamp: 3;
  }
}

// Hover tooltip on cover
.book-card__tooltip {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: oklch(0.12 0.02 250 / 0.85);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
}

.book-card__tooltip-title {
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: oklch(0.98 0 0);
  text-align: center;
  line-height: 1.3;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 1px 2px oklch(0 0 0 / 0.5);
}

.book-card__tooltip-author {
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.55rem;
  font-weight: 400;
  color: oklch(0.8 0.04 80);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px oklch(0 0 0 / 0.5);
}

.book-card:hover:not(:disabled):not(.book-card--disabled) {
  .book-card__tooltip {
    opacity: 1;
    visibility: visible;
  }
}

// Dark mode tooltip
[data-theme='dark'] .book-card__tooltip {
  background: oklch(0.08 0.02 250 / 0.9);
  backdrop-filter: blur(6px);
}

[data-theme='dark'] .book-card__tooltip-title {
  color: oklch(0.95 0.02 80);
  text-shadow: 0 1px 3px oklch(0 0 0 / 0.7);
}

[data-theme='dark'] .book-card__tooltip-author {
  color: oklch(0.75 0.06 80);
  text-shadow: 0 1px 3px oklch(0 0 0 / 0.7);
}

// States
.book-card--eliminated {
  .book-card__cover {
    filter: grayscale(1);
    opacity: 0.5;
  }

  .book-card__title {
    opacity: 0.4;
    text-decoration: line-through;
  }
}

.book-card--selected {
  transform: translateY(-4px);

  .book-card__cover {
    box-shadow:
      0 0 0 3px var(--gutenku-zen-accent),
      0 8px 20px oklch(0 0 0 / 0.15);
  }
}

.book-card--correct {
  cursor: default;
}

.book-card--wrong {
  cursor: default;
}

.book-card--disabled {
  cursor: not-allowed;
  opacity: 0.6;

  .book-card__cover {
    filter: grayscale(0.3);
    box-shadow: none;
  }

  .book-card__title {
    opacity: 0.5;
  }

  .book-card__tooltip {
    display: none;
  }
}

[data-theme='dark'] .book-card--disabled {
  opacity: 0.7;

  .book-card__cover {
    filter: grayscale(0.2) brightness(0.9);
  }

  .book-card__title {
    opacity: 0.6;
  }
}

// Spotlight state (loss reveal moment)
.book-card--spotlight {
  z-index: 10;
  transform: scale(1.15) translateY(-8px);
  animation: spotlight-pulse 1.5s ease-in-out;

  .book-card__cover {
    box-shadow:
      0 0 0 4px var(--gutenku-zen-accent),
      0 0 30px oklch(0.6 0.2 195 / 0.4),
      0 12px 30px oklch(0 0 0 / 0.25);
  }
}

@keyframes spotlight-pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.15) translateY(-8px);
    opacity: 1;
  }
  100% {
    transform: scale(1.15) translateY(-8px);
    opacity: 1;
  }
}

// Animations
@keyframes celebrate {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px);
  }
  40%, 80% {
    transform: translateX(4px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

// Overlay transitions
.overlay-enter-active {
  transition: all 0.3s ease-out;
}

.overlay-leave-active {
  transition: all 0.2s ease-in;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .book-card {
    transition: none;

    &:hover {
      transform: none;
    }
  }

  .book-card__tooltip {
    transition: none;
  }

  .book-card__overlay--correct,
  .book-card__overlay--wrong,
  .book-card__selection-ring {
    animation: none;
  }

  .overlay-enter-active,
  .overlay-leave-active {
    transition: none;
  }
}
</style>
