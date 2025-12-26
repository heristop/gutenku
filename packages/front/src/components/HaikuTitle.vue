<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

// Theme toggle functionality
const {
  isDarkMode,
  toggleTheme,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();

// Toggle following system preference and align theme accordingly
const toggleSystemPreference = () => {
  const next = !systemPreferenceEnabled.value;
  saveSystemPreferenceEnabled(next);
  if (next) {
    // Enable system-driven theme
    setTheme('system');
  } else {
    // Disable system preference, keep current visual theme as explicit
    setTheme(isDarkMode.value ? 'dark' : 'light');
  }
};

// Manual theme selection should disable system preference
const toggleThemeManually = () => {
  if (systemPreferenceEnabled.value) {
    saveSystemPreferenceEnabled(false);
  }
  toggleTheme();
};

const poetryQuotes = [
  'Where words fail, poetry speaks',
  'In seventeen syllables, infinite worlds',
  'Every haiku holds a season of the soul',
  'Literature breathes life into silence',
  'From classic books to modern verse',
];

const currentQuote = ref(0);
const showQuote = ref(false);
const typewriterText = ref('');
const showCursor = ref(true);
const fullTitle = 'GutenKu';

let quoteInterval: NodeJS.Timeout | null = null;
let typewriterTimeout: NodeJS.Timeout | null = null;

const startTypewriter = () => {
  let i = 0;
  const typeNextChar = () => {
    if (i < fullTitle.length) {
      typewriterText.value += fullTitle.charAt(i);
      i++;
      typewriterTimeout = setTimeout(typeNextChar, 150);
    } else {
      showCursor.value = false;
      setTimeout(() => {
        showQuote.value = true;
        startQuoteRotation();
      }, 800);
    }
  };
  typeNextChar();
};

const startQuoteRotation = () => {
  quoteInterval = setInterval(() => {
    currentQuote.value = (currentQuote.value + 1) % poetryQuotes.length;
  }, 4000);
};

onMounted(() => {
  setTimeout(startTypewriter, 300);
});

onUnmounted(() => {
  if (quoteInterval) clearInterval(quoteInterval);
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
});
</script>

<template>
  <v-card
    class="gutenku-card text-center mb-6 haiku-title-card"
    color="secondary"
    variant="tonal"
  >
    <div class="theme-actions">
      <!-- Elegant Theme Toggle -->
      <v-tooltip
        :text="
          systemPreferenceEnabled
            ? 'Disable System Theme to change manually'
            : isDarkMode
              ? 'Switch to Light Mode'
              : 'Switch to Dark Mode'
        "
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="toggleThemeManually"
            class="theme-icon-btn theme-toggle-btn"
            :class="{ 'is-disabled': systemPreferenceEnabled }"
            :disabled="systemPreferenceEnabled"
            :icon="isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            size="small"
            variant="text"
            :elevation="0"
            :ripple="false"
            :aria-label="
              systemPreferenceEnabled
                ? 'Disable System Theme to change manually'
                : isDarkMode
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
            "
          />
        </template>
      </v-tooltip>

      <!-- System Preference Toggle (Settings) -->
      <v-tooltip
        :text="
          systemPreferenceEnabled
            ? 'Disable System Theme'
            : 'Enable System Theme'
        "
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="toggleSystemPreference"
            class="theme-icon-btn theme-settings-btn"
            :class="{ active: systemPreferenceEnabled }"
            icon="mdi-laptop"
            size="small"
            variant="text"
            :elevation="0"
            :ripple="false"
            :aria-label="
              systemPreferenceEnabled
                ? 'Disable System Theme'
                : 'Enable System Theme'
            "
          />
        </template>
      </v-tooltip>
    </div>

    <div class="title-container">
      <h1 class="haiku-title">
        <span class="typewriter-text">{{ typewriterText }}</span>
      </h1>

      <transition
        name="quote-fade"
        mode="out-in"
      >
        <p
          v-if="showQuote"
          :key="currentQuote"
          class="poetry-quote"
        >
          {{ poetryQuotes[currentQuote] }}
        </p>
      </transition>
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
        var(--gutenku-zen-water, rgba(47, 93, 98, 0.05)) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 70%,
        var(--gutenku-zen-mist, rgba(167, 196, 188, 0.1)) 0%,
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
    1px 1px 2px rgba(0, 0, 0, 0.1),
    0 0 4px rgba(47, 93, 98, 0.2);
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

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(2px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(1px);
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
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer !important;
  transition: var(--gutenku-transition-zen);
  box-shadow: none;

  // No special base shadow in dark mode; keep flat for consistency

  // Ensure pointer cursor works on all elements within the button
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

    // Ensure hover state also has pointer cursor
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
      outline-color: rgba(255, 255, 255, 0.8);
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
  width: 40px;
  height: 40px;
  cursor: pointer !important;
  transition: var(--gutenku-transition-zen);
  box-shadow: none;

  // No special base shadow in dark mode; keep flat for consistency

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
    /* Softer, thinner accent ring and reduced elevation */
    box-shadow:
      0 0 0 2px rgba(47, 93, 98, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.18);

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
    gap: 0.75rem;
  }

  .theme-icon-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
