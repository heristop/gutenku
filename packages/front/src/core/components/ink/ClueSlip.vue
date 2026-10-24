<script lang="ts" setup>
// A torn index slip, like a note left in a library book. Never a rounded card.
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 0.8125rem 1.5rem;
  color: var(--gk-ink);
  background: var(--gk-paper-raised);
  box-shadow: var(--gk-lift);
  // Torn foot
  -webkit-mask: radial-gradient(4px 3px at 50% 100%, #0000 98%, #000) 0 0 / 9px
    100% repeat-x;
  mask: radial-gradient(4px 3px at 50% 100%, #0000 98%, #000) 0 0 / 9px 100%
    repeat-x;

  &__index {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.6875rem;
    color: var(--gk-ink-soft);
  }

  &__kind {
    font-size: 0.6875rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gk-ink-soft);
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
    -webkit-mask: none;
    mask: none;
  }
}
</style>
