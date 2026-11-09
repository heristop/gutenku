<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ArrowUp, ArrowUpRight } from '@/core/components/icons/ink';
import BrandMark from '@/core/components/ink/BrandMark.vue';
import CookieConsentToggle from '@/core/components/CookieConsentToggle.vue';
import { useCookieConsent } from '@/core/composables/cookie-consent';
import { useSitePages } from '@/core/composables/site-pages';
import { GAME_ENABLED } from '@/features/game/config';

const { t } = useI18n();
const { isConsentRequired } = useCookieConsent();
const { pages } = useSitePages();
const currentYear = new Date().getFullYear();
const bookmojiGalleryPath = import.meta.env.DEV ? '/dev/bookmoji' : undefined;

// Back to the top of the page: instant when motion is reduced, eased otherwise
function backToTop(): void {
  const reduced = globalThis.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  globalThis.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}

const socialLinks = [
  {
    url: 'https://instagram.com/gutenku.poem',
    label: 'footer.social.instagram',
  },
  { url: 'https://gutenberg.org', label: 'footer.social.gutenberg' },
];
</script>

<template>
  <footer class="app-footer" :aria-label="t('footer.ariaLabel')">
    <div class="footer-content">
      <!-- The colophon: the mark and one sentence of what the site is -->
      <div class="footer-colophon">
        <BrandMark :size="34" class="footer-colophon__mark" />
        <p class="footer-colophon__text">
          <strong>GutenKu</strong>
          <span>{{ t('home.hero.colophon') }}</span>
        </p>
      </div>

      <nav class="footer-nav" :aria-label="t('footer.navAriaLabel')">
        <ul class="footer-nav__list">
          <li v-for="page in pages" :key="page.to">
            <RouterLink :to="page.to" class="footer-nav__link">
              <sup class="footer-nav__numeral" aria-hidden="true">{{
                page.numeral
              }}</sup>
              <span class="footer-nav__text">{{ t(page.labelKey) }}</span>
            </RouterLink>
          </li>
        </ul>
        <ul class="footer-nav__list footer-nav__list--about">
          <li v-if="GAME_ENABLED">
            <RouterLink to="/how-to-play" class="footer-nav__link">
              <span class="footer-nav__text">{{ t('footer.howToPlay') }}</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" class="footer-nav__link">
              <span class="footer-nav__text">{{ t('footer.about') }}</span>
            </RouterLink>
          </li>
          <li v-if="bookmojiGalleryPath">
            <RouterLink :to="bookmojiGalleryPath" class="footer-nav__link">
              <span class="footer-nav__text">Bookmoji</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="footer-meta">
        <nav class="footer-social" :aria-label="t('footer.socialAriaLabel')">
          <a
            v-for="link in socialLinks"
            :key="link.url"
            :href="link.url"
            class="footer-social__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t(link.label)
            }}<ArrowUpRight
              :size="14"
              class="footer-social__arrow"
              aria-hidden="true"
            />
            <span class="sr-only">({{ t('common.opensInNewTab') }})</span>
          </a>
        </nav>

        <div class="footer-base">
          <button type="button" class="footer-top" @click="backToTop">
            <ArrowUp :size="14" aria-hidden="true" />
            {{ t('footer.backToTop') }}
          </button>

          <small class="footer-copyright"
            >heristop © 2023–{{ currentYear }}</small
          >

          <!-- The header already holds language, theme and type: the colophon
               keeps only consent, and only under a provider that asks for it -->
          <CookieConsentToggle v-if="isConsentRequired" />
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
// Ex Libris: signature, contents, then the ruled credits, like a printed page.
.app-footer {
  container-type: inline-size;
  position: relative;
  padding-block: 1.5rem;
  padding-bottom: calc(
    var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 1.25rem
  );
  // Landscape phones: keep clear of the notch and the rounded corners
  padding-inline: max(1.25rem, env(safe-area-inset-left, 0px))
    max(1.25rem, env(safe-area-inset-right, 0px));
  background: var(--gk-paper);
  border-top: var(--gk-rule);
  font-family: var(--gk-font);
  color: var(--gk-ink);

  @media (min-width: 900px) {
    padding-block: 2rem 1.5rem;
  }
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  max-width: 64rem;
  margin: 0 auto;
}

