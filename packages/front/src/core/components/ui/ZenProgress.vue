<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    indeterminate?: boolean;
    height?: number;
    ariaLabel?: string;
  }>(),
  {
    modelValue: 0,
    indeterminate: false,
    height: 6,
  },
);

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
// Ex Libris: a ruled line filling with sumi ink. Flat pigment on paper-deep,
// no gradients or glow.
.zen-progress {
  position: relative;
  width: 100%;
  height: var(--zen-progress-height, 6px);
  border-radius: 1px;
  overflow: hidden;
}

.zen-progress__track {
  position: absolute;
  inset: 0;
  background: var(--gk-paper-deep);
  box-shadow: inset 0 0 0 1px var(--gk-ink-faint);
  border-radius: inherit;
}

.zen-progress__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--gk-ink);
  border-radius: inherit;
  transition: width var(--gk-dur-base) var(--gk-ease-out);
}

.zen-progress__ink-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 35%;
  height: 100%;
  background: var(--gk-ink);
  border-radius: inherit;
  animation: ink-flow 1.6s var(--gk-ease-in-out) infinite;
}

@keyframes ink-flow {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(290%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-progress__fill {
    transition: none;
  }

  .zen-progress__ink-flow {
    animation: none;
    width: 100%;
    opacity: 0.35;
  }
}
</style>
