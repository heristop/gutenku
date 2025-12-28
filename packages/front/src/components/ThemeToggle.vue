<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Monitor } from 'lucide-vue-next';
import { useTheme } from '@/composables/theme';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const {
  isDarkMode,
  toggleTheme,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();

const toggleSystemPreference = () => {
  const next = !systemPreferenceEnabled.value;
  saveSystemPreferenceEnabled(next);
  if (next) {
    setTheme('system');
  } else {
    setTheme(isDarkMode.value ? 'dark' : 'light');
  }
};

const toggleThemeManually = () => {
  if (systemPreferenceEnabled.value) {
    saveSystemPreferenceEnabled(false);
  }
  toggleTheme();
};

const themeToggleTooltip = computed(() => {
  if (systemPreferenceEnabled.value) {
    return t('haikuTitle.theme.systemDisableHint');
  }
  return isDarkMode.value
    ? t('haikuTitle.theme.switchToLight')
    : t('haikuTitle.theme.switchToDark');
});

const systemThemeTooltip = computed(() =>
  systemPreferenceEnabled.value
    ? t('haikuTitle.theme.disableSystem')
    : t('haikuTitle.theme.enableSystem'),
);
</script>

<template>
  <div class="theme-toggle">
    <!-- Theme Toggle -->
    <ZenTooltip
      :text="themeToggleTooltip"
      position="left"
      :disabled="systemPreferenceEnabled"
    >
      <button
        class="theme-toggle__btn"
        :class="{ 'is-disabled': systemPreferenceEnabled }"
        :disabled="systemPreferenceEnabled"
        :aria-label="themeToggleTooltip"
        @click.stop="toggleThemeManually"
        @touchend.stop.prevent="toggleThemeManually"
      >
        <Sun v-if="isDarkMode" :size="18" />
        <Moon v-else :size="18" />
      </button>
    </ZenTooltip>

    <!-- System Preference Toggle -->
    <ZenTooltip :text="systemThemeTooltip" position="left">
      <button
        class="theme-toggle__btn theme-toggle__btn--system"
        :class="{ active: systemPreferenceEnabled }"
        :aria-label="systemThemeTooltip"
        @click.stop="toggleSystemPreference"
        @touchend.stop.prevent="toggleSystemPreference"
      >
        <Monitor :size="18" />
      </button>
    </ZenTooltip>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
}

.theme-toggle__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: oklch(1 0 0 / 0.5);
  color: var(--gutenku-text-primary);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--gutenku-transition-fast);
  box-shadow: var(--gutenku-shadow-zen);
  backdrop-filter: blur(8px);

  [data-theme='dark'] & {
    background: oklch(0.2 0 0 / 0.4);
  }

  &:hover:not(:disabled) {
    background: var(--gutenku-paper-hover);
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--gutenku-shadow-elevated);

    svg {
      transform: rotate(15deg);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &:disabled,
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      transform: none;
      box-shadow: var(--gutenku-shadow-zen);

      svg {
        transform: none;
      }
    }
  }

  svg {
    transition: transform 0.2s ease;
  }

  &--system {
    &:hover svg {
      transform: rotate(-15deg);
    }

    &.active {
      background: var(--gutenku-zen-accent);
      color: #fff;
      border-color: var(--gutenku-zen-accent);

      &:hover {
        background: var(--gutenku-zen-accent);
      }
    }
  }
}

@media (max-width: 600px) {
  .theme-toggle {
    position: absolute;
    top: 0.85rem;
    right: 0.5rem;
    flex-direction: row;
  }

  .theme-toggle__btn {
    width: 2.25rem;
    height: 2.25rem;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
