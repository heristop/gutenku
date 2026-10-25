<script lang="ts" setup>
// A cost, typed in stamp ink: "−15 pts". No pill: the colour and the minus carry it.
withDefaults(
  defineProps<{
    cost: number;
    size?: 'xs' | 'sm' | 'md';
    // Kept for existing callers: the cost no longer pulses. Its arrival with
    // the clue is the state change, so it sits still.
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
  <span class="malus-badge" :class="`malus-badge--${size}`"
    >−{{ cost }} pts</span
  >
</template>

<style lang="scss" scoped>
.malus-badge {
  display: inline-block;
  font-family: var(--gk-font);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--gk-stamp-ink);

  &--xs {
    font-size: 0.6875rem;
  }

  &--sm {
    font-size: 0.8125rem;
  }
}
</style>
