<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Monitor } from 'lucide-vue-next';
import { useTheme } from '@/composables/theme';
import { useTypewriter } from '@/composables/typewriter';
import { useQuoteRotation } from '@/composables/quote-rotation';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

const { t } = useI18n();

// Use direct translation calls instead of tm() to avoid slot invocation warnings
const QUOTE_COUNT = 5;
const poetryQuotes = Array.from({ length: QUOTE_COUNT }, (_, i) =>
  t(`haikuTitle.quotes.${i}`),
);

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

const {
  currentIndex: currentQuote,
  showQuote,
  start: startQuoteRotation,
} = useQuoteRotation(poetryQuotes, { intervalMs: 4000, startDelay: 800 });

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

const {
  displayText: typewriterText,
  showCursor,
  start: startTypewriter,
} = useTypewriter('GutenKu', {
  speed: 150,
  startDelay: 300,
  onComplete: startQuoteRotation,
});

onMounted(startTypewriter);
</script>

<template>
  <v-card
    class="gutenku-card text-center mb-6 haiku-title-card"
    color="secondary"
    variant="tonal"
  >
    <div class="theme-actions">
      <!-- Theme Toggle -->
      <ZenTooltip
        :text="themeToggleTooltip"
        position="bottom"
        :disabled="systemPreferenceEnabled"
      >
        <v-btn
          class="theme-icon-btn theme-toggle-btn"
          :class="{ 'is-disabled': systemPreferenceEnabled }"
          :disabled="systemPreferenceEnabled"
          size="small"
          variant="text"
          :elevation="0"
          :ripple="false"
          :aria-label="themeToggleTooltip"
          @click="toggleThemeManually"
        >
          <Sun v-if="isDarkMode" :size="20" />
          <Moon v-else :size="20" />
        </v-btn>
      </ZenTooltip>

      <!-- System Preference Toggle (Settings) -->
      <ZenTooltip :text="systemThemeTooltip" position="bottom">
        <v-btn
          class="theme-icon-btn theme-settings-btn"
          :class="{ active: systemPreferenceEnabled }"
          size="small"
          variant="text"
          :elevation="0"
          :ripple="false"
          :aria-label="systemThemeTooltip"
          @click="toggleSystemPreference"
        >
          <Monitor :size="20" />
        </v-btn>
      </ZenTooltip>
    </div>

    <div class="title-container">
      <h1 class="haiku-title">
        <span class="typewriter-text">{{ typewriterText }}</span>
      </h1>

      <p
        v-if="showQuote"
        :key="currentQuote"
        v-motion
        :initial="prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(2px)' }"
        :enter="prefersReducedMotion
          ? { opacity: 0.8, transition: { duration: 0 } }
          : { opacity: 0.8, y: 0, filter: 'blur(0px)', transition: { duration: 600, ease: [0.25, 0.8, 0.25, 1] } }"
        :leave="prefersReducedMotion
          ? { opacity: 0, transition: { duration: 0 } }
          : { opacity: 0, y: -10, filter: 'blur(2px)', transition: { duration: 300, ease: [0.4, 0, 1, 1] } }"
        class="poetry-quote"
      >
        {{ poetryQuotes[currentQuote] }}
      </p>
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.haiku-title-card {
  position: relative;
  overflow: visible;
  transition: var(--gutenku-transition-zen, all 0.4s ease);
  background: linear-gradient(
    135deg,
    var(--gutenku-paper-bg, #f8f6f0) 0%,
    var(--gutenku-paper-bg-warm, #faf8f2) 100%
  );
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  caret-color: transparent !important;

  *:not(.theme-toggle-btn):not(.theme-toggle-btn *):not(
      .theme-settings-btn
    ):not(.theme-settings-btn *),
  *:not(.theme-toggle-btn):not(.theme-toggle-btn *):not(
      .theme-settings-btn
    ):not(.theme-settings-btn *)::before,
  *:not(.theme-toggle-btn):not(.theme-toggle-btn *):not(
      .theme-settings-btn
    ):not(.theme-settings-btn *)::after {
    cursor: default !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    caret-color: transparent !important;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      radial-gradient(
        ellipse at 20% 30%,
        var(--gutenku-zen-water, oklch(0.45 0.08 195 / 0.05)) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 70%,
        var(--gutenku-zen-mist, oklch(0.76 0.04 175 / 0.1)) 0%,
        transparent 50%
      );
    border-radius: 8px;
    pointer-events: none;
    z-index: 1;
    opacity: 0.6;
  }
}

.title-container {
  position: relative;
  z-index: 2;
  padding: 2rem 1.5rem;
  cursor: default;
  user-select: none;
}

.haiku-title {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: var(--gutenku-text-primary, #2c1810);
  text-shadow:
    1px 1px 2px oklch(0 0 0 / 0.1),
    0 0 4px oklch(0.45 0.08 195 / 0.2);
  margin: 0;
  position: relative;
  cursor: default !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }

  span {
    cursor: default !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
}

.poetry-quote {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--gutenku-text-zen, #2f5d62);
  margin: 1rem 0 0 0;
  opacity: 0.8;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

// Actions container to align buttons with consistent spacing
.theme-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 10;
}

// Common icon button style
.theme-icon-btn {
  position: relative;
  background: var(--gutenku-btn-subtle-bg) !important;
  color: var(--gutenku-text-contrast) !important;
  border: 1px solid var(--gutenku-border-visible);
  border-radius: 50% !important;
  width: 2.5rem !important;
  height: 2.5rem !important;
  min-width: 2.5rem !important;
  min-height: 2.5rem !important;
  max-width: 2.5rem !important;
  max-height: 2.5rem !important;
  padding: 0 !important;
  cursor: pointer !important;
  transition: var(--gutenku-transition-zen);
  box-shadow: none;

  // Pointer cursor on all button elements
  &,
  *,
  .v-icon,
  .v-icon::before,
  .v-icon::after {
    cursor: pointer !important;
  }

  &:hover {
    background: var(--gutenku-btn-subtle-hover) !important;
    border-color: var(--gutenku-border-visible-hover);
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--gutenku-shadow-ink);

    // Maintain pointer cursor on hover
    &,
    *,
    .v-icon,
    .v-icon::before,
    .v-icon::after {
      cursor: pointer !important;
    }
  }

  &:active {
    transform: translateY(0) scale(0.95);
    transition: var(--gutenku-transition-fast);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;

    [data-theme='dark'] & {
      outline-color: oklch(1 0 0 / 0.8);
    }
  }

  .v-icon {
    transition: var(--gutenku-transition-zen);
    cursor: pointer !important;
  }

  // Disabled state (when following system theme)
  &[disabled],
  &.v-btn--disabled,
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed !important;
    box-shadow: none !important;
    transform: none !important;
    background: transparent !important;
    border-color: transparent !important;
  }

  &[disabled]:hover,
  &.v-btn--disabled:hover,
  &.is-disabled:hover {
    background: var(--gutenku-btn-subtle-bg) !important;
    border-color: var(--gutenku-border-visible) !important;
    transform: none !important;
    box-shadow: none !important;
  }

  &[disabled] .v-icon,
  &.v-btn--disabled .v-icon,
  &.is-disabled .v-icon {
    transform: none !important;
    cursor: not-allowed !important;
    opacity: 0.85;
  }
}

// Individual hover icon motions
.theme-toggle-btn:hover .v-icon {
  transform: rotate(15deg) scale(1.1);
}

// Small settings icon next to theme toggle
.theme-settings-btn {
  position: relative;
  background: var(--gutenku-btn-subtle-bg) !important;
  color: var(--gutenku-text-contrast) !important;
  border: 1px solid var(--gutenku-border-visible);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  cursor: pointer !important;
  transition: var(--gutenku-transition-zen);
  box-shadow: none;

  &,
  *,
  .v-icon,
  .v-icon::before,
  .v-icon::after {
    cursor: pointer !important;
  }

  &:hover {
    background: var(--gutenku-btn-subtle-hover) !important;
    border-color: var(--gutenku-border-visible-hover);
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--gutenku-shadow-ink);
  }

  &:active {
    transform: translateY(0) scale(0.95);
    transition: var(--gutenku-transition-fast);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  .v-icon {
    transition: var(--gutenku-transition-zen);
    cursor: pointer !important;
  }

  &:hover .v-icon {
    transform: rotate(-15deg) scale(1.1);
  }

  &.active {
    background: linear-gradient(
      135deg,
      color-mix(in oklab, var(--gutenku-zen-accent), white 20%) 0%,
      var(--gutenku-zen-accent) 100%
    ) !important;
    color: #fff !important;
    border-color: var(--gutenku-zen-accent);
    box-shadow:
      0 0 0 2px oklch(0.45 0.08 195 / 0.15),
      0 4px 12px oklch(0 0 0 / 0.18);

    .v-icon {
      color: #fff !important;
    }
  }
}

@media (max-width: 768px) {
  .title-container {
    padding: 1.5rem 1rem;
  }

  .theme-actions {
    top: 0.75rem;
    right: 0.75rem;
    gap: 0.5rem;
  }

  .theme-icon-btn,
  .theme-settings-btn {
    width: 2rem !important;
    height: 2rem !important;
    min-width: 2rem !important;
    min-height: 2rem !important;
    max-width: 2rem !important;
    max-height: 2rem !important;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }
}
</style>
