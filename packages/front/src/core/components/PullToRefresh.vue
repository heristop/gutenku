<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RefreshCw } from '@/core/components/icons/ink';
import InkBook from '@/core/components/decorative/InkBook.vue';

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
        role="status"
      >
        <InkBook
          v-if="isRefreshing"
          :size="26"
          class="pull-to-refresh__quill"
        />
        <RefreshCw
          v-else
          :size="20"
          class="pull-to-refresh__icon"
          :style="{ transform: `rotate(${progress * 3.6}deg)` }"
          aria-hidden="true"
        />
        <span class="pull-to-refresh__text">{{ statusText }}</span>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
// Ex Libris: a small index slip pulled down from the top edge. While the
// page refreshes it carries the site's one loading mark, the book.
.pull-to-refresh {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  font-family: var(--gk-font);

  &__indicator {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-height: 2.75rem;
    padding: 0.375rem 1rem;
    background: var(--gk-paper-raised);
    color: var(--gk-ink);
    border: var(--gk-rule);
    border-radius: var(--gk-radius-paper);
    box-shadow: var(--gk-lift);
  }

  &__icon {
    color: var(--gk-ink-soft);
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    .pull-to-refresh__indicator--ready & {
      color: var(--gk-ink);
    }
  }

  &__quill {
    margin: -0.25rem 0;
  }

  &__text {
    font-size: 0.875rem;
    color: var(--gk-ink);
  }
}

.pull-indicator-enter-active,
.pull-indicator-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.pull-indicator-enter-from,
.pull-indicator-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pull-to-refresh__icon {
    transition: none;
  }
}
</style>
