<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Instagram, BookOpen } from 'lucide-vue-next';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenCreditsModal from '@/core/components/ui/ZenCreditsModal.vue';
import ThemeToggle from '@/core/components/ThemeToggle.vue';
import AccessibilityToggle from '@/core/components/AccessibilityToggle.vue';
import { useLocale } from '@/core/composables/locale';

const { t } = useI18n();
const { currentLocale, availableLocales, setLocale, getLocaleLabel } =
  useLocale();
const currentYear = new Date().getFullYear();

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
const showCredits = ref(false);

const inkRipple = ref<{ x: number; y: number; active: boolean }>({
  x: 0,
  y: 0,
  active: false,
});

const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const GUTENBERG_URL = 'https://gutenberg.org';

const navLinks = [
  { to: '/', label: 'footer.nav.home' },
  { to: '/haiku', label: 'footer.nav.gutenku' },
  { to: '/game', label: 'footer.nav.gutenguess' },
];

const socialLinks = [
  { url: INSTAGRAM_URL, icon: Instagram, label: 'footer.social.instagram' },
  { url: GUTENBERG_URL, icon: BookOpen, label: 'footer.social.gutenberg' },
];

function openCredits(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  inkRipple.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    active: true,
  };

  setTimeout(() => {
    inkRipple.value.active = false;
  }, 600);

  showCredits.value = true;
}

