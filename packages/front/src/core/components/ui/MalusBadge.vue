<script lang="ts" setup>
import { Minus } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    cost: number;
    size?: 'xs' | 'sm' | 'md';
    animated?: boolean;
    showIcon?: boolean;
  }>(),
  {
    size: 'xs',
    animated: false,
    showIcon: false,
  },
);
</script>

<template>
  <span
    class="malus-badge"
    :class="[`malus-badge--${size}`, { 'malus-badge--animated': animated }]"
    role="status"
    :aria-label="`Costs ${cost} points`"
  >
    <Minus v-if="showIcon" class="malus-badge__icon" :size="10" />
    <span aria-hidden="true">-{{ cost }} pts</span>
  </span>
</template>

<style lang="scss" scoped>
.malus-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.25rem 0.75rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.01em;
  color: oklch(0.4 0.1 25);
  background: oklch(0.95 0.03 55);
  border: 1px solid oklch(0.85 0.05 45);
  border-radius: var(--gutenku-radius-sm);
  white-space: nowrap;
  transition: all 0.2s ease;

  // Mount animation
  animation: malus-fade-in 0.25s ease-out;

  // Size: extra-small
  &--xs {
    padding: 0.05rem 0.25rem;
    font-size: 0.55rem;
    gap: 0.05rem;
  }

  // Size: small
  &--sm {
    padding: 0.15rem 0.5rem;
    font-size: 0.7rem;
    gap: 0.1rem;
  }

  // Pulse animation
  &--animated {
    animation:
      malus-fade-in 0.25s ease-out,
      malus-pulse 2.5s ease-in-out infinite 0.5s;
  }

  &__icon {
    flex-shrink: 0;
    opacity: 0.7;
  }
}

[data-theme='dark'] .malus-badge {
  color: oklch(0.9 0.08 45);
  background: oklch(0.32 0.04 45);
  border-color: oklch(0.45 0.06 45);
}

@keyframes malus-fade-in {
  0% {
    opacity: 0;
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes malus-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .malus-badge {
    animation: none;

    &--animated {
      animation: none;
    }
  }
}
</style>
