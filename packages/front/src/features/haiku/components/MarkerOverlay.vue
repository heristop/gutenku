<script lang="ts" setup>
import { ref, computed, watch, nextTick, toRef } from 'vue';
import {
  useMarkerLayout,
  type MarkerLine,
} from '@/features/haiku/composables/marker-layout';
import {
  generateMarkerStrokes,
  type MarkerStroke,
} from '@/features/haiku/composables/marker-svg';

const props = withDefaults(
  defineProps<{
    /** Plain text to measure (no HTML) */
    text: string;
    /** Whether the marker bars are visible (true = redacted) */
    hidden: boolean;
    /** Base animation delay in ms (for cascading across sections) */
    delay?: number;
    /** Whether text is centered (title/author) */
    centered?: boolean;
    /** Cursor position relative to .book-content for spotlight reveal */
    spotlight?: { x: number; y: number } | null;
  }>(),
  {
    delay: 0,
    centered: false,
    spotlight: null,
  },
);

const containerRef = ref<HTMLElement | null>(null);
const textRef = toRef(props, 'text');

const { layout, ready } = useMarkerLayout(containerRef, textRef);

const strokes = computed<MarkerStroke[]>(() => {
  if (!layout.value.lines.length || !layout.value.containerWidth) {
    return [];
  }
  return generateMarkerStrokes(layout.value.lines, layout.value.containerWidth);
});

// Track animation state
const hasDrawn = ref(false);
const isRevealing = ref(false);

// Stagger timing
const DRAW_STAGGER = 55;
const DRAW_DURATION = 280;
const REVEAL_STAGGER = 35;
const REVEAL_DURATION = 250;

// Shared noise filters (performance)
const NOISE_FILTER_COUNT = 4;
const noiseSeeds = computed(() => {
  if (!strokes.value.length) {
    return [];
  }
  return strokes.value.slice(0, NOISE_FILTER_COUNT).map((s) => s.noiseSeed);
});

const totalLines = computed(() => layout.value.lines.length);

// Spotlight: convert book-content coords to SVG-local coords
const SPOTLIGHT_RADIUS = 60;

const localSpotlight = computed(() => {
  if (!props.spotlight || !containerRef.value) {
    return null;
  }
  const myEl = containerRef.value;
  const parentEl = myEl.closest('.book-content');
  if (!parentEl) {
    return null;
  }
  const myRect = myEl.getBoundingClientRect();
  const parentRect = parentEl.getBoundingClientRect();
  return {
    x: props.spotlight.x - (myRect.left - parentRect.left),
    y: props.spotlight.y - (myRect.top - parentRect.top),
  };
});

// Hidden toggle → reveal/redraw animations
watch(
  () => props.hidden,
  (newHidden, oldHidden) => {
    if (oldHidden && !newHidden) {
      isRevealing.value = true;
      const totalRevealTime =
        REVEAL_DURATION + totalLines.value * REVEAL_STAGGER;
      setTimeout(() => {
        isRevealing.value = false;
      }, totalRevealTime + 100);
    }
    if (!oldHidden && newHidden) {
      hasDrawn.value = false;
      nextTick(() => {
        hasDrawn.value = true;
      });
    }
  },
);

// Initial draw when layout is ready
watch(ready, (isReady) => {
  if (isReady && props.hidden) {
    hasDrawn.value = true;
  }
});

function getLineStyle(line: MarkerLine, stroke: MarkerStroke, index: number) {
  // For centered text, center the stroke within the container
  const xPos = props.centered
    ? (layout.value.containerWidth - stroke.width) / 2
    : stroke.xOffset;

  return {
    '--draw-delay': `${props.delay + index * DRAW_STAGGER}ms`,
    '--draw-duration': `${DRAW_DURATION}ms`,
    '--reveal-delay': `${(totalLines.value - 1 - index) * REVEAL_STAGGER}ms`,
    '--reveal-duration': `${REVEAL_DURATION}ms`,
    transform: `translate(${xPos}px, ${line.y + stroke.yOffset}px) rotate(${stroke.rotation}deg)`,
  };
}
</script>

<template>
  <span ref="containerRef" class="marker-overlay" aria-hidden="true">
    <svg
      v-if="ready && strokes.length && (hidden || isRevealing)"
      :viewBox="`0 0 ${layout.containerWidth} ${layout.containerHeight}`"
      :width="layout.containerWidth"
      :height="layout.containerHeight"
      class="marker-svg"
      preserveAspectRatio="none"
    >
      <defs>
        <filter
          v-for="(seed, fi) in noiseSeeds"
          :id="`marker-noise-${fi}`"
          :key="fi"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            :seed="seed"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <radialGradient id="mo-spotlight-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="black" />
          <stop offset="55%" stop-color="black" />
          <stop offset="100%" stop-color="white" />
        </radialGradient>

        <mask
          v-if="localSpotlight"
          id="mo-spotlight-mask"
          maskUnits="userSpaceOnUse"
          x="-50"
          y="-50"
          :width="layout.containerWidth + 100"
          :height="layout.containerHeight + 100"
        >
          <rect
            x="-50"
            y="-50"
            :width="layout.containerWidth + 100"
            :height="layout.containerHeight + 100"
            fill="white"
          />
          <circle
            :cx="localSpotlight.x"
            :cy="localSpotlight.y"
            :r="SPOTLIGHT_RADIUS"
            fill="url(#mo-spotlight-grad)"
          />
        </mask>
      </defs>

      <g :mask="localSpotlight ? 'url(#mo-spotlight-mask)' : undefined">
        <g
          v-for="(line, i) in layout.lines"
          :key="`stroke-${i}`"
          :style="getLineStyle(line, strokes[i], i)"
          class="marker-stroke"
          :class="{
            drawing: hasDrawn && hidden && !isRevealing,
            revealing: isRevealing,
          }"
        >
          <path
            :d="strokes[i].path"
            :fill="`oklch(0.08 0 0 / ${strokes[i].opacity})`"
            :filter="`url(#marker-noise-${i % NOISE_FILTER_COUNT})`"
          />
        </g>
      </g>
    </svg>
  </span>
</template>

<style lang="scss" scoped>
.marker-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 15;
  overflow: visible;
}

.marker-svg {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
}

.marker-stroke {
  will-change: clip-path, opacity, transform;

  &.drawing {
    clip-path: inset(0 100% 0 0);
    animation: draw-marker var(--draw-duration, 280ms)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: var(--draw-delay, 0ms);
  }

  &.revealing {
    animation: reveal-marker var(--reveal-duration, 250ms)
      cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
    animation-delay: var(--reveal-delay, 0ms);
  }
}

@keyframes draw-marker {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 -5% 0 0);
  }
}

@keyframes reveal-marker {
  0% {
    opacity: 1;
    clip-path: inset(0 -5% 0 0);
  }
  60% {
    opacity: 0.6;
    clip-path: inset(0 -5% 0 0);
  }
  100% {
    opacity: 0;
    clip-path: inset(0 0 0 100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marker-stroke {
    &.drawing {
      animation: none;
      clip-path: inset(0 -5% 0 0);
    }

    &.revealing {
      animation: none;
      opacity: 0;
    }
  }
}

[data-theme='dark'] .marker-stroke path {
  fill: oklch(0.92 0 0 / 0.82);
}
</style>
