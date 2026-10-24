<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useCountUp } from '@/features/haiku/composables/count-up';

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    label?: string;
    animated?: boolean;
    delay?: number;
    color?: 'primary' | 'accent' | 'muted';
  }>(),
  {
    max: 1,
    size: 'md',
    showValue: true,
    animated: true,
    delay: 0,
    color: 'primary',
  },
);

// Size configurations
const sizeConfig = computed(() => {
  const configs = {
    sm: { diameter: 32, strokeWidth: 3, fontSize: '0.625rem' },
    md: { diameter: 48, strokeWidth: 4, fontSize: '0.75rem' },
    lg: { diameter: 64, strokeWidth: 5, fontSize: '1rem' },
  };

  return configs[props.size];
});

const radius = computed(
  () => (sizeConfig.value.diameter - sizeConfig.value.strokeWidth) / 2,
);
const circumference = computed(() => 2 * Math.PI * radius.value);
const normalizedValue = computed(() =>
  Math.min(Math.max(props.value / props.max, 0), 1),
);

// The dial shows its value at rest. With `animated`, it sweeps up from empty
// once on mount; later value changes glide in 400ms or less.
const shownValue = ref(props.animated ? 0 : normalizedValue.value);
const { value: shownPercent } = useCountUp(
  () => Math.round(shownValue.value * 100),
  { duration: 360 },
);

const strokeOffset = computed(
  () => circumference.value * (1 - shownValue.value),
);

function sweep() {
  if (typeof document === 'undefined') {
    shownValue.value = normalizedValue.value;

    return;
  }
  shownValue.value = 0;
  requestAnimationFrame(() => {
    shownValue.value = normalizedValue.value;
  });
}

watch(normalizedValue, (next) => {
  shownValue.value = next;
});

onMounted(() => {
  if (props.animated) {
    sweep();
  }
});

const displayPercent = computed(() => shownPercent.value);

// Color class
const colorClass = computed(() => `radial-progress--${props.color}`);

// Accessible label - fallback to progress percentage if no label provided
const accessibleLabel = computed(
  () => props.label || `${Math.round(normalizedValue.value * 100)}% progress`,
);
</script>

<template>
  <div
    class="radial-progress"
    :class="[`radial-progress--${size}`, colorClass]"
  >
    <!-- Native progress element for accessibility -->
    <progress
      class="radial-progress__native"
      :value="Math.round(normalizedValue * 100)"
      max="100"
      :aria-label="accessibleLabel"
    >
      {{ Math.round(normalizedValue * 100) }}%
    </progress>

    <!-- Custom SVG visualization -->
    <svg
      class="radial-progress__svg"
      :width="sizeConfig.diameter"
      :height="sizeConfig.diameter"
      :viewBox="`0 0 ${sizeConfig.diameter} ${sizeConfig.diameter}`"
      aria-hidden="true"
    >
      <!-- Background track -->
      <circle
        class="radial-progress__track"
        :cx="sizeConfig.diameter / 2"
        :cy="sizeConfig.diameter / 2"
        :r="radius"
        fill="none"
        :stroke-width="sizeConfig.strokeWidth"
      />
      <!-- Progress fill -->
      <circle
        class="radial-progress__fill"
        :cx="sizeConfig.diameter / 2"
        :cy="sizeConfig.diameter / 2"
        :r="radius"
        fill="none"
        :stroke-width="sizeConfig.strokeWidth"
        :stroke-dasharray="circumference"
        stroke-linecap="round"
        :style="{
          strokeDashoffset: strokeOffset,
          transitionDelay: `${delay}ms`,
        }"
      />
    </svg>

    <!-- Value display -->
    <span v-if="showValue" class="radial-progress__value" aria-hidden="true">
      {{ displayPercent }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
// Score dial: sumi stroke on a faint ink track, theme-tuned by the tokens
.radial-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Visually hidden but accessible native progress element
  &__native {
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

  &__svg {
    transform: rotate(-90deg);
  }

  &__track {
    stroke: var(--gk-ink-faint);
  }

  &__fill {
    stroke: var(--gk-ink);
    transform-origin: center;
    transition: stroke-dashoffset 360ms var(--gk-ease-out);
  }

  &__value {
    position: absolute;
    font-weight: 400;
    color: var(--gk-ink);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  &--sm .radial-progress__value {
    font-size: 0.6875rem;
  }

  &--md .radial-progress__value {
    font-size: 0.75rem;
  }

  &--lg .radial-progress__value {
    font-size: 1rem;
  }

  &--accent .radial-progress__fill {
    stroke: var(--gk-ink);
  }

  &--muted .radial-progress__fill {
    stroke: var(--gk-ink-soft);
  }
}

@media (prefers-reduced-motion: reduce) {
  .radial-progress__fill {
    transition: none;
  }
}
</style>
