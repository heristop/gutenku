<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import { useCookieConsent } from '@/core/composables/cookie-consent';

// Lands just after the footer's entrance stagger finishes (~530ms), so the
// question arrives into a settled page instead of racing it.
const REVEAL_DELAY_MS = 600;

const { t } = useI18n();
const { isBannerVisible, accept, decline } = useCookieConsent();

const isVisible = ref(false);

onMounted(() => {
  if (isBannerVisible.value) {
    setTimeout(() => {
      isVisible.value = true;
    }, REVEAL_DELAY_MS);
  }
});

// Reopened from the footer: shown at once, since the visitor just asked for it.
watch(isBannerVisible, (show) => {
  isVisible.value = show;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie-consent">
      <div
        v-if="isVisible && isBannerVisible"
        class="cookie-consent"
        role="region"
        :aria-label="t('consent.bannerLabel')"
      >
        <div class="cookie-consent__card">
          <div class="cookie-consent__text">
            <p class="cookie-consent__title">{{ t('consent.title') }}</p>
            <p class="cookie-consent__message">{{ t('consent.message') }}</p>
          </div>

          <svg
            class="cookie-consent__divider"
            viewBox="0 0 2 20"
            aria-hidden="true"
          >
            <path
              class="cookie-consent__stroke"
              d="M1 0 Q0.5 5 1 10 Q1.5 15 1 20"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              fill="none"
            />
          </svg>

          <div class="cookie-consent__actions">
            <ZenButton
              variant="ghost"
              size="sm"
              :aria-label="t('consent.declineLabel')"
              @click="decline"
            >
              {{ t('consent.decline') }}
            </ZenButton>

            <ZenButton
              variant="cta"
              size="sm"
              :aria-label="t('consent.acceptLabel')"
              @click="accept"
            >
              {{ t('consent.accept') }}
            </ZenButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
// Ex Libris: a slip of paper tucked under the foot of the page. Solid paper,
// one ink rule, the same lift as every other sheet. No glass.
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  // Above the PWA banner: a pending consent question outranks an invitation.
  z-index: 1600;
  padding: 0.5rem 0.75rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
  // Only the card itself is interactive; the layer lets clicks pass through.
  pointer-events: none;
  font-family: var(--gk-font);

  @media (min-width: 600px) {
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  }
}

.cookie-consent__card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  max-width: min(94vw, 560px);
  margin: 0 auto;
  padding: 0.75rem 0.875rem;
  pointer-events: auto;
  background: var(--gk-paper-raised);
  color: var(--gk-ink);
  border: var(--gk-rule);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
}

.cookie-consent__text {
  flex: 1;
  min-width: 0;
}

.cookie-consent__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--gk-ink);
}

.cookie-consent__message {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--gk-ink-soft);
}

// Same brushstroke that separates the footer's groups.
.cookie-consent__divider {
  flex-shrink: 0;
  width: 2px;
  height: 1.75rem;
  overflow: visible;
}

.cookie-consent__stroke {
  stroke: var(--gk-ink-faint);
}

.cookie-consent__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// Accept carries the CTA fill; decline stays ghost. Both keep the same size
// and the same 44px touch target, so refusing is never harder than accepting.
.cookie-consent__actions :deep(.zen-btn) {
  min-height: 2.75rem;
  min-width: 5.5rem;
  padding-inline: 1rem;
}

// It leaves along the path it arrived by.
.cookie-consent-enter-active {
  transition:
    transform var(--gk-dur-base) var(--gk-ease-out),
    opacity var(--gk-dur-base) var(--gk-ease-out);
}

.cookie-consent-leave-active {
  transition:
    transform var(--gk-dur-fast) var(--gk-ease-out),
    opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.cookie-consent-enter-from,
.cookie-consent-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .cookie-consent__card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .cookie-consent__divider {
    display: none;
  }

  .cookie-consent__actions :deep(.zen-btn) {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cookie-consent-enter-active,
  .cookie-consent-leave-active {
    transition: opacity 150ms linear;
  }

  .cookie-consent-enter-from,
  .cookie-consent-leave-to {
    transform: none;
  }
}

@media (prefers-contrast: more) {
  .cookie-consent__card {
    border-width: 2px;
  }
}
</style>
