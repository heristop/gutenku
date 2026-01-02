<script lang="ts" setup>
import { computed, ref, useTemplateRef, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import {
  Sparkles,
  Check,
  Copy,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useClipboard } from '@/core/composables/clipboard';
import { useShare } from '@/core/composables/share';
import { useImageDownload } from '@/core/composables/image-download';
import { useInView } from '@/features/haiku/composables/in-view';
import { useToast } from '@/core/composables/toast';
import { useLongPress, useTouchGestures } from '@/core/composables/touch-gestures';
import { useKeyboardShortcuts } from '@/features/haiku/composables/keyboard-shortcuts';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import SwipeHint from '@/core/components/ui/SwipeHint.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenPaginationDots from '@/core/components/ui/ZenPaginationDots.vue';

const { t } = useI18n();
const { success, error } = useToast();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const generateBtnRef = ref<HTMLElement | null>(null);
const { isInView } = useInView(cardRef, { delay: 0 });

const haikuStore = useHaikuStore();
const { fetchNewHaiku, goBack, goForward } = haikuStore;
const { haiku, loading, firstLoaded } = storeToRefs(haikuStore);

const historyLength = computed(() => haikuStore.historyLength);
const historyPosition = computed(() => haikuStore.historyPosition);
const canGoBack = computed(() => haikuStore.canGoBack);
const canGoForward = computed(() => haikuStore.canGoForward);

const { copy, copied } = useClipboard();
const { share, shared } = useShare();
const { inProgress: downloadInProgress, download } = useImageDownload();

const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
const isTouchDevice = ref(false);

onMounted(() => {
  isTouchDevice.value = 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
});

const longPressProgress = ref(0);
const { isPressed: isLongPressing } = useLongPress(generateBtnRef, {
  delay: 350,
  onLongPress: () => {
    if (!loading.value) {
      fetchNewHaiku();
    }
  },
  onProgress: (progress) => {
    longPressProgress.value = progress;
  },
  vibrate: true,
});

// Swipe gestures for history navigation
useTouchGestures(cardRef, {
  threshold: 60,
  onSwipeLeft: () => {
    if (!loading.value && canGoForward.value) {
      goForward();
    }
  },
  onSwipeRight: () => {
    if (!loading.value && canGoBack.value) {
      goBack();
    }
  },
  vibrate: true,
});

const buttonLabel = computed<string>(() => {
  if (loading.value) {
    return firstLoaded.value ? t('toolbar.generating') : t('toolbar.extracting');
  }
  return firstLoaded.value ? t('toolbar.generate') : t('toolbar.extract');
});

const generateTooltip = computed(() => t('toolbar.generateTooltip', { action: buttonLabel.value }));
const copyTooltip = computed(() => `${t('toolbar.copyTooltip')} (C)`);
const shareTooltip = computed(() => `${t('toolbar.shareTooltip')} (S)`);
const downloadTooltip = computed(() => `${t('toolbar.downloadTooltip')} (D)`);
const previousTooltip = computed(() => `${t('toolbar.previousTooltip')} (\u2190)`);
const nextTooltip = computed(() => `${t('toolbar.nextTooltip')} (\u2192)`);

const showPulse = computed(() => firstLoaded.value && !loading.value && haiku.value?.verses?.length);

async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) {return;}
  const copySuccess = await copy(haiku.value.verses.join('\n'));
  if (copySuccess) {
    success(t('toolbar.copySuccess'));
  } else {
    error(t('toolbar.copyError'));
  }
}

async function shareHaiku(): Promise<void> {
  if (!haiku.value) {return;}
  const shareSuccess = await share(haiku.value);
  if (shareSuccess) {
    success(t('toolbar.shareSuccess'));
  }
}

async function downloadImage(): Promise<void> {
  if (!haiku.value?.image) {return;}

  const bookTitle = haiku.value.book?.title || 'haiku';
  const chapterTitle = haiku.value.chapter?.title || '';

  try {
    await download(`data:image/png;base64,${haiku.value.image}`, {
      filename: `${bookTitle}_${chapterTitle}`,
    });
    success(t('toolbar.downloadSuccess'));
  } catch {
    error(t('toolbar.downloadError'));
  }
}

function navigateBack(): void {
  if (canGoBack.value) {
    goBack();
  }
}

function navigateForward(): void {
  if (canGoForward.value) {
    goForward();
  }
}

