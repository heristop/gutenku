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
// Ex Libris: a ruled line, indigo for the part you have set, an indigo ink drop to drag.
.zen-slider {
  --zen-slider-track-height: 44px;
  --zen-slider-stroke-height: 2px;
  --zen-slider-thumb-size: 20px;

  display: flex;
  align-items: center;
  padding: 0.5rem;

  &--sm {
    --zen-slider-track-height: 28px;
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
  background: var(--gk-ink-faint);
}

.zen-slider__fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: var(--zen-slider-stroke-height);
  transform: translateY(-50%);
  background: var(--gk-indigo);
  transition: width 0.05s linear;
}

.zen-slider__ink {
  position: absolute;
  top: 50%;
  width: var(--zen-slider-thumb-size);
  height: calc(var(--zen-slider-thumb-size) * 1.08);
  transform: translate(-50%, -50%);
  background: var(--gk-indigo);
  border-radius: 52% 48% 46% 54% / 58% 56% 44% 42%;
  box-shadow: 0 2px 0 var(--gk-indigo-edge);
  cursor: grab;
  transition: transform var(--gk-dur-press) var(--gk-ease-out);

  // 44px hit area
  &::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: 44px;
    height: 44px;
    transform: translate(-50%, -50%);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 3px;
  }

  &:active,
  .zen-slider--dragging & {
    cursor: grabbing;
    transform: translate(-50%, -50%) scale(0.94);
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-slider__ink,
  .zen-slider__fill {
    transition: none;
  }
}

@media (forced-colors: active) {
  .zen-slider__ink,
  .zen-slider__fill {
    background: Highlight;
  }

  .zen-slider__stroke {
    background: CanvasText;
  }
}
</style>
