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
// Ex Libris: three typed lines on the page, closed by a short ink stroke.
.zen-haiku {
  position: relative;
  padding: 1.25rem 1rem;
  font-family: var(--gk-font);
}

.zen-haiku--brush-stroke::after {
  content: '';
  position: absolute;
  bottom: -0.25rem;
  left: 50%;
  width: 2.5rem;
  height: 1.5px;
  background: var(--gk-ink);
  opacity: 0.4;
  transform: translateX(-50%);
}

.zen-haiku--sm {
  padding: 0.75rem;

  .zen-haiku__line {
    font-size: 0.9375rem;
    line-height: 1.6;
  }
}

.zen-haiku--md {
  padding: 1.25rem 1rem;

  .zen-haiku__line {
    font-size: 1.0625rem;
    line-height: 1.8;
  }
}

.zen-haiku__line {
  margin: 0;
  padding-left: var(--line-indent);
  color: var(--gk-ink);
  text-align: center;
}

// Each line is typed in turn
.zen-haiku--animated .zen-haiku__line {
  animation: typewriter-reveal var(--gk-dur-base) var(--gk-ease-out) both;
  animation-delay: calc(var(--line-index) * 140ms + 80ms);
}

@keyframes typewriter-reveal {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-haiku--animated .zen-haiku__line {
    animation: none;
  }
}
</style>
