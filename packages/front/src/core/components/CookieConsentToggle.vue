<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Cookie } from '@lucide/vue';
import { openCookieConsent } from '@/core/composables/cookie-consent';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';

const { t } = useI18n();
</script>

<template>
  <ZenTooltip :text="t('consent.manage')" position="top">
    <button
      type="button"
      class="consent-toggle-btn"
      :aria-label="t('consent.manageLabel')"
      @click="openCookieConsent"
    >
      <span class="consent-toggle-btn__circle" aria-hidden="true" />
      <Cookie :size="20" :stroke-width="1.5" />
    </button>
  </ZenTooltip>
</template>

<style lang="scss" scoped>
.consent-toggle-btn {
  position: relative;
  display: grid;
  place-items: center;
  // 44px: the iOS minimum touch target, shared by the whole toggle cluster.
  width: 2.75rem;
  height: 2.75rem;
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

    .consent-toggle-btn__circle {
      transform: scale(1) rotate(0deg);
      opacity: 0.1;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-focus-ring);
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

// Dark theme
[data-theme='dark'] .consent-toggle-btn {
  color: var(--gutenku-text-primary);

  &:hover {
    color: var(--gutenku-zen-accent);
  }

  .consent-toggle-btn__circle {
    background: radial-gradient(
      circle at center,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-accent) 50%,
      transparent 100%
    );
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .consent-toggle-btn {
    transition: none;

    svg {
      transition: none;
    }

    &__circle {
      transition: none;
    }

    &:hover {
      svg {
        transform: none;
      }
    }
  }
}
</style>
