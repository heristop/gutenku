<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Instagram, BookOpen, Github } from 'lucide-vue-next';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const ZenCreditsModal = defineAsyncComponent(
  () => import('@/components/ui/ZenCreditsModal.vue'),
);

const { t } = useI18n();
const currentYear = new Date().getFullYear();
const creditsModal = ref<{ open: () => void } | null>(null);

// Ink ripple on copyright click
const inkRipple = ref<{ x: number; y: number; active: boolean }>({
  x: 0,
  y: 0,
  active: false,
});

const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const GITHUB_URL = 'https://github.com/heristop/gutenku';
const GUTENBERG_URL = 'https://gutenberg.org';

const navLinks = [
  { to: '/', label: 'footer.nav.home' },
  { to: '/haiku', label: 'footer.nav.gutenku' },
  { to: '/game', label: 'footer.nav.gutenguess' },
];

const socialLinks = [
  { url: INSTAGRAM_URL, icon: Instagram, label: 'footer.social.instagram' },
  { url: GUTENBERG_URL, icon: BookOpen, label: 'footer.social.gutenberg' },
  { url: GITHUB_URL, icon: Github, label: 'footer.social.github' },
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

  creditsModal.value?.open();
}

function openSocialLink(url: string) {
  globalThis.open(url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <div class="app-footer" :aria-label="t('footer.ariaLabel')">
    <!-- Decorative top border -->
    <div class="footer-border" aria-hidden="true">
      <svg
        class="footer-border__stroke"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
      >
        <path
          class="ink-line"
          d="M0 1 Q25 0.5 50 1 Q75 1.5 100 1"
          stroke="currentColor"
          stroke-width="0.5"
          fill="none"
        />
      </svg>
    </div>

    <div class="footer-content">
      <!-- Navigation Links -->
      <nav class="footer-nav stagger-1" :aria-label="t('footer.navAriaLabel')">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="footer-nav__link"
        >
          <span class="footer-nav__text">{{ t(link.label) }}</span>
          <span class="footer-nav__underline" aria-hidden="true" />
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
      <div
        class="footer-social stagger-3"
        role="list"
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
            role="listitem"
            :aria-label="t(link.label)"
            @click="openSocialLink(link.url)"
          >
            <span class="ink-circle" aria-hidden="true" />
            <component :is="link.icon" :size="18" :stroke-width="1.5" />
          </button>
        </ZenTooltip>
      </div>

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
    </div>

    <ZenCreditsModal ref="creditsModal" />
  </div>
</template>

<style scoped lang="scss">
// Keyframes
@keyframes footer-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  }
  to {
    stroke-dashoffset: 0;
  }
}

.app-footer {
  position: relative;
  padding: 1.75rem 1rem 2rem;
  background: transparent;
  box-shadow: inset 0 1px 0 0 color-mix(in oklch, var(--gutenku-text-primary) 12%, transparent);
  animation: footer-fade-in 0.5s ease-out 0.1s both;
}

// Decorative top border - organic ink brushstroke
.footer-border {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(85%, 36rem);
  height: 4px;
  overflow: visible;

  &__stroke {
    width: 100%;
    height: 100%;
    color: var(--gutenku-text-muted);
    opacity: 0.15;
  }
}

.ink-line {
  stroke-dasharray: 200;
  animation: ink-draw 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  max-width: 42rem;
  margin: 0 auto;
}

// Staggered entrance animations
.stagger-1 {
  animation: footer-fade-in 0.4s ease-out 0.15s both;
}

.stagger-2 {
  animation: footer-fade-in 0.4s ease-out 0.25s both;
}

.stagger-3 {
  animation: footer-fade-in 0.4s ease-out 0.35s both;
}

.stagger-4 {
  animation: footer-fade-in 0.4s ease-out 0.45s both;
}

.stagger-5 {
  animation: footer-fade-in 0.4s ease-out 0.55s both;
}