useKeyboardShortcuts({
  onGenerate: extractGenerate,
  onCopy: copyHaiku,
  onDownload: downloadImage,
  onShare: shareHaiku,
  onPrevious: navigateBack,
  onNext: navigateForward,
});
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="default"
    :loading="loading"
    :aria-label="t('toolbar.ariaLabel')"
    class="toolbar-panel toolbar-panel--card toolbar-container animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <h2 class="sr-only">{{ t('toolbar.title') }}</h2>

    <div class="toolbar-panel__primary">
      <ZenTooltip :text="generateTooltip" position="top">
        <span
          ref="generateBtnRef"
          class="generate-btn-wrapper"
          :class="{ 'is-pressing': isLongPressing }"
        >
          <ZenButton
            :loading="loading"
            :disabled="loading"
            :aria-label="generateTooltip"
            class="toolbar-panel__button toolbar-panel__button--generate"
            :class="{
              'toolbar-panel__button--loading': loading,
              'toolbar-panel__button--pulse': showPulse && !isTouchDevice,
            }"
            data-cy="fetch-btn"
            size="lg"
            @click="extractGenerate"
          >
            <template #icon-left>
              <Sparkles :size="20" />
            </template>
            {{ buttonLabel }}
          </ZenButton>

          <svg
            v-if="isTouchDevice && isLongPressing"
            class="long-press-progress"
            viewBox="0 0 44 44"
          >
            <circle
              class="progress-ring"
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke-width="2"
              :stroke-dasharray="125.6"
              :stroke-dashoffset="125.6 - (longPressProgress / 100) * 125.6"
            />
          </svg>
        </span>
      </ZenTooltip>
    </div>

    <div class="toolbar-panel__secondary">
      <ZenTooltip :text="previousTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--disabled': !canGoBack }"
          :style="{ '--stagger-index': 0 }"
          :disabled="!canGoBack || loading"
          :aria-label="previousTooltip"
          @click="navigateBack"
        >
          <template #icon-left>
            <ChevronLeft :size="20" />
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip :text="copyTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--success': copied }"
          :style="{ '--stagger-index': 1 }"
          data-cy="copy-btn"
          :disabled="!haiku?.verses?.length"
          :aria-label="copied ? t('toolbar.copiedLabel') : copyTooltip"
          @click="copyHaiku"
        >
          <template #icon-left>
            <Check v-if="copied" :size="18" class="success-checkmark" />
            <Copy v-else :size="18" />
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip :text="shareTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--success': shared }"
          :style="{ '--stagger-index': 2 }"
          data-cy="share-btn"
          :disabled="!haiku?.verses?.length"
          :aria-label="shareTooltip"
          @click="shareHaiku"
        >
          <template #icon-left>
            <Check v-if="shared" :size="18" class="success-checkmark" />
            <Share2 v-else :size="18" />
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip :text="downloadTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :style="{ '--stagger-index': 3 }"
          data-cy="download-btn"
          :loading="downloadInProgress"
          :disabled="!haiku?.image || loading"
          :aria-label="downloadTooltip"
          @click="downloadImage"
        >
          <template #icon-left>
            <Download :size="18" />
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip :text="nextTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--disabled': !canGoForward }"
          :style="{ '--stagger-index': 4 }"
          :disabled="!canGoForward || loading"
          :aria-label="nextTooltip"
          @click="navigateForward"
        >
          <template #icon-left>
            <ChevronRight :size="20" />
          </template>
        </ZenButton>
      </ZenTooltip>
    </div>

    <div v-if="historyLength > 0" class="toolbar-panel__history">
      <span class="sr-only">
        {{ t('toolbar.historyPosition', { current: historyPosition, total: historyLength }) }}
      </span>
      <ZenPaginationDots
        :model-value="historyPosition - 1"
        :total="historyLength"
        :clickable="false"
        :aria-label="t('toolbar.historyLabel')"
        item-label="Haiku"
      />
    </div>

    <SwipeHint v-if="isTouchDevice" />
  </ZenCard>
</template>

<style lang="scss" scoped>
.generate-btn-wrapper {
  position: relative;
  display: block;
  width: 100%;

  &.is-pressing {
    .toolbar-panel__button--generate {
      transform: scale(0.98);
      transition: transform 0.15s ease-out;
    }
  }
}

.long-press-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%) rotate(-90deg);
  pointer-events: none;
  z-index: 10;
}

.progress-ring {
  stroke: var(--gutenku-zen-accent);
  transition: stroke-dashoffset 0.05s linear;

  [data-theme='dark'] & {
    stroke: var(--gutenku-zen-accent);
  }
}

.toolbar-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: var(--gutenku-space-6);

  &__primary {
    width: 100%;
    max-width: 280px;
    display: flex;
    justify-content: center;
  }

  &__secondary {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0;
  }

  &__action-btn.zen-btn {
    width: 2.5rem !important;
    height: 2.5rem !important;
    min-width: 2.5rem !important;
    padding: 0 !important;
    border-radius: var(--gutenku-radius-md);
    transition: all 0.2s ease;

    &--stagger {
      animation: btn-stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(var(--stagger-index, 0) * 50ms);
      opacity: 0;
    }

    &:hover:not(:disabled) {
      background: color-mix(in oklch, var(--gutenku-zen-primary) 10%, transparent);
      transform: translateY(-1px);
    }

    &--success {
      color: var(--gutenku-zen-primary) !important;
      animation: success-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

      .success-checkmark {
        animation: checkmark-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }

    &--disabled {
      opacity: 0.3;
    }

    [data-theme='dark'] & {
      color: oklch(1 0 0 / 0.8);

      &:hover:not(:disabled) {
        background: oklch(1 0 0 / 0.1);
        color: oklch(1 0 0);
      }

      &--success {
        color: var(--gutenku-zen-accent) !important;
      }
    }

  }

  &__button.zen-btn {
    width: 100%;
    min-width: 180px;
    min-height: 3.25rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--pulse {
      animation: generate-pulse 2.5s ease-in-out infinite;
    }
  }

}

@keyframes generate-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in oklch, var(--gutenku-zen-primary) 40%, transparent);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 0 0 6px transparent;
  }
}

@keyframes btn-stagger-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes success-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkmark-spring {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toolbar-panel {
    &__button.zen-btn {
      min-height: 3rem;
    }

    &__action-btn.zen-btn {
      width: 2.75rem !important;
      height: 2.75rem !important;
      min-width: 2.75rem !important;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .toolbar-panel {
    &__button.zen-btn {
      transition: none;

      &--pulse {
        animation: none;
      }

      &:hover {
        transform: none;
      }
    }

    &__action-btn.zen-btn {
      transition: none;

      &--stagger {
        animation: none;
        opacity: 1;
      }

      &--success {
        animation: none;

        .success-checkmark {
          animation: none;
        }
      }

      &:hover {
        transform: none;
      }
    }
  }
}
</style>
