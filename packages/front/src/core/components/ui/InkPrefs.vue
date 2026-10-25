<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Monitor } from '@/core/components/icons/ink';
import InkLanguageMenu from '@/core/components/ui/InkLanguageMenu.vue';
import { setThemeOrigin, useTheme } from '@/core/composables/theme';
import { useAccessibility } from '@/core/composables/accessibility';

// Reader preferences (theme, language, dyslexia type) as small ruled keys,
// shared by the table of contents and the colophon footer.
const { t } = useI18n();
const {
  isDarkMode,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();
const { dyslexiaEnabled, toggleDyslexia } = useAccessibility();

type ThemeState = 'light' | 'dark' | 'system';

const currentThemeState = computed<ThemeState>(() => {
  if (systemPreferenceEnabled.value) {
    return 'system';
  }

  return isDarkMode.value ? 'dark' : 'light';
});

// Cycle: light → dark → system
// The new theme spreads from where the key was pressed (its centre when
// pressed from the keyboard)
// Only a press turns the icon; it lands still on page load
const iconTurns = ref(false);

function cycleThemeFrom(event: MouseEvent) {
  iconTurns.value = true;
  const key = event.currentTarget as HTMLElement;
  const box = key.getBoundingClientRect();
  const fromPointer = event.detail > 0 && (event.clientX || event.clientY);

  setThemeOrigin(
    fromPointer ? event.clientX : box.left + box.width / 2,
    fromPointer ? event.clientY : box.top + box.height / 2,
  );
  cycleTheme();
}

function cycleTheme() {
  switch (currentThemeState.value) {
    case 'light':
      saveSystemPreferenceEnabled(false);
      setTheme('dark');
      break;
    case 'dark':
      saveSystemPreferenceEnabled(true);
      setTheme('auto');
      break;
    case 'system':
      saveSystemPreferenceEnabled(false);
      setTheme('light');
      break;
  }
}

const themeLabel = computed(() => {
  switch (currentThemeState.value) {
    case 'light':
      return t('theme.switchToDark');
    case 'dark':
      return t('theme.enableSystem');
    default:
      return t('theme.switchToLight');
  }
});

const dyslexiaLabel = computed(() =>
  dyslexiaEnabled.value
    ? t('footer.accessibility.dyslexiaOn')
    : t('footer.accessibility.dyslexiaOff'),
);
</script>

<template>
  <div class="ink-prefs">
    <InkLanguageMenu class="ink-prefs__key" />

    <button
      type="button"
      class="ink-prefs__key theme-toggle"
      :aria-label="themeLabel"
      :title="themeLabel"
      @click="cycleThemeFrom"
    >
      <Sun
        v-if="currentThemeState === 'light'"
        key="light"
        class="theme-toggle__icon"
        :class="{ 'theme-toggle__icon--turn': iconTurns }"
        :size="15"
        :stroke-width="1.75"
        aria-hidden="true"
      />
      <Moon
        v-else-if="currentThemeState === 'dark'"
        key="dark"
        class="theme-toggle__icon"
        :class="{ 'theme-toggle__icon--turn': iconTurns }"
        :size="15"
        :stroke-width="1.75"
        aria-hidden="true"
      />
      <Monitor
        v-else
        key="system"
        class="theme-toggle__icon"
        :class="{ 'theme-toggle__icon--turn': iconTurns }"
        :size="15"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </button>

    <button
      type="button"
      class="ink-prefs__key"
      :aria-label="dyslexiaLabel"
      :aria-pressed="dyslexiaEnabled"
      :title="dyslexiaLabel"
      @click="toggleDyslexia"
    >
      <span aria-hidden="true">Aa</span>
    </button>

    <slot />
  </div>
</template>

<style lang="scss" scoped>
.ink-prefs {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.ink-prefs__key {
  position: relative;
  display: inline-grid;
  place-items: center;
  min-width: 2.25rem;
  height: 2rem;
  padding: 0 0.5625rem;
  background: transparent;
  border: 1.5px solid var(--gk-ink-faint);
  border-radius: var(--gk-radius-control);
  font-family: var(--gk-font);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  color: var(--gk-ink);
  cursor: pointer;
  transition:
    border-color var(--gk-dur-fast) var(--gk-ease-out),
    background-color var(--gk-dur-fast) var(--gk-ease-out),
    color var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);

  // 44px hit area around the smaller visual key
  &::before {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: max(100%, 44px);
    height: 44px;
    transform: translate(-50%, -50%);
  }

  @media (hover: hover) {
    &:hover {
      border-color: var(--gk-ink);
    }
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }

  &[aria-expanded='true'] {
    border-color: var(--gk-ink);
  }

  &[aria-pressed='true'] {
    background: var(--gk-ink);
    border-color: var(--gk-ink);
    color: var(--gk-paper);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ink-prefs__key {
    transition: none;

    &:active {
      transform: none;
    }
  }
}

@media (forced-colors: active) {
  .ink-prefs__key {
    border-color: ButtonText;
  }

  .ink-prefs__key[aria-pressed='true'] {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
}

// The new icon lands with a quarter turn as the theme changes
.theme-toggle__icon--turn {
  animation: theme-icon-turn var(--gk-dur-base) var(--gk-ease-out) both;
}

@keyframes theme-icon-turn {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle__icon--turn {
    animation: none;
  }
}
</style>
