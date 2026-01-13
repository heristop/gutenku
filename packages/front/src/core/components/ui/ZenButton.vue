<script lang="ts" setup>
import { computed, useSlots, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InkDropLoader from '@/core/components/InkDropLoader.vue';

export type ZenButtonVariant = 'cta' | 'ghost' | 'text';
export type ZenButtonSize = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: ZenButtonVariant;
    size?: ZenButtonSize;
    to?: string;
    href?: string;
    target?: string;
    rel?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
    ariaDescribedby?: string;
    spring?: boolean;
  }>(),
  {
    variant: 'cta',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    spring: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { t } = useI18n();
const slots = useSlots();

const hasLeftIcon = computed(() => !!slots['icon-left']);
const hasRightIcon = computed(() => !!slots['icon-right']);
const isIconOnly = computed(
  () => !slots.default && (hasLeftIcon.value || hasRightIcon.value),
);

const isExternalLink = computed(
  () => props.target === '_blank' || props.href?.startsWith('http'),
);

const classes = computed(() => [
  'zen-btn',
  `zen-btn--${props.variant}`,
  `zen-btn--${props.size}`,
  {
    'zen-btn--loading': props.loading,
    'zen-btn--icon-only': isIconOnly.value,
    'zen-btn--spring': props.spring,
  },
]);

const isDisabled = computed(() => props.disabled || props.loading);

const component = computed(() => {
  if (props.to) {
    return RouterLink;
  }

  if (props.href) {
    return 'a';
  }
  return 'button';
});

const componentProps = computed(() => {
  if (props.to) {
    return {
      to: props.to,
      'aria-disabled': isDisabled.value || undefined,
    };
  }

  if (props.href) {
    return {
      href: props.href,
      target: props.target,
      rel:
        props.rel ||
        (props.target === '_blank' ? 'noopener noreferrer' : undefined),
      'aria-disabled': isDisabled.value || undefined,
    };
  }
  return {
    type: props.type,
    disabled: isDisabled.value,
  };
});

function handleClick(event: MouseEvent) {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }
  emit('click', event);
}

// Dev warning for missing aria-label on icon-only buttons
if (import.meta.env.DEV) {
  onMounted(() => {
    if (isIconOnly.value && !props.ariaLabel) {
      console.warn(
        '[ZenButton] Icon-only button requires aria-label for screen reader accessibility',
      );
    }
  });
}
</script>

<template>
  <component
    :is="component"
    :class="classes"
    v-bind="componentProps"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="zen-btn__loading-wrapper">
      <InkDropLoader :size="64" class="zen-btn__loader" aria-hidden="true" />
      <span class="zen-btn__content">
        <slot />
      </span>
    </span>

    <template v-else>
      <span
        v-if="hasLeftIcon"
        class="zen-btn__icon zen-btn__icon--left"
        aria-hidden="true"
      >
        <slot name="icon-left" />
      </span>

      <span v-if="$slots.default" class="zen-btn__content">
        <slot />
      </span>

      <span
        v-if="hasRightIcon"
        class="zen-btn__icon zen-btn__icon--right"
        aria-hidden="true"
      >
        <slot name="icon-right" />
      </span>
    </template>

    <span v-if="isExternalLink" class="visually-hidden">
      {{ t('common.opensInNewTab') }}
    </span>
  </component>
</template>

