<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { MARK_PARTS } from '@/core/components/ink/brand-mark';

// The site's one loading mark: the GutenKu book, its haiku written line by
// line (short, long, short) in indigo, over and over while the wait lasts.
// `sealed` presses the vermilion stamp once, when the wait is over.
const props = withDefaults(
  defineProps<{
    size?: number;
    sealed?: boolean;
  }>(),
  {
    size: 32,
    sealed: false,
  },
);

const { place, pages, spine, small, stampTurn } = MARK_PARTS;

// The haiku path as three separate strokes, so each can be written in turn
const verses = small.haiku.split(' M').map((d, i) => (i === 0 ? d : `M${d}`));

const stamp = computed(() => {
  const { x, y, s, r } = small.stamp;

  return {
    x,
    y,
    s,
    r,
    transform: `rotate(${stampTurn} ${x + s / 2} ${y + s / 2})`,
  };
});

const box = computed(() => `${props.size}px`);

// Sealing never snaps: a verse caught half-written finishes from where its
// ink is (160ms), then the stamp presses. Read the live stroke, cancel the
// loop, and write the rest with WAAPI so the motion starts from the screen.
const verseRefs = ref<SVGPathElement[]>([]);
const FINISH_MS = 160;

watch(
  () => props.sealed,
  async (sealed) => {
    if (!sealed) {
      return;
    }
    await nextTick();

    for (const path of verseRefs.value) {
      const style = getComputedStyle(path);
      const from = {
        strokeDashoffset: style.strokeDashoffset,
        opacity: style.opacity,
      };

      for (const animation of path.getAnimations()) {
        animation.cancel();
      }

      path.animate?.([from, { strokeDashoffset: '0', opacity: '1' }], {
        duration: FINISH_MS,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'both',
      });
    }
  },
);
</script>

<template>
  <span
    class="ink-book"
    :class="{ 'ink-book--sealed': sealed }"
    :style="{ width: box, height: box }"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" class="ink-book__svg">
      <g
        :transform="place"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path class="ink-book__pages" :d="pages" :stroke-width="small.book" />
        <path
          class="ink-book__spine"
          :d="spine"
          :stroke-width="small.book * 0.8"
        />
        <path
          v-for="(d, i) in verses"
          :key="i"
          ref="verseRefs"
          class="ink-book__verse"
          :class="`ink-book__verse--${i + 1}`"
          :d="d"
          pathLength="1"
          :stroke-width="small.haikuWidth"
        />
      </g>
      <g :transform="place">
        <rect
          class="ink-book__stamp"
          :x="stamp.x"
          :y="stamp.y"
          :width="stamp.s"
          :height="stamp.s"
          :rx="stamp.r"
          :transform="stamp.transform"
        />
      </g>
    </svg>
  </span>
</template>

<style lang="scss" scoped>
.ink-book {
  // One cycle: the three lines are written (0-62%), rest a moment, then the
  // ink lifts together and the page is written again
  --book-cycle: 2s;

  display: inline-block;

  &__svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  &__pages,
  &__spine {
    stroke: var(--gk-ink);
  }

  &__verse {
    stroke: var(--gk-indigo);
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: var(--book-cycle) cubic-bezier(0.45, 0.05, 0.35, 1) infinite both;

    &--1 {
      animation-name: verse-1;
    }
    &--2 {
      animation-name: verse-2;
    }
    &--3 {
      animation-name: verse-3;
    }
  }

  &__stamp {
    fill: var(--gk-stamp);
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
  }

  // Sealed: the verses stay written and the stamp presses once (lands slightly
  // large, settles), then the indicator lifts away
  // The verses are finished by script from their live state (see above);
  // the stamp presses as the last line lands
  &--sealed &__stamp {
    animation: stamp-press 260ms var(--gk-ease-out) 120ms both;
  }
}

// Each line takes the time its length asks (10 / 16.5 / 5.5 units), with a
// small lift of the pen between lines; the page rests, then the ink lifts
@keyframes verse-1 {
  0% {
    stroke-dashoffset: 1;
    opacity: 1;
  }
  19%,
  82% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes verse-2 {
  0%,
  23% {
    stroke-dashoffset: 1;
    opacity: 1;
  }
  52%,
  82% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes verse-3 {
  0%,
  56% {
    stroke-dashoffset: 1;
    opacity: 1;
  }
  66%,
  82% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes stamp-press {
  0% {
    opacity: 0;
    scale: 1.35;
  }
  60% {
    opacity: 1;
    scale: 0.94;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}

// Reduced motion: the haiku is simply there, breathing in and out of the page
@media (prefers-reduced-motion: reduce) {
  .ink-book__verse {
    stroke-dashoffset: 0;
    animation: verse-breathe 2.4s ease-in-out infinite;
  }

  .ink-book--sealed .ink-book__stamp {
    animation: stamp-fade 160ms ease both;
  }

  @keyframes verse-breathe {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes stamp-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
