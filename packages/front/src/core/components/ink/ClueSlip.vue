<script lang="ts" setup>
// Straight-cut reading slips. A separate SVG sheet gives the paper its lift.
withDefaults(
  defineProps<{
    kind?: string;
    index?: string;
    state?: 'default' | 'new' | 'locked';
    as?: string;
  }>(),
  {
    kind: '',
    index: '',
    state: 'default',
    as: 'div',
  },
);
</script>

<template>
  <component :is="as" class="clue-slip" :class="`clue-slip--${state}`">
    <svg
      v-if="state !== 'locked'"
      class="clue-slip__paper"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0H100V100H0Z" />
      <path
        class="clue-slip__edge"
        d="M0 100H100"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <span v-if="index" class="clue-slip__index" aria-hidden="true">{{
      index
    }}</span>
    <span v-if="kind" class="clue-slip__kind">{{ kind }}</span>
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.clue-slip {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 0.8125rem 1.5rem;
  color: var(--gk-ink);

  // Only the paper casts a shadow; text and controls keep their crisp edges.
  &__paper {
    position: absolute;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    overflow: visible;
    fill: var(--gk-paper-raised);
    pointer-events: none;
    filter: drop-shadow(
      0 4px 4px color-mix(in srgb, var(--gk-scrim) 40%, transparent)
    );
  }

  &__edge {
    fill: none;
    stroke: var(--gk-paper-edge);
    stroke-width: 1px;
  }

  &__index {
    position: absolute;
    top: 0.875rem;
    right: 0.8125rem;
    font-size: 0.6875rem;
    color: var(--gk-ink-soft);
  }

  &__kind {
    padding-right: 2rem;
    padding-bottom: 0.5rem;
    margin-bottom: 0.125rem;
    font-size: 0.6875rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
    border-bottom: 1px solid var(--gk-ink-faint);
  }

  // The new slip keeps its paper; the vermilion edge and label are the signal
  &--new {
    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto;
      height: 3px;
      background: var(--gk-stamp);
    }

    .clue-slip__kind {
      color: var(--gk-stamp-ink);
    }
  }

  &--locked {
    justify-content: center;
    align-items: center;
    text-align: center;
    color: var(--gk-ink-soft);
    background: transparent;
    box-shadow: inset 0 0 0 1.5px var(--gk-ink-faint);
  }
}
</style>
