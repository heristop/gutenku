<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Sun, Moon, Monitor, ALargeSmall } from 'lucide-vue-next';
import { useTheme } from '@/core/composables/theme';
import { useLocale, type SupportedLocale } from '@/core/composables/locale';
import { useAccessibility } from '@/core/composables/accessibility';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';

type ThemeState = 'light' | 'dark' | 'system';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'footer';
  }>(),
  {
    variant: 'default',
  },
);

const { t } = useI18n();
const { currentLocale, availableLocales, setLocale, getLocaleLabel } =
  useLocale();
const { dyslexiaEnabled, toggleDyslexia } = useAccessibility();

// Locale dropdown state
const localeDropdownOpen = ref(false);

function toggleLocaleDropdown() {
  localeDropdownOpen.value = !localeDropdownOpen.value;
}

function selectLocale(locale: SupportedLocale) {
  setLocale(locale);
  localeDropdownOpen.value = false;
}

function handleLocaleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    localeDropdownOpen.value = false;
  }
}

const dyslexiaTooltip = computed(() =>
  dyslexiaEnabled.value
    ? t('footer.accessibility.dyslexiaOn')
    : t('footer.accessibility.dyslexiaOff'),
);

// Disable tooltips on touch devices (causes layout overflow)
const isTouchDevice = ref(false);

const {
  isDarkMode,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();

// Current theme state for 3-state toggle (footer variant)
const currentThemeState = computed<ThemeState>(() => {
  if (systemPreferenceEnabled.value) {
    return 'system';
  }
  return isDarkMode.value ? 'dark' : 'light';
});

// Cycle through themes: light → dark → system
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

// Tooltip texts for footer (3-state cycle)
const themeTooltip = computed(() => {
  switch (currentThemeState.value) {
    case 'light':
      return t('theme.switchToDark');
    case 'dark':
      return t('theme.enableSystem');
    case 'system':
      return t('theme.switchToLight');
  }
});

// Desktop: separate light/dark toggle
function toggleLightDark() {
  saveSystemPreferenceEnabled(false);
  setTheme(isDarkMode.value ? 'light' : 'dark');
}

// Desktop: toggle system preference
function toggleSystemPreference() {
  if (systemPreferenceEnabled.value) {
    saveSystemPreferenceEnabled(false);
    setTheme(isDarkMode.value ? 'dark' : 'light');
  } else {
    saveSystemPreferenceEnabled(true);
    setTheme('auto');
  }
}

// Desktop tooltips
const lightDarkTooltip = computed(() =>
  isDarkMode.value ? t('theme.switchToLight') : t('theme.switchToDark'),
);

const systemTooltip = computed(() =>
  systemPreferenceEnabled.value
    ? t('theme.disableSystem')
    : t('theme.enableSystem'),
);

// Silk thread animation state
const isAnimating = ref(false);

function triggerBounce() {
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 1200);
}

function handleThemeClick() {
  triggerBounce();
  toggleLightDark();
}

function handleSystemClick() {
  triggerBounce();
  toggleSystemPreference();
}

// Initialize on mount
onMounted(() => {
  // Detect touch devices
  isTouchDevice.value =
    'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;

  // Trigger entrance animation after a small delay
  setTimeout(() => {
    triggerBounce();
  }, 300);
});
</script>

