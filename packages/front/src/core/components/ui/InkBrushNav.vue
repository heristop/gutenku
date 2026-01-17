<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  Leaf,
  Lightbulb,
  Sun,
  Moon,
  Monitor,
  ALargeSmall,
  Feather,
} from 'lucide-vue-next';
import ToriiIcon from '@/core/components/icons/ToriiIcon.vue';
import { withViewTransition } from '@/core/composables/view-transition';
import { useI18n } from 'vue-i18n';
import { GAME_ENABLED } from '@/features/game';
import { useLocale } from '@/core/composables/locale';
import { useTheme } from '@/core/composables/theme';
import { useAccessibility } from '@/core/composables/accessibility';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentLocale, availableLocales, setLocale, getLocaleLabel } =
  useLocale();
const {
  isDarkMode,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
  setTheme,
} = useTheme();
const { dyslexiaEnabled, toggleDyslexia } = useAccessibility();

// Theme cycling (mobile): light → dark → system
type ThemeState = 'light' | 'dark' | 'system';
const currentThemeState = computed<ThemeState>(() => {
  if (systemPreferenceEnabled.value) {
    return 'system';
  }

  return isDarkMode.value ? 'dark' : 'light';
});

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

const dyslexiaTooltip = computed(() =>
  dyslexiaEnabled.value
    ? t('footer.accessibility.dyslexiaOn')
    : t('footer.accessibility.dyslexiaOff'),
);

// Locale dropdown state
const localeDropdownOpen = ref(false);

function toggleLocaleDropdown() {
  localeDropdownOpen.value = !localeDropdownOpen.value;
}

function selectLocale(locale: typeof currentLocale.value) {
  setLocale(locale);
  localeDropdownOpen.value = false;
}

function handleLocaleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    localeDropdownOpen.value = false;
  }
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.ink-nav__locale-wrapper')) {
    localeDropdownOpen.value = false;
  }
}

const navItems = computed(() => [
  {
    labelKey: 'nav.homeLabel',
    to: '/',
    icon: ToriiIcon,
    transitionName: 'nav-icon-home',
    ariaLabel: 'nav.home',
  },
  ...(GAME_ENABLED
    ? [
        {
          labelKey: 'nav.gameLabel',
          to: '/game',
          icon: Lightbulb,
          transitionName: 'nav-icon-game',
          ariaLabel: 'nav.game',
        },
      ]
    : []),
  {
    labelKey: 'nav.haikuLabel',
    to: '/haiku',
    icon: Leaf,
    transitionName: 'nav-icon-haiku',
    ariaLabel: 'nav.haiku',
  },
  {
    labelKey: 'nav.blogLabel',
    to: '/blog',
    icon: Feather,
    transitionName: 'nav-icon-blog',
    ariaLabel: 'nav.blog',
  },
]);

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path === path || route.path.startsWith(path + '/');
};

// Track hover state
const hoveredItem = ref<string | null>(null);

// Track click state for feedback
const clickedItem = ref<string | null>(null);

function handleMouseEnter(to: string) {
  hoveredItem.value = to;
}

function handleMouseLeave() {
  hoveredItem.value = null;
}

function handleClick(event: MouseEvent, to: string) {
  // If already on this page, don't navigate
  if (isActive(to)) {
    event.preventDefault();
    return;
  }

  // Visual click feedback
  clickedItem.value = to;

  // Navigate with view transition
  event.preventDefault();
  withViewTransition(() => {
    router.push(to);
  });

  setTimeout(() => {
    clickedItem.value = null;
  }, 150);
}
</script>

