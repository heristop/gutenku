<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const { t } = useI18n();
</script>

<template>
  <div class="swipe-hint">
    <ChevronLeft :size="14" class="swipe-hint__arrow swipe-hint__arrow--left" />
    <span>{{ t('common.swipe') }}</span>
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
  opacity: 0.7;

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

@keyframes swipe-left {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-3px); }
}

@keyframes swipe-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
</style>
