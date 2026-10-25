<script lang="ts" setup>
import { computed } from 'vue';

export type ZenSwitchSize = 'sm' | 'md';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    size?: ZenSwitchSize;
    disabled?: boolean;
    id?: string;
    /** Settings row: the label leads and the switch sits at the row's end */
    labelFirst?: boolean;
  }>(),
  {
    labelFirst: false,
    size: 'md',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const switchId = computed(
  () => props.id || `zen-switch-${Math.random().toString(36).slice(2, 9)}`,
);
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
    :class="[
      `zen-switch--${size}`,
      {
        'zen-switch--disabled': disabled,
        'zen-switch--label-first': labelFirst,
      },
    ]"
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
// Ex Libris: a ruled slot with a small block. Off is an empty slot drawn in
// soft ink; on fills with indigo, since it is pressable.
.zen-switch {
  --zen-switch-track-width: 48px;
  --zen-switch-track-height: 28px;
  --zen-switch-ink-size: 18px;
  --zen-switch-ink-travel: 20px;

  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &--sm {
    --zen-switch-track-width: 38px;
    --zen-switch-track-height: 22px;
    --zen-switch-ink-size: 14px;
    --zen-switch-ink-travel: 16px;

    gap: 0.5rem;
  }

  &--label-first {
    flex-direction: row-reverse;
    justify-content: space-between;
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
  border-radius: var(--gk-radius-control);
  box-shadow: inset 0 0 0 1.5px var(--gk-ink-soft);
  cursor: pointer;
  transition:
    background-color var(--gk-dur-fast) var(--gk-ease-out),
    box-shadow var(--gk-dur-fast) var(--gk-ease-out);

  // 44px hit area around the smaller visual
  &::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: max(100%, 44px);
    height: 44px;
    transform: translate(-50%, -50%);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &--on {
    background: var(--gk-indigo);
    box-shadow: inset 0 0 0 1.5px var(--gk-indigo);
  }
}

.zen-switch__stroke {
  display: none;
}

.zen-switch__ink {
  position: absolute;
  top: 50%;
  left: 5px;
  width: var(--zen-switch-ink-size);
  height: var(--zen-switch-ink-size);
  transform: translateY(-50%);
  background: var(--gk-ink-soft);
  border-radius: 2px;
  transition:
    transform var(--gk-dur-base) var(--gk-ease-out),
    background-color var(--gk-dur-fast) var(--gk-ease-out);

  .zen-switch__track--on & {
    transform: translateY(-50%) translateX(var(--zen-switch-ink-travel));
    background: var(--gk-on-indigo);
  }
}

.zen-switch--sm .zen-switch__ink {
  left: 4px;
}

.zen-switch__label {
  font-size: 0.8125rem;
  color: var(--gk-ink);
  user-select: none;
  cursor: pointer;
  font-family: var(--gk-font);
}

@media (prefers-reduced-motion: reduce) {
  .zen-switch__ink,
  .zen-switch__track {
    transition: none;
  }
}

@media (forced-colors: active) {
  .zen-switch__track {
    border: 2px solid ButtonText;
  }

  .zen-switch__ink {
    background: ButtonText;
  }
}
</style>
