<script setup lang="ts">
defineProps<{
  lines?: number;
  variant?: 'text' | 'title' | 'image';
}>();
</script>

<template>
  <output
    class="zen-skeleton"
    :class="[`zen-skeleton--${variant || 'text'}`]"
    aria-busy="true"
    aria-label="Loading content"
  >
    <span
      v-for="n in lines || 3"
      :key="n"
      class="zen-skeleton__stroke"
      :style="{ '--delay': `${n * 0.15}s` }"
      aria-hidden="true"
    />
  </output>
</template>

<style scoped lang="scss">
.zen-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &--title {
    .zen-skeleton__stroke {
      height: 1.5rem;
      width: 60%;
      margin: 0 auto;
    }
  }

  &--text {
    .zen-skeleton__stroke {
      height: 0.75rem;

      &:nth-child(odd) {
        width: 90%;
      }

      &:nth-child(even) {
        width: 75%;
      }

      &:last-child {
        width: 50%;
      }
    }
  }

  &--image {
    aspect-ratio: 1/1;

    .zen-skeleton__stroke {
      position: absolute;
      height: 3px;
      border-radius: var(--gutenku-radius-xs);

      &:nth-child(1) {
        width: 60%;
        top: 30%;
        left: 10%;
      }

      &:nth-child(2) {
        width: 40%;
        top: 50%;
        right: 15%;
        left: auto;
      }

      &:nth-child(3) {
        width: 50%;
        bottom: 35%;
        left: 20%;
        top: auto;
      }
    }
  }

  &__stroke {
    background: linear-gradient(
      90deg,
      var(--gutenku-zen-mist) 0%,
      var(--gutenku-zen-water) 50%,
      var(--gutenku-zen-mist) 100%
    );
    background-size: 200% 100%;
    border-radius: var(--gutenku-radius-xs);
    animation: zen-shimmer 2s ease-in-out infinite;
    animation-delay: var(--delay);
  }
}

@keyframes zen-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

// Respect reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-skeleton__stroke {
    animation: none;
    background-position: 0 0;
  }
}
</style>
