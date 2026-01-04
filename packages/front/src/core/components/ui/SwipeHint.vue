<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwipe } from '@vueuse/core';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    variant?: 'subtle' | 'pill';
  }>(),
  {
    variant: 'subtle',
  },
);

const emit = defineEmits<{
  prev: [];
  next: [];
}>();

const { t } = useI18n();

const containerRef = ref<HTMLElement | null>(null);

useSwipe(containerRef, {
  threshold: 30,
  onSwipeEnd: (_e, direction) => {
    if (direction === 'left') {
      emit('next');
    } else if (direction === 'right') {
      emit('prev');
    }
  },
});
</script>

<template>
  <div ref="containerRef" class="swipe-hint" :class="`swipe-hint--${variant}`">
    <button
      class="swipe-hint__btn swipe-hint__btn--left"
      type="button"
      :aria-label="t('common.previous')"
      @click="emit('prev')"
    >
      <ChevronLeft
        :size="18"
        :stroke-width="2.5"
        class="swipe-hint__arrow swipe-hint__arrow--left"
      />
    </button>
    <span class="swipe-hint__text">{{ t('common.swipe') }}</span>
    <button
      class="swipe-hint__btn swipe-hint__btn--right"
      type="button"
      :aria-label="t('common.next')"
      @click="emit('next')"
    >
      <ChevronRight
        :size="18"
        :stroke-width="2.5"
        class="swipe-hint__arrow swipe-hint__arrow--right"
      />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--gutenku-text-secondary);
  touch-action: pan-y;
  user-select: none;

  &--subtle {
    opacity: 0.7;
  }

  &--pill {
    position: relative;
    padding: 0.5rem 1.25rem;
    background: var(--gutenku-zen-water);
    border: 1.5px solid var(--gutenku-zen-accent);
    border-radius: 2rem;
    box-shadow: 0 2px 8px oklch(0 0 0 / 0.06);
    opacity: 1;
    overflow: hidden;

    // Shimmer effect
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 30%,
        oklch(1 0 0 / 0.15) 48%,
        oklch(1 0 0 / 0.25) 50%,
        oklch(1 0 0 / 0.15) 52%,
        transparent 70%
      );
      transform: translateX(-100%);
      animation: shimmer 4s ease-in-out infinite;
    }

    .swipe-hint__text {
      position: relative;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gutenku-zen-primary);
    }

    .swipe-hint__arrow {
      position: relative;
      color: var(--gutenku-zen-primary);
      opacity: 1;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: none;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.15s ease, background 0.15s ease;
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.85);
    }
  }

  &--pill &__btn:active {
    background: oklch(0 0 0 / 0.08);
  }

  &__arrow {
    opacity: 0.7;

    &--left {
      animation: swipe-left 1.5s ease-in-out infinite;
    }

    &--right {
      animation: swipe-right 1.5s ease-in-out infinite;
    }
  }
}

[data-theme='dark'] .swipe-hint--pill {
  background: oklch(0.22 0.025 200 / 0.7);
  border-color: oklch(0.6 0.08 195 / 0.6);
  box-shadow: 0 2px 12px oklch(0 0 0 / 0.25);

  &::before {
    background: linear-gradient(
      105deg,
      transparent 30%,
      oklch(0.8 0.05 195 / 0.1) 48%,
      oklch(0.8 0.05 195 / 0.18) 50%,
      oklch(0.8 0.05 195 / 0.1) 52%,
      transparent 70%
    );
  }

  .swipe-hint__text {
    color: oklch(0.8 0.06 195);
  }

  .swipe-hint__arrow {
    color: oklch(0.75 0.12 195);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  60%, 100% {
    transform: translateX(100%);
  }
}

@keyframes swipe-left {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
}

@keyframes swipe-right {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swipe-hint--pill::before {
    animation: none;
    display: none;
  }

  .swipe-hint__arrow--left,
  .swipe-hint__arrow--right {
    animation: none;
  }
}
</style>