<template>
  <!-- Footer variant: 3-state cycle toggle (mobile only) -->
  <ZenTooltip v-if="variant === 'footer'" :text="themeTooltip" position="top">
    <button
      type="button"
      class="theme-toggle-footer"
      :aria-label="themeTooltip"
      @click="cycleTheme"
    >
      <span class="theme-toggle-footer__circle" aria-hidden="true" />
      <Transition name="theme-icon" mode="out-in">
        <Sun
          v-if="currentThemeState === 'light'"
          key="sun"
          :size="20"
          :stroke-width="1.5"
        />
        <Moon
          v-else-if="currentThemeState === 'dark'"
          key="moon"
          :size="20"
          :stroke-width="1.5"
        />
        <Monitor v-else key="monitor" :size="20" :stroke-width="1.5" />
      </Transition>
    </button>
  </ZenTooltip>

  <!-- Default variant: floating button (desktop only) -->
  <div
    v-else
    class="theme-toggle-wrapper"
    :class="{ 'theme-toggle-wrapper--animating': isAnimating }"
  >
    <!-- Top silk thread -->
    <div class="silk-thread silk-thread--top" aria-hidden="true">
      <div class="silk-thread__line" />
    </div>

    <!-- Main theme toggle (light/dark only) -->
    <ZenTooltip
      :text="lightDarkTooltip"
      position="left"
      :disabled="isTouchDevice"
    >
      <button
        class="theme-toggle"
        :aria-label="lightDarkTooltip"
        @click="handleThemeClick"
      >
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
      </button>
    </ZenTooltip>

    <!-- Connector thread (theme to system) -->
    <div class="silk-thread silk-thread--connector" aria-hidden="true">
      <div class="silk-thread__line" />
    </div>

    <!-- System preference toggle -->
    <ZenTooltip :text="systemTooltip" position="left" :disabled="isTouchDevice">
      <button
        type="button"
        class="system-toggle"
        :class="{ 'system-toggle--active': systemPreferenceEnabled }"
        :aria-label="systemTooltip"
        :aria-pressed="systemPreferenceEnabled"
        @click="handleSystemClick"
      >
        <Monitor :size="18" :stroke-width="1.5" />
      </button>
    </ZenTooltip>

    <!-- Connector thread 1 -->
    <div class="silk-thread silk-thread--connector" aria-hidden="true">
      <div class="silk-thread__line" />
    </div>

    <!-- Locale toggle -->
    <div class="locale-wrapper" @keydown="handleLocaleKeydown">
      <ZenTooltip
        :text="t('locale.switch')"
        position="left"
        :disabled="isTouchDevice"
      >
        <button
          type="button"
          class="locale-toggle"
          :aria-label="t('locale.switch')"
          :aria-expanded="localeDropdownOpen"
          aria-haspopup="listbox"
          @click="toggleLocaleDropdown"
        >
          <span class="locale-toggle__code">{{
            currentLocale.toUpperCase()
          }}</span>
        </button>
      </ZenTooltip>
      <Transition name="locale-dropdown">
        <ul
          v-if="localeDropdownOpen"
          class="locale-dropdown"
          role="listbox"
          :aria-label="t('locale.switch')"
          @click.stop
        >
          <li
            v-for="locale in availableLocales"
            :key="locale"
            role="option"
            :aria-selected="locale === currentLocale"
            class="locale-dropdown__option"
            :class="{
              'locale-dropdown__option--active': locale === currentLocale,
            }"
            @click="selectLocale(locale)"
          >
            {{ getLocaleLabel(locale) }}
          </li>
        </ul>
      </Transition>
      <div
        v-if="localeDropdownOpen"
        class="locale-backdrop"
        @click="localeDropdownOpen = false"
      />
    </div>

    <!-- Connector thread 2 -->
    <div class="silk-thread silk-thread--connector" aria-hidden="true">
      <div class="silk-thread__line" />
    </div>

    <!-- Accessibility toggle -->
    <ZenTooltip
      :text="dyslexiaTooltip"
      position="left"
      :disabled="isTouchDevice"
    >
      <button
        type="button"
        class="a11y-toggle"
        :class="{ 'a11y-toggle--active': dyslexiaEnabled }"
        :aria-label="dyslexiaTooltip"
        :aria-pressed="dyslexiaEnabled"
        @click="toggleDyslexia"
      >
        <ALargeSmall :size="18" :stroke-width="1.5" />
      </button>
    </ZenTooltip>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-wrapper {
  position: fixed;
  top: -20px;
  padding-top: 20px;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  contain: layout;
  overflow: hidden;

  // Hover glow effect on threads
  &:hover .silk-thread__line {
    box-shadow: 0 0 8px 1px oklch(0.5 0.15 195 / 0.3);
  }

  @media (max-width: 600px) {
    display: none;
  }
}

