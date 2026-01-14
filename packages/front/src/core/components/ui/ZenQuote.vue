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
.zen-quote {
  display: inline-flex;
  align-items: baseline;
  font-family: 'JMH Typewriter', monospace;
  font-style: italic;
  color: var(--gutenku-text-primary);
  opacity: 0.75;

  // Decorative quotes
  &::before,
  &::after {
    font-family: Georgia, serif;
    color: var(--gutenku-zen-primary);
    opacity: 0.4;
    line-height: 1;
  }

  &::before {
    content: '"';
    margin-right: 0.25rem;
  }

  &::after {
    content: '"';
    margin-left: 0.25rem;
  }

  // Size variants
  &--sm {
    font-size: 0.85rem;

    &::before,
    &::after {
      font-size: 1.2rem;
    }
  }

  &--md {
    font-size: 0.8rem;

    &::before,
    &::after {
      font-size: 1.25rem;
    }

    @media (min-width: 600px) {
      font-size: 1rem;

      &::before,
      &::after {
        font-size: 1.5rem;
      }
    }
  }

  &--lg {
    font-size: 1.1rem;

    &::before,
    &::after {
      font-size: 1.75rem;
    }

    @media (min-width: 600px) {
      font-size: 1.2rem;
    }
  }
}

[data-theme='dark'] .zen-quote {
  color: var(--gutenku-text-primary);

  &::before,
  &::after {
    color: var(--gutenku-zen-accent);
  }
}
</style>
