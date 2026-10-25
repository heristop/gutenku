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
// Ex Libris: hand-pressed ink drops. The current page is filled, the rest
// outlined. Each clickable drop sits in a 44px key; only the drop is drawn.
.zen-pagination-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.zen-pagination-dots__dot {
  --drop-w: 10px;
  --drop-h: 11px;

  position: relative;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 2.75rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--gk-radius-control);
  cursor: pointer;

  // The drawn drop
  &::before {
    content: '';
    width: var(--drop-w);
    height: var(--drop-h);
    border: 1.5px solid var(--gk-ink);
    border-radius: 52% 48% 46% 54% / 58% 56% 44% 42%;
    transition: background-color var(--gk-dur-base) var(--gk-ease-out);
  }

  &:nth-child(2n)::before {
    border-radius: 47% 53% 55% 45% / 54% 60% 40% 46%;
  }

  &:nth-child(3n)::before {
    border-radius: 55% 45% 50% 50% / 60% 50% 50% 40%;
  }

  // Widen the hit area to 44px; neighbours overlap harmlessly at the edges
  &::after {
    content: '';
    position: absolute;
    inset: 0 -0.5rem;
  }
}

@media (hover: hover) {
  button.zen-pagination-dots__dot:hover:not(
      .zen-pagination-dots__dot--active
    )::before {
    background: var(--gk-ink-faint);
  }
}

.zen-pagination-dots__dot:focus-visible {
  outline: 2px solid var(--gk-indigo);
  outline-offset: -4px;
}

.zen-pagination-dots__dot--active::before {
  background: var(--gk-ink);
}

.zen-pagination-dots--readonly {
  gap: 0.375rem;

  .zen-pagination-dots__dot {
    --drop-w: 7px;
    --drop-h: 8px;

    width: auto;
    height: auto;
    cursor: default;

    &::before {
      border-width: 1.25px;
    }

    &::after {
      content: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-pagination-dots__dot::before {
    transition: none;
  }
}

@media (forced-colors: active) {
  .zen-pagination-dots__dot::before {
    border-color: CanvasText;
  }

  .zen-pagination-dots__dot--active::before {
    background: CanvasText;
  }
}
</style>
