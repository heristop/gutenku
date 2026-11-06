<script setup lang="ts">
import { computed, useId } from 'vue';
import { Check } from '@/core/components/icons/ink';

defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);
const checked = defineModel<boolean>({ default: false });
const generatedId = `zen-checkbox-${useId()}`;
const inputId = computed(() => props.id || generatedId);
</script>

<template>
  <label
    class="zen-checkbox"
    :class="{ 'zen-checkbox--disabled': disabled }"
    :for="inputId"
  >
    <input
      :id="inputId"
      v-model="checked"
      v-bind="$attrs"
      class="zen-checkbox__input"
      type="checkbox"
      :disabled="disabled"
    />
    <span class="zen-checkbox__control" aria-hidden="true">
      <Check :size="16" class="zen-checkbox__mark" />
    </span>
    <span class="zen-checkbox__label"
      ><slot>{{ label }}</slot></span
    >
  </label>
</template>

<style scoped lang="scss">
// Ex Libris: an ink-ruled square on paper, filled with pressable indigo.
// The native input keeps label activation, keyboard and form semantics.
.zen-checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  color: var(--gk-ink);
  font-family: var(--gk-font);
  font-size: 0.8125rem;
  line-height: 1.5;
  cursor: pointer;

  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  &__control {
    display: grid;
    flex: 0 0 22px;
    place-items: center;
    width: 22px;
    height: 22px;
    box-sizing: border-box;
    background: var(--gk-paper-raised);
    border: 1.5px solid var(--gk-ink);
    border-radius: var(--gk-radius-control);
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      border-color var(--gk-dur-fast) var(--gk-ease-out);
  }

  &__mark {
    opacity: 0;
    transform: scale(0.85);
    transition:
      opacity var(--gk-dur-press) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);
  }

  &__label {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &__input:checked + &__control {
    color: var(--gk-on-indigo-fill);
    background: var(--gk-indigo-fill);
    border-color: var(--gk-indigo-fill);
  }

  &__input:checked + &__control &__mark {
    opacity: 1;
    transform: none;
  }

  &__input:focus-visible + &__control {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    &:not(&--disabled):hover &__control {
      border-color: var(--gk-indigo);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__control,
    &__mark {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    &__control {
      forced-color-adjust: none;
      background: Canvas;
      border-color: CanvasText;
    }
    &__input:checked + &__control {
      color: HighlightText;
      background: Highlight;
      border-color: Highlight;
    }
    &__input:focus-visible + &__control {
      outline-color: Highlight;
    }
    &--disabled {
      opacity: 1;
      color: GrayText;
    }
    &--disabled &__control {
      border-color: GrayText;
    }
  }
}
</style>
