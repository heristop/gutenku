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
              spring
              :aria-label="t('consent.declineLabel')"
              @click="decline"
            >
              {{ t('consent.decline') }}
            </ZenButton>

            <ZenButton
              variant="ghost"
              size="sm"
              spring
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
  pointer-events: auto;

  padding: 0.75rem 0.875rem;

  background: oklch(0.98 0.01 85 / 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-lg);
  // The inset top edge is the footer's material treatment: light catching the
  // lip of the glass, which is what stops it reading as a flat rectangle.
  box-shadow:
    0 8px 28px oklch(0 0 0 / 0.1),
    0 2px 6px oklch(0 0 0 / 0.05),
    inset 0 1px 0 oklch(1 0 0 / 0.5);
}

.cookie-consent__text {
  flex: 1;
  min-width: 0;
}

.cookie-consent__title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  line-height: 1.3;
}

// The smallest type on the page also sits over blurred glass, where letterforms
// lose definition. A touch of positive tracking buys it back.
.cookie-consent__message {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  letter-spacing: 0.01em;
  color: var(--gutenku-text-secondary);
  line-height: 1.4;
}

// Same brushstroke that separates the footer's groups.
.cookie-consent__divider {
  flex-shrink: 0;
  width: 2px;
  height: 1.75rem;
  overflow: visible;
}

.cookie-consent__stroke {
  stroke: color-mix(in oklch, var(--gutenku-text-primary) 15%, transparent);
}

.cookie-consent__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// Both answers are the same button at the same size and weight: the choice is
// never nudged one way. The floor also keeps them at a 44px touch target.
.cookie-consent__actions :deep(.zen-btn) {
  min-height: 2.75rem;
  min-width: 5.5rem;
  padding-inline: 1rem;
}

[data-theme='dark'] .cookie-consent__card {
  background: oklch(0.18 0.015 70 / 0.94);
  border-color: oklch(0.35 0.02 75 / 0.45);
  box-shadow:
    0 8px 28px oklch(0 0 0 / 0.35),
    0 2px 6px oklch(0 0 0 / 0.22),
    inset 0 1px 0 oklch(1 0 0 / 0.05);
}

[data-theme='dark'] .cookie-consent__title {
  color: oklch(0.92 0.02 70);
}

[data-theme='dark'] .cookie-consent__message {
  color: oklch(0.84 0.015 70);
}

[data-theme='dark'] .cookie-consent__stroke {
  stroke: color-mix(in oklch, var(--gutenku-text-primary) 25%, transparent);
}

// It leaves along the path it arrived by, on the mirrored curve, so dismissing
// reads as the entrance run backwards rather than a second, unrelated move.
.cookie-consent-enter-active,
.cookie-consent-leave-active {
  will-change: transform, opacity;
}

.cookie-consent-enter-active {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.cookie-consent-leave-active {
  transition:
    transform 0.2s cubic-bezier(0.64, 0, 0.78, 0),
    opacity 0.2s cubic-bezier(0.64, 0, 0.78, 0);
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
    transition: opacity 0.15s ease;
  }

  .cookie-consent-enter-from,
  .cookie-consent-leave-to {
    transform: none;
  }
}

// Translucency is decoration here; the words are not. Drop the glass and let
// the card sit on solid paper.
@media (prefers-reduced-transparency: reduce) {
  .cookie-consent__card {
    background: var(--gutenku-paper-bg);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  [data-theme='dark'] .cookie-consent__card {
    background: var(--gutenku-paper-bg);
  }
}

@media (prefers-contrast: more) {
  .cookie-consent__card {
    background: var(--gutenku-paper-bg);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-width: 2px;
  }

  [data-theme='dark'] .cookie-consent__card {
    background: var(--gutenku-paper-bg);
  }

  .cookie-consent__actions :deep(.zen-btn) {
    border-width: 2px;
  }
}
</style>
