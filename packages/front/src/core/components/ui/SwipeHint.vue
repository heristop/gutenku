<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    variant?: 'subtle' | 'pill';
  }>(),
  {
    variant: 'subtle',
  },
);

const { t } = useI18n();
</script>

<template>
  <div class="swipe-hint" :class="`swipe-hint--${variant}`">
    <ChevronLeft :size="14" class="swipe-hint__arrow swipe-hint__arrow--left" />
    <span class="swipe-hint__text">{{ t('common.swipe') }}</span>
    <ChevronRight
      :size="14"
      class="swipe-hint__arrow swipe-hint__arrow--right"
    />
  </div>
</template>

<style lang="scss" scoped>
.swipe-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: var(--gutenku-text-muted);

  &--subtle {
    opacity: 0.7;
  }

  &--pill {
    padding: 0.4rem 0.75rem;
    background: var(--gutenku-paper-bg);
    border: 1px solid var(--gutenku-border-visible);
    border-radius: 2rem;
    box-shadow: 0 2px 8px oklch(0 0 0 / 0.1);
    opacity: 1;

    .swipe-hint__text {
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  &__arrow {
    opacity: 0.6;

    &--left {
      animation: swipe-left 1.5s ease-in-out infinite;
    }

    &--right {
      animation: swipe-right 1.5s ease-in-out infinite;
    }
  }
}

[data-theme='dark'] .swipe-hint--pill {
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.3);
}

@keyframes swipe-left {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
}

@keyframes swipe-right {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .swipe-hint__arrow--left,
  .swipe-hint__arrow--right {
    animation: none;
  }
}
</style>