<style lang="scss" scoped>
.zen-btn {
  --zen-btn-cta-bg: linear-gradient(
    135deg,
    oklch(0.42 0.06 192) 0%,
    oklch(0.38 0.05 198) 100%
  );
  --zen-btn-cta-bg-hover: linear-gradient(
    135deg,
    oklch(0.46 0.07 192) 0%,
    oklch(0.42 0.06 198) 100%
  );
  --zen-btn-cta-color: oklch(1 0 0);
  --zen-btn-cta-shadow:
    0 2px 8px oklch(0.4 0.06 195 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.15);
  --zen-btn-cta-shadow-hover:
    0 4px 16px oklch(0.4 0.06 195 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.2);
  --zen-btn-cta-shadow-active:
    0 1px 4px oklch(0.4 0.06 195 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.1);

  --zen-btn-ghost-bg: oklch(0.97 0.01 85 / 0.85);
  --zen-btn-ghost-bg-hover: oklch(0.95 0.01 85 / 0.95);
  --zen-btn-ghost-bg-active: oklch(0.92 0.01 85);
  --zen-btn-ghost-color: oklch(0.25 0.02 85);
  --zen-btn-ghost-color-hover: oklch(0.15 0.02 85);
  --zen-btn-ghost-border: oklch(0.6 0.03 85 / 0.4);
  --zen-btn-ghost-border-hover: oklch(0.5 0.04 85 / 0.5);
  --zen-btn-ghost-shadow: 0 1px 3px oklch(0 0 0 / 0.08);
  --zen-btn-ghost-shadow-hover: 0 2px 8px oklch(0 0 0 / 0.12);

  --zen-btn-text-color: oklch(0.3 0.02 85);
  --zen-btn-text-color-hover: oklch(0.15 0.02 85);
  --zen-btn-text-bg-hover: oklch(0 0 0 / 0.06);
  --zen-btn-text-bg-active: oklch(0 0 0 / 0.1);
}

:global([data-theme='dark'] .zen-btn) {
  --zen-btn-cta-bg: linear-gradient(
    135deg,
    oklch(0.48 0.06 192) 0%,
    oklch(0.44 0.05 198) 100%
  );
  --zen-btn-cta-bg-hover: linear-gradient(
    135deg,
    oklch(0.52 0.07 192) 0%,
    oklch(0.48 0.06 198) 100%
  );
  --zen-btn-cta-color: oklch(1 0 0);
  --zen-btn-cta-shadow:
    0 2px 12px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.1);
  --zen-btn-cta-shadow-hover:
    0 6px 20px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.15);
  --zen-btn-cta-shadow-active:
    0 2px 8px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.08);

  --zen-btn-ghost-bg: oklch(0.22 0.02 85 / 0.9);
  --zen-btn-ghost-bg-hover: oklch(0.28 0.025 85 / 0.95);
  --zen-btn-ghost-bg-active: oklch(0.25 0.02 85);
  --zen-btn-ghost-color: oklch(0.9 0.01 85);
  --zen-btn-ghost-color-hover: oklch(1 0 0);
  --zen-btn-ghost-border: oklch(0.45 0.03 85 / 0.6);
  --zen-btn-ghost-border-hover: oklch(0.55 0.035 85 / 0.7);
  --zen-btn-ghost-shadow: 0 1px 4px oklch(0 0 0 / 0.4);
  --zen-btn-ghost-shadow-hover: 0 2px 10px oklch(0 0 0 / 0.45);

  --zen-btn-text-color: oklch(0.85 0.01 85);
  --zen-btn-text-color-hover: oklch(1 0 0);
  --zen-btn-text-bg-hover: oklch(1 0 0 / 0.1);
  --zen-btn-text-bg-active: oklch(1 0 0 / 0.15);
}

$spring-easing: linear(
  0,
  0.006,
  0.025 2.8%,
  0.101 6.1%,
  0.539 18.9%,
  0.721 25.3%,
  0.849 31.5%,
  0.937 38.1%,
  0.968 41.8%,
  0.991 45.7%,
  1.006 50.1%,
  1.015 55%,
  1.017 63.9%,
  1.001 83%,
  1
);

.zen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &--spring {
    transition:
      transform 0.5s $spring-easing,
      background 0.2s ease,
      box-shadow 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--icon-only {
    padding: 0.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border-radius: var(--gutenku-radius-full);
  }

  &--loading {
    cursor: wait;
    opacity: 0.8;
    overflow: visible;
  }

  &__loading-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 2rem;
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    margin-right: -2.6rem;
  }

  &__content {
    display: inline-flex;
    align-items: center;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--left {
      margin-right: 0.25rem;
    }

    &--right {
      margin-left: 0.25rem;
    }
  }

  &--icon-only &__icon {
    margin: 0;
  }
}

