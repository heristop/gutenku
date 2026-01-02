<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Download, X, Share, Plus } from 'lucide-vue-next';
import ZenButton from '@/components/ui/ZenButton.vue';
import ZenModal from '@/components/ui/ZenModal.vue';
import { usePwaInstall } from '@/composables/pwa-install';

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
  } else if (hasNativePrompt.value) {
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
          <div class="pwa-install-banner__icon" aria-hidden="true">
            <img
              src="/android-chrome-48x48.png"
              alt=""
              width="40"
              height="40"
              class="pwa-install-banner__app-icon"
            />
          </div>

          <div class="pwa-install-banner__text">
            <p class="pwa-install-banner__title">
              {{ t('pwa.addToHomeScreen') }}
            </p>
            <p class="pwa-install-banner__subtitle">
              {{ t('pwa.installSubtitle') }}
            </p>
          </div>

          <div class="pwa-install-banner__actions">
            <ZenButton
              variant="cta"
              size="sm"
              :aria-label="t('pwa.installButton')"
              @click="handleInstallClick"
            >
              <template #icon-left>
                <Download :size="16" />
              </template>
              {{ t('pwa.install') }}
            </ZenButton>
          </div>

          <button
            type="button"
            class="pwa-install-banner__close"
            :aria-label="t('common.close')"
            @click="handleClose"
          >
            <X :size="18" aria-hidden="true" />
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
  padding: 0.75rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));

  background: oklch(0.98 0.01 85 / 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-top: 1px solid var(--gutenku-paper-border);
  box-shadow:
    0 -4px 16px oklch(0 0 0 / 0.08),
    0 -1px 4px oklch(0 0 0 / 0.04);

  @media (min-width: 600px) {
    padding: 1rem 1.5rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  }
}

:global([data-theme='dark']) .pwa-install-banner {
  background: oklch(0.18 0.015 70 / 0.92);
  border-top-color: oklch(0.35 0.02 75 / 0.4);
  box-shadow:
    0 -4px 16px oklch(0 0 0 / 0.3),
    0 -1px 4px oklch(0 0 0 / 0.2);
}

.pwa-install-banner__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 600px) {
    gap: 1rem;
  }
}

.pwa-install-banner__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
  box-shadow: 0 2px 6px oklch(0 0 0 / 0.1);
}

.pwa-install-banner__app-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pwa-install-banner__text {
  flex: 1;
  min-width: 0;
}

.pwa-install-banner__title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  line-height: 1.3;

  @media (min-width: 600px) {
    font-size: 0.95rem;
  }
}

.pwa-install-banner__subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
  color: var(--gutenku-text-muted);
  line-height: 1.3;

  @media (max-width: 400px) {
    display: none;
  }
}

.pwa-install-banner__actions {
  flex-shrink: 0;
}

.pwa-install-banner__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-left: 0.25rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--gutenku-radius-full);
  color: var(--gutenku-text-muted);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  min-width: 44px;
  min-height: 44px;

  &:hover {
    background: oklch(0 0 0 / 0.06);
    color: var(--gutenku-text-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

:global([data-theme='dark']) .pwa-install-banner__close:hover {
  background: oklch(1 0 0 / 0.1);
}

.pwa-banner-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
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
