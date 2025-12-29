<script lang="ts" setup>
defineProps<{
  size?: number;
}>();
</script>

<template>
  <div
    class="ink-drop-loader"
    :style="{ '--loader-size': `${size ?? 120}px` }"
    role="status"
    aria-label="Loading"
  >
    <!-- Central ink drop -->
    <div class="ink-drop" />

    <!-- Expanding ripples -->
    <div class="ripple ripple-1" />
    <div class="ripple ripple-2" />
    <div class="ripple ripple-3" />

    <!-- Subtle ink particles -->
    <div class="ink-particle ink-particle-1" />
    <div class="ink-particle ink-particle-2" />
    <div class="ink-particle ink-particle-3" />
  </div>
</template>

<style lang="scss" scoped>
.ink-drop-loader {
  --loader-size: 120px;
  --ink-color: var(--gutenku-zen-ink, oklch(0.25 0.02 260));
  --ripple-color: var(--gutenku-zen-ink, oklch(0.25 0.02 260 / 0.3));

  position: relative;
  width: var(--loader-size);
  height: var(--loader-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

// Central ink drop that pulses
.ink-drop {
  position: absolute;
  width: 12%;
  height: 12%;
  background: radial-gradient(
    circle,
    var(--ink-color) 0%,
    var(--ink-color) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: ink-drop-pulse 2.4s ease-in-out infinite;
  z-index: 2;
}

@keyframes ink-drop-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

// Expanding ripples
.ripple {
  position: absolute;
  border: 2px solid var(--ripple-color);
  border-radius: 50%;
  opacity: 0;
  animation: ripple-expand 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.ripple-1 {
  animation-delay: 0s;
}

.ripple-2 {
  animation-delay: 0.8s;
}

.ripple-3 {
  animation-delay: 1.6s;
}

@keyframes ripple-expand {
  0% {
    width: 10%;
    height: 10%;
    opacity: 0.6;
    border-width: 2px;
  }
  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
    border-width: 1px;
  }
}

// Subtle ink particles that drift outward
.ink-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--ink-color);
  border-radius: 50%;
  opacity: 0;
  animation: particle-drift 2.4s ease-out infinite;
}

.ink-particle-1 {
  animation-delay: 0.3s;
}

.ink-particle-2 {
  animation-delay: 1.1s;
}

.ink-particle-3 {
  animation-delay: 1.9s;
}

@keyframes particle-drift {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translate(
        calc((var(--loader-size) / 3) * var(--drift-x, 1)),
        calc((var(--loader-size) / 3) * var(--drift-y, -1))
      )
      scale(0.3);
    opacity: 0;
  }
}

.ink-particle-1 {
  --drift-x: -0.8;
  --drift-y: -0.6;
}

.ink-particle-2 {
  --drift-x: 0.9;
  --drift-y: -0.4;
}

.ink-particle-3 {
  --drift-x: 0.2;
  --drift-y: 0.9;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .ink-drop {
    animation: none;
    opacity: 0.9;
  }

  .ripple {
    animation: simple-pulse 2s ease-in-out infinite;
    width: 60%;
    height: 60%;
  }

  .ripple-1 {
    animation-delay: 0s;
  }
  .ripple-2 {
    animation-delay: 0.66s;
  }
  .ripple-3 {
    animation-delay: 1.33s;
  }

  @keyframes simple-pulse {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 0.5;
    }
  }

  .ink-particle {
    display: none;
  }
}
</style>
