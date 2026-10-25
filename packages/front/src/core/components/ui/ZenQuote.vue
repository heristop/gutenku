<script lang="ts" setup>
interface Props {
  size?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), {
  size: 'md',
});
</script>

<template>
  <span class="zen-quote" :class="`zen-quote--${size}`">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
// Ex Libris: a typed quotation, the marks in soft ink.
.zen-quote {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--gk-font);
  font-style: italic;
  color: var(--gk-ink-soft);

  &::before,
  &::after {
    color: var(--gk-ink-soft);
    line-height: 1;
  }

  &::before {
    content: '\201C';
    margin-right: 0.25rem;
  }

  &::after {
    content: '\201D';
    margin-left: 0.25rem;
  }

  &--sm {
    font-size: 0.875rem;
  }

  &--md {
    font-size: 0.875rem;

    @media (min-width: 600px) {
      font-size: 1rem;
    }
  }

  &--lg {
    font-size: 1.125rem;

    @media (min-width: 600px) {
      font-size: 1.25rem;
    }
  }
}
</style>
