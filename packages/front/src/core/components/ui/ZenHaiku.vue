<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  lines: string[];
  animated?: boolean;
  showBrushStroke?: boolean;
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  showBrushStroke: true,
  size: 'md',
});

const containerClasses = computed(() => [
  'zen-haiku',
  `zen-haiku--${props.size}`,
  {
    'zen-haiku--animated': props.animated,
    'zen-haiku--brush-stroke': props.showBrushStroke,
  },
]);

// Staggered indentation pattern for haiku aesthetic
const lineIndent = (index: number): string => {
  const indents = ['0.5rem', '1.25rem', '0.25rem'];
  return indents[index % indents.length];
};
</script>

<template>
  <div :class="containerClasses">
    <p
      v-for="(line, index) in lines"
      :key="index"
      class="zen-haiku__line"
      :style="{
        '--line-index': index,
        '--line-indent': lineIndent(index),
      }"
    >
      {{ line }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.zen-haiku {
  position: relative;
  padding: 1.25rem 1rem;
  z-index: 1;

  // Ink wash background - organic sumi-e feel
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 120% 100% at 50% 50%,
      oklch(0.45 0.05 55 / 0.06) 0%,
      oklch(0.45 0.05 55 / 0.02) 60%,
      transparent 100%
    );
    border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
    transform: rotate(-2deg);
    z-index: -1;
  }

  [data-theme='dark'] &::before {
    background: radial-gradient(
      ellipse 120% 100% at 50% 50%,
      oklch(0.75 0.04 55 / 0.08) 0%,
      oklch(0.75 0.04 55 / 0.03) 60%,
      transparent 100%
    );
  }
}

// Brush stroke accent
.zen-haiku--brush-stroke::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gutenku-zen-primary) 30%,
    var(--gutenku-zen-primary) 70%,
    transparent 100%
  );
  opacity: 0.3;
  border-radius: 1px;
}

// Size variants
.zen-haiku--sm {
  padding: 0.75rem 0.75rem;

  .zen-haiku__line {
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

.zen-haiku--md {
  padding: 1.25rem 1rem;

  .zen-haiku__line {
    font-size: 1.05rem;
    line-height: 1.8;
  }
}

// Line styles
.zen-haiku__line {
  color: var(--gutenku-text-primary);
  margin: 0;
  letter-spacing: 0.02em;
  text-align: center;
  padding-left: var(--line-indent);
}

// Animated variant
.zen-haiku--animated .zen-haiku__line {
  opacity: 0;
  animation: typewriter-reveal 0.25s ease forwards;
  animation-delay: calc(var(--line-index) * 0.15s + 0.1s);
}

@keyframes typewriter-reveal {
  0% {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-haiku--animated .zen-haiku__line {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
