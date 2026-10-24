<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { openCookieConsent } from '@/core/composables/cookie-consent';

const { t } = useI18n();
</script>

<template>
  <button
    type="button"
    class="consent-toggle-btn"
    :aria-label="t('consent.manageLabel')"
    :title="t('consent.manageLabel')"
    @click="openCookieConsent"
  >
    {{ t('consent.manage') }}
  </button>
</template>

<style lang="scss" scoped>
// A text key in the colophon, set like the copyright beside it
.consent-toggle-btn {
  position: relative;
  display: inline-grid;
  place-items: center;
  min-height: 2.75rem;
  padding: 0 0.25rem;
  background: transparent;
  border: 0;
  border-radius: var(--gk-radius-control);
  font-family: var(--gk-font);
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--gk-ink-soft);
  cursor: pointer;
  transition:
    color var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-press) var(--gk-ease-out);

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
      color: var(--gk-ink);
    }
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .consent-toggle-btn {
    transition: none;

    &:active {
      transform: none;
    }
  }
}
</style>