// Navigation with ink underline
.footer-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__link {
    position: relative;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.8rem;
    color: var(--gutenku-text-secondary);
    text-decoration: none;
    padding: 0.375rem 0.625rem;
    border-radius: var(--gutenku-radius-sm);
    transition: all 0.2s ease;

    &:hover {
      color: var(--gutenku-zen-primary);
      background: color-mix(in oklch, var(--gutenku-zen-primary) 8%, transparent);
    }

    &.router-link-exact-active {
      color: var(--gutenku-zen-primary);
      font-weight: 500;

      .footer-nav__underline {
        transform: scaleX(1);
        opacity: 1;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__text {
    position: relative;
    z-index: 1;
  }

  &__underline {
    position: absolute;
    bottom: 4px;
    left: 0.625rem;
    right: 0.625rem;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-primary) 15%,
      var(--gutenku-zen-primary) 85%,
      transparent 100%
    );
    border-radius: 1px;
    transform: scaleX(0);
    transform-origin: left;
    opacity: 0;
    transition:
      transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.3s ease;
  }
}

// Ink brushstroke divider
.ink-divider {
  width: 2px;
  height: 1.25rem;
  overflow: visible;

  .ink-stroke {
    stroke: color-mix(in oklch, var(--gutenku-text-primary) 15%, transparent);
    stroke-dasharray: 30;
    animation: ink-stroke-draw 0.5s ease-out 0.3s both;
  }
}

// Social icons with ink circle
.footer-social {
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &__link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--gutenku-text-muted);
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

// Ink circle reveal behind icons
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

// Copyright with ink ripple
.footer-copyright {
  position: relative;
  font-family: 'JMH Typewriter', monospace;
  font-size: 0.75rem;
  color: var(--gutenku-text-muted);
  background: transparent;
  border: none;
  padding: 0.375rem 0.625rem;
  border-radius: var(--gutenku-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    color: var(--gutenku-text-secondary);
    background: color-mix(in oklch, var(--gutenku-zen-primary) 6%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-primary);
    outline-offset: 2px;
  }
}

// Ink ripple effect
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

// Dark theme
[data-theme='dark'] {
  .app-footer {
    box-shadow: inset 0 1px 0 0 color-mix(in oklch, var(--gutenku-text-primary) 15%, transparent);
  }

  .footer-nav__link {
    &:hover {
      color: var(--gutenku-zen-accent);
      background: color-mix(in oklch, var(--gutenku-zen-accent) 12%, transparent);
    }

    &.router-link-exact-active {
      color: var(--gutenku-zen-accent);

      .footer-nav__underline {
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--gutenku-zen-accent) 15%,
          var(--gutenku-zen-accent) 85%,
          transparent 100%
        );
      }
    }
  }

  .footer-social__link:hover {
    color: var(--gutenku-zen-accent);
  }

  .ink-circle {
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-accent) 50%,
      transparent 100%
    );
  }

  .footer-copyright:hover {
    color: var(--gutenku-text-secondary);
    background: color-mix(in oklch, var(--gutenku-zen-accent) 10%, transparent);
  }

  .ink-ripple {
    background: var(--gutenku-zen-accent);
  }
}

// Mobile
@media (max-width: 600px) {
  .app-footer {
    padding: 1.25rem 0.75rem 1.75rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 0.875rem;
  }

  .ink-divider {
    width: 2.5rem;
    height: 2px;
    transform: rotate(90deg);
  }

  .footer-nav {
    gap: 0.25rem;
  }

  .footer-border {
    width: 80%;
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .app-footer,
  .stagger-1,
  .stagger-2,
  .stagger-3,
  .stagger-4,
  .stagger-5,
  .ink-line,
  .ink-stroke {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .ink-stroke {
    stroke-dashoffset: 0;
  }

  .ink-circle,
  .ink-ripple,
  .footer-nav__underline {
    transition: none;
  }
}
</style>
