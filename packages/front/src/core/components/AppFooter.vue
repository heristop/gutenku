<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowUpRight } from '@/core/components/icons/ink';
import ZenCreditsModal from '@/core/components/ui/ZenCreditsModal.vue';
import CookieConsentToggle from '@/core/components/CookieConsentToggle.vue';
import { useCookieConsent } from '@/core/composables/cookie-consent';
import { useSitePages } from '@/core/composables/site-pages';

const { t } = useI18n();
const { isConsentRequired } = useCookieConsent();
const { pages } = useSitePages();
const currentYear = new Date().getFullYear();

const showCredits = ref(false);

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
      <nav class="footer-nav" :aria-label="t('footer.navAriaLabel')">
        <RouterLink
          v-for="page in pages"
          :key="page.to"
          :to="page.to"
          class="footer-nav__link"
        >
          <sup class="footer-nav__numeral" aria-hidden="true">{{
            page.numeral
          }}</sup>
          <span class="footer-nav__text">{{ t(page.labelKey) }}</span>
        </RouterLink>
      </nav>

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

      <button
        type="button"
        class="footer-copyright"
        :aria-label="`heristop © 2023–${currentYear} · ${t('footer.openCredits')}`"
        :title="t('footer.openCredits')"
        @click="showCredits = true"
      >
        heristop © 2023–{{ currentYear }}
      </button>

      <!-- The header already holds language, theme and type: the colophon
           keeps only consent, and only under a provider that asks for it -->
      <CookieConsentToggle v-if="isConsentRequired" />
    </div>

    <ZenCreditsModal v-model="showCredits" />
  </footer>
</template>

<style scoped lang="scss">
// Ex Libris: the colophon. Same typed table of contents as the nav, set
// under a ruled line at the foot of the page.
.app-footer {
  position: relative;
  padding: 1.25rem 1rem 1.5rem;
  padding-bottom: calc(
    var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 1.5rem
  );
  background: var(--gk-paper);
  border-top: var(--gk-rule);
  font-family: var(--gk-font);
  color: var(--gk-ink);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.75rem;
  flex-wrap: wrap;
  max-width: 64rem;
  margin: 0 auto;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 0 1.25rem;
  flex-wrap: wrap;
  justify-content: center;

  &__link {
    display: inline-flex;
    align-items: baseline;
    min-height: 2.75rem;
    padding: 0.75rem 0;
    font-size: 0.8125rem;
    line-height: 1.2;
    color: var(--gk-ink-soft);
    text-decoration: none;
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    &.router-link-exact-active {
      color: var(--gk-ink);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  &__numeral {
    margin-right: 0.25rem;
    font-size: 0.625rem;
  }
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 0 1.25rem;

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

.footer-copyright {
  min-height: 2.75rem;
  padding: 0 0.25rem;
  background: transparent;
  border: none;
  font-family: var(--gk-font);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--gk-ink-soft);
  cursor: pointer;
  transition: color var(--gk-dur-fast) var(--gk-ease-out);

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
    border-radius: var(--gk-radius-control);
  }
}

@media (hover: hover) {
  .footer-nav__link:hover,
  .footer-copyright:hover {
    color: var(--gk-ink);
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

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer-nav__link,
  .footer-social__link,
  .footer-copyright {
    transition: none;
  }
}
</style>