function openSocialLink(url: string) {
  globalThis.open(url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <footer class="app-footer" :aria-label="t('footer.ariaLabel')">
    <div class="footer-content">
      <!-- Navigation Links -->
      <nav class="footer-nav stagger-1" :aria-label="t('footer.navAriaLabel')">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="footer-nav__link link-highlight"
        >
          <span class="footer-nav__text">{{ t(link.label) }}</span>
        </RouterLink>
      </nav>

      <!-- Ink Brushstroke Divider -->
      <svg class="ink-divider stagger-2" viewBox="0 0 2 20" aria-hidden="true">
        <path
          class="ink-stroke"
          d="M1 0 Q0.5 5 1 10 Q1.5 15 1 20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <!-- Social Links -->
      <nav
        class="footer-social stagger-3"
        :aria-label="t('footer.socialAriaLabel')"
      >
        <ZenTooltip
          v-for="link in socialLinks"
          :key="link.url"
          :text="t(link.label)"
          position="top"
        >
          <button
            type="button"
            class="footer-social__link"
            :aria-label="t(link.label)"
            @click="openSocialLink(link.url)"
          >
            <span class="ink-circle" aria-hidden="true" />
            <component :is="link.icon" :size="20" :stroke-width="1.5" />
          </button>
        </ZenTooltip>
      </nav>

      <!-- Ink Brushstroke Divider -->
      <svg class="ink-divider stagger-4" viewBox="0 0 2 20" aria-hidden="true">
        <path
          class="ink-stroke"
          d="M1 0 Q1.5 5 1 10 Q0.5 15 1 20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <!-- Copyright with Ink Ripple -->
      <ZenTooltip :text="t('footer.openCredits')" position="top">
        <button
          type="button"
          class="footer-copyright stagger-5"
          :aria-label="t('footer.openCredits')"
          @click="openCredits"
        >
          <span
            v-if="inkRipple.active"
            class="ink-ripple"
            :style="{ left: `${inkRipple.x}px`, top: `${inkRipple.y}px` }"
            aria-hidden="true"
          />
          {{ t('footer.copyright', { year: currentYear }) }}
        </button>
      </ZenTooltip>

      <!-- Ink Brushstroke Divider -->
      <svg class="ink-divider stagger-6" viewBox="0 0 2 20" aria-hidden="true">
        <path
          class="ink-stroke"
          d="M1 0 Q0.5 5 1 10 Q1.5 15 1 20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <!-- Theme, Language & Accessibility Toggles -->
      <div class="footer-toggles">
        <ThemeToggle variant="footer" class="stagger-7" />
        <div
          class="footer-locale-wrapper stagger-8"
          @keydown="handleLocaleKeydown"
        >
          <button
            type="button"
            class="footer-locale"
            :aria-label="t('locale.switch')"
            :aria-expanded="localeDropdownOpen"
            aria-haspopup="listbox"
            @click="toggleLocaleDropdown"
          >
            <span class="footer-locale__code">{{
              currentLocale.toUpperCase()
            }}</span>
          </button>
          <Transition name="locale-dropdown">
            <ul
              v-if="localeDropdownOpen"
              class="footer-locale__dropdown"
              role="listbox"
              :aria-label="t('locale.switch')"
              @click.stop
            >
              <li
                v-for="locale in availableLocales"
                :key="locale"
                role="option"
                :aria-selected="locale === currentLocale"
                class="footer-locale__option"
                :class="{
                  'footer-locale__option--active': locale === currentLocale,
                }"
                @click="selectLocale(locale)"
              >
                {{ getLocaleLabel(locale) }}
              </li>
            </ul>
          </Transition>
          <div
            v-if="localeDropdownOpen"
            class="footer-locale__backdrop"
            @click="localeDropdownOpen = false"
          />
        </div>
        <AccessibilityToggle class="stagger-9" />
      </div>
    </div>

    <ZenCreditsModal v-model="showCredits" />
  </footer>
</template>

<style scoped lang="scss">
$ease-zen: cubic-bezier(0.23, 1, 0.32, 1);
$ease-zen-out: cubic-bezier(0.16, 1, 0.3, 1);
@keyframes footer-fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes nav-slide-in {
  from {
    opacity: 0;
    transform: translateX(-16px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes social-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  60% {
    opacity: 1;
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes copyright-rise {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes ink-draw {
  from {
    stroke-dashoffset: 200;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes ink-stroke-draw {
  from {
    stroke-dashoffset: 30;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.app-footer {
  position: relative;
  padding: 1.5rem 1rem 1.75rem;
  background: oklch(0.88 0.02 55 / 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 -4px 16px oklch(0 0 0 / 0.06),
    0 -2px 8px oklch(0 0 0 / 0.04),
    inset 0 1px 0 oklch(1 0 0 / 0.5);

  animation: footer-fade-in 0.3s $ease-zen both;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  max-width: 52rem;
  margin: 0 auto;
}

.stagger-1 {
  animation: nav-slide-in 0.25s $ease-zen-out 0.05s both;
}

.stagger-2 {
  animation: ink-stroke-draw 0.3s $ease-zen 0.1s both;
}

.stagger-3 {
  animation: social-pop-in 0.25s $ease-zen-out 0.12s both;
}

.stagger-4 {
  animation: ink-stroke-draw 0.3s $ease-zen 0.15s both;
}

.stagger-5 {
  animation: copyright-rise 0.25s $ease-zen-out 0.18s both;
}

.stagger-6 {
  animation: ink-stroke-draw 0.3s $ease-zen 0.2s both;
}

.stagger-7 {
  animation: social-pop-in 0.25s $ease-zen-out 0.22s both;
}

.stagger-8 {
  animation: social-pop-in 0.25s $ease-zen-out 0.25s both;
}

.stagger-9 {
  animation: social-pop-in 0.25s $ease-zen-out 0.28s both;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__link {
    font-size: 0.9rem;
    padding: 0.375rem 0.625rem;

    &.router-link-exact-active {
      color: var(--gutenku-text-primary);
      font-weight: 700;
      text-shadow: 0 1px 2px oklch(1 0 0 / 0.5);

      &::after {
        height: 45%;
        top: 38%;
        background: linear-gradient(
          172deg,
          color-mix(in oklch, var(--gutenku-zen-secondary) 35%, transparent) 0%,
          color-mix(in oklch, var(--gutenku-zen-secondary) 60%, transparent) 45%,
          color-mix(in oklch, var(--gutenku-zen-secondary) 50%, transparent)
            100%
        );
        transform: skewX(-2deg) rotate(-0.5deg) scaleX(1.05);
      }
    }
  }

  &__text {
    position: relative;
    z-index: 1;
  }
}

.ink-divider {
  width: 2px;
  height: 1.25rem;
  overflow: visible;

  .ink-stroke {
    stroke: color-mix(in oklch, var(--gutenku-text-primary) 15%, transparent);
    stroke-dasharray: 30;
  }
}

.footer-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &__link {
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
        transform: scale(1.1);
      }

      .ink-circle {
        transform: scale(1) rotate(0deg);
        opacity: 0.1;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }
}

.ink-circle {
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

.footer-copyright {
  position: relative;
  font-size: 0.875rem;
  color: var(--gutenku-text-secondary);
  background: transparent;
  border: none;
  padding: 0.375rem 0.625rem;
  border-radius: var(--gutenku-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    color: var(--gutenku-text-primary);
    background: color-mix(in oklch, var(--gutenku-zen-primary) 8%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }
}

.ink-ripple {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--gutenku-zen-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.3;
  animation: ink-ripple-expand 0.6s cubic-bezier(0, 0.5, 0.5, 1) forwards;
  pointer-events: none;
}

@keyframes ink-ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(25);
    opacity: 0;
  }
}

.footer-toggles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-locale-wrapper {
  position: relative;
  z-index: 100;
}

.footer-locale {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
  border-radius: var(--gutenku-radius-full);
  background: var(--gutenku-zen-water);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);

    .footer-locale__code {
      color: white;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.95);
  }

  &__code {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--gutenku-zen-primary);
    transition: color 0.2s ease;
  }

  &__dropdown {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    right: 0;
    min-width: 8rem;
    padding: 0.5rem;
    margin: 0;
    list-style: none;
    background: oklch(0.98 0.008 85);
    border: 1.5px solid oklch(0.45 0.1 195 / 0.2);
    border-radius: var(--gutenku-radius-md);
    box-shadow:
      0 -4px 12px oklch(0 0 0 / 0.1),
      0 -2px 4px oklch(0 0 0 / 0.05);
    z-index: 101;
  }

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

  &__backdrop {
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
  transform: translateY(0.5rem);
}

[data-theme='dark'] {
  .app-footer {
    background: oklch(0.2 0.02 55 / 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 -4px 16px oklch(0 0 0 / 0.2),
      0 -2px 8px oklch(0 0 0 / 0.15),
      inset 0 1px 0 oklch(1 0 0 / 0.05);
  }

  .footer-nav__link.router-link-exact-active {
    color: var(--gutenku-text-primary);
    text-shadow: 0 1px 3px oklch(0 0 0 / 0.6);

    &::after {
      height: 45%;
      top: 38%;
      background: linear-gradient(
        172deg,
        color-mix(in oklch, var(--gutenku-zen-secondary) 40%, transparent) 0%,
        color-mix(in oklch, var(--gutenku-zen-secondary) 65%, transparent) 45%,
        color-mix(in oklch, var(--gutenku-zen-secondary) 55%, transparent) 100%
      );
      transform: skewX(-2deg) rotate(-0.5deg) scaleX(1.05);
    }
  }

  .footer-social__link {
    color: var(--gutenku-text-primary);

    &:hover {
      color: var(--gutenku-zen-accent);
    }
  }

  .ink-circle {
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-accent) 50%,
      transparent 100%
    );
  }

  .footer-copyright {
    color: var(--gutenku-text-primary);

    &:hover {
      color: var(--gutenku-zen-accent);
      background: color-mix(
        in oklch,
        var(--gutenku-zen-accent) 12%,
        transparent
      );
    }
  }

  .ink-divider .ink-stroke {
    stroke: color-mix(in oklch, var(--gutenku-text-primary) 25%, transparent);
  }

  .ink-ripple {
    background: var(--gutenku-zen-accent);
  }

  .footer-locale {
    background: oklch(0.25 0.04 195 / 0.7);
    border-color: oklch(0.5 0.08 195 / 0.3);

    &:hover {
      background: var(--gutenku-zen-accent);
      border-color: var(--gutenku-zen-accent);

      .footer-locale__code {
        color: oklch(0.12 0.02 195);
      }
    }

    &:focus-visible {
      outline-color: var(--gutenku-zen-accent);
    }
  }

  .footer-locale__code {
    color: var(--gutenku-zen-accent);
  }

  .footer-locale__dropdown {
    background: oklch(0.2 0.03 195);
    border-color: oklch(0.5 0.08 195 / 0.3);
    box-shadow:
      0 -4px 12px oklch(0 0 0 / 0.3),
      0 -2px 4px oklch(0 0 0 / 0.2);
  }

  .footer-locale__option {
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

@media (max-width: 600px) {
  .app-footer {
    padding: 1.25rem 0.75rem 1.75rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 0.875rem;
  }

  .ink-divider {
    display: none;
  }

  .footer-nav {
    gap: 0.25rem;

    &__link {
      padding: 0.5rem 0.75rem;
      min-height: 44px;
      display: flex;
      align-items: center;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-footer,
  .stagger-1,
  .stagger-2,
  .stagger-3,
  .stagger-4,
  .stagger-5,
  .stagger-6,
  .stagger-7,
  .stagger-8,
  .stagger-9,
  .ink-stroke {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .ink-stroke {
    stroke-dashoffset: 0;
  }

  .ink-circle,
  .ink-ripple,
  .footer-locale {
    transition: none;
  }

  .footer-locale__code,
  .footer-locale__option {
    transition: none;
  }

  .locale-dropdown-enter-active,
  .locale-dropdown-leave-active {
    transition: none;
  }
}

@media (forced-colors: active) {
  .footer-locale__dropdown {
    border: 2px solid CanvasText;
  }

  .footer-locale__option--active {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
}
</style>
