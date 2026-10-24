<script lang="ts" setup>
import { computed } from 'vue';

export type ZenChipVariant = 'default' | 'accent' | 'muted';
export type ZenChipSize = 'sm' | 'md';

const props = withDefaults(
  defineProps<{
    variant?: ZenChipVariant;
    size?: ZenChipSize;
    ariaLabel: string;
    live?: boolean;
    ariaDescribedby?: string;
  }>(),
  {
    variant: 'default',
    size: 'md',
    live: false,
  },
);

const classes = computed(() => [
  'zen-chip',
  `zen-chip--${props.variant}`,
  `zen-chip--${props.size}`,
]);
</script>

<template>
  <span
    :class="classes"
    role="status"
    :aria-label="ariaLabel"
    :aria-live="live ? 'polite' : undefined"
    aria-atomic="true"
    :aria-describedby="ariaDescribedby"
  >
    <slot />
  </span>
</template>

<style lang="scss" scoped>
// Ex Libris: never a pill. A small typed label inside a ruled box.
.zen-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--gk-font);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  line-height: 1.4;
  white-space: nowrap;
  border-radius: var(--gk-radius-control);
  background: transparent;
  color: var(--gk-ink);
  box-shadow: inset 0 0 0 1.5px var(--gk-ink-faint);
}

.zen-chip--sm {
  padding: 0.125rem 0.4375rem;
  font-size: 0.75rem;
  min-height: 1.5rem;
  min-width: 1.5rem;
}

.zen-chip--md {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  min-height: 1.75rem;
  min-width: 1.75rem;
}

.zen-chip--accent {
  box-shadow: inset 0 0 0 1.5px var(--gk-ink);
}

.zen-chip--muted {
  color: var(--gk-ink-soft);
}

.zen-chip:focus-visible {
  outline: 2px solid var(--gk-indigo);
  outline-offset: 3px;
}

@media (prefers-contrast: more) {
  .zen-chip {
    box-shadow: inset 0 0 0 2px currentColor;
  }
}

@media (forced-colors: active) {
  .zen-chip {
    border: 2px solid CanvasText;
    box-shadow: none;
  }
}
</style>
