<script lang="ts" setup>
import { computed, toRef, useSlots } from 'vue';
import { useInkLoading } from '@/core/composables/ink-loading';

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

// Cards report busy to the single site-wide quill; no per-card loader
useInkLoading(toRef(props, 'loading'));

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
    case 'footer':
      return 'group';
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
    :tabindex="ariaLabel ? 0 : undefined"
  >
    <div class="zen-card__paper" aria-hidden="true" />

    <header v-if="hasHeader" class="zen-card__header">
      <slot name="header" />
    </header>

    <div class="zen-card__content">
      <slot />
    </div>

    <div v-if="hasActions" class="zen-card__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Ex Libris: a sheet of paper resting on the page. No glass, no halo.
.zen-card {
  position: relative;
  border-radius: var(--gk-radius-paper);
  overflow: clip;
  container-type: inline-size;
  container-name: zen-card;
  background: var(--gk-paper-raised);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);

  &__paper {
    display: none;
  }

  &__header,
  &__content,
  &__actions {
    position: relative;
    z-index: 1;
  }

  &__content {
    padding: 0;
    transition: opacity var(--gk-dur-base) var(--gk-ease-out);
    min-width: 200px;
  }

  &__actions {
    display: flex;
    gap: 0.375rem;
    justify-content: center;
    padding: 0 0.75rem 0.5rem;
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }

  // Busy cards stay readable: the site-wide quill carries the loading signal
  &--book.zen-card--loading {
    .zen-card__content {
      opacity: 0.72;
      transition: opacity var(--gk-dur-base) var(--gk-ease-out);
    }
  }

  &--book {
    padding: 2rem 0.5rem 1.5rem 1rem;
    overflow: visible;
  }

  &--panel {
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
}

@container zen-card (max-width: 500px) {
  .zen-card {
    margin-inline: 0.5rem;
  }
}

@media (forced-colors: active) {
  .zen-card {
    border: 1px solid CanvasText;
  }
}
</style>
