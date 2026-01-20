<script lang="ts" setup>
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next';
import { useToast } from '@/core/composables/toast';

const { toasts, remove } = useToast();

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const iconLabels = {
  success: 'Success',
  error: 'Error',
  info: 'Information',
};
</script>

<template>
  <Teleport to="body">
    <!-- Live region for screen reader announcements -->
    <div class="sr-only" aria-live="assertive" aria-atomic="true">
      <span v-for="toast in toasts" :key="`sr-${toast.id}`">
        {{ iconLabels[toast.type] }}: {{ toast.message }}
      </span>
    </div>

    <section class="zen-toast-container" aria-label="Notifications">
      <TransitionGroup name="zen-toast">
        <output
          v-for="toast in toasts"
          :key="toast.id"
          class="zen-toast"
          :class="`zen-toast--${toast.type}`"
          :aria-label="`${iconLabels[toast.type]}: ${toast.message}`"
        >
          <!-- Book spine accent -->
          <div class="zen-toast__spine" aria-hidden="true" />

          <!-- Paper texture with breathing -->
          <div class="zen-toast__paper" aria-hidden="true" />

          <component
            :is="icons[toast.type]"
            :size="20"
            class="zen-toast__icon"
            aria-hidden="true"
          />
          <span class="zen-toast__message">{{ toast.message }}</span>
          <button
            v-if="toast.closable"
            type="button"
            class="zen-toast__close"
            :aria-label="`Dismiss ${iconLabels[toast.type].toLowerCase()} notification`"
            @click="remove(toast.id)"
          >
            <X :size="16" aria-hidden="true" />
          </button>
        </output>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<style lang="scss">
// CSS @property for clip-path animation
@property --ink-radius {
  syntax: '<percentage>';
  initial-value: 0%;
  inherits: false;
}
</style>

<style scoped lang="scss">
.zen-toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 1rem;
  pointer-events: none;
  perspective: 1200px;
}

.zen-toast {
  --ink-radius: 150%;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.5rem 1.125rem 1.75rem;
  background: linear-gradient(
    165deg,
    var(--gutenku-paper-bg) 0%,
    var(--gutenku-paper-bg-aged) 60%,
    oklch(0.94 0.01 85) 100%
  );
  border: none;
  border-radius: var(--gutenku-radius-sm);
  font-size: 0.9rem;
  color: var(--gutenku-text-primary);
  pointer-events: auto;
  max-width: 90vw;
  min-width: 320px;
  overflow: hidden;
  clip-path: circle(var(--ink-radius) at 2.5rem center);

  // Multi-layer book shadow with ink effect
  box-shadow:
    // Page depth effect
    1px 1px 0 oklch(0.88 0.01 85),
    2px 2px 0 oklch(0.85 0.01 85),
    3px 3px 0 oklch(0.82 0.01 85),
    // Soft ambient shadow
    4px 8px 16px oklch(0 0 0 / 0.12),
    8px 16px 32px oklch(0 0 0 / 0.08),
    // Inner highlight
    inset 0 1px 0 oklch(1 0 0 / 0.6),
    inset -1px 0 0 oklch(0 0 0 / 0.03);

  // Book spine / binding
  &__spine {
    position: absolute;
    left: 0;
    top: -1px;
    bottom: -1px;
    width: 6px;
    background: linear-gradient(
      90deg,
      oklch(0.35 0.05 45) 0%,
      oklch(0.45 0.06 45) 40%,
      oklch(0.35 0.05 45) 100%
    );
    border-radius: 3px 0 0 3px;
    box-shadow:
      inset -1px 0 2px oklch(0 0 0 / 0.3),
      1px 0 1px oklch(1 0 0 / 0.1);
    z-index: 3;
  }

  // Paper texture with zen breathing
  &__paper {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        ellipse at 30% 50%,
        oklch(0.55 0.08 170 / 0.04) 0%,
        transparent 50%
      ),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    border-radius: var(--gutenku-radius-sm);
    animation: zen-breathe 3s ease-in-out infinite;
  }

  // Success state
  &--success {
    .zen-toast__spine {
      background: linear-gradient(
        90deg,
        var(--gutenku-zen-primary) 0%,
        oklch(0.45 0.12 170) 40%,
        var(--gutenku-zen-primary) 100%
      );
    }

    .zen-toast__icon {
      color: var(--gutenku-zen-primary);
      animation: enso-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 2px 4px oklch(0.45 0.08 195 / 0.35));
    }

    .zen-toast__paper {
      background:
        radial-gradient(
          ellipse at 20% 50%,
          oklch(0.55 0.12 170 / 0.1) 0%,
          transparent 60%
        ),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  }

  // Error state
  &--error {
    .zen-toast__spine {
      background: linear-gradient(
        90deg,
        oklch(0.5 0.18 25) 0%,
        oklch(0.55 0.2 25) 40%,
        oklch(0.5 0.18 25) 100%
      );
    }

    .zen-toast__icon {
      color: oklch(0.55 0.2 25);
      animation: ink-splash 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 2px 4px oklch(0.5 0.18 25 / 0.35));
    }

    .zen-toast__paper {
      background:
        radial-gradient(
          ellipse at 20% 50%,
          oklch(0.55 0.18 25 / 0.06) 0%,
          transparent 60%
        ),
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
  }

  // Info state
  &--info {
    .zen-toast__spine {
      background: linear-gradient(
        90deg,
        var(--gutenku-zen-secondary) 0%,
        oklch(0.6 0.08 200) 40%,
        var(--gutenku-zen-secondary) 100%
      );
    }

    .zen-toast__icon {
      color: var(--gutenku-zen-secondary);
      animation: ink-drop 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
  }

  &__icon {
    position: relative;
    flex-shrink: 0;
    z-index: 2;
    margin-left: 0.5rem;
  }

  &__message {
    position: relative;
    flex: 1;
    line-height: 1.6;
    z-index: 2;
    letter-spacing: 0.025em;
    padding-right: 0.5rem;
  }

  &__close {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--gutenku-text-muted);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;

    &:hover {
      background: oklch(0 0 0 / 0.06);
      color: var(--gutenku-text-primary);
      transform: scale(1.1) rotate(90deg);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }
}

