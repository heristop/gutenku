<script lang="ts" setup>
import { ref, computed, onUnmounted } from 'vue';

export type ZenSliderSize = 'sm' | 'md';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    size?: ZenSliderSize;
    disabled?: boolean;
    ariaLabel?: string;
    ariaValuetext?: string;
    id?: string;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    disabled: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const sliderId = computed(
  () => props.id || `zen-slider-${Math.random().toString(36).slice(2, 9)}`,
);

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

const clamp = (value: number) =>
  Math.min(props.max, Math.max(props.min, value));

const roundToStep = (value: number) => {
  const steps = Math.round((value - props.min) / props.step);

  return clamp(props.min + steps * props.step);
};

const updateFromPosition = (clientX: number) => {
  if (!trackRef.value || props.disabled) {
    return;
  }

  const rect = trackRef.value.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const rawValue = props.min + percent * (props.max - props.min);
  emit('update:modelValue', roundToStep(rawValue));
};

const handleMouseDown = (e: MouseEvent) => {
  if (props.disabled) {
    return;
  }

  isDragging.value = true;
  updateFromPosition(e.clientX);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    updateFromPosition(e.clientX);
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled) {
    return;
  }

  isDragging.value = true;
  updateFromPosition(e.touches[0].clientX);
};

const handleTouchMove = (e: TouchEvent) => {
  if (isDragging.value) {
    e.preventDefault();
    updateFromPosition(e.touches[0].clientX);
  }
};

const handleTouchEnd = () => {
  isDragging.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  const largeStep = (props.max - props.min) * 0.1;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      e.preventDefault();
      emit('update:modelValue', clamp(props.modelValue + props.step));
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      e.preventDefault();
      emit('update:modelValue', clamp(props.modelValue - props.step));
      break;
    case 'PageUp':
      e.preventDefault();
      emit(
        'update:modelValue',
        roundToStep(clamp(props.modelValue + largeStep)),
      );
      break;
    case 'PageDown':
      e.preventDefault();
      emit(
        'update:modelValue',
        roundToStep(clamp(props.modelValue - largeStep)),
      );
      break;
    case 'Home':
      e.preventDefault();
      emit('update:modelValue', props.min);
      break;
    case 'End':
      e.preventDefault();
      emit('update:modelValue', props.max);
      break;
  }
};

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<template>
  <div
    class="zen-slider"
    :class="[
      `zen-slider--${size}`,
      { 'zen-slider--disabled': disabled, 'zen-slider--dragging': isDragging },
    ]"
  >
    <div
      ref="trackRef"
      class="zen-slider__track"
      @mousedown="handleMouseDown"
      @touchstart.passive="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Brush stroke background -->
      <span class="zen-slider__stroke" aria-hidden="true" />
      <!-- Ink fill (progress) -->
      <span
        class="zen-slider__fill"
        :style="{ width: `${percentage}%` }"
        aria-hidden="true"
      />
      <!-- Ink dot thumb -->
      <span
        :id="sliderId"
        role="slider"
        tabindex="0"
        class="zen-slider__ink"
        :style="{ left: `${percentage}%` }"
        :aria-valuenow="modelValue"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuetext="ariaValuetext"
        :aria-label="ariaLabel"
        :aria-disabled="disabled"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.zen-slider {
  --zen-slider-stroke: oklch(0.78 0.02 85);
  --zen-slider-fill: var(--gutenku-zen-primary, oklch(0.42 0.06 192));
  --zen-slider-ink: oklch(0.25 0.02 85);
  --zen-slider-ink-active: var(--gutenku-zen-accent, oklch(0.5 0.08 192));
  --zen-slider-paper: var(--gutenku-paper-bg, oklch(0.97 0.01 85));
  --zen-slider-glow: oklch(0.42 0.08 192 / 0.3);
  --zen-slider-track-height: 44px;
  --zen-slider-stroke-height: 6px;
  --zen-slider-thumb-size: 22px;

  display: flex;
  align-items: center;
  padding: 0.5rem 0.5rem;

  &--sm {
    --zen-slider-track-height: 28px;
    --zen-slider-stroke-height: 3px;
    --zen-slider-thumb-size: 14px;
    padding: 0.125rem 0;
    margin: 0 0.5rem;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.zen-slider__track {
  position: relative;
  width: 100%;
  height: var(--zen-slider-track-height);
  cursor: pointer;
  touch-action: none;
}

.zen-slider__stroke {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: var(--zen-slider-stroke-height);
  transform: translateY(-50%);
  background: var(--zen-slider-stroke);
  border-radius: calc(var(--zen-slider-stroke-height) / 2);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      oklch(1 0 0 / 0.12) 20%,
      oklch(1 0 0 / 0.08) 50%,
      oklch(1 0 0 / 0.12) 80%,
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
      var(--zen-slider-paper) 0%,
      transparent 3%,
      transparent 97%,
      var(--zen-slider-paper) 100%
    );
  }
}

