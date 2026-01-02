<script lang="ts" setup>
import { computed } from 'vue';

export type ZenSwitchSize = 'sm' | 'md';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  label?: string;
  size?: ZenSwitchSize;
  disabled?: boolean;
  id?: string;
}>(), {
  size: 'md',
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const switchId = computed(() => props.id || `zen-switch-${Math.random().toString(36).slice(2, 9)}`);
const labelId = computed(() => `${switchId.value}-label`);

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    toggle();
  }
};
</script>

<template>
  <div
    class="zen-switch"
    :class="[`zen-switch--${size}`, { 'zen-switch--disabled': disabled }]"
  >
    <button
      :id="switchId"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="label ? labelId : undefined"
      :disabled="disabled"
      class="zen-switch__track"
      :class="{ 'zen-switch__track--on': modelValue }"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span class="zen-switch__stroke" aria-hidden="true" />
      <span class="zen-switch__ink" aria-hidden="true" />
    </button>
    <label v-if="label" :id="labelId" :for="switchId" class="zen-switch__label">
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
$spring-easing: linear(
  0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
  0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 55%, 1.017 63.9%,
  1.001 83%, 1
);

.zen-switch {
  --zen-switch-text: var(--gutenku-text-zen, oklch(0.35 0.03 85));
  --zen-switch-stroke: oklch(0.78 0.02 85);
  --zen-switch-stroke-on: var(--gutenku-zen-primary, oklch(0.42 0.06 192));
  --zen-switch-ink: oklch(0.3 0.02 85);
  --zen-switch-ink-on: var(--gutenku-zen-accent, oklch(0.5 0.08 192));
  --zen-switch-paper: var(--gutenku-paper-bg, oklch(0.97 0.01 85));
  --zen-switch-track-width: 48px;
  --zen-switch-track-height: 28px;
  --zen-switch-stroke-height: 6px;
  --zen-switch-ink-size: 20px;
  --zen-switch-ink-travel: 24px;

  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &--sm {
    --zen-switch-track-width: 36px;
    --zen-switch-track-height: 22px;
    --zen-switch-stroke-height: 4px;
    --zen-switch-ink-size: 16px;
    --zen-switch-ink-travel: 18px;
    gap: 0.5rem;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.zen-switch__track {
  position: relative;
  width: var(--zen-switch-track-width);
  height: var(--zen-switch-track-height);
  min-width: var(--zen-switch-track-width);
  min-height: var(--zen-switch-track-height);
  padding: 0;
  background: transparent;
  border: none;
  border-radius: calc(var(--zen-switch-track-height) / 2);
  cursor: pointer;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent, oklch(0.5 0.08 192));
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.zen-switch__stroke {
  position: absolute;
  top: 50%;
  left: 3px;
  right: 3px;
  height: var(--zen-switch-stroke-height);
  transform: translateY(-50%);
  background: var(--zen-switch-stroke);
  border-radius: calc(var(--zen-switch-stroke-height) / 2);
  transition: background-color 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(1 0 0 / 0.15) 20%,
      oklch(1 0 0 / 0.1) 50%,
      oklch(1 0 0 / 0.15) 80%,
      transparent 100%
    );
    border-radius: inherit;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--zen-switch-paper) 0%,
      transparent 8%,
      transparent 92%,
      var(--zen-switch-paper) 100%
    );
  }

  .zen-switch__track--on & {
    background: var(--zen-switch-stroke-on);
  }
}

.zen-switch__ink {
  position: absolute;
  top: 50%;
  left: 3px;
  width: var(--zen-switch-ink-size);
  height: var(--zen-switch-ink-size);
  transform: translateY(-50%);
  background: var(--zen-switch-ink);
  border-radius: 50%;
  box-shadow:
    0 1px 3px oklch(0 0 0 / 0.2),
    inset 0 1px 2px oklch(1 0 0 / 0.1);
  transition:
    transform 0.4s $spring-easing,
    background-color 0.3s ease,
    box-shadow 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    width: 30%;
    height: 30%;
    background: radial-gradient(
      circle,
      oklch(1 0 0 / 0.4) 0%,
      transparent 70%
    );
    border-radius: 50%;
  }

  .zen-switch__track--on & {
    transform: translateY(-50%) translateX(var(--zen-switch-ink-travel));
    background: var(--zen-switch-ink-on);
    box-shadow:
      0 2px 6px oklch(0.4 0.08 192 / 0.4),
      inset 0 1px 2px oklch(1 0 0 / 0.15);
  }

  .zen-switch__track:hover:not(:disabled) & {
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.25),
      inset 0 1px 2px oklch(1 0 0 / 0.15);
  }
}

.zen-switch__label {
  font-size: 0.75rem;
  color: var(--zen-switch-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
  cursor: pointer;
  font-family: inherit;
}

[data-theme='dark'] .zen-switch {
  --zen-switch-text: var(--gutenku-text-primary, oklch(0.9 0.01 85));
  --zen-switch-stroke: oklch(0.35 0.02 85);
  --zen-switch-stroke-on: var(--gutenku-zen-accent, oklch(0.55 0.08 192));
  --zen-switch-ink: oklch(0.75 0.01 85);
  --zen-switch-ink-on: oklch(0.95 0.01 85);
  --zen-switch-paper: var(--gutenku-paper-bg, oklch(0.18 0.02 85));
}

@media (prefers-reduced-motion: reduce) {
  .zen-switch__ink {
    transition: none;
  }

  .zen-switch__stroke {
    transition: none;
  }
}
</style>
