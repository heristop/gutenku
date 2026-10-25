<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwipe } from '@vueuse/core';
import { ChevronLeft, ChevronRight } from '@/core/components/icons/ink';

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

      return;
    }

    if (direction === 'right') {
      emit('prev');
    }
  },
});
</script>

<template>
  <div ref="containerRef" class="swipe-hint">
    <button
      class="swipe-hint__btn swipe-hint__btn--left"
      type="button"
      :aria-label="t('common.previous')"
      @click="emit('prev')"
    >
      <ChevronLeft
        :size="18"
        aria-hidden="true"
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
        aria-hidden="true"
        class="swipe-hint__arrow swipe-hint__arrow--right"
      />
    </button>
  </div>
</template>

<style lang="scss" scoped>
// Ex Libris: two page-turn keys either side of a typed hint.
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: var(--gk-font);
  font-size: 0.875rem;
  color: var(--gk-ink-soft);
  touch-action: pan-y;
  user-select: none;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    background: none;
    border: none;
    border-radius: var(--gk-radius-control);
    color: var(--gk-indigo);
    cursor: pointer;
    transition:
      transform var(--gk-dur-press) var(--gk-ease-out),
      background-color var(--gk-dur-fast) var(--gk-ease-out);
    -webkit-tap-highlight-color: transparent;

    &:active {
      transform: scale(0.94);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }
}

@media (hover: hover) {
  .swipe-hint__btn:hover {
    background: color-mix(in oklch, var(--gk-ink-faint) 40%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swipe-hint__btn {
    transition: none;

    &:active {
      transform: none;
    }
  }
}
</style>