<template>
  <nav class="ink-nav" :aria-label="t('nav.mainNavigation')">
    <ul class="ink-nav__container" role="list">
      <li v-for="item in navItems" :key="item.to" class="ink-nav__list-item">
        <RouterLink
          :to="item.to"
          class="ink-nav__item"
          :class="{
            'ink-nav__item--active': isActive(item.to),
            'ink-nav__item--hovered': hoveredItem === item.to,
            'ink-nav__item--clicked': clickedItem === item.to,
          }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :aria-label="t(item.ariaLabel)"
          @mouseenter="handleMouseEnter(item.to)"
          @mouseleave="handleMouseLeave"
          @click="handleClick($event, item.to)"
        >
          <span
            class="ink-nav__icon-wrapper"
            :style="{ viewTransitionName: item.transitionName }"
            aria-hidden="true"
          >
            <svg
              v-if="isActive(item.to)"
              class="ink-nav__enso"
              viewBox="0 0 50 50"
              aria-hidden="true"
            >
              <circle cx="25" cy="25" r="22" />
            </svg>
            <component :is="item.icon" :size="20" class="ink-nav__icon" />
          </span>
          <span class="ink-nav__label">{{ t(item.labelKey) }}</span>
        </RouterLink>
      </li>
    </ul>
    <!-- Mobile toggles row: Theme, Locale, A11y -->
    <div class="ink-nav__toggles">
      <!-- Theme toggle -->
      <button
        type="button"
        class="ink-nav__toggle-btn"
        :aria-label="themeTooltip"
        @click="cycleTheme"
      >
        <Transition name="theme-icon" mode="out-in">
          <Sun
            v-if="currentThemeState === 'light'"
            key="sun"
            :size="18"
            :stroke-width="1.5"
          />
          <Moon
            v-else-if="currentThemeState === 'dark'"
            key="moon"
            :size="18"
            :stroke-width="1.5"
          />
          <Monitor v-else key="monitor" :size="18" :stroke-width="1.5" />
        </Transition>
      </button>

      <!-- Locale toggle -->
      <div class="ink-nav__locale-wrapper" @keydown="handleLocaleKeydown">
        <button
          type="button"
          class="ink-nav__toggle-btn"
          :aria-label="t('locale.switch')"
          :aria-expanded="localeDropdownOpen"
          aria-haspopup="listbox"
          @click="toggleLocaleDropdown"
        >
          <span class="ink-nav__locale-code">{{
            currentLocale.toUpperCase()
          }}</span>
        </button>
        <Transition name="locale-dropdown">
          <ul
            v-if="localeDropdownOpen"
            class="ink-nav__locale-dropdown"
            role="listbox"
            :aria-label="t('locale.switch')"
            @click.stop
          >
            <li
              v-for="locale in availableLocales"
              :key="locale"
              role="option"
              :aria-selected="locale === currentLocale"
              class="ink-nav__locale-option"
              :class="{
                'ink-nav__locale-option--active': locale === currentLocale,
              }"
              @click="selectLocale(locale)"
            >
              {{ getLocaleLabel(locale) }}
            </li>
          </ul>
        </Transition>
        <div
          v-if="localeDropdownOpen"
          class="ink-nav__locale-backdrop"
          @click="localeDropdownOpen = false"
        />
      </div>

      <!-- Accessibility toggle -->
      <button
        type="button"
        class="ink-nav__toggle-btn"
        :class="{ 'ink-nav__toggle-btn--active': dyslexiaEnabled }"
        :aria-label="dyslexiaTooltip"
        :aria-pressed="dyslexiaEnabled"
        @click="toggleDyslexia"
      >
        <ALargeSmall :size="18" :stroke-width="1.5" />
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
/* stylelint-disable scss/operator-no-newline-after */
.ink-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 0.5rem 1.25rem;
  // Use native safe area when available (iOS Capacitor), fallback to env(), then 0
  padding-top: calc(
    var(
        --native-safe-area-top,
        var(--safe-area-inset-top, env(safe-area-inset-top, 0px))
      ) +
      1rem
  );
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  // Small mobile (< 375px)
  @media (min-width: 375px) {
    gap: 1.5rem;
    padding: 1.25rem 1rem 1.5rem;
    padding-top: calc(
      var(
          --native-safe-area-top,
          var(--safe-area-inset-top, env(safe-area-inset-top, 0px))
        ) +
        1.25rem
    );
    margin-bottom: 0.75rem;
  }

  // Tablet and up - back to single row
  @media (min-width: 600px) {
    display: block;
    padding: 1.5rem 1rem 1.75rem;
    padding-top: calc(
      var(
          --native-safe-area-top,
          var(--safe-area-inset-top, env(safe-area-inset-top, 0px))
        ) +
        1.5rem
    );
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
    width: 100%;

    // Small mobile (320px+)
    @media (min-width: 320px) {
      gap: 0.75rem;
    }

    // Medium mobile (375px+)
    @media (min-width: 375px) {
      gap: 1.25rem;
    }

    // Large mobile (425px+)
    @media (min-width: 425px) {
      gap: 2rem;
    }

    // Tablet and up
    @media (min-width: 600px) {
      gap: 4rem;
    }
  }

  &__list-item {
    display: contents;
  }

  &__item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem;
    min-width: 3.5rem;
    text-decoration: none;
    border-radius: var(--gutenku-radius-lg);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    // Small mobile (320px+)
    @media (min-width: 320px) {
      min-width: 3.75rem;
    }

    // Medium mobile (375px+)
    @media (min-width: 375px) {
      gap: 0.625rem;
      padding: 0.375rem;
      min-width: 4.25rem;
    }

    // Large mobile (425px+)
    @media (min-width: 425px) {
      gap: 0.75rem;
      padding: 0.5rem;
      min-width: 5rem;
    }

    &::before {
      content: '';
      position: absolute;
      inset: -4px;
      min-width: 44px;
      min-height: 44px;
    }

    &:hover {
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 3px solid var(--gutenku-zen-accent);
      outline-offset: 4px;
    }
  }

  &__item--clicked {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease-out !important;
  }

  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--gutenku-radius-full);
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.12) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-water);
    border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
    box-shadow:
      0 2px 8px oklch(0.45 0.08 195 / 0.12),
      inset 0 1px 0 oklch(1 0 0 / 0.15);
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.3s ease;

    // Medium mobile (375px+)
    @media (min-width: 375px) {
      width: 2.5rem;
      height: 2.5rem;
    }

    // Large mobile (425px+)
    @media (min-width: 425px) {
      width: 2.75rem;
      height: 2.75rem;
    }

    // Tablet and up
    @media (min-width: 600px) {
      width: 3rem;
      height: 3rem;
    }
  }

  &__item:hover &__icon-wrapper {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.2) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);
    box-shadow:
      0 6px 20px oklch(0.45 0.1 195 / 0.28),
      0 0 0 3px oklch(0.45 0.1 195 / 0.1),
      inset 0 1px 0 oklch(1 0 0 / 0.2);
  }

  &__item--active &__icon-wrapper {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.15) 0%,
        transparent 50%
      ),
      var(--gutenku-zen-primary);
    border-color: oklch(0.35 0.1 195);
    transform: scale(1.05);
    box-shadow:
      0 4px 16px oklch(0.45 0.1 195 / 0.35),
      0 0 0 4px oklch(0.45 0.1 195 / 0.12),
      inset 0 1px 0 oklch(1 0 0 / 0.2);
  }

  &__enso {
    position: absolute;
    inset: -5px;
    fill: none;
    stroke: var(--gutenku-zen-accent);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 140;
    stroke-dashoffset: 140;
    opacity: 0.5;
    animation: enso-draw 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    pointer-events: none;
  }

  &__icon {
    position: relative;
    z-index: 2;
    color: var(--gutenku-zen-primary);
    transition: color 0.3s ease;
  }

  &__item:hover &__icon,
  &__item--active &__icon {
    color: white;
  }

  &__label {
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--gutenku-text-primary);
    transition:
      color 0.3s ease 0.05s,
      text-shadow 0.3s ease;
    white-space: nowrap;

    // Small mobile (320px+)
    @media (min-width: 320px) {
      font-size: 0.55rem;
      letter-spacing: 0.06em;
    }

    // Medium mobile (375px+)
    @media (min-width: 375px) {
      font-size: 0.625rem;
      letter-spacing: 0.08em;
    }

    // Large mobile (425px+)
    @media (min-width: 425px) {
      font-size: 0.7rem;
    }

    // Tablet and up
    @media (min-width: 600px) {
      font-size: 0.75rem;
    }
  }

  &__item:hover &__label {
    color: var(--gutenku-zen-primary);
  }

  &__item--active &__label {
    color: var(--gutenku-zen-primary);
    font-weight: 700;
    text-shadow: 0 0 20px oklch(0.45 0.1 195 / 0.3);
  }

  // Mobile toggles row
  &__toggles {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    // Hide on desktop (toggles are in ThemeToggle component)
    @media (min-width: 600px) {
      display: none;
    }
  }

  &__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
    border-radius: var(--gutenku-radius-full);
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.1) 0%,
        transparent 50%
      ),
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
      outline: 3px solid var(--gutenku-zen-accent);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.95);
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

  &__locale-wrapper {
    position: relative;
    z-index: 100;
  }

  &__locale-code {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--gutenku-zen-primary);
    transition: color 0.2s ease;
  }

  &__toggle-btn:hover &__locale-code {
    color: white;
  }

  &__locale-dropdown {
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

    // Mobile: ensure dropdown doesn't go off-screen
    @media (max-width: 374px) {
      right: -0.5rem;
      min-width: 7rem;
    }
  }

  &__locale-option {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    border-radius: var(--gutenku-radius-sm);
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
    // Minimum touch target
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

  &__locale-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }
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