// Silk thread (fil d'araignée)
.silk-thread {
  position: relative;
  width: 1px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &__line {
    position: relative;
    width: 100%;
    height: 100%;
    background: oklch(0.45 0.08 195 / 0.25);
    transform-origin: center center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    overflow: hidden;

    // Shimmer effect - light traveling down the thread
    &::after {
      content: '';
      position: absolute;
      top: -100%;
      left: -1px;
      right: -1px;
      height: 30%;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        oklch(1 0 0 / 0.6) 50%,
        transparent 100%
      );
      animation: shimmer 4s ease-in-out infinite;
      animation-delay: var(--shimmer-delay, 0s);
    }
  }

  // Top thread (hangs from above)
  &--top {
    height: 1rem;
    transform-origin: top center;

    .silk-thread__line {
      --shimmer-delay: 0s;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        oklch(0.45 0.08 195 / 0.15) 20%,
        oklch(0.45 0.08 195 / 0.3) 100%
      );
    }
  }

  // Connector threads between items
  &--connector {
    height: 0.75rem;

    .silk-thread__line {
      background: oklch(0.45 0.08 195 / 0.25);
    }

    &:first-of-type .silk-thread__line {
      --shimmer-delay: 0.3s;
    }

    &:last-of-type .silk-thread__line {
      --shimmer-delay: 0.6s;
    }
  }
}

// Shimmer animation
@keyframes shimmer {
  0%,
  100% {
    top: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  30% {
    top: 100%;
    opacity: 1;
  }
  40%,
  100% {
    top: 100%;
    opacity: 0;
  }
}

// Elastic bounce animation - physics-based spring motion
.theme-toggle-wrapper--animating {
  > * {
    animation: elastic-drop 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  // Top thread stretches during drop
  > .silk-thread--top {
    animation: elastic-stretch 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  // Connector threads have subtle wobble
  > .silk-thread--connector {
    animation: elastic-wobble 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  // Stagger animation - cascade effect like a chain
  > *:nth-child(1) {
    animation-delay: 0ms;
  }
  > *:nth-child(2) {
    animation-delay: 0ms;
  }
  > *:nth-child(3) {
    animation-delay: 25ms;
  }
  > *:nth-child(4) {
    animation-delay: 50ms;
  }
  > *:nth-child(5) {
    animation-delay: 75ms;
  }
  > *:nth-child(6) {
    animation-delay: 100ms;
  }
  > *:nth-child(7) {
    animation-delay: 125ms;
  }
  > *:nth-child(8) {
    animation-delay: 150ms;
  }
  > *:nth-child(9) {
    animation-delay: 175ms;
  }
}

// Main elastic drop - gravity pull then spring bounce
@keyframes elastic-drop {
  0% {
    transform: translateY(0) translateX(0);
  }
  // Fast initial drop (gravity acceleration)
  8% {
    transform: translateY(16px) translateX(0);
  }
  // First bounce up - overshoot
  20% {
    transform: translateY(-10px) translateX(1px);
  }
  // Second drop
  32% {
    transform: translateY(7px) translateX(-1px);
  }
  // Second bounce - smaller
  44% {
    transform: translateY(-5px) translateX(0.5px);
  }
  // Third drop
  56% {
    transform: translateY(3px) translateX(-0.5px);
  }
  // Third bounce - subtle
  68% {
    transform: translateY(-2px) translateX(0.25px);
  }
  // Fourth drop - almost settled
  80% {
    transform: translateY(1px) translateX(0);
  }
  // Final settle
  90% {
    transform: translateY(-0.5px) translateX(0);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}

// Thread stretch - synced with drop physics
@keyframes elastic-stretch {
  0% {
    transform: scaleY(1) scaleX(1);
  }
  // Stretch as items drop
  8% {
    transform: scaleY(3.2) scaleX(0.7);
  }
  // Compress as items bounce up
  20% {
    transform: scaleY(0.4) scaleX(1.4);
  }
  // Stretch again
  32% {
    transform: scaleY(1.8) scaleX(0.85);
  }
  // Compress
  44% {
    transform: scaleY(0.65) scaleX(1.2);
  }
  // Smaller stretch
  56% {
    transform: scaleY(1.35) scaleX(0.92);
  }
  // Smaller compress
  68% {
    transform: scaleY(0.85) scaleX(1.08);
  }
  // Almost normal
  80% {
    transform: scaleY(1.12) scaleX(0.97);
  }
  90% {
    transform: scaleY(0.95) scaleX(1.02);
  }
  100% {
    transform: scaleY(1) scaleX(1);
  }
}

// Connector wobble - subtle horizontal sway
@keyframes elastic-wobble {
  0% {
    transform: translateY(0) scaleY(1) rotate(0deg);
  }
  8% {
    transform: translateY(8px) scaleY(1.5) rotate(0deg);
  }
  20% {
    transform: translateY(-5px) scaleY(0.7) rotate(2deg);
  }
  32% {
    transform: translateY(4px) scaleY(1.2) rotate(-1.5deg);
  }
  44% {
    transform: translateY(-2px) scaleY(0.85) rotate(1deg);
  }
  56% {
    transform: translateY(1.5px) scaleY(1.1) rotate(-0.5deg);
  }
  68% {
    transform: translateY(-1px) scaleY(0.95) rotate(0.25deg);
  }
  80% {
    transform: translateY(0.5px) scaleY(1.02) rotate(0deg);
  }
  100% {
    transform: translateY(0) scaleY(1) rotate(0deg);
  }
}

// Dark theme silk thread - increased visibility
[data-theme='dark'] {
  .silk-thread__line {
    background: oklch(0.75 0.1 195 / 0.4);

    &::after {
      background: linear-gradient(
        to bottom,
        transparent 0%,
        oklch(0.8 0.15 195 / 0.8) 50%,
        transparent 100%
      );
    }
  }

  .silk-thread--top .silk-thread__line {
    background: linear-gradient(
      to bottom,
      transparent 0%,
      oklch(0.75 0.1 195 / 0.3) 30%,
      oklch(0.75 0.1 195 / 0.5) 100%
    );
  }

  .silk-thread--connector .silk-thread__line {
    background: oklch(0.75 0.1 195 / 0.4);
  }

  .theme-toggle-wrapper:hover .silk-thread__line {
    box-shadow: 0 0 10px 2px oklch(0.7 0.15 195 / 0.4);
  }
}

.theme-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  background:
    radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.12) 0%, transparent 50%),
    var(--gutenku-zen-water);
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;

  box-shadow:
    0 2px 8px oklch(0.45 0.08 195 / 0.12),
    inset 0 1px 0 oklch(1 0 0 / 0.15);

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;

  &:hover {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.2) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      0 6px 20px oklch(0.45 0.1 195 / 0.28),
      0 0 0 3px oklch(0.45 0.1 195 / 0.1),
      inset 0 1px 0 oklch(1 0 0 / 0.2);

    .theme-toggle__icon {
      color: white;
      transform: rotate(15deg) scale(1.1);
    }
  }

  &:active {
    transform: translateY(2px) scale(0.92);
    box-shadow:
      0 1px 4px oklch(0.45 0.08 195 / 0.2),
      inset 0 2px 4px oklch(0 0 0 / 0.1);
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;
  }

  &:focus-visible {
    outline: 3px solid var(--gutenku-zen-accent);
    outline-offset: 4px;
  }

  &__icon {
    color: var(--gutenku-zen-primary);
    transition:
      color 0.3s ease,
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

// Dark theme adjustments
[data-theme='dark'] {
  .theme-toggle {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.08) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.7);
    border-color: oklch(0.5 0.08 195 / 0.3);
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.08);

    &:hover {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.12) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      box-shadow:
        0 6px 20px oklch(0.6 0.1 195 / 0.4),
        0 0 0 3px oklch(0.6 0.1 195 / 0.2),
        inset 0 1px 0 oklch(1 0 0 / 0.1);

      .theme-toggle__icon {
        color: oklch(0.12 0.02 195);
      }
    }

    &__icon {
      color: var(--gutenku-zen-accent);
    }
  }
}

