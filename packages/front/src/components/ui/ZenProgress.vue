<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: number;
  indeterminate?: boolean;
  height?: number;
  ariaLabel?: string;
}>(), {
  modelValue: 0,
  indeterminate: false,
  height: 6,
});

const percentage = computed(() => Math.max(0, Math.min(100, props.modelValue)));
</script>

<template>
  <div
    class="zen-progress"
    :class="{ 'zen-progress--indeterminate': indeterminate }"
    :style="{ '--zen-progress-height': `${height}px` }"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : Math.round(percentage)"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : 100"
    :aria-valuetext="indeterminate ? 'Loading' : undefined"
    :aria-label="ariaLabel"
  >
    <span class="zen-progress__track" aria-hidden="true" />
    <span
      v-if="!indeterminate"
      class="zen-progress__fill"
      :style="{ width: `${percentage}%` }"
      aria-hidden="true"
    />
    <span v-else class="zen-progress__ink-flow" aria-hidden="true" />
  </div>
</template>

<style lang="scss" scoped>
$ink-easing: cubic-bezier(0.22, 1, 0.36, 1);

.zen-progress {
  --zen-progress-track: oklch(0.85 0.02 85);
  --zen-progress-fill-start: var(--gutenku-zen-primary, oklch(0.42 0.06 192));
  --zen-progress-fill-end: var(--gutenku-zen-accent, oklch(0.5 0.08 192));
  --zen-progress-glow: oklch(0.45 0.08 192 / 0.4);

  position: relative;
  width: 100%;
  height: var(--zen-progress-height, 6px);
  border-radius: calc(var(--zen-progress-height, 6px) / 2);
  overflow: hidden;
}

.zen-progress__track {
  position: absolute;
  inset: 0;
  background: var(--zen-progress-track);
  border-radius: inherit;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      oklch(0 0 0 / 0.06) 0%,
      transparent 50%,
      oklch(1 0 0 / 0.1) 100%
    );
    border-radius: inherit;
  }
}

.zen-progress__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(
    270deg,
    var(--zen-progress-fill-start) 0%,
    var(--zen-progress-fill-end) 100%
  );
  border-radius: inherit;
  transition: width 0.3s $ink-easing;
  box-shadow: 0 0 8px var(--zen-progress-glow);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      oklch(1 0 0 / 0.25) 0%,
      transparent 50%,
      oklch(0 0 0 / 0.1) 100%
    );
    border-radius: inherit;
  }
}

.zen-progress__ink-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    270deg,
    transparent 0%,
    var(--zen-progress-fill-start) 30%,
    var(--zen-progress-fill-end) 70%,
    transparent 100%
  );
  border-radius: inherit;
  animation: ink-flow 1.5s $ink-easing infinite;
  box-shadow: 0 0 12px var(--zen-progress-glow);
}

@keyframes ink-flow {
  0% {
    left: -40%;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

[data-theme='dark'] .zen-progress {
  --zen-progress-track: oklch(0.28 0.02 85);
  --zen-progress-fill-start: var(--gutenku-zen-accent, oklch(0.55 0.08 192));
  --zen-progress-fill-end: oklch(0.65 0.1 192);
  --zen-progress-glow: oklch(0.6 0.1 192 / 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .zen-progress__fill {
    transition: none;
  }

  .zen-progress__ink-flow {
    animation: none;
    left: 0;
    width: 100%;
    opacity: 0.7;
  }
}
</style>
