<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Download, Share, Plus } from '@/core/components/icons/ink';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import {
  isDailyGameComplete,
  usePwaInstall,
  usePwaPromptMoment,
} from '@/core/composables/pwa-install';

const { t } = useI18n();
const route = useRoute();
const {
  isIos,
  canInstall,
  shouldShowBanner,
  hasNativePrompt,
  showPrompt,
  markShown,
  dismiss,
  optOut,
  trackGameCompleted,
} = usePwaInstall();
const { isMoment } = usePwaPromptMoment(
  shouldShowBanner,
  computed(() => route.name),
);

const isVisible = ref(false);
const showIosModal = ref(false);

watch(isMoment, (moment) => {
  if (moment && shouldShowBanner.value) {
    isVisible.value = true;
    markShown();
  }
});

// Installed from the browser menu meanwhile: the slip has nothing left to offer
watch(canInstall, (ok) => {
  if (!ok) {
    isVisible.value = false;
  }
});

watch(isDailyGameComplete, (done) => done && trackGameCompleted(), {
  immediate: true,
});

async function handleInstallClick() {
  isVisible.value = false;

  if (isIos.value) {
    showIosModal.value = true;

    return;
  }

  if (hasNativePrompt.value && !(await showPrompt())) {
    dismiss();
  }
}

function handleNotNow() {
  isVisible.value = false;
  dismiss();
}

function handleNeverAsk() {
  isVisible.value = false;
  optOut();
}

// Whether or not the steps were followed, the question has been answered
function handleIosModalClose() {
  if (!showIosModal.value) {
    return;
  }
  showIosModal.value = false;
  dismiss();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="pwa-banner">
      <div
        v-if="isVisible"
        class="pwa-install-banner"
        role="complementary"
        :aria-label="t('pwa.bannerLabel')"
      >
        <div class="pwa-install-banner__content" @keydown.esc="handleNotNow">
          <div class="pwa-install-banner__text">
            <p class="pwa-install-banner__title">
              {{ t('pwa.installPrompt') }}
            </p>
            <p class="pwa-install-banner__pitch">{{ t('pwa.pitch') }}</p>
          </div>

          <div class="pwa-install-banner__actions">
            <ZenButton
              variant="cta"
              size="sm"
              :aria-label="t('pwa.installButton')"
              @click="handleInstallClick"
            >
              <template #icon-left>
                <Download :size="16" aria-hidden="true" />
              </template>
              {{ t('pwa.install') }}
            </ZenButton>

            <ZenButton variant="ghost" size="sm" @click="handleNotNow">
              {{ t('pwa.notNow') }}
            </ZenButton>

            <button
              type="button"
              class="pwa-install-banner__never"
              @click="handleNeverAsk"
            >
              {{ t('pwa.neverAsk') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ZenModal
      v-model="showIosModal"
      :title="t('pwa.iosModalTitle')"
      :description="t('pwa.iosModalDescription')"
      max-width="340"
      variant="help"
      :show-close="false"
      @close="handleIosModalClose"
    >
      <div class="pwa-ios-instructions">
        <ol class="pwa-ios-instructions__steps">
          <li class="pwa-ios-instructions__step">
            <div class="pwa-ios-instructions__step-icon">
              <Share :size="24" aria-hidden="true" />
            </div>
            <div class="pwa-ios-instructions__step-text">
              <strong>{{ t('pwa.iosStep1Title') }}</strong>
              <span>{{ t('pwa.iosStep1Desc') }}</span>
            </div>
          </li>
          <li class="pwa-ios-instructions__step">
            <div class="pwa-ios-instructions__step-icon">
              <Plus :size="24" aria-hidden="true" />
            </div>
            <div class="pwa-ios-instructions__step-text">
              <strong>{{ t('pwa.iosStep2Title') }}</strong>
              <span>{{ t('pwa.iosStep2Desc') }}</span>
            </div>
          </li>
        </ol>
      </div>

      <template #actions>
        <ZenButton variant="ghost" @click="handleIosModalClose">
          {{ t('common.close') }}
        </ZenButton>
      </template>
    </ZenModal>
  </Teleport>
</template>

<style lang="scss" scoped>
// Ex Libris: the same paper slip as the consent banner, tucked under the page.
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1500;
  padding: 0.5rem 0.75rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
  // Only the card itself is interactive; the layer lets clicks pass through.
  pointer-events: none;
  font-family: var(--gk-font);

  @media (min-width: 600px) {
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  }
}

.pwa-install-banner__content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.875rem;
  max-width: min(94vw, 520px);
  margin: 0 auto;
  padding: 0.75rem 0.875rem;
  pointer-events: auto;
  background: var(--gk-paper-raised);
  color: var(--gk-ink);
  border: var(--gk-rule);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
}

.pwa-install-banner__text {
  flex: 1 1 14rem;
  min-width: 0;
}

.pwa-install-banner__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--gk-ink);
}

.pwa-install-banner__pitch {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--gk-ink-soft);
}

.pwa-install-banner__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}

.pwa-install-banner__actions :deep(.zen-btn) {
  min-height: 2.75rem;
}

// The permanent "no" stays small but keeps a full touch target.
.pwa-install-banner__never {
  min-height: 2.75rem;
  padding: 0 0.5rem;
  background: transparent;
  border: none;
  border-radius: var(--gk-radius-control);
  color: var(--gk-ink-soft);
  font: inherit;
  font-size: 0.75rem;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color var(--gk-dur-fast) var(--gk-ease-out);

  &:focus-visible {
    outline: 2px solid var(--gk-indigo);
    outline-offset: 2px;
  }
}

@media (hover: hover) {
  .pwa-install-banner__never:hover {
    color: var(--gk-ink);
  }
}

.pwa-banner-enter-active {
  transition:
    transform var(--gk-dur-reward) var(--gk-ease-out),
    opacity var(--gk-dur-reward) var(--gk-ease-out);
}

.pwa-banner-leave-active {
  transition:
    transform var(--gk-dur-fast) var(--gk-ease-out),
    opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.pwa-banner-enter-from,
.pwa-banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.pwa-ios-instructions {
  padding: 0.5rem 0;
}

.pwa-ios-instructions__steps {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pwa-ios-instructions__step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;

  &:not(:last-child) {
    border-bottom: var(--gk-rule-faint);
  }
}

.pwa-ios-instructions__step-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--gk-paper-deep);
  border: 1.5px solid var(--gk-ink-faint);
  border-radius: var(--gk-radius-control);
  color: var(--gk-ink);
}

.pwa-ios-instructions__step-text {
  flex: 1;

  strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--gk-ink);
  }

  span {
    font-size: 0.875rem;
    line-height: 1.45;
    color: var(--gk-ink-soft);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pwa-banner-enter-active,
  .pwa-banner-leave-active {
    transition: opacity 150ms linear;
  }

  .pwa-banner-enter-from,
  .pwa-banner-leave-to {
    transform: none;
  }

  .pwa-install-banner__never {
    transition: none;
  }
}
</style>
