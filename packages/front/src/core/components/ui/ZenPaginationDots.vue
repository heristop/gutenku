<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    /** Total number of items/pages */
    total: number;
    /** ARIA label for the container */
    ariaLabel?: string;
    /** Label prefix for each dot (e.g., "Page", "Haiku") */
    itemLabel?: string;
    /** Whether dots are clickable (default: true) */
    clickable?: boolean;
  }>(),
  {
    ariaLabel: 'Pagination',
    itemLabel: 'Page',
    clickable: true,
  },
);

const modelValue = defineModel<number>({ required: true });

function handleClick(index: number) {
  if (props.clickable) {
    modelValue.value = index;
  }
}
</script>

<template>
  <div
    v-if="total > 1"
    class="zen-pagination-dots"
    :class="{ 'zen-pagination-dots--readonly': !clickable }"
    :role="clickable ? 'tablist' : 'group'"
    :aria-label="ariaLabel"
  >
    <component
      :is="clickable ? 'button' : 'span'"
      v-for="i in total"
      :key="i"
      class="zen-pagination-dots__dot"
      :class="{ 'zen-pagination-dots__dot--active': modelValue === i - 1 }"
      :role="clickable ? 'tab' : undefined"
      :aria-selected="clickable ? modelValue === i - 1 : undefined"
      :aria-label="clickable ? `${itemLabel} ${i}` : undefined"
      :aria-hidden="!clickable ? 'true' : undefined"
      @click="handleClick(i - 1)"
    />
  </div>
</template>

<style lang="scss" scoped>
.zen-pagination-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  container-type: inline-size;
  container-name: pagination-dots;
}

@container pagination-dots (min-width: 400px) {
  .zen-pagination-dots {
    gap: 0.5rem;
  }
}

.zen-pagination-dots__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: var(--gutenku-paper-border);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@container pagination-dots (min-width: 400px) {
  .zen-pagination-dots__dot {
    width: 10px;
    height: 10px;
  }
}

.zen-pagination-dots__dot:hover:not(.zen-pagination-dots__dot--active) {
  background: var(--gutenku-zen-secondary);
  transform: scale(1.2);
}

.zen-pagination-dots__dot:focus-visible {
  outline: 2px solid var(--gutenku-zen-accent);
  outline-offset: 2px;
}

.zen-pagination-dots__dot--active {
  background: var(--gutenku-zen-accent);
  transform: scale(1.3);
  box-shadow: 0 0 8px var(--gutenku-zen-accent);
}

.zen-pagination-dots--readonly {
  gap: 0.35rem;

  .zen-pagination-dots__dot {
    width: 6px;
    height: 6px;
    cursor: default;

    &:hover:not(.zen-pagination-dots__dot--active) {
      background: var(--gutenku-paper-border);
      transform: none;
    }

    &--active {
      transform: scale(1.2);
      box-shadow: none;
    }
  }
}

[data-theme='dark'] .zen-pagination-dots__dot {
  background: oklch(0.4 0.02 85);

  &:hover:not(.zen-pagination-dots__dot--active) {
    background: var(--gutenku-zen-secondary);
  }

  &--active {
    background: var(--gutenku-zen-accent);
    box-shadow: 0 0 10px oklch(0.75 0.08 175 / 0.6);
  }
}

[data-theme='dark'] .zen-pagination-dots--readonly .zen-pagination-dots__dot {
  &:hover:not(.zen-pagination-dots__dot--active) {
    background: oklch(0.4 0.02 85);
  }

  &--active {
    box-shadow: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-pagination-dots__dot {
    transition: none;
  }
}
</style>