// Zen breathing animation for paper texture
@keyframes zen-breathe {
  0%,
  100% {
    opacity: 0.02;
    transform: scale(1);
  }
  50% {
    opacity: 0.05;
    transform: scale(1.015);
  }
}

// Enso-style icon reveal for success
@keyframes enso-reveal {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  75% {
    transform: scale(0.95) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

// Ink splash for error
@keyframes ink-splash {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  30% {
    transform: scale(1.4);
    opacity: 1;
  }
  50% {
    transform: scale(0.9);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// Ink drop for info
@keyframes ink-drop {
  0% {
    transform: translateY(-12px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateY(2px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

// Entry animation - Ink ripple reveal
.zen-toast-enter-active {
  animation: ink-ripple-reveal 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

// Exit animation - Ink dissolve with scatter
.zen-toast-leave-active {
  animation: ink-dissolve-out 0.35s ease-in forwards;
}

.zen-toast-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes ink-ripple-reveal {
  0% {
    --ink-radius: 0%;
    opacity: 0;
    filter: blur(6px);
    transform: translateY(10px) scale(0.95);
  }
  40% {
    opacity: 1;
    filter: blur(2px);
  }
  100% {
    --ink-radius: 150%;
    filter: blur(0);
    transform: translateY(0) scale(1);
  }
}

@keyframes ink-dissolve-out {
  0% {
    --ink-radius: 150%;
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
  60% {
    opacity: 0.5;
    filter: blur(2px);
  }
  100% {
    --ink-radius: 0%;
    opacity: 0;
    filter: blur(6px);
    transform: scale(0.95);
  }
}

// Dark theme
[data-theme='dark'] .zen-toast {
  background: linear-gradient(
    165deg,
    var(--gutenku-paper-bg-warm) 0%,
    var(--gutenku-paper-bg) 60%,
    oklch(0.18 0.01 85) 100%
  );

  box-shadow:
    1px 1px 0 oklch(0.15 0.01 85),
    2px 2px 0 oklch(0.13 0.01 85),
    3px 3px 0 oklch(0.11 0.01 85),
    4px 8px 20px oklch(0 0 0 / 0.4),
    8px 16px 40px oklch(0 0 0 / 0.3),
    inset 0 1px 0 oklch(1 0 0 / 0.08),
    inset -1px 0 0 oklch(1 0 0 / 0.03);

  .zen-toast__paper {
    opacity: 0.04;
  }

  .zen-toast__spine {
    box-shadow:
      inset -1px 0 3px oklch(0 0 0 / 0.5),
      1px 0 1px oklch(1 0 0 / 0.05);
  }

  .zen-toast__close:hover {
    background: oklch(1 0 0 / 0.1);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .zen-toast-enter-active {
    animation: none;
    opacity: 1;
    --ink-radius: 150%;
  }

  .zen-toast-leave-active {
    animation: none;
    transition: opacity 0.2s ease;
  }

  .zen-toast__icon {
    animation: none !important;
  }

  .zen-toast__paper {
    animation: none;
  }
}

// Mobile
@media (max-width: 600px) {
  .zen-toast-container {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
    perspective: none;
  }

  .zen-toast {
    min-width: auto;
    width: 100%;
    padding: 1rem 1.25rem 1rem 1.5rem;
    clip-path: circle(var(--ink-radius) at 2rem center);

    box-shadow:
      2px 2px 0 oklch(0.85 0.01 85),
      3px 6px 12px oklch(0 0 0 / 0.1),
      inset 0 1px 0 oklch(1 0 0 / 0.5);
  }
}
</style>