// CTA Variant
.zen-btn--cta {
  padding: 0.75rem 1.5rem;
  background: var(--zen-btn-cta-bg);
  border: none;
  border-radius: var(--gutenku-radius-lg);
  color: var(--zen-btn-cta-color);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: var(--zen-btn-cta-shadow);

  &.zen-btn--icon-only {
    border-radius: var(--gutenku-radius-full);
  }

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--zen-btn-cta-bg-hover);
    transform: translateY(-2px);
    box-shadow: var(--zen-btn-cta-shadow-hover);
  }

  &:active:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(0);
    box-shadow: var(--zen-btn-cta-shadow-active);
  }

  &.zen-btn--spring:hover:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(-2px) scale(1.02);
  }

  &.zen-btn--spring:active:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(0) scale(0.98);
  }

  &[aria-busy='true'] {
    opacity: 0.8;
    cursor: wait;
  }
}

// Ghost Variant
.zen-btn--ghost {
  padding: 0.5rem 0.875rem;
  background: var(--zen-btn-ghost-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--zen-btn-ghost-border);
  border-radius: var(--gutenku-radius-md);
  color: var(--zen-btn-ghost-color);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--zen-btn-ghost-shadow);

  &.zen-btn--icon-only {
    border-radius: var(--gutenku-radius-full);
  }

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--zen-btn-ghost-bg-hover);
    border-color: var(--zen-btn-ghost-border-hover);
    color: var(--zen-btn-ghost-color-hover);
    box-shadow: var(--zen-btn-ghost-shadow-hover);
  }

  &:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--zen-btn-ghost-bg-active);
  }

  :deep(svg) {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled):not([aria-disabled='true']) :deep(svg) {
    transform: translateX(-3px);
  }

  &.zen-btn--spring {
    :deep(svg) {
      transition: transform 0.4s $spring-easing;
    }

    &:hover:not(:disabled):not([aria-disabled='true']) {
      transform: scale(1.02);
    }

    &:active:not(:disabled):not([aria-disabled='true']) {
      transform: scale(0.98);
    }
  }
}

// Text Variant
.zen-btn--text {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: var(--gutenku-radius-md);
  color: var(--zen-btn-text-color);
  font-size: 0.875rem;
  font-weight: 500;

  &.zen-btn--icon-only {
    border-radius: var(--gutenku-radius-full);
  }

  &:hover:not(:disabled):not([aria-disabled='true']) {
    background: var(--zen-btn-text-bg-hover);
    color: var(--zen-btn-text-color-hover);
  }

  &:active:not(:disabled):not([aria-disabled='true']) {
    background: var(--zen-btn-text-bg-active);
  }

  &.zen-btn--spring:hover:not(:disabled):not([aria-disabled='true']) {
    transform: scale(1.05);
  }

  &.zen-btn--spring:active:not(:disabled):not([aria-disabled='true']) {
    transform: scale(0.95);
  }
}

.zen-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  gap: 0.375rem;

  &.zen-btn--icon-only {
    padding: 0.625rem;
    min-width: 2.75rem; // 44px
    min-height: 2.75rem; // 44px
  }
}

.zen-btn--md {
}

.zen-btn--lg {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-family: inherit;
  gap: 0.625rem;

  &.zen-btn--icon-only {
    padding: 1rem;
    min-width: 3rem; // 48px
    min-height: 3rem; // 48px
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-btn,
  .zen-btn--cta,
  .zen-btn--ghost {
    transition: none;

    &:hover {
      transform: none;
    }

    :deep(svg) {
      transition: none;
    }

    &:hover :deep(svg) {
      transform: none;
    }
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
