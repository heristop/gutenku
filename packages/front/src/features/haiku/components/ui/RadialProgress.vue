<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';

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

// Animation state
const displayedValue = ref(0);
const hasAnimated = ref(false);

// Calculate stroke offset for SVG
const strokeOffset = computed(() => {
  const targetOffset = circumference.value * (1 - displayedValue.value);

  return targetOffset;
});

// Animate value on mount or when value changes
function animateValue() {
  if (!props.animated || typeof document === 'undefined') {
    displayedValue.value = normalizedValue.value;
    return;
  }

  const duration = 800;
  const startTime = performance.now();
  const startValue = displayedValue.value;
  const targetValue = normalizedValue.value;

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    displayedValue.value = startValue + (targetValue - startValue) * eased;

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    hasAnimated.value = true;
  }

  setTimeout(() => {
    requestAnimationFrame(update);
  }, props.delay);
}

watch(
  () => props.value,
  () => {
    if (hasAnimated.value) {
      animateValue();
    }
  },
);

onMounted(() => {
  animateValue();
});

// Display percentage
const displayPercent = computed(() => Math.round(displayedValue.value * 100));

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
    role="progressbar"
    :aria-valuenow="Math.round(normalizedValue * 100)"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="accessibleLabel"
  >
    <svg
      class="radial-progress__svg"
      :width="sizeConfig.diameter"
      :height="sizeConfig.diameter"
      :viewBox="`0 0 ${sizeConfig.diameter} ${sizeConfig.diameter}`"
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
        :stroke-dashoffset="strokeOffset"
        stroke-linecap="round"
        :style="{
          '--circumference': circumference,
          '--fill-offset': strokeOffset,
          '--animation-delay': `${delay}ms`,
        }"
      />
    </svg>

    <!-- Value display -->
    <span v-if="showValue" class="radial-progress__value">
      {{ displayPercent }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
$ink-easing: cubic-bezier(0.22, 1, 0.36, 1);

.radial-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &__svg {
    transform: rotate(-90deg);
  }

  &__track {
    stroke: oklch(0.9 0.01 85 / 0.5);
    transition: stroke 0.3s ease;
  }

  &__fill {
    stroke: var(--gutenku-zen-primary);
    transform-origin: center;
    transition:
      stroke-dashoffset 0.8s $ink-easing,
      stroke 0.3s ease;
  }

  &__value {
    position: absolute;
    font-family: 'JMH Typewriter', monospace;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    letter-spacing: -0.02em;
  }

  // Sizes
  &--sm {
    .radial-progress__value {
      font-size: 0.625rem;
    }
  }

  &--md {
    .radial-progress__value {
      font-size: 0.75rem;
    }
  }

  &--lg {
    .radial-progress__value {
      font-size: 1rem;
    }
  }

  // Colors
  &--primary {
    .radial-progress__fill {
      stroke: var(--gutenku-zen-primary);
    }
  }

  &--accent {
    .radial-progress__fill {
      stroke: var(--gutenku-zen-accent);
    }
  }

  &--muted {
    .radial-progress__fill {
      stroke: var(--gutenku-text-muted);
    }
  }
}

// Dark theme
[data-theme='dark'] {
  .radial-progress {
    &__track {
      stroke: oklch(0.45 0.02 85 / 0.7);
    }

    &--primary .radial-progress__fill {
      stroke: var(--gutenku-zen-accent);
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .radial-progress__fill {
    transition: none;
  }
}
</style>