@keyframes enso-draw {
  to {
    stroke-dashoffset: 8;
  }
}

[data-theme='dark'] .ink-nav {
  &__item {
    &:focus-visible {
      outline-color: oklch(0.8 0.12 195);
    }
  }

  &__icon-wrapper {
    background: transparent;
    border-color: oklch(0.5 0.08 195 / 0.5);
    box-shadow: none;
  }

  &__item:hover &__icon-wrapper {
    background: oklch(0.3 0.04 195 / 0.4);
    border-color: var(--gutenku-zen-accent);
    box-shadow: none;
  }

  &__item--active &__icon-wrapper {
    background: transparent;
    border-color: var(--gutenku-zen-accent);
    box-shadow: none;
  }

  &__enso {
    stroke: oklch(0.85 0.1 195);
    opacity: 0.5;
  }

  &__icon {
    color: var(--gutenku-zen-accent);
  }

  &__item:hover &__icon,
  &__item--active &__icon {
    color: oklch(0.12 0.02 195);
  }

  &__label {
    color: var(--gutenku-text-primary);
  }

  &__item:hover &__label,
  &__item--active &__label {
    color: var(--gutenku-zen-accent);
  }

  &__item--active &__label {
    text-shadow: 0 0 20px oklch(0.6 0.1 195 / 0.5);
  }

  &__toggle-btn {
    background:
      radial-gradient(
        circle at 30% 30%,
        oklch(1 0 0 / 0.06) 0%,
        transparent 50%
      ),
      oklch(0.25 0.04 195 / 0.6);
    border: 2px solid oklch(0.85 0.1 195 / 0.8);
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

    &:focus-visible {
      outline-color: oklch(0.8 0.12 195);
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

  &__locale-code {
    color: var(--gutenku-zen-accent);
  }

  &__toggle-btn:hover &__locale-code {
    color: oklch(0.12 0.02 195);
  }

  &__locale-dropdown {
    background: oklch(0.2 0.03 195);
    border-color: oklch(0.5 0.08 195 / 0.3);
    box-shadow:
      0 4px 12px oklch(0 0 0 / 0.3),
      0 2px 4px oklch(0 0 0 / 0.2);
  }

  &__locale-option {
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

::view-transition-old(nav-icon-home),
::view-transition-old(nav-icon-haiku),
::view-transition-old(nav-icon-game),
::view-transition-old(nav-icon-blog) {
  animation: nav-morph-out 250ms ease-out both;
}

::view-transition-new(nav-icon-home),
::view-transition-new(nav-icon-haiku),
::view-transition-new(nav-icon-game),
::view-transition-new(nav-icon-blog) {
  animation: nav-morph-in 250ms ease-in both;
}

@keyframes nav-morph-out {
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes nav-morph-in {
  from {
    opacity: 0;
    transform: scale(1.1);
  }
}

// Theme icon transition for mobile toggles
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: scale(0.6) rotate(-45deg);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: scale(0.6) rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .ink-nav {
    &__item {
      transition: none;

      &:hover {
        transform: none;
      }
    }

    &__icon-wrapper,
    &__icon,
    &__label {
      transition: none;
    }

    &__item--clicked {
      transform: none !important;
    }

    &__enso {
      animation: none;
      stroke-dashoffset: 5;
    }

    &__item:hover &__icon-wrapper,
    &__item--active &__icon-wrapper {
      transform: none;
    }

    &__toggle-btn {
      transition: none;

      &:hover,
      &:active {
        transform: none;
      }
    }

    &__locale-code {
      transition: none;
    }

    &__locale-dropdown {
      animation: none;
    }

    &__locale-option {
      transition: none;
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
  }

  ::view-transition-old(nav-icon-home),
  ::view-transition-old(nav-icon-haiku),
  ::view-transition-old(nav-icon-game),
  ::view-transition-old(nav-icon-blog),
  ::view-transition-new(nav-icon-home),
  ::view-transition-new(nav-icon-haiku),
  ::view-transition-new(nav-icon-game),
  ::view-transition-new(nav-icon-blog) {
    animation: none;
  }
}

@media (forced-colors: active) {
  .ink-nav {
    &__item:focus-visible {
      outline: 3px solid CanvasText;
    }

    &__icon-wrapper {
      border: 2px solid CanvasText;
      forced-color-adjust: none;
    }

    &__item--active &__icon-wrapper {
      background: Highlight;
      border-color: Highlight;
    }

    &__icon {
      color: CanvasText;
    }

    &__item--active &__icon {
      color: HighlightText;
    }

    &__label {
      color: CanvasText;
    }

    &__enso {
      stroke: Highlight;
    }

    &__toggle-btn {
      border: 2px solid CanvasText;
      forced-color-adjust: none;
    }

    &__locale-code {
      color: CanvasText;
    }

    &__locale-dropdown {
      border: 2px solid CanvasText;
      forced-color-adjust: none;
    }

    &__locale-option {
      color: CanvasText;

      &--active {
        background: Highlight;
        color: HighlightText;
      }
    }
  }
}
</style>
