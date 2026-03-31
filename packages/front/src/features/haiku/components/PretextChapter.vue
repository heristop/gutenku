<script lang="ts" setup>
import { ref, computed, watch, nextTick, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  useMarkerLayout,
  type MarkerLine,
} from '@/features/haiku/composables/marker-layout';
import {
  generateAllLineSegments,
  type BarSegment,
} from '@/features/haiku/composables/marker-svg';

interface TextSegment {
  text: string;
  isVerse: boolean;
}

const props = withDefaults(
  defineProps<{
    text: string;
    verses: string[];
    hidden: boolean;
    delay?: number;
    /** Cursor position relative to .book-content for spotlight reveal */
    spotlight?: { x: number; y: number } | null;
  }>(),
  { delay: 0, spotlight: null },
);

const { t } = useI18n();

const containerRef = ref<HTMLElement | null>(null);
const textRef = toRef(props, 'text');
const versesRef = toRef(props, 'verses');

const { layout, ready } = useMarkerLayout(containerRef, textRef, versesRef);

// --- Bar segments (split around verse cutouts) ---

const barSegments = computed<BarSegment[][]>(() => {
  if (!layout.value.lines.length || !layout.value.containerWidth) {
    return [];
  }
  return generateAllLineSegments(
    layout.value.lines,
    layout.value.containerWidth,
  );
});

// Flat list of all segments with their line index for animation delay
const allSegments = computed(() => {
  const result: Array<{
    lineIndex: number;
    segIndex: number;
    seg: BarSegment;
    line: MarkerLine;
  }> = [];
  layout.value.lines.forEach((line, li) => {
    const segs = barSegments.value[li] ?? [];
    segs.forEach((seg, si) => {
      result.push({ lineIndex: li, segIndex: si, seg, line });
    });
  });
  return result;
});

// --- Verse segmentation (handles verses spanning multiple lines) ---

const verseSegments = computed(() => {
  const lines = layout.value.lines;
  if (!lines.length) {return [];}

  // Join all line texts; trimEnd avoids double spaces from pretext trailing whitespace
  const lineOffsets: number[] = [];
  const lineLengths: number[] = [];
  let joined = '';
  for (const line of lines) {
    const trimmed = line.text.trimEnd();
    lineOffsets.push(joined.length);
    lineLengths.push(trimmed.length);
    joined += trimmed + ' ';
  }

  // Find all verse ranges in the joined text
  const verseRanges: Array<{ start: number; end: number }> = [];
  for (const verse of props.verses) {
    if (!verse || !verse.trim()) {continue;}
    const idx = joined.indexOf(verse.trim());
    if (idx !== -1) {
      verseRanges.push({ start: idx, end: idx + verse.trim().length });
    }
  }

  // For each line, split text into verse/non-verse segments
  return lines.map((line, li) => {
    const lineStart = lineOffsets[li];
    const lineEnd = lineStart + lineLengths[li];

    const overlaps: Array<{ from: number; to: number }> = [];
    for (const vr of verseRanges) {
      if (vr.start < lineEnd && vr.end > lineStart) {
        overlaps.push({
          from: Math.max(0, vr.start - lineStart),
          to: Math.min(line.text.length, vr.end - lineStart),
        });
      }
    }

    if (!overlaps.length) {
      return [{ text: line.text, isVerse: false } as TextSegment];
    }

    overlaps.sort((a, b) => a.from - b.from);
    const segments: TextSegment[] = [];
    let cursor = 0;
    for (const ov of overlaps) {
      if (ov.from > cursor) {
        segments.push({
          text: line.text.slice(cursor, ov.from),
          isVerse: false,
        });
      }
      segments.push({ text: line.text.slice(ov.from, ov.to), isVerse: true });
      cursor = ov.to;
    }
    if (cursor < line.text.length) {
      segments.push({ text: line.text.slice(cursor), isVerse: false });
    }
    return segments;
  });
});

function lineHasVerse(index: number): boolean {
  return verseSegments.value[index]?.some((s) => s.isVerse) ?? false;
}

// --- Accessibility ---

const highlightCount = computed(
  () => props.verses.filter((l) => l && l.trim()).length,
);
const ariaDescription = computed(() =>
  t('highlightText.ariaDescription', { count: highlightCount.value }),
);

// --- Spotlight: convert book-content coords to SVG-local coords ---

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

// --- Animation state ---

const hasDrawn = ref(false);
const isRevealing = ref(false);

const DRAW_STAGGER = 55;
const DRAW_DURATION = 280;
const REVEAL_STAGGER = 35;
const REVEAL_DURATION = 250;
const NOISE_FILTER_COUNT = 4;

const noiseSeeds = computed(() => {
  const segs = allSegments.value;
  if (!segs.length) {
    return [];
  }
  return segs.slice(0, NOISE_FILTER_COUNT).map((s) => s.seg.stroke.noiseSeed);
});

const totalLines = computed(() => layout.value.lines.length);

