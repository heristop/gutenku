<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { PenTool, Lightbulb } from 'lucide-vue-next';
import ToriiIcon from '@/core/components/icons/ToriiIcon.vue';
import { withViewTransition } from '@/core/composables/view-transition';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const navItems = [
  { label: 'Home', to: '/', icon: ToriiIcon, transitionName: 'nav-icon-home', ariaLabel: 'nav.home' },
  { label: 'GutenKu', to: '/haiku', icon: PenTool, transitionName: 'nav-icon-haiku', ariaLabel: 'nav.haiku' },
  { label: 'GutenGuess', to: '/game', icon: Lightbulb, transitionName: 'nav-icon-game', ariaLabel: 'nav.game' },
];

const isActive = (path: string) => route.path === path;

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
          <!-- Rounded icon button with enso circle -->
          <span
            class="ink-nav__icon-wrapper"
            :style="{ viewTransitionName: item.transitionName }"
            aria-hidden="true"
          >
            <!-- Enso circle for active state -->
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

          <!-- Label -->
          <span class="ink-nav__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.ink-nav {
  position: relative;
  padding: 1rem 0.5rem 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;

  // Small mobile (< 375px)
  @media (min-width: 375px) {
    padding: 1.25rem 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  // Tablet and up
  @media (min-width: 600px) {
    padding: 1.5rem 1rem 1.75rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }

  // List reset for semantic ul
  &__container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;

    // Small mobile (< 375px)
    @media (min-width: 375px) {
      gap: 2.5rem;
    }

    // Tablet and up
    @media (min-width: 600px) {
      gap: 5rem;
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
    gap: 0.375rem;
    padding: 0.5rem;
    min-width: 4.5rem;
    text-decoration: none;
    border-radius: var(--gutenku-radius-lg);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    // Larger touch target on mobile
    @media (min-width: 375px) {
      gap: 0.5rem;
      min-width: 5.5rem;
    }

    // Ensure minimum 44x44px touch target (WCAG 2.2)
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

    // Focus visible with high contrast ring (WCAG 2.2 compliant)
    &:focus-visible {
      outline: 3px solid var(--gutenku-zen-accent);
      outline-offset: 4px;
    }
  }

  // Click feedback
  &__item--clicked {
    transform: scale(0.95) !important;
    transition: transform 0.1s ease-out !important;
  }

  // Rounded icon wrapper with paper texture
  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    // Minimum 44x44px for touch targets (WCAG 2.2)
    width: 2.75rem;
    height: 2.75rem;
    border-radius: var(--gutenku-radius-full);
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.12) 0%, transparent 50%),
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

    @media (min-width: 600px) {
      width: 3rem;
      height: 3rem;
    }
  }

  // Hover state with spring effect
  &__item:hover &__icon-wrapper {
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.2) 0%, transparent 50%),
      var(--gutenku-zen-primary);
    border-color: var(--gutenku-zen-primary);
    transform: scale(1.05);
    box-shadow:
      0 6px 20px oklch(0.45 0.1 195 / 0.28),
      0 0 0 3px oklch(0.45 0.1 195 / 0.1),
      inset 0 1px 0 oklch(1 0 0 / 0.2);
  }

  // Active state with glow ring
  &__item--active &__icon-wrapper {
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.15) 0%, transparent 50%),
      var(--gutenku-zen-primary);
    border-color: oklch(0.35 0.1 195);
    transform: scale(1.05);
    box-shadow:
      0 4px 16px oklch(0.45 0.1 195 / 0.35),
      0 0 0 4px oklch(0.45 0.1 195 / 0.12),
      inset 0 1px 0 oklch(1 0 0 / 0.2);
  }

  // Enso circle (zen circle) for active state
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

  // Icon
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

  // Navigation label typography
  &__label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    // Ensure 4.5:1 contrast ratio (WCAG AA)
    color: var(--gutenku-text-primary);
    transition: color 0.3s ease 0.05s, text-shadow 0.3s ease;

    @media (min-width: 375px) {
      font-size: 0.7rem;
    }

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
}

// Enso draw animation
@keyframes enso-draw {
  to {
    stroke-dashoffset: 15; // Leave small gap for zen "incomplete" aesthetic
  }
}

// Dark mode with WCAG 2.2 compliant contrast
[data-theme='dark'] .ink-nav {
  &__item {
    // High contrast focus ring for dark mode
    &:focus-visible {
      outline-color: oklch(0.8 0.12 195);
    }
  }

  &__icon-wrapper {
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.08) 0%, transparent 50%),
      oklch(0.25 0.04 195 / 0.7);
    border-color: oklch(0.5 0.08 195 / 0.3);
    box-shadow:
      0 2px 8px oklch(0 0 0 / 0.3),
      inset 0 1px 0 oklch(1 0 0 / 0.08);
  }

  &__item:hover &__icon-wrapper {
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.12) 0%, transparent 50%),
      var(--gutenku-zen-accent);
    border-color: var(--gutenku-zen-accent);
    box-shadow:
      0 6px 20px oklch(0.6 0.1 195 / 0.4),
      0 0 0 3px oklch(0.6 0.1 195 / 0.2),
      inset 0 1px 0 oklch(1 0 0 / 0.1);
  }

  &__item--active &__icon-wrapper {
    background:
      radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.1) 0%, transparent 50%),
      var(--gutenku-zen-accent);
    border-color: oklch(0.6 0.1 195);
    box-shadow:
      0 4px 16px oklch(0.6 0.1 195 / 0.45),
      0 0 0 4px oklch(0.6 0.1 195 / 0.2),
      inset 0 1px 0 oklch(1 0 0 / 0.1);
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

  // Ensure label contrast in dark mode (min 4.5:1 for WCAG AA)
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
}

// View transition animations
::view-transition-old(nav-icon-home),
::view-transition-old(nav-icon-haiku),
::view-transition-old(nav-icon-game) {
  animation: nav-morph-out 250ms ease-out both;
}

::view-transition-new(nav-icon-home),
::view-transition-new(nav-icon-haiku),
::view-transition-new(nav-icon-game) {
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

// Reduced motion (WCAG 2.2 - 2.3.3 Animation from Interactions)
@media (prefers-reduced-motion: reduce) {
  .ink-nav {
    &__item {
      transition: none;

      // Disable hover lift
      &:hover {
        transform: none;
      }
    }

    &__icon-wrapper,
    &__icon,
    &__label {
      transition: none;
    }

    // Disable click scale
    &__item--clicked {
      transform: none !important;
    }

    // Show enso without animation
    &__enso {
      animation: none;
      stroke-dashoffset: 15;
    }

    // Disable hover scale on icon wrapper
    &__item:hover &__icon-wrapper,
    &__item--active &__icon-wrapper {
      transform: none;
    }
  }

  // Disable view transitions
  ::view-transition-old(nav-icon-home),
  ::view-transition-old(nav-icon-haiku),
  ::view-transition-old(nav-icon-game),
  ::view-transition-new(nav-icon-home),
  ::view-transition-new(nav-icon-haiku),
  ::view-transition-new(nav-icon-game) {
    animation: none;
  }
}

// High contrast mode support
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
  }
}
</style>
