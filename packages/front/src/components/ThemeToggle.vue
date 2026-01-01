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

// Toggle between light and dark directly
function toggleTheme() {
  saveSystemPreferenceEnabled(false);
  setTheme(isDarkMode.value ? 'light' : 'dark');
}

// Toggle system preference
function toggleSystemPreference() {
  if (systemPreferenceEnabled.value) {
    saveSystemPreferenceEnabled(false);
  } else {
    saveSystemPreferenceEnabled(true);
    setTheme('auto');
  }
}

// Tooltip texts
const themeTooltip = computed(() =>
  isDarkMode.value ? t('theme.switchToLight') : t('theme.switchToDark'),
);

const systemTooltip = computed(() =>
  systemPreferenceEnabled.value
    ? t('theme.disableSystem')
    : t('theme.enableSystem'),
);

// Ink ripple effect
const ripple = ref<{ x: number; y: number; active: boolean }>({
  x: 0,
  y: 0,
  active: false,
});

function handleClick(event: MouseEvent | TouchEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

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

  toggleTheme();
}
</script>

<template>
  <div class="theme-toggle-wrapper">
    <!-- Main light/dark toggle -->
    <ZenTooltip :text="themeTooltip" position="left">
      <button
        class="theme-toggle"
        :aria-label="themeTooltip"
        @click="handleClick"
        @touchend.prevent="handleClick"
      >
        <!-- Ink ripple effect -->
        <span
          v-if="ripple.active"
          class="theme-toggle__ripple"
          :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }"
          aria-hidden="true"
        />

        <!-- Icon with transition -->
        <Transition name="theme-icon" mode="out-in">
          <Sun
            v-if="!isDarkMode"
            key="sun"
            :size="20"
            :stroke-width="1.5"
            class="theme-toggle__icon"
            aria-hidden="true"
          />
          <Moon
            v-else
            key="moon"
            :size="20"
            :stroke-width="1.5"
            class="theme-toggle__icon"
            aria-hidden="true"
          />
        </Transition>

        <!-- State indicator dots (light/dark) -->
        <div class="theme-toggle__dots" aria-hidden="true">
          <span :class="{ active: !isDarkMode }" />
          <span :class="{ active: isDarkMode }" />
        </div>
      </button>
    </ZenTooltip>

    <!-- Separator -->
    <div class="theme-separator" aria-hidden="true" />

    <!-- System preference toggle -->
    <ZenTooltip :text="systemTooltip" position="left">
      <button
        class="system-toggle"
        :class="{ 'system-toggle--active': systemPreferenceEnabled }"
        :aria-label="systemTooltip"
        :aria-pressed="systemPreferenceEnabled"
        @click="toggleSystemPreference"
      >
        <Monitor :size="14" :stroke-width="1.5" />
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.theme-toggle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  gap: 0.25rem;

  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;

  box-shadow:
    0 2px 8px oklch(0 0 0 / 0.06),
    0 1px 2px oklch(0 0 0 / 0.04);

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 16px oklch(0 0 0 / 0.1),
      0 2px 4px oklch(0 0 0 / 0.06);

    .theme-toggle__icon {
      transform: rotate(15deg) scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 3px;
  }

  &__icon {
    color: var(--gutenku-zen-primary);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__ripple {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--gutenku-zen-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.3;
    animation: ink-ripple 0.5s cubic-bezier(0, 0.5, 0.5, 1) forwards;
    pointer-events: none;
  }

  &__dots {
    position: absolute;
    bottom: 5px;
    display: flex;
    gap: 4px;

    span {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--gutenku-zen-primary);
      opacity: 0.2;
      transition: all 0.25s ease;

      &.active {
        opacity: 0.8;
        transform: scale(1.1);
      }
    }
  }
}

.theme-separator {
  width: 16px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gutenku-paper-border) 30%,
    var(--gutenku-paper-border) 70%,
    transparent 100%
  );
}

.system-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  padding: 0;

  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: 50%;
  cursor: pointer;

  color: var(--gutenku-text-secondary);
  opacity: 0.6;

  box-shadow: 0 1px 4px oklch(0 0 0 / 0.04);

  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }

  &--active {
    opacity: 1;
    background: color-mix(in oklch, var(--gutenku-zen-primary) 12%, var(--gutenku-paper-bg));
    border-color: var(--gutenku-zen-primary);
    color: var(--gutenku-zen-primary);

    &:hover {
      background: color-mix(in oklch, var(--gutenku-zen-primary) 18%, var(--gutenku-paper-bg));
    }
  }
}

// Dark theme adjustments
[data-theme='dark'] {
  .theme-toggle {
    box-shadow:
      0 2px 12px oklch(0 0 0 / 0.2),
      0 1px 4px oklch(0 0 0 / 0.15);

    &:hover {
      box-shadow:
        0 4px 20px oklch(0 0 0 / 0.3),
        0 2px 8px oklch(0 0 0 / 0.2);
    }

    &__icon {
      color: var(--gutenku-zen-accent);
    }

    &__ripple {
      background: var(--gutenku-zen-accent);
    }

    &__dots span {
      background: var(--gutenku-zen-accent);
    }
  }

  .system-toggle {
    &--active {
      background: color-mix(in oklch, var(--gutenku-zen-accent) 15%, var(--gutenku-paper-bg));
      border-color: var(--gutenku-zen-accent);
      color: var(--gutenku-zen-accent);

      &:hover {
        background: color-mix(in oklch, var(--gutenku-zen-accent) 22%, var(--gutenku-paper-bg));
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
    opacity: 0.3;
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
    gap: 0.25rem;
  }

  .theme-toggle {
    width: 2.5rem;
    height: 2.5rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    &__icon {
      width: 18px;
      height: 18px;
    }

    &__dots {
      bottom: 4px;
      gap: 3px;

      span {
        width: 3px;
        height: 3px;
      }
    }
  }

  .theme-separator {
    width: 12px;
  }

  .system-toggle {
    width: 1.5rem;
    height: 1.5rem;

    svg {
      width: 12px;
      height: 12px;
    }
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .theme-toggle {
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

  .system-toggle {
    transition: none;

    &:hover {
      transform: none;
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