watch(
  () => props.hidden,
  (newHidden, oldHidden) => {
    if (oldHidden && !newHidden) {
      isRevealing.value = true;
      const totalTime = REVEAL_DURATION + totalLines.value * REVEAL_STAGGER;
      setTimeout(() => {
        isRevealing.value = false;
      }, totalTime + 100);
    }
    if (!oldHidden && newHidden) {
      hasDrawn.value = false;
      nextTick(() => {
        hasDrawn.value = true;
      });
    }
  },
);

watch(ready, (isReady) => {
  if (isReady && props.hidden) {
    hasDrawn.value = true;
  }
});

function getSegmentStyle(line: MarkerLine, seg: BarSegment, lineIndex: number) {
  const stroke = seg.stroke;
  return {
    '--draw-delay': `${props.delay + lineIndex * DRAW_STAGGER}ms`,
    '--draw-duration': `${DRAW_DURATION}ms`,
    '--reveal-delay': `${(totalLines.value - 1 - lineIndex) * REVEAL_STAGGER}ms`,
    '--reveal-duration': `${REVEAL_DURATION}ms`,
    transform: `translate(${seg.x + stroke.xOffset}px, ${line.y + stroke.yOffset}px) rotate(${stroke.rotation}deg)`,
  };
}
</script>

<template>
  <span
    ref="containerRef"
    class="pretext-chapter"
    role="text"
    :aria-description="ariaDescription"
    :style="ready ? { height: layout.containerHeight + 'px' } : undefined"
  >
    <!-- Fallback while pretext loads -->
    <span v-if="!ready" v-html="text.replaceAll('\n\n', '<br /><br />')" />

    <!-- Pretext-rendered text lines -->
    <template v-if="ready">
      <span
        v-for="(line, i) in layout.lines"
        :key="'line-' + i"
        class="text-line"
        :class="{ 'last-line': line.isLastLine }"
        :style="{
          top: line.y + 'px',
          width: layout.containerWidth + 'px',
        }"
        ><!--
        --><template v-if="lineHasVerse(i)"
          ><!--
          --><template v-for="(seg, si) in verseSegments[i]" :key="si"
            ><!--
            --><mark v-if="seg.isVerse" class="highlight">{{ seg.text }}</mark
            ><!--
            --><template v-else>{{ seg.text }}</template
            ><!--
          --></template
          ><!--
        --></template
        ><!--
        --><template v-else>{{ line.text }}</template
        ><!--
      --></span>

      <!-- Marker bars SVG (split around verse cutouts) -->
      <svg
        v-if="allSegments.length && (hidden || isRevealing)"
        :viewBox="`0 0 ${layout.containerWidth} ${layout.containerHeight}`"
        :width="layout.containerWidth"
        :height="layout.containerHeight"
        class="marker-svg"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            v-for="(seed, fi) in noiseSeeds"
            :id="`ch-noise-${fi}`"
            :key="fi"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
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

          <!-- Spotlight reveal gradient: black=hidden, white=visible -->
          <radialGradient id="ch-spotlight-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="black" />
            <stop offset="55%" stop-color="black" />
            <stop offset="100%" stop-color="white" />
          </radialGradient>

          <!-- Spotlight mask: white rect (markers shown) + gradient circle (markers hidden) -->
          <mask
            v-if="localSpotlight"
            id="ch-spotlight-mask"
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
              fill="url(#ch-spotlight-grad)"
            />
          </mask>
        </defs>

        <g :mask="localSpotlight ? 'url(#ch-spotlight-mask)' : undefined">
          <g
            v-for="(item, i) in allSegments"
            :key="`seg-${item.lineIndex}-${item.segIndex}`"
            :style="getSegmentStyle(item.line, item.seg, item.lineIndex)"
            class="marker-stroke"
            :class="{
              drawing: hasDrawn && hidden && !isRevealing,
              revealing: isRevealing,
            }"
          >
            <path
              :d="item.seg.stroke.path"
              :fill="`oklch(0.08 0 0 / ${item.seg.stroke.opacity})`"
              :filter="`url(#ch-noise-${i % NOISE_FILTER_COUNT})`"
            />
          </g>
        </g>
      </svg>
    </template>
  </span>
</template>

<style lang="scss" scoped>
.pretext-chapter {
  display: block;
  position: relative;
  width: 100%;
}

.text-line {
  position: absolute;
  left: 0;
  display: block;
  text-align: justify;
  text-align-last: justify;

  &.last-line {
    text-align-last: left;
  }
}

// Verse highlights: clear windows through redaction
.highlight {
  background: transparent !important;
  background-image: none !important;
  color: var(--gutenku-text-primary) !important;
  padding: 0;
  font-weight: bold;
  position: relative;
  z-index: 20;
  text-shadow: none !important;
  display: inline;
  white-space: nowrap;
}

.marker-svg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 15;
  overflow: visible;
  pointer-events: none;
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

[data-theme='dark'] {
  .marker-stroke path {
    fill: oklch(0.92 0 0 / 0.82);
  }
}
</style>
