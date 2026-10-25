<script lang="ts" setup>
import { computed, useSlots, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useInkLoading } from '@/core/composables/ink-loading';

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

// A busy button keeps its label; the site-wide quill shows the wait
useInkLoading(() => props.loading);

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
    <!-- Loading keeps every slot in place: the button only dims (aria-busy),
         so its width never changes mid-request -->
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

    <span v-if="isExternalLink" class="visually-hidden">
      {{ t('common.opensInNewTab') }}
    </span>
  </component>
</template>

<style lang="scss" scoped>
// Ex Libris: indigo is reserved for things you can press. Flat pigment, a
// darker edge underneath, and a short press instead of lift-and-glow.
.zen-btn {
  --zen-btn-edge: var(--gk-indigo-edge);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  border: none;
  cursor: pointer;
  font-family: var(--gk-font);
  font-weight: 700;
  text-decoration: none;
  transition:
    transform var(--gk-dur-press) var(--gk-ease-out),
    background-color var(--gk-dur-fast) var(--gk-ease-out),
    box-shadow var(--gk-dur-fast) var(--gk-ease-out),
    color var(--gk-dur-fast) var(--gk-ease-out),
    opacity var(--gk-dur-fast) var(--gk-ease-out);

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled):not([aria-disabled='true']) {
    transform: scale(0.98);
  }

  &--icon-only {
    padding: 0.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
  }

  &--loading {
    cursor: wait;
    opacity: 0.72;
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

// Primary: indigo fill with a 2px darker bottom edge
.zen-btn--cta {
  --zen-btn-edge: color-mix(in oklch, var(--gk-indigo-fill), black 35%);

  padding: 0.75rem 1.375rem;
  background: var(--gk-indigo-fill);
  border-radius: var(--gk-radius-control);
  color: var(--gk-on-indigo-fill);
  font-size: 0.9375rem;
  box-shadow: 0 2px 0 var(--zen-btn-edge);

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-disabled='true']) {
      background: color-mix(in oklch, var(--gk-indigo-fill), black 8%);
    }
  }

  &:active:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(1px) scale(0.98);
    box-shadow: 0 1px 0 var(--zen-btn-edge);
  }

  &[aria-busy='true'] {
    opacity: 0.8;
    cursor: wait;
  }
}

// Ghost: a 1.5px ink ring on bare paper
.zen-btn--ghost {
  padding: 0.5rem 0.875rem;
  background: transparent;
  border-radius: var(--gk-radius-control);
  color: var(--gk-ink);
  font-size: 0.875rem;
  box-shadow: inset 0 0 0 1.5px var(--gk-ink);

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-disabled='true']) {
      background: var(--gk-ink-faint);
    }
  }
}

// Text: bare ink, underline on hover
.zen-btn--text {
  padding: 0.5rem;
  background: transparent;
  border-radius: var(--gk-radius-control);
  color: var(--gk-ink-soft);
  font-size: 0.875rem;

  @media (hover: hover) {
    &:hover:not(:disabled):not([aria-disabled='true']) {
      color: var(--gk-ink);
      background: var(--gk-ink-faint);
    }
  }
}

.zen-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  gap: 0.375rem;

  &.zen-btn--icon-only {
    padding: 0.625rem;
  }
}

.zen-btn--lg {
  padding: 0.875rem 1.75rem;
  min-height: 3rem;
  font-size: 1rem;
  gap: 0.625rem;

  &.zen-btn--icon-only {
    padding: 1rem;
    min-width: 3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-btn {
    transition:
      background-color var(--gk-dur-fast) ease,
      color var(--gk-dur-fast) ease;

    &:active:not(:disabled):not([aria-disabled='true']) {
      transform: none;
    }
  }
}

@media (forced-colors: active) {
  .zen-btn--cta,
  .zen-btn--ghost {
    border: 1px solid ButtonText;
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