.footer-colophon {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;

  @media (min-width: 600px) {
    align-items: center;
  }

  &__mark {
    flex: none;
    margin-top: 0.125rem;

    @media (min-width: 600px) {
      margin-top: 0;
    }
  }

  &__text {
    display: grid;
    gap: 0.125rem;
    min-width: 0;
    max-width: 52ch;
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--gk-ink-soft);
    text-wrap: balance;

    @media (min-width: 600px) {
      display: block;
      max-width: none;

      strong {
        margin-inline-end: 0.5rem;
      }
    }

    strong {
      font-size: 0.9375rem;
      color: var(--gk-ink);
    }
  }
}

// Keep numbered pages together; supporting links move as a separate group.
// Every control answers the press at once (no 300 ms tap delay, a state on
// pointer-down) and not only the release
.footer-nav__link,
.footer-social__link,
.footer-top {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem 2rem;

  &__list {
    display: grid;
    flex: 1 1 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 0.75rem;
    min-width: 0;
    max-width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (min-width: 600px) {
      display: flex;
      flex: 0 1 auto;
      flex-wrap: wrap;
      gap: 0 1.5rem;
    }
  }

  &__list--about {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    gap: 0 1.5rem;
  }

  &__link {
    display: inline-flex;
    min-width: 44px;
    max-width: 100%;
    align-items: baseline;
    min-height: 2.75rem;
    padding: 0.75rem 0;
    font-size: 0.875rem;
    line-height: 1.2;
    color: var(--gk-ink-soft);
    text-decoration: none;
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    // The current page: full ink and its underline kept (no bold: it is wider
    // and would shift the row from one page to the next)
    &.router-link-exact-active {
      color: var(--gk-ink);

      .footer-nav__text {
        text-decoration-color: currentcolor;
      }
    }

    // Underline drawn in on hover and focus: a list of links without buttons
    .footer-nav__text {
      min-width: 0;
      overflow-wrap: anywhere;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.25em;
      text-decoration-color: transparent;
      transition: text-decoration-color var(--gk-dur-fast) var(--gk-ease-out);
    }

    &:focus-visible .footer-nav__text {
      text-decoration-color: currentcolor;
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  // A fixed column, so the lines align whether or not they carry a numeral
  &__numeral {
    display: inline-block;
    margin-right: 0.375rem;
    font-size: 0.625rem;
    font-weight: 400;

    // Phone grid: the numerals share a column, so the names line up
    @media (max-width: 599px) {
      min-width: 1.25rem;
    }
  }
}

// Under a faint rule: elsewhere on the left, the credits on the right
.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-top: 0.5rem;
  border-top: var(--gk-rule-faint);

  @media (min-width: 600px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 1.5rem;
  }
}

.footer-social {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 1.5rem;

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    font-size: 0.8125rem;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    transition: text-decoration-thickness var(--gk-dur-fast) var(--gk-ease-out);

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  &__arrow {
    margin-left: 0.125rem;
  }
}

.footer-base {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 1.5rem;
}

.footer-top {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.75rem;
  padding: 0;
  background: transparent;
  border: none;
  font-family: var(--gk-font);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--gk-indigo);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
    border-radius: var(--gk-radius-control);
  }

  &:active {
    translate: 0 1px;
  }
}

.footer-copyright {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--gk-ink-soft);
}

// Pressed: the same state hover shows, immediately, for touch as well
.footer-nav__link:active {
  color: var(--gk-ink);

  .footer-nav__text {
    text-decoration-color: currentcolor;
  }
}

.footer-social__link:active {
  text-decoration-thickness: 2px;
}

// More contrast asked for: text at full ink, links always underlined
@media (prefers-contrast: more) {
  .footer-colophon__text,
  .footer-nav__link,
  .footer-copyright {
    color: var(--gk-ink);
  }

  .footer-nav__link .footer-nav__text {
    text-decoration-color: currentcolor;
  }

  .footer-meta {
    border-top-color: var(--gk-ink);
  }
}

@media (hover: hover) {
  .footer-nav__link:hover {
    color: var(--gk-ink);
  }

  .footer-nav__link:hover .footer-nav__text {
    text-decoration-color: currentcolor;
  }

  .footer-social__link:hover {
    text-decoration-thickness: 2px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .footer-nav__link,
  .footer-social__link,
  .footer-nav__link .footer-nav__text {
    transition: none;
  }

  .footer-top:active {
    translate: none;
  }
}

@container (max-width: 240px) {
  .footer-colophon {
    flex-wrap: wrap;
  }
  .footer-colophon__text {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .footer-nav__list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
