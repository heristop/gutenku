<script lang="ts" setup>
import { computed, useSlots } from 'vue';

export type ZenCardVariant = 'default' | 'book' | 'panel' | 'footer';

const props = withDefaults(
  defineProps<{
    variant?: ZenCardVariant;
    loading?: boolean;
    role?: string;
    ariaLabel?: string;
  }>(),
  {
    variant: 'default',
    loading: false,
  },
);

const slots = useSlots();

const hasHeader = computed(() => !!slots.header);
const hasActions = computed(() => !!slots.actions);

const computedRole = computed(() => {
  if (props.role) {
    return props.role;
  }
  switch (props.variant) {
    case 'book':
      return 'article';
    case 'panel':
      return 'complementary';
    case 'footer':
      return 'contentinfo';
    default:
      return 'region';
  }
});

const cardClasses = computed(() => [
  'zen-card',
  `zen-card--${props.variant}`,
  {
    'zen-card--loading': props.loading,
    'zen-card--has-header': hasHeader.value,
    'zen-card--has-actions': hasActions.value,
  },
]);
</script>

<template>
  <div
    :class="cardClasses"
    :role="computedRole"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    :aria-live="loading ? 'polite' : undefined"
    :tabindex="ariaLabel ? 0 : undefined"
  >
    <div
      v-if="loading"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Loading content, please wait...
    </div>

    <Transition name="zen-progress">
      <div
        v-if="loading"
        class="zen-card__progress"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Loading"
        aria-hidden="true"
      />
    </Transition>

    <div class="zen-card__paper" aria-hidden="true" />

    <header v-if="hasHeader" class="zen-card__header">
      <slot name="header" />
    </header>

    <div class="zen-card__content">
      <slot />
    </div>

    <footer v-if="hasActions" class="zen-card__actions">
      <slot name="actions" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.zen-card {
  position: relative;
  border-radius: var(--gutenku-radius-lg);
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;

  background: var(--gutenku-paper-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 0.3);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.08),
    0 8px 32px oklch(0 0 0 / 0.06),
    inset 0 1px 0 oklch(1 0 0 / 0.5);

  &__paper {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(
        circle at 20% 30%,
        oklch(0.42 0.09 55 / 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 70%,
        oklch(0.42 0.09 55 / 0.05) 0%,
        transparent 50%
      );
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
  }

  &__header,
  &__content,
  &__actions {
    position: relative;
    z-index: 1;
  }

  &__content {
    padding: 0;
    transition:
      opacity 0.3s ease,
      filter 0.3s ease;
    min-width: 200px;
  }

  &__actions {
    display: flex;
    gap: 0.375rem;
    justify-content: center;
    padding: 0 0.75rem 0.5rem;
  }

  &__progress {
    position: absolute;
    top: 0;
    left: var(--gutenku-radius-lg);
    right: var(--gutenku-radius-lg);
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(0.45 0.06 170 / 0.85) 50%,
      transparent 100%
    );
    animation: ink-breathe 0.8s ease-in-out infinite;
    z-index: 10;
    border-radius: 1px;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        oklch(0.45 0.06 170 / 0.4) 50%,
        transparent 100%
      );
      filter: blur(3px);
      pointer-events: none;
    }

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        oklch(1 0 0 / 0.5) 50%,
        transparent 100%
      );
      animation: ink-shimmer 0.8s ease-in-out infinite;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }

  &--default {
  }

  &--book.zen-card--loading {
    .zen-card__content {
      opacity: 0.5;
      filter: blur(1px);
      transition: all 0.3s ease;
    }
  }

  &--book {
    padding: 3rem 0.5rem 2rem 1rem;
    min-height: 31.25rem;
    overflow: visible;
    box-shadow:
      0 2px 4px -1px oklch(0 0 0 / 0.2),
      0 4px 5px 0 oklch(0 0 0 / 0.14),
      0 1px 10px 0 oklch(0 0 0 / 0.12);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 2px;
      height: 100%;
      background: linear-gradient(
        to bottom,
        oklch(0 0 0 / 0.1) 0%,
        oklch(0 0 0 / 0.05) 50%,
        oklch(0 0 0 / 0.1) 100%
      );
      z-index: 1;
    }

    .zen-card__content {
      padding: 0;
    }

    .zen-card__paper {
      background-image:
        radial-gradient(
          circle at 20% 50%,
          oklch(0.51 0.02 85 / 0.3) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 20%,
          oklch(0.51 0.02 85 / 0.3) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 40% 80%,
          oklch(0.51 0.02 85 / 0.3) 0%,
          transparent 50%
        );
      opacity: 0.1;
    }
  }

  &--panel {
    margin: 1rem 0;

    .zen-card__content {
      padding: 0.125rem 0.25rem;
    }
  }

  &--footer {
    .zen-card__content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem;
    }
  }

  @media (max-width: 600px) {
    margin-inline: 0.5rem;
  }
}

[data-theme='dark'] .zen-card {
  background: oklch(0.18 0.02 70 / 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid oklch(1 0 0 / 0.08);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.25),
    0 8px 32px oklch(0 0 0 / 0.2),
    inset 0 1px 0 oklch(1 0 0 / 0.05);

  &__paper {
    opacity: 0.03;
  }

  &__progress {
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(0.7 0.08 170 / 0.8) 50%,
      transparent 100%
    );

    &::after {
      background: linear-gradient(
        90deg,
        transparent 0%,
        oklch(0.7 0.08 170 / 0.5) 50%,
        transparent 100%
      );
    }
  }

  &--book {
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.4),
      0 2px 4px oklch(0 0 0 / 0.3);

    &::after {
      background: linear-gradient(
        to bottom,
        oklch(1 0 0 / 0.05) 0%,
        oklch(1 0 0 / 0.02) 50%,
        oklch(1 0 0 / 0.05) 100%
      );
    }
  }
}

@keyframes ink-breathe {
  0%,
  100% {
    opacity: 0.4;
    transform: scaleX(0.5);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes ink-shimmer {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
  }
}

.zen-progress-enter-active {
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.zen-progress-leave-active {
  transition:
    opacity 0.5s cubic-bezier(0.4, 0, 1, 1),
    transform 0.6s cubic-bezier(0.4, 0, 1, 1);
}

.zen-progress-enter-from {
  opacity: 0;
  transform: scaleX(0.3);
}

.zen-progress-leave-to {
  opacity: 0;
  transform: scaleX(0.5);
}

@media (prefers-reduced-motion: reduce) {
  .zen-card__progress {
    animation: none;
    opacity: 0.7;
    transform: scaleX(1);

    &::before {
      animation: none;
      opacity: 0;
    }

    &::after {
      opacity: 0.5;
    }
  }

  .zen-progress-enter-active,
  .zen-progress-leave-active {
    transition: none;
  }
}
</style>
