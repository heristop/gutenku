<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Monitor } from 'lucide-vue-next';
import { useTheme } from '@/composables/theme';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const {
  isDarkMode,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();

// Current mode: 'light' | 'system' | 'dark'
const currentMode = computed(() => {
  if (systemPreferenceEnabled.value) {return 'system';}
  return isDarkMode.value ? 'dark' : 'light';
});

// Cycle through: light → system → dark → light
function cycleTheme() {
  if (currentMode.value === 'light') {
    saveSystemPreferenceEnabled(true);
    setTheme('system');
  } else if (currentMode.value === 'system') {
    saveSystemPreferenceEnabled(false);
    setTheme('dark');
  } else {
    saveSystemPreferenceEnabled(false);
    setTheme('light');
  }
}

// Tooltip text
const tooltipText = computed(() => {
  const mode = currentMode.value;
  if (mode === 'light') {return t('theme.currentLight');}
  if (mode === 'system') {return t('theme.currentSystem');}
  return t('theme.currentDark');
});

// Ink ripple effect
const ripple = ref<{ x: number; y: number; active: boolean }>({
  x: 0,
  y: 0,
  active: false,
});

function handleClick(event: MouseEvent | TouchEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  // Get coordinates from mouse or touch event
  let x = rect.width / 2;
  let y = rect.height / 2;

  if ('clientX' in event) {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  } else if (event.touches?.length) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  }

  ripple.value = { x, y, active: true };

  setTimeout(() => {
    ripple.value.active = false;
  }, 500);

  cycleTheme();
}
</script>

<template>
  <div class="theme-toggle-wrapper">
    <ZenTooltip :text="tooltipText" position="left">
      <button
        class="theme-toggle-zen"
        :aria-label="tooltipText"
        @click="handleClick"
        @touchend.prevent="handleClick"
      >
        <!-- Ink ripple effect -->
        <span
          v-if="ripple.active"
          class="theme-toggle-zen__ripple"
          :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }"
          aria-hidden="true"
        />

        <!-- Icon with transition -->
        <Transition name="theme-icon" mode="out-in">
          <Sun
            v-if="currentMode === 'light'"
            key="sun"
            :size="20"
            class="theme-toggle-zen__icon"
            aria-hidden="true"
          />
          <Monitor
            v-else-if="currentMode === 'system'"
            key="monitor"
            :size="20"
            class="theme-toggle-zen__icon"
            aria-hidden="true"
          />
          <Moon
            v-else
            key="moon"
            :size="20"
            class="theme-toggle-zen__icon"
            aria-hidden="true"
          />
        </Transition>

        <!-- State indicator dots -->
        <div class="theme-toggle-zen__dots" aria-hidden="true">
          <span :class="{ active: currentMode === 'light' }" />
          <span :class="{ active: currentMode === 'system' }" />
          <span :class="{ active: currentMode === 'dark' }" />
        </div>
      </button>
    </ZenTooltip>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-wrapper {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.theme-toggle-zen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;

  // Glassmorphism - transparent with blur
  background: oklch(1 0 0 / 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(0.5 0.05 192 / 0.2);
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;

  box-shadow: 0 2px 8px oklch(0 0 0 / 0.08);

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    background: oklch(1 0 0 / 0.6);
    box-shadow: 0 4px 16px oklch(0 0 0 / 0.12);

    .theme-toggle-zen__icon {
      transform: rotate(15deg) scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 3px;
  }

  // Dark mode adjustments
  [data-theme='dark'] & {
    background: oklch(0.2 0.02 200 / 0.5);
    border-color: oklch(0.7 0.04 192 / 0.25);
    box-shadow: 0 2px 12px oklch(0 0 0 / 0.3);

    &:hover {
      background: oklch(0.25 0.03 200 / 0.6);
      box-shadow: 0 4px 20px oklch(0 0 0 / 0.4);
    }
  }

  &__icon {
    color: var(--gutenku-zen-primary);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    [data-theme='dark'] & {
      color: var(--gutenku-zen-accent);
    }
  }

  &__ripple {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--gutenku-zen-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.4;
    animation: ink-ripple 0.5s cubic-bezier(0, 0.5, 0.5, 1) forwards;
    pointer-events: none;

    [data-theme='dark'] & {
      background: var(--gutenku-zen-accent);
    }
  }

  &__dots {
    position: absolute;
    bottom: 4px;
    display: flex;
    gap: 3px;

    span {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--gutenku-zen-primary);
      opacity: 0.25;
      transition: all 0.25s ease;

      &.active {
        opacity: 1;
        transform: scale(1.2);
      }

      [data-theme='dark'] & {
        background: var(--gutenku-zen-accent);
      }
    }
  }
}

// Icon transition animations
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: scale(0.6) rotate(-45deg);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: scale(0.6) rotate(45deg);
}

// Ink ripple animation
@keyframes ink-ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(20);
    opacity: 0;
  }
}

// Mobile adjustments
@media (max-width: 600px) {
  .theme-toggle-wrapper {
    top: 0.85rem;
    right: 0.5rem;
  }

  .theme-toggle-zen {
    width: 2.5rem;
    height: 2.5rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &__icon {
      width: 18px;
      height: 18px;
    }

    &__dots {
      bottom: 3px;

      span {
        width: 2.5px;
        height: 2.5px;
      }
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-zen {
    transition: none;

    &:hover {
      transform: none;
    }

    &__icon {
      transition: none;
    }

    &__ripple {
      animation: none;
      display: none;
    }
  }

  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: opacity 0.15s ease;
  }

  .theme-icon-enter-from,
  .theme-icon-leave-to {
    transform: none;
  }
}
</style>
