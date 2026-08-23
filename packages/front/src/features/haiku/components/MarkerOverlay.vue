<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import {
  generateMarkerStroke,
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
    /** Cursor position relative to .book-content for spotlight reveal */
    spotlight?: { x: number; y: number } | null;
  }>(),
  {
    delay: 0,
    spotlight: null,
  },
);

const containerRef = ref<HTMLElement | null>(null);

/** One rendered line box of the parent's text */
interface TextLineBox {
  /** X offset from the parent's padding box (px) */
  x: number;
  /** Y offset from the parent's padding box (px) */
  y: number;
  /** Measured width of the text on this line (px) */
  width: number;
  /** Measured height of the text on this line (px) */
  height: number;
  index: number;
}

interface OverlayLayout {
  lines: TextLineBox[];
  containerWidth: number;
  containerHeight: number;
}

const layout = ref<OverlayLayout>({
  lines: [],
  containerWidth: 0,
  containerHeight: 0,
});
const ready = ref(false);
let resizeObserver: ResizeObserver | null = null;

/**
 * Measures the parent's rendered text runs with a DOM Range. Unlike dividing
 * the height by the line height, this yields the real per-line box — so a
 * centered title gets a bar that hugs the words instead of spanning the whole
 * page, and text-transform / letter-spacing are accounted for for free.
 * Nested runs count too, or a wrapper like the author's "by" would stay legible.
 */
function measureTextLines(
  parent: HTMLElement,
  overlay: HTMLElement,
): DOMRect[] {
  const rects: DOMRect[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent?.trim() && !overlay.contains(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  while (walker.nextNode()) {
    range.selectNodeContents(walker.currentNode);
    rects.push(...range.getClientRects());
  }

  return rects.filter((rect) => rect.width > 0 && rect.height > 0);
}

/** Groups raw client rects into one box per rendered line */
function groupIntoLines(
  rects: DOMRect[],
  originX: number,
  originY: number,
): TextLineBox[] {
  const rows: Array<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }> = [];

  // Runs on the same visual line can differ in height (a smaller "by" prefix),
  // so rows are merged on vertical overlap rather than on an exact top match.
  for (const rect of [...rects].sort((a, b) => a.top - b.top)) {
    const row = rows.at(-1);

    if (row && rect.top < row.bottom - 2) {
      row.left = Math.min(row.left, rect.left);
      row.right = Math.max(row.right, rect.right);
      row.top = Math.min(row.top, rect.top);
      row.bottom = Math.max(row.bottom, rect.bottom);

      continue;
    }
    rows.push({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    });
  }

  return rows.map((row, index) => ({
    x: row.left - originX,
    y: row.top - originY,
    width: row.right - row.left,
    height: row.bottom - row.top,
    index,
  }));
}

function computeLayout() {
  const el = containerRef.value;

  if (!el) {
    return;
  }
  const parent = el.parentElement;

  if (!parent) {
    return;
  }

  const style = getComputedStyle(parent);
  const parentRect = parent.getBoundingClientRect();
  // .marker-overlay is inset:0 inside the parent, i.e. anchored to its padding box
  const lines = groupIntoLines(
    measureTextLines(parent, el),
    parentRect.left + (Number.parseFloat(style.borderLeftWidth) || 0),
    parentRect.top + (Number.parseFloat(style.borderTopWidth) || 0),
  );

  if (!lines.length) {
    return;
  }

  layout.value = {
    lines,
    containerWidth: parent.clientWidth,
    containerHeight: parent.scrollHeight,
  };
  ready.value = true;
}

const debouncedCompute = useDebounceFn(computeLayout, 50);

watch(
  () => props.text,
  () => nextTick(debouncedCompute),
);

onMounted(async () => {
  if (import.meta.env.SSR) {
    return;
  }
  await document.fonts.ready;
  await nextTick();
  computeLayout();

  if (containerRef.value?.parentElement) {
    resizeObserver = new ResizeObserver(() => debouncedCompute());
    resizeObserver.observe(containerRef.value.parentElement);
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

/** Bar bleeds a little past the glyphs on each side, like a real pen pass */
const TEXT_BLEED = 6;
/**
 * Client rects hug the glyph box, so the stroke is generated against a
 * slightly taller virtual line box and then re-centred on the text.
 */
const BOX_SCALE = 1.5;

const strokes = computed<MarkerStroke[]>(() =>
  layout.value.lines.map((line) =>
    generateMarkerStroke({
      extent: line.width + TEXT_BLEED * 2,
      lineHeight: line.height * BOX_SCALE,
      seed: 42 + line.index * 7919,
    }),
  ),
);

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

function getLineStyle(line: TextLineBox, stroke: MarkerStroke, index: number) {
  return {
    '--draw-delay': `${props.delay + index * DRAW_STAGGER}ms`,
    '--draw-duration': `${DRAW_DURATION}ms`,
    '--reveal-delay': `${(totalLines.value - 1 - index) * REVEAL_STAGGER}ms`,
    '--reveal-duration': `${REVEAL_DURATION}ms`,
    transform: `translate(${line.x - TEXT_BLEED + stroke.xOffset}px, ${line.y - (line.height * (BOX_SCALE - 1)) / 2 + stroke.yOffset}px) rotate(${stroke.rotation}deg)`,
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