// Footer variant styles
.theme-toggle-footer {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--gutenku-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  svg {
    position: relative;
    z-index: 1;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    color: var(--gutenku-zen-primary);

    svg {
      transform: translateY(-2px) scale(1.05);
    }

    .theme-toggle-footer__circle {
      transform: scale(1) rotate(0deg);
      opacity: 0.1;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }

  &__circle {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-primary) 0%,
      var(--gutenku-zen-primary) 50%,
      transparent 100%
    );
    border-radius: 50%;
    transform: scale(0) rotate(-30deg);
    opacity: 0;
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.25s ease;
  }
}

[data-theme='dark'] .theme-toggle-footer {
  color: var(--gutenku-text-primary);

  &:hover {
    color: var(--gutenku-zen-accent);
  }

  .theme-toggle-footer__circle {
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-accent) 50%,
      transparent 100%
    );
  }
}

// Icon transition animations
.theme-icon-enter-active {
  transition:
    opacity 0.4s ease-out,
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.3s ease-out;
}

.theme-icon-leave-active {
  transition: all 0.2s ease-out;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: scale(0.4) rotate(-20deg);
  filter: blur(3px);
}

.theme-icon-enter-to {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  filter: blur(0);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: scale(0.7) rotate(10deg);
}

// Locale toggle styles (desktop)
.locale-wrapper {
  position: relative;
  z-index: 100;
}

