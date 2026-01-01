<script lang="ts" setup>
import { computed } from 'vue';

export type ZenChipVariant = 'default' | 'accent' | 'muted';
export type ZenChipSize = 'sm' | 'md';

const props = withDefaults(
  defineProps<{
    variant?: ZenChipVariant;
    size?: ZenChipSize;
    ariaLabel: string;
    live?: boolean;
    ariaDescribedby?: string;
  }>(),
  {
    variant: 'default',
    size: 'md',
    live: false,
  },
);

const classes = computed(() => [
  'zen-chip',
  `zen-chip--${props.variant}`,
  `zen-chip--${props.size}`,
]);
</script>

<template>
  <span
    :class="classes"
    role="status"
    :aria-label="ariaLabel"
    :aria-live="live ? 'polite' : undefined"
    aria-atomic="true"
    :aria-describedby="ariaDescribedby"
  >
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.zen-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 600;
  border-radius: var(--gutenku-radius-md);
  transition: all 0.2s ease;
  line-height: 1.5;
  overflow: visible;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  word-spacing: inherit;
  letter-spacing: inherit;
}

// Size variants
.zen-chip--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  min-height: 1.5rem; // 24px
  min-width: 1.5rem; // 24px
}

.zen-chip--md {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  min-height: 1.75rem; // 28px
  min-width: 1.75rem; // 28px
}

// Default variant
.zen-chip--default {
  background: oklch(0.5 0.02 85 / 0.15);
  border: 1px solid oklch(0.5 0.02 85 / 0.25);
  color: oklch(0.3 0.02 85);
}

// Accent variant
.zen-chip--accent {
  background: linear-gradient(
    135deg,
    oklch(0.5 0.06 192 / 0.15) 0%,
    oklch(0.45 0.05 198 / 0.1) 100%
  );
  border: 1px solid oklch(0.5 0.06 192 / 0.35);
  color: oklch(0.35 0.06 192);
}

// Muted variant
.zen-chip--muted {
  background: oklch(0.5 0.01 85 / 0.1);
  border: 1px solid oklch(0.5 0.01 85 / 0.2);
  color: oklch(0.35 0.02 85);
}

// Dark mode
[data-theme='dark'] .zen-chip--default {
  background: oklch(0.8 0.02 85 / 0.12);
  border-color: oklch(0.8 0.02 85 / 0.2);
  color: oklch(0.92 0.01 85);
}

[data-theme='dark'] .zen-chip--accent {
  background: linear-gradient(
    135deg,
    oklch(0.5 0.06 192 / 0.25) 0%,
    oklch(0.45 0.05 198 / 0.2) 100%
  );
  border-color: oklch(0.55 0.06 192 / 0.4);
  color: oklch(0.85 0.05 192);
}

[data-theme='dark'] .zen-chip--muted {
  background: oklch(0.8 0.01 85 / 0.1);
  border-color: oklch(0.8 0.01 85 / 0.15);
  color: oklch(0.88 0.01 85);
}

.zen-chip:focus-visible {
  outline: 3px solid var(--gutenku-zen-accent, oklch(0.55 0.15 165));
  outline-offset: 3px;
  box-shadow: 0 0 0 6px oklch(0.55 0.15 165 / 0.2);
}

// High contrast mode
@media (prefers-contrast: high) {
  .zen-chip {
    border-width: 2px;
    font-weight: 700;
  }

  .zen-chip--default,
  .zen-chip--muted {
    background: transparent;
    border-color: currentColor;
    color: var(--gutenku-text-primary);
  }

  .zen-chip--accent {
    background: transparent;
    border-color: oklch(0.35 0.08 192);
    color: oklch(0.3 0.08 192);
  }

  [data-theme='dark'] .zen-chip--accent {
    border-color: oklch(0.75 0.06 192);
    color: oklch(0.9 0.05 192);
  }

  .zen-chip:focus-visible {
    outline-width: 4px;
    outline-offset: 4px;
  }
}

// Windows High Contrast Mode
@media (forced-colors: active) {
  .zen-chip {
    border: 2px solid CanvasText;
    background: Canvas;
    color: CanvasText;
    forced-color-adjust: none;
  }

  .zen-chip--accent {
    border-color: Highlight;
    color: CanvasText;
  }

  .zen-chip:focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 3px;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-chip {
    transition: none;
  }

  .zen-chip:focus-visible {
    box-shadow: none;
  }
}

// High-DPI scaling
@media (min-resolution: 1.5dppx) {
  .zen-chip {
    padding-inline: max(0.5rem, 0.5em);
  }
}

// Small viewport support
@media (max-width: 320px) {
  .zen-chip {
    white-space: normal;
    text-align: center;
  }
}
</style>
