<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BrandMark from '@/core/components/ink/BrandMark.vue';
import InkPrefs from '@/core/components/ui/InkPrefs.vue';
import { useSitePages } from '@/core/composables/site-pages';

const route = useRoute();
const { t } = useI18n();
const { pages, isActive } = useSitePages();

// Pages that have their own h1: /blog, /blog/:slug, /game
// Pages without h1 (logo becomes h1): /, /haiku
const pageHasOwnH1 = computed(
  () => route.path.startsWith('/blog') || route.path.startsWith('/game'),
);

function handleClick(event: MouseEvent, to: string, navigate: () => void) {
  // Leave modified clicks to the browser so "open in new tab" keeps working.
  // The anchor carries a real href, so not calling preventDefault is enough.
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  ) {
    return;
  }

  event.preventDefault();

  if (isActive(to)) {
    return;
  }

  // `navigate` comes from RouterLink's custom slot: the link no longer routes
  // on its own, so this is the only navigation. The layout's router guard
  // wraps it in the page transition (core/layouts/default/View.vue).
  navigate();
}
</script>

<template>
  <nav class="ink-nav" :aria-label="t('nav.mainNavigation')">
    <RouterLink to="/" class="ink-nav__logo" aria-label="GutenKu Home">
      <BrandMark :size="32" class="ink-nav__seal" />
      <component :is="pageHasOwnH1 ? 'span' : 'h1'" class="ink-nav__logo-text">
        <span class="ink-nav__logo-prefix">Guten</span
        ><i class="ink-nav__logo-suffix">Ku</i>
      </component>
    </RouterLink>

    <ul class="ink-nav__container">
      <li v-for="page in pages" :key="page.to" class="ink-nav__list-item">
        <RouterLink v-slot="{ href, navigate }" :to="page.to" custom>
          <a
            :href="href"
            class="ink-nav__item"
            :class="{ 'ink-nav__item--active': isActive(page.to) }"
            :aria-current="isActive(page.to) ? 'page' : undefined"
            @click="handleClick($event, page.to, navigate)"
          >
            <sup class="ink-nav__numeral" aria-hidden="true">{{
              page.numeral
            }}</sup>
            <span class="ink-nav__label">{{ t(page.labelKey) }}</span>
            <span
              v-if="isActive(page.to)"
              class="ink-nav__mark"
              aria-hidden="true"
            />
          </a>
        </RouterLink>
      </li>
    </ul>

    <InkPrefs class="ink-nav__toggles" />
  </nav>
</template>

<style lang="scss" scoped>
/* stylelint-disable scss/operator-no-newline-after */
// Ex Libris: the nav is a typed table of contents. Roman numerals, plain ink
// links, and one stroke of vermilion under the page you are on.
.ink-nav {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'logo prefs'
    'links links';
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1rem 0.25rem;
  padding-top: calc(
    var(
        --native-safe-area-top,
        var(--safe-area-inset-top, env(safe-area-inset-top, 0px))
      ) +
      0.75rem
  );
  border-bottom: var(--gk-rule-faint);
  font-family: var(--gk-font);

  @media (min-width: 768px) {
    display: flex;
    gap: 1.75rem;
    padding: 1rem 1.75rem;
    padding-top: calc(
      var(
          --native-safe-area-top,
          var(--safe-area-inset-top, env(safe-area-inset-top, 0px))
        ) +
        1rem
    );
  }

  // Landscape orientation - no safe area padding
  @media (orientation: landscape) {
    padding-top: 0.75rem;

    @media (min-width: 768px) {
      padding-top: 1rem;
    }
  }

  &__logo {
    grid-area: logo;
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    min-height: 2.75rem;
    width: fit-content;
    color: var(--gk-ink);
    text-decoration: none;

    @media (min-width: 768px) {
      margin-right: auto;
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 4px;
      border-radius: var(--gk-radius-control);
    }
  }

  &__logo-text {
    margin: 0;
    padding: 0;
    font-size: 1.25rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1;
    white-space: nowrap;

    @media (min-width: 768px) {
      font-size: 1.375rem;
    }
  }

  &__logo-suffix {
    font-style: italic;
    color: var(--gk-ink-soft);
  }

  &__container {
    grid-area: links;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.25rem 1rem;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (min-width: 425px) {
      justify-content: center;
      gap: 0.25rem 1.5rem;
    }

    @media (min-width: 768px) {
      gap: 1.625rem;
    }
  }

  &__list-item {
    display: contents;
  }

  &__item {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    min-height: 2.75rem;
    padding: 0.75rem 0;
    font-size: 0.8125rem;
    line-height: 1.2;
    color: var(--gk-ink-soft);
    text-decoration: none;
    white-space: nowrap;
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    @media (min-width: 375px) {
      font-size: 0.875rem;
    }

    @media (hover: hover) {
      &:hover {
        color: var(--gk-ink);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }

    &--active {
      color: var(--gk-ink);
    }
  }

  &__numeral {
    margin-right: 0.25rem;
    font-size: 0.625rem;
  }

  &__label {
    position: relative;
    z-index: 1;
  }

  // The vermilion brush stroke under the current page. A real element (not a
  // pseudo) so it can carry a view-transition-name and slide between links
  // (timing in assets/css/main.scss, with the other view-transition rules).
  &__mark {
    position: absolute;
    left: -4px;
    right: -6px;
    bottom: 0.5rem;
    height: 7px;
    background: var(--gk-stamp);
    opacity: 0.85;
    clip-path: polygon(
      0 55%,
      8% 30%,
      40% 20%,
      75% 28%,
      100% 10%,
      98% 70%,
      60% 85%,
      20% 80%,
      2% 95%
    );
    view-transition-name: ink-nav-mark;
    pointer-events: none;
  }

  &__toggles {
    grid-area: prefs;
  }
}

[data-dyslexia='true'] .ink-nav__item {
  font-size: 0.75rem;

  @media (min-width: 768px) {
    font-size: 0.8125rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ink-nav__item {
    transition: none;
  }
}

@media (forced-colors: active) {
  .ink-nav__item:focus-visible {
    outline: 3px solid CanvasText;
  }

  .ink-nav__item--active {
    text-decoration: underline;
  }

  .ink-nav__mark {
    background: Highlight;
  }
}
</style>
