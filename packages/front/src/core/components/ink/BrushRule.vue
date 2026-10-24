<script lang="ts" setup>
import type { Component } from 'vue';

// Section divider: two tapered ink strokes around a typewritten label,
// or one unbroken stroke when there is no label.
// Replaces pill badges and gradient hairlines across the site.
withDefaults(
  defineProps<{
    label?: string;
    icon?: Component;
    tone?: 'ink' | 'stamp';
    as?: string;
  }>(),
  {
    label: '',
    icon: undefined,
    tone: 'ink',
    as: 'div',
  },
);
</script>

<template>
  <component :is="as" class="brush-rule" :class="`brush-rule--${tone}`">
    <svg
      class="brush-rule__stroke"
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 4.6 C 40 3.2, 120 2.6, 200 3.6 L 200 4.4 C 120 5.6, 40 5.4, 0 4.9 Z"
      />
    </svg>
    <span v-if="label || $slots.default" class="brush-rule__label">
      <component :is="icon" v-if="icon" :size="14" aria-hidden="true" />
      <slot>{{ label }}</slot>
    </span>
    <svg
      v-if="label || $slots.default"
      class="brush-rule__stroke brush-rule__stroke--end"
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 4.6 C 40 3.2, 120 2.6, 200 3.6 L 200 4.4 C 120 5.6, 40 5.4, 0 4.9 Z"
      />
    </svg>
  </component>
</template>

<style lang="scss" scoped>
.brush-rule {
  --rule-color: var(--gk-ink);

  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin: 0;
  padding: 1rem 1rem 0.75rem;

  @media (min-width: 600px) {
    padding: 1.25rem 1.5rem 0.875rem;
  }

  &--stamp {
    --rule-color: var(--gk-stamp);
  }

  &__stroke {
    flex: 1;
    // SVGs default to 300px wide: let flex size them so narrow screens fit
    width: 0;
    min-width: 1.5rem;
    height: 8px;
    fill: var(--rule-color);
    opacity: 0.5;

    &--end {
      transform: scaleX(-1);
    }
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--gk-font);
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--gk-ink);

    svg {
      color: var(--rule-color);
    }
  }
}
</style>