.locale-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: var(--gutenku-radius-full);
  background:
    radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.1) 0%, transparent 50%),
    var(--gutenku-zen-water);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);

    .locale-toggle__code {
      color: white;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &__code {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--gutenku-zen-primary);
    transition: color 0.2s ease;
  }
}

.locale-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 8rem;
  padding: 0.5rem;
  margin: 0;
  list-style: none;
  background: oklch(0.98 0.008 85);
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.1),
    0 2px 4px oklch(0 0 0 / 0.05);
  z-index: 101;

  &__option {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    border-radius: var(--gutenku-radius-sm);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
    min-height: 44px;
    display: flex;
    align-items: center;

    &:hover {
      background: oklch(0.45 0.1 195 / 0.1);
      color: var(--gutenku-zen-primary);
    }

    &--active {
      background: var(--gutenku-zen-primary);
      color: white;

      &:hover {
        background: var(--gutenku-zen-primary);
        color: white;
      }
    }
  }
}

.locale-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

// Locale dropdown transition
.locale-dropdown-enter-active,
.locale-dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.locale-dropdown-enter-from,
.locale-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

// System toggle styles (desktop)
.system-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: var(--gutenku-radius-full);
  background:
    radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.1) 0%, transparent 50%),
    var(--gutenku-zen-water);
  color: var(--gutenku-zen-primary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;

  &:hover {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);
    color: white;
  }

  &:active {
    transform: translateY(1px) scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &--active {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    color: white;
  }
}

// A11y toggle styles (desktop)
.a11y-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: var(--gutenku-radius-full);
  background:
    radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.1) 0%, transparent 50%),
    var(--gutenku-zen-water);
  color: var(--gutenku-zen-primary);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;

  &:hover {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);
    color: white;
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &--active {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    color: white;
  }
}

// Dark theme for locale and a11y toggles
[data-theme='dark'] {
  .locale-toggle {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.06) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.6);
    border-color: oklch(0.5 0.08 195 / 0.25);

    &__code {
      color: var(--gutenku-zen-accent);
    }

    &:hover {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.1) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);

      .locale-toggle__code {
        color: oklch(0.12 0.02 195);
      }
    }
  }

  .locale-dropdown {
    background: oklch(0.2 0.03 195);
    border-color: oklch(0.5 0.08 195 / 0.3);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.3),
      0 2px 4px oklch(0 0 0 / 0.2);

    &__option {
      color: var(--gutenku-text-primary);

      &:hover {
        background: oklch(0.6 0.1 195 / 0.2);
        color: var(--gutenku-zen-accent);
      }

      &--active {
        background: var(--gutenku-zen-accent);
        color: oklch(0.12 0.02 195);

        &:hover {
          background: var(--gutenku-zen-accent);
          color: oklch(0.12 0.02 195);
        }
      }
    }
  }

  .system-toggle {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.06) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.6);
    border-color: oklch(0.5 0.08 195 / 0.25);
    color: var(--gutenku-zen-accent);

    &:hover {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.1) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      color: oklch(0.12 0.02 195);
    }

    &--active {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.1) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      color: oklch(0.12 0.02 195);
    }
  }

  .a11y-toggle {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.06) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.6);
    border-color: oklch(0.5 0.08 195 / 0.25);
    color: var(--gutenku-zen-accent);

    &:hover {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.1) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      color: oklch(0.12 0.02 195);
    }

    &--active {
      background:
        radial-gradient(
          circle at 30% 30%,
          oklch(1 0 0 / 0.1) 0%,
          transparent 50%
        ),
        var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);
      color: oklch(0.12 0.02 195);
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
  }

  .silk-thread {
    display: none;
  }

  .locale-toggle,
  .system-toggle,
  .a11y-toggle {
    transition: none;

    &:hover {
      transform: none;
    }
  }

  .locale-dropdown-enter-active,
  .locale-dropdown-leave-active {
    transition: none;
  }

  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: opacity 0.15s ease;
  }

  .theme-icon-enter-from,
  .theme-icon-leave-to {
    transform: none;
    filter: none;
  }
}
</style>
