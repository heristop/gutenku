<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Download, X, Share, Plus } from '@lucide/vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import { usePwaInstall } from '@/core/composables/pwa-install';

const { t } = useI18n();
const { isIos, shouldShowBanner, hasNativePrompt, showPrompt, dismiss } =
  usePwaInstall();

const isVisible = ref(false);
const showIosModal = ref(false);

onMounted(() => {
  if (shouldShowBanner.value) {
    setTimeout(() => {
      isVisible.value = true;
    }, 1500);
  }
});

watch(shouldShowBanner, (show) => {
  if (show && !isVisible.value) {
    setTimeout(() => {
      isVisible.value = true;
    }, 1500);
  }
});

async function handleInstallClick() {
  if (isIos.value) {
    showIosModal.value = true;

    return;
  }

  if (hasNativePrompt.value) {
    const accepted = await showPrompt();

    if (accepted) {
      handleClose();
    }
  }
}

function handleClose() {
  isVisible.value = false;
  dismiss();
}

function handleIosModalClose() {
  showIosModal.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="pwa-banner">
      <div
        v-if="isVisible && shouldShowBanner"
        class="pwa-install-banner"
        role="complementary"
        :aria-label="t('pwa.bannerLabel')"
      >
        <div class="pwa-install-banner__content">
          <p class="pwa-install-banner__label">
            {{ t('pwa.installPrompt') }}
          </p>

          <ZenButton
            variant="ghost"
            size="sm"
            :aria-label="t('pwa.installButton')"
            @click="handleInstallClick"
          >
            <template #icon-left>
              <Download :size="16" />
            </template>
            {{ t('pwa.install') }}
          </ZenButton>

          <button
            type="button"
            class="pwa-install-banner__close"
            :aria-label="t('common.close')"
            @click="handleClose"
          >
            <X :size="16" aria-hidden="true" />
          </button>
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
              <Share :size="24" />
            </div>
            <div class="pwa-ios-instructions__step-text">
              <strong>{{ t('pwa.iosStep1Title') }}</strong>
              <span>{{ t('pwa.iosStep1Desc') }}</span>
            </div>
          </li>
          <li class="pwa-ios-instructions__step">
            <div class="pwa-ios-instructions__step-icon">
              <Plus :size="24" />
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

  @media (min-width: 600px) {
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
  }
}

.pwa-install-banner__content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: max-content;
  max-width: min(92vw, 420px);
  margin: 0 auto;
  pointer-events: auto;

  padding: 0.5rem 0.55rem 0.5rem 1rem;

  background: oklch(0.98 0.01 85 / 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-lg);
  box-shadow:
    0 8px 28px oklch(0 0 0 / 0.1),
    0 2px 6px oklch(0 0 0 / 0.05);
}

[data-theme='dark'] .pwa-install-banner__content {
  background: oklch(0.18 0.015 70 / 0.94);
  border-color: oklch(0.35 0.02 75 / 0.45);
  box-shadow:
    0 8px 28px oklch(0 0 0 / 0.35),
    0 2px 6px oklch(0 0 0 / 0.22);
}

[data-theme='dark'] .pwa-install-banner__label {
  color: oklch(0.92 0.02 70);
}

.pwa-install-banner__label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  line-height: 1.2;
  white-space: nowrap;
}

.pwa-install-banner__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--gutenku-radius-md);
  color: var(--gutenku-text-muted);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: oklch(0 0 0 / 0.06);
    color: var(--gutenku-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

[data-theme='dark'] .pwa-install-banner__close:hover {
  background: oklch(1 0 0 / 0.1);
}

.pwa-banner-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease-out;
}

.pwa-banner-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.25s ease-in;
}

.pwa-banner-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

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
    border-bottom: 1px solid var(--gutenku-paper-border);
  }
}

.pwa-ios-instructions__step-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-md);
  color: var(--gutenku-zen-primary);
}

.pwa-ios-instructions__step-text {
  flex: 1;

  strong {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
    margin-bottom: 0.25rem;
  }

  span {
    font-size: 0.8rem;
    color: var(--gutenku-text-secondary);
    line-height: 1.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pwa-banner-enter-active,
  .pwa-banner-leave-active {
    transition: opacity 0.15s ease;
  }

  .pwa-banner-enter-from,
  .pwa-banner-leave-to {
    transform: none;
  }
}
</style>
