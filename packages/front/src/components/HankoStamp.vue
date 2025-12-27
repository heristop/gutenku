<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  size?: number;
}>();

const isAnimating = ref(false);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      isAnimating.value = true;
    }
  },
);
</script>

<template>
  <div
    v-if="show"
    class="hanko-stamp"
    :class="{ 'hanko-stamp--animate': isAnimating }"
    :style="{ '--hanko-size': `${size || 48}px` }"
    aria-hidden="true"
  >
    <svg
      class="hanko-stamp__svg"
      :width="size || 48"
      :height="size || 48"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Outer circle (seal border) -->
      <circle
        class="hanko-stamp__border"
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke-width="4"
      />
      <!-- Inner decorative circle -->
      <circle
        class="hanko-stamp__inner"
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke-width="1.5"
      />
      <!-- Kanji "句" for haiku -->
      <g class="hanko-stamp__character">
        <!-- Top horizontal stroke -->
        <path d="M30 30 L70 30" stroke-width="4" stroke-linecap="round" />
        <!-- Left vertical -->
        <path d="M35 30 L35 55" stroke-width="3.5" stroke-linecap="round" />
        <!-- Right curved stroke -->
        <path
          d="M65 30 Q68 45 60 60 Q50 75 35 70"
          stroke-width="3.5"
          stroke-linecap="round"
          fill="none"
        />
        <!-- Mouth/口 element -->
        <rect
          x="42"
          y="45"
          width="18"
          height="16"
          rx="2"
          stroke-width="3"
          fill="none"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.hanko-stamp {
  --hanko-color: #c41e3a; // Traditional vermillion red
  --hanko-color-dark: #8b1538;

  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: var(--hanko-size);
  height: var(--hanko-size);
  opacity: 0;
  transform: scale(1.3) rotate(-5deg);
  pointer-events: none;
  z-index: 10;

  &--animate {
    animation: hanko-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  &__svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
  }

  &__border {
    stroke: var(--hanko-color);
    opacity: 0.9;
  }

  &__inner {
    stroke: var(--hanko-color);
    opacity: 0.6;
  }

  &__character {
    path,
    rect {
      stroke: var(--hanko-color);
      fill: none;
    }
  }
}

// Dark mode adjustment
[data-theme='dark'] .hanko-stamp {
  --hanko-color: #d4536a;
  --hanko-color-dark: #a83850;
}

@keyframes hanko-stamp {
  0% {
    opacity: 0;
    transform: scale(1.4) rotate(-8deg);
  }
  30% {
    opacity: 1;
    transform: scale(0.95) rotate(2deg);
  }
  50% {
    transform: scale(1.05) rotate(-1deg);
  }
  70% {
    transform: scale(0.98) rotate(0.5deg);
  }
  100% {
    opacity: 0.85;
    transform: scale(1) rotate(0deg);
  }
}

// Ink texture effect
.hanko-stamp::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E");
  border-radius: 50%;
  pointer-events: none;
  mix-blend-mode: multiply;
}

// Respect reduced motion
@media (prefers-reduced-motion: reduce) {
  .hanko-stamp--animate {
    animation: none;
    opacity: 0.85;
    transform: scale(1) rotate(0deg);
  }
}
</style>
