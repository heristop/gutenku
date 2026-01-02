<script lang="ts" setup>
import { computed } from 'vue';
import { Star } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    /** Score value 0-5 */
    score?: number;
    /** Max stars */
    max?: number;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
    <!-- SVG gradient definition -->
    <svg width="0" height="0" class="svg-defs">
      <defs>
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="oklch(0.85 0.18 80)" />
          <stop offset="50%" stop-color="oklch(0.75 0.2 70)" />
          <stop offset="100%" stop-color="oklch(0.65 0.18 55)" />
        </linearGradient>
      </defs>
    </svg>
    <span
      v-for="star in stars"
      :key="star.index"
      class="star"
      :class="`star--${star.type}`"
      :style="{ '--index': star.index, '--delay': animated ? star.index : undefined }"
    >
      <Star class="star__icon" />
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
  letter-spacing: 0.05em;
}

.star {
  display: inline-flex;
  line-height: 1;

  .star__icon {
    color: oklch(0.78 0.16 75);
    fill: url(#star-gradient);
    filter:
      drop-shadow(0 0 3px oklch(0.8 0.2 70 / 0.5))
      drop-shadow(0 1px 2px oklch(0.6 0.15 60 / 0.4));
    animation: stars-glow 2.5s ease-in-out infinite;
  }

  &--empty .star__icon {
    color: oklch(0.6 0.03 70);
    fill: none;
    filter: none;
    opacity: 0.35;
    animation: none;
  }

  &--half .star__icon {
    opacity: 0.65;
  }
}

[data-theme='dark'] .star {
  .star__icon {
    color: oklch(0.82 0.18 75);
    filter:
      drop-shadow(0 0 4px oklch(0.85 0.2 70 / 0.6))
      drop-shadow(0 0 8px oklch(0.7 0.15 60 / 0.3));
  }

  &--empty .star__icon {
    color: oklch(0.5 0.02 70);
    opacity: 0.3;
  }
}

.svg-defs {
  position: absolute;
  pointer-events: none;
}

@keyframes stars-glow {
  0%, 100% {
    filter:
      drop-shadow(0 0 3px oklch(0.8 0.2 70 / 0.5))
      drop-shadow(0 1px 2px oklch(0.6 0.15 60 / 0.4));
    opacity: 1;
  }
  50% {
    filter:
      drop-shadow(0 0 6px oklch(0.85 0.22 70 / 0.7))
      drop-shadow(0 0 12px oklch(0.7 0.18 60 / 0.4));
    opacity: 0.95;
  }
}

// Size variants
.score-stars--xs .star svg {
  width: 16px;
  height: 16px;
}

.score-stars--sm .star svg {
  width: 18px;
  height: 18px;
}

.score-stars--md .star svg {
  width: 22px;
  height: 22px;
}

.score-stars--lg .star svg {
  width: 26px;
  height: 26px;
}

.score-stars--xl .star svg {
  width: 32px;
  height: 32px;
}

// Animation variant - staggered entrance with wow effect
.score-stars--animated {
  .star {
    opacity: 0;
    animation: star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(var(--delay) * 100ms + 150ms);

    .star__icon {
      animation: star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                 stars-glow 2s ease-in-out infinite;
      animation-delay: calc(var(--delay) * 100ms + 150ms), calc(var(--delay) * 100ms + 650ms);
    }
  }

  .star--empty .star__icon {
    animation: star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(var(--delay) * 100ms + 150ms);
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

@media (prefers-reduced-motion: reduce) {
  .star .star__icon {
    animation: none;
    filter: drop-shadow(0 0 2px oklch(0.7 0.15 85 / 0.4));
  }

  .star--empty .star__icon {
    filter: none;
  }

  .score-stars--animated .star,
  .score-stars--animated .star .star__icon {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
