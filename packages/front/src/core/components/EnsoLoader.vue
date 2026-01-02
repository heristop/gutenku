<script setup lang="ts">
defineProps<{
  size?: number;
  strokeWidth?: number;
}>();
</script>

<template>
  <output class="enso-loader" aria-label="Loading">
    <svg
      class="enso-loader__svg"
      :width="size || 80"
      :height="size || 80"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Enso circle path -->
      <path
        class="enso-loader__circle"
        d="M50 10
           C75 10, 92 30, 90 50
           C88 70, 70 90, 50 90
           C30 90, 12 72, 10 52
           C8 32, 22 12, 45 10"
        :stroke-width="strokeWidth || 3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <!-- Ink dot -->
      <circle class="enso-loader__dot" cx="45" cy="10" r="2" />
    </svg>
    <span class="sr-only">Loading...</span>
  </output>
</template>

<style scoped lang="scss">
.enso-loader {
  display: flex;
  align-items: center;
  justify-content: center;

  &__svg {
    overflow: visible;
  }

  &__circle {
    stroke: var(--gutenku-zen-primary);
    fill: none;
    stroke-dasharray: 280;
    stroke-dashoffset: 280;
    animation: enso-draw 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    filter: url(#ink-blur);
  }

  &__dot {
    fill: var(--gutenku-zen-primary);
    opacity: 0;
    animation: enso-dot 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }
}

@keyframes enso-draw {
  0% {
    stroke-dashoffset: 280;
    opacity: 0.3;
  }
  10% {
    opacity: 1;
  }
  60% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  80% {
    stroke-dashoffset: 0;
    opacity: 0.8;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes enso-dot {
  0%,
  55% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    opacity: 1;
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

// Respect reduced motion
@media (prefers-reduced-motion: reduce) {
  .enso-loader__circle {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 0.6;
  }

  .enso-loader__dot {
    animation: none;
    opacity: 0.6;
  }
}
</style>
