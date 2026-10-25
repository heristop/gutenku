<script lang="ts" setup>
import { CheckCircle, AlertCircle, Info, X } from '@/core/components/icons/ink';
import { computed } from 'vue';
import { useToast } from '@/core/composables/toast';

const { toasts, remove } = useToast();

// Errors interrupt; confirmations and info wait their turn
const errorToasts = computed(() =>
  toasts.value.filter((toast) => toast.type === 'error'),
);
const politeToasts = computed(() =>
  toasts.value.filter((toast) => toast.type !== 'error'),
);

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
    <!-- Live regions for screen reader announcements -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      <span v-for="toast in politeToasts" :key="`sr-${toast.id}`">
        {{ iconLabels[toast.type] }}: {{ toast.message }}
      </span>
    </div>
    <div class="sr-only" aria-live="assertive" aria-atomic="true">
      <span v-for="toast in errorToasts" :key="`sr-${toast.id}`">
        {{ iconLabels[toast.type] }}: {{ toast.message }}
      </span>
    </div>

    <section class="zen-toast-container" aria-label="Notifications">
      <TransitionGroup name="zen-toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="zen-toast"
          :class="`zen-toast--${toast.type}`"
        >
          <!-- Stamp-ink bar along the top edge -->
          <div class="zen-toast__mark" aria-hidden="true" />

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
        </div>
      </TransitionGroup>
    </section>
  </Teleport>
</template>

<style scoped lang="scss">
// Ex Libris: a slip of paper with a thin bar of stamp ink across the top.
.zen-toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  pointer-events: none;
}

.zen-toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 0.5rem 0.75rem 1rem;
  background: var(--gk-paper-float);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift-float);
  font-size: 0.9rem;
  color: var(--gk-ink);
  pointer-events: auto;
  max-width: 90vw;
  min-width: 320px;
  overflow: clip;

  &__mark {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: var(--gk-stamp);
  }

  &__icon {
    flex-shrink: 0;
    color: var(--gk-ink);
  }

  &--error &__icon {
    color: var(--gk-stamp-ink);
  }

  // Vermilion is a verdict: only errors carry it
  &--info &__mark,
  &--success &__mark {
    background: var(--gk-ink);
  }

  &__message {
    flex: 1;
    line-height: 1.5;
    padding-right: 0.25rem;
  }

  &__close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--gk-radius-control);
    color: var(--gk-ink-soft);
    cursor: pointer;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    &:active {
      transform: scale(0.96);
    }

    @media (hover: hover) {
      &:hover {
        background: var(--gk-ink-faint);
        color: var(--gk-ink);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }
}

.zen-toast-enter-active {
  transition:
    opacity var(--gk-dur-base) var(--gk-ease-out),
    transform var(--gk-dur-base) var(--gk-ease-out);
}

// Slips in from the bottom edge (240ms) and drops back the way it came
// (160ms), so arrival and dismissal read as one gesture.
.zen-toast-leave-active {
  // Out of flow while leaving, so the rest of the stack glides (-move) instead of jumping
  position: absolute;
  width: 100%;
  pointer-events: none;
  transition:
    opacity var(--gk-dur-exit) var(--gk-ease-out),
    transform var(--gk-dur-exit) var(--gk-ease-out);
}

.zen-toast-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.zen-toast-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}

.zen-toast-move {
  transition: transform var(--gk-dur-base) var(--gk-ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .zen-toast-enter-active,
  .zen-toast-leave-active {
    transition: opacity 150ms ease;
  }

  .zen-toast-enter-from,
  .zen-toast-leave-to {
    transform: none;
  }

  .zen-toast-move {
    transition: none;
  }

  .zen-toast__close:active {
    transform: none;
  }
}

@media (forced-colors: active) {
  .zen-toast {
    border: 2px solid CanvasText;
  }
}

@media (max-width: 600px) {
  .zen-toast-container {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
  }

  .zen-toast {
    min-width: auto;
    width: 100%;
  }
}
</style>
