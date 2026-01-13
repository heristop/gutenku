<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RefreshCw } from 'lucide-vue-next';

const props = defineProps<{
  pullDistance: number;
  isRefreshing: boolean;
  shouldRelease: boolean;
  progress: number;
}>();

const { t } = useI18n();

const isVisible = computed(() => props.pullDistance > 10 || props.isRefreshing);

const statusText = computed(() => {
  if (props.isRefreshing) {
    return t('pullToRefresh.refreshing');
  }

  if (props.shouldRelease) {
    return t('pullToRefresh.release');
  }
  return t('pullToRefresh.pull');
});
</script>

<template>
  <Transition name="pull-indicator">
    <div
      v-if="isVisible"
      class="pull-to-refresh"
      :style="{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }"
    >
      <div
        class="pull-to-refresh__indicator"
        :class="{ 'pull-to-refresh__indicator--ready': shouldRelease }"
      >
        <RefreshCw
          :size="20"
          class="pull-to-refresh__icon"
          :class="{ 'pull-to-refresh__icon--spinning': isRefreshing }"
          :style="{ transform: `rotate(${progress * 3.6}deg)` }"
        />
        <span class="pull-to-refresh__text">{{ statusText }}</span>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.pull-to-refresh {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;

  &__indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--gutenku-paper-bg);
    border-radius: 2rem;
    box-shadow: 0 2px 12px oklch(0 0 0 / 0.15);
    transition: transform 0.2s ease;

    &--ready {
      transform: scale(1.05);
    }
  }

  &__icon {
    color: var(--gutenku-zen-primary);
    transition: transform 0.1s linear;

    &--spinning {
      animation: spin 1s linear infinite;
    }
  }

  &__text {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    font-weight: 500;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pull-indicator-enter-active,
.pull-indicator-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.pull-indicator-enter-from,
.pull-indicator-leave-to {
  opacity: 0;
  transform: translateY(-20px) !important;
}
</style>
