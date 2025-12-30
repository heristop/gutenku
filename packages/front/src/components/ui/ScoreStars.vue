<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Score value 0-5 */
    score?: number;
    /** Max stars */
    max?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Animate entrance */
    animated?: boolean;
  }>(),
  {
    score: 0,
    max: 5,
    size: 'md',
    animated: false,
  },
);

const safeScore = computed(() => props.score ?? 0);
const fullStars = computed(() => Math.floor(safeScore.value));
const hasHalfStar = computed(() => safeScore.value % 1 >= 0.5);
const emptyStars = computed(() =>
  Math.max(0, props.max - fullStars.value - (hasHalfStar.value ? 1 : 0)),
);

// Generate all stars with their state
const stars = computed(() => {
  const result: Array<{ type: 'full' | 'half' | 'empty'; index: number }> = [];

  for (let i = 0; i < fullStars.value; i++) {
    result.push({ type: 'full', index: i });
  }

  if (hasHalfStar.value) {
    result.push({ type: 'half', index: fullStars.value });
  }

  for (let i = 0; i < emptyStars.value; i++) {
    result.push({
      type: 'empty',
      index: fullStars.value + (hasHalfStar.value ? 1 : 0) + i,
    });
  }

  return result;
});
</script>

<template>
  <div
    class="score-stars"
    :class="[`score-stars--${size}`, { 'score-stars--animated': animated }]"
    role="img"
    :aria-label="`Score: ${safeScore} out of ${max} stars`"
  >
    <span
      v-for="star in stars"
      :key="star.index"
      class="star"
      :class="`star--${star.type}`"
      :style="{ '--index': star.index, '--delay': animated ? star.index : undefined }"
    >
      <span class="star__filled">&#9733;</span>
      <span class="star__empty">&#9734;</span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.score-stars {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  line-height: 1;
  vertical-align: middle;
  // Optical adjustment for star characters (they sit lower in their glyph box)
  transform: translateY(-0.15em);
}

.star {
  position: relative;
  display: inline-flex;
  line-height: 1;

  // Hide the empty by default, show filled
  .star__filled {
    color: oklch(0.7 0.18 85);
    filter: drop-shadow(0 0 1px oklch(0.7 0.15 85 / 0.5));
    transition: filter 0.3s ease;
  }

  .star__empty {
    position: absolute;
    inset: 0;
    color: oklch(0.75 0.03 55);
    opacity: 0;
  }

  &--full {
    .star__filled {
      opacity: 1;
    }
    .star__empty {
      opacity: 0;
    }
  }

  &--half {
    .star__filled {
      opacity: 1;
      clip-path: inset(0 50% 0 0);
    }
    .star__empty {
      opacity: 1;
    }
  }

  &--empty {
    .star__filled {
      opacity: 0;
    }
    .star__empty {
      opacity: 1;
    }
  }
}

// Size variants
.score-stars--sm {
  gap: 0.125rem;

  .star {
    font-size: 1.125rem;
  }
}

.score-stars--md {
  gap: 0.1875rem;

  .star {
    font-size: 1.375rem;
  }
}

.score-stars--lg {
  gap: 0.25rem;

  .star {
    font-size: 1.625rem;
  }
}

.score-stars--xl {
  gap: 0.375rem;

  .star {
    font-size: 2rem;
  }
}

// Animation variant - staggered entrance with wow effect
.score-stars--animated {
  .star {
    opacity: 0;
    animation: star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(var(--delay) * 100ms + 150ms);

    .star__filled {
      animation: star-glow 0.5s ease-out forwards;
      animation-delay: calc(var(--delay) * 100ms + 150ms);
    }
  }
}

@keyframes star-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-360deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.4) rotate(15deg);
  }
  75% {
    transform: scale(0.9) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes star-glow {
  0% {
    filter: drop-shadow(0 0 0 oklch(0.8 0.2 85 / 0));
  }
  40% {
    filter: drop-shadow(0 0 8px oklch(0.8 0.2 85 / 0.9)) drop-shadow(0 0 16px oklch(0.75 0.18 85 / 0.5));
  }
  100% {
    filter: drop-shadow(0 0 2px oklch(0.7 0.15 85 / 0.4));
  }
}

// Dark mode
[data-theme='dark'] .star {
  .star__filled {
    color: oklch(0.75 0.16 85);
    filter: drop-shadow(0 0 2px oklch(0.7 0.15 85 / 0.4));
  }

  .star__empty {
    color: oklch(0.55 0.03 55);
  }
}

@media (prefers-reduced-motion: reduce) {
  .score-stars--animated .star,
  .score-stars--animated .star .star__filled {
    animation: none;
    opacity: 1;
    transform: none;
    filter: drop-shadow(0 0 1px oklch(0.7 0.15 85 / 0.5));
  }
}
</style>
