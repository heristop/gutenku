<script lang="ts" setup>
// Tries as hand-pressed ink drops. Remaining tries are filled; spent ones
// keep a vermilion slash so the history reads without colour alone.
withDefaults(
  defineProps<{
    total?: number;
    remaining: number;
    label: string;
  }>(),
  {
    total: 6,
  },
);
</script>

<template>
  <span class="ink-drops" role="img" :aria-label="label">
    <span
      v-for="i in total"
      :key="i"
      class="ink-drops__drop"
      :class="{ 'ink-drops__drop--spent': i > remaining }"
    />
  </span>
</template>

<style lang="scss" scoped>
.ink-drops {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;

  &__drop {
    position: relative;
    width: 12px;
    height: 13px;
    border: 1.5px solid var(--gk-ink);
    border-radius: 52% 48% 46% 54% / 58% 56% 44% 42%;
    background: var(--gk-ink);
    transition:
      background-color var(--gk-dur-base) var(--gk-ease-out),
      border-color var(--gk-dur-base) var(--gk-ease-out);

    &:nth-child(2n) {
      border-radius: 47% 53% 55% 45% / 54% 60% 40% 46%;
    }

    &:nth-child(3n) {
      border-radius: 55% 45% 50% 50% / 60% 50% 50% 40%;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 4.5px -1px auto;
      height: 2px;
      border-radius: 2px;
      background: var(--gk-stamp);
      transform: rotate(-38deg) scaleX(0);
      transition: transform 200ms var(--gk-ease-out) 160ms;
    }

    &--spent {
      background: transparent;
      border-color: var(--gk-stamp);

      &::after {
        transform: rotate(-38deg) scaleX(1);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .ink-drops__drop,
  .ink-drops__drop::after {
    transition: none;
  }
}
</style>
