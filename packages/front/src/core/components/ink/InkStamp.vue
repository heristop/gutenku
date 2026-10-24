<script lang="ts" setup>
import { computed, useId } from 'vue';

// Rubber-stamp mark: the single vermilion accent of the Ex Libris identity.
// Used for the GK monogram, puzzle numbers and verdicts. Decorative: callers
// provide the accessible text next to it.
const props = withDefaults(
  defineProps<{
    label?: string;
    size?: number;
    tone?: 'stamp' | 'ink';
    outline?: boolean;
    stamp?: boolean;
    tilt?: number;
  }>(),
  {
    label: '',
    size: 40,
    tone: 'stamp',
    outline: false,
    stamp: false,
    tilt: -4,
  },
);

// The press modifier is `ink-stamp--press`: tone="stamp" already renders
// `ink-stamp--stamp`, which once made every vermilion stamp press on mount.
const filterId = `gk-bleed-${useId()}`;

const fontSize = computed(() => {
  const len = Math.max(1, props.label.length);

  if (len <= 2) {
    return 40;
  }

  if (len === 3) {
    return 34;
  }

  return 28;
});
</script>

<template>
  <span
    class="ink-stamp"
    :class="[
      `ink-stamp--${tone}`,
      { 'ink-stamp--outline': outline, 'ink-stamp--press': stamp },
    ]"
    :style="{ '--stamp-size': `${size}px`, '--stamp-tilt': `${tilt}deg` }"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" class="ink-stamp__svg">
      <defs>
        <filter :id="filterId" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
        </filter>
      </defs>
      <g :filter="`url(#${filterId})`">
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="15"
          class="ink-stamp__body"
        />
        <rect
          x="13"
          y="13"
          width="74"
          height="74"
          rx="10"
          class="ink-stamp__inner"
        />
        <text
          v-if="label"
          x="50"
          y="52"
          text-anchor="middle"
          dominant-baseline="central"
          class="ink-stamp__label"
          :font-size="fontSize"
        >
          {{ label }}
        </text>
        <slot />
      </g>
    </svg>
  </span>
</template>

<style lang="scss" scoped>
.ink-stamp {
  --stamp-color: var(--gk-stamp);
  --stamp-on: var(--gk-on-stamp);

  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  // `--ink-stamp-size` lets a parent resize the stamp per breakpoint in CSS
  width: var(--ink-stamp-size, var(--stamp-size));
  height: var(--ink-stamp-size, var(--stamp-size));
  transform: rotate(var(--stamp-tilt));
  color: var(--stamp-on);

  &--ink {
    --stamp-color: var(--gk-ink);
    --stamp-on: var(--gk-paper);
  }

  &__svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  &__body {
    fill: var(--stamp-color);
  }

  &__inner {
    fill: none;
    stroke: var(--stamp-on);
    stroke-width: 2.5;
    opacity: 0.85;
  }

  &__label {
    font-family: var(--gk-font);
    font-weight: 700;
    fill: var(--stamp-on);
    letter-spacing: -0.04em;
  }

  &--outline {
    color: var(--stamp-color);

    .ink-stamp__body {
      fill: none;
      stroke: var(--stamp-color);
      stroke-width: 5;
    }

    .ink-stamp__inner {
      stroke: var(--stamp-color);
      opacity: 0.55;
    }

    .ink-stamp__label {
      fill: var(--stamp-color);
    }
  }

  // Pressed onto the page: lands from above, a hair of give, then rests.
  // Impact is at 60% (~250ms): sync sounds to that moment.
  &--press {
    animation: ink-stamp-press 420ms var(--gk-ease-out) both;
  }
}

@keyframes ink-stamp-press {
  0% {
    opacity: 0;
    transform: rotate(calc(var(--stamp-tilt) - 8deg)) scale(1.6);
  }
  60% {
    opacity: 1;
    transform: rotate(var(--stamp-tilt)) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--stamp-tilt)) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ink-stamp--press {
    animation: ink-stamp-fade 200ms ease both;
  }

  @keyframes ink-stamp-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
</style>
