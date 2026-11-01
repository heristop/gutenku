<script lang="ts" setup>
import { computed } from 'vue';

// A few ink droplets thrown from the middle of the parent and slowed by the
// page, gone in half a second. Marks one moment (an emoji turning over), never
// decorates. The parent is the anchor: it must be positioned. Decorative.
const props = withDefaults(
  defineProps<{
    count?: number;
    /** How far the farthest droplet travels, in px */
    reach?: number;
    /** Average droplet width, in px */
    size?: number;
  }>(),
  { count: 8, reach: 30, size: 5 },
);

// Fixed scatter, no randomness: the same hand every time, and SSR-safe
const drops = computed(() =>
  Array.from({ length: props.count }, (_, i) => {
    const angle =
      (i / props.count) * Math.PI * 2 + (((i * 37) % 11) / 11) * 0.6 - 0.3;
    const dist = props.reach * (0.6 + (((i * 53) % 7) / 7) * 0.4);
    const width = props.size * (0.6 + (((i * 29) % 5) / 5) * 0.8);

    return {
      style: {
        '--dx': `${(Math.cos(angle) * dist).toFixed(1)}px`,
        '--dy': `${(Math.sin(angle) * dist).toFixed(1)}px`,
        '--d': `${width.toFixed(1)}px`,
      },
      stamp: i % 3 === 0,
    };
  }),
);
</script>

<template>
  <span class="ink-spatter" aria-hidden="true">
    <span
      v-for="(drop, i) in drops"
      :key="i"
      class="ink-spatter__drop"
      :class="{ 'ink-spatter__drop--stamp': drop.stamp }"
      :style="drop.style"
    />
  </span>
</template>

<style lang="scss" scoped>
.ink-spatter {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  pointer-events: none;

  &__drop {
    position: absolute;
    left: calc(var(--d) / -2);
    top: calc(var(--d) / -2);
    width: var(--d);
    height: var(--d);
    border-radius: 50%;
    background: var(--gk-ink);
    animation: ink-spatter 520ms var(--gk-ease-out) both;

    &--stamp {
      background: var(--gk-stamp);
    }
  }
}

@keyframes ink-spatter {
  from {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) scale(0.3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ink-spatter {
    display: none;
  }
}
</style>