.zen-slider__fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: var(--zen-slider-stroke-height);
  transform: translateY(-50%);
  background: linear-gradient(
    270deg,
    var(--zen-slider-fill) 0%,
    var(--zen-slider-ink-active) 100%
  );
  border-radius: calc(var(--zen-slider-stroke-height) / 2) 0 0
    calc(var(--zen-slider-stroke-height) / 2);
  transition: width 0.05s linear;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      oklch(1 0 0 / 0.2) 0%,
      transparent 50%,
      oklch(0 0 0 / 0.1) 100%
    );
    border-radius: inherit;
  }

  .zen-slider--dragging & {
    box-shadow: 0 0 8px var(--zen-slider-glow);
  }
}

.zen-slider__ink {
  position: absolute;
  top: 50%;
  width: var(--zen-slider-thumb-size);
  height: var(--zen-slider-thumb-size);
  transform: translate(-50%, -50%);
  background: var(--zen-slider-ink);
  border-radius: 50%;
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.2),
    inset 0 1px 2px oklch(1 0 0 / 0.1);
  cursor: grab;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;

  &::before {
    content: '';
    position: absolute;
    top: 18%;
    left: 18%;
    width: 27%;
    height: 27%;
    background: radial-gradient(
      circle,
      oklch(1 0 0 / 0.35) 0%,
      transparent 70%
    );
    border-radius: 50%;
  }

  &:hover {
    background: var(--zen-slider-ink-active);
    box-shadow:
      0 3px 8px oklch(0 0 0 / 0.25),
      0 0 12px var(--zen-slider-glow),
      inset 0 1px 2px oklch(1 0 0 / 0.15);
    transform: translate(-50%, -50%) scale(1.1);
  }

  &:focus-visible {
    outline: none;
    background: var(--zen-slider-ink-active);
    box-shadow:
      0 0 0 3px var(--zen-slider-paper),
      0 0 0 5px var(--zen-slider-ink-active),
      0 3px 8px oklch(0 0 0 / 0.2);
  }

  &:active,
  .zen-slider--dragging & {
    cursor: grabbing;
    background: var(--zen-slider-ink-active);
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.3),
      0 0 16px var(--zen-slider-glow),
      inset 0 1px 2px oklch(1 0 0 / 0.2);
  }
}

[data-theme='dark'] .zen-slider {
  --zen-slider-stroke: oklch(0.32 0.02 85);
  --zen-slider-fill: var(--gutenku-zen-accent, oklch(0.55 0.08 192));
  --zen-slider-ink: oklch(0.8 0.01 85);
  --zen-slider-ink-active: oklch(0.95 0.01 85);
  --zen-slider-paper: var(--gutenku-paper-bg, oklch(0.18 0.02 85));
  --zen-slider-glow: oklch(0.6 0.1 192 / 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .zen-slider__ink {
    transition: none;
  }

  .zen-slider__fill {
    transition: none;
  }
}
</style>
