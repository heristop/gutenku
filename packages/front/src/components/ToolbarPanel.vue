<script lang="ts" setup>
import { computed, ref, useTemplateRef, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import {
  Loader2,
  Sparkles,
  Check,
  Copy,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useClipboard } from '@/composables/clipboard';
import { useShare } from '@/composables/share';
import { useImageDownload } from '@/composables/image-download';
import { useInView } from '@/composables/in-view';
import { useToast } from '@/composables/toast';
import { useLongPress, useTouchGestures } from '@/composables/touch-gestures';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';
import SwipeHint from '@/components/ui/SwipeHint.vue';

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
</script>

<template>
  <div
    ref="cardRef"
    class="gutenku-card toolbar-panel toolbar-panel--card toolbar-container mt-2 mt-sm-0 mb-6 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <!-- Primary: Generate Button (full width) -->
    <div class="toolbar-panel__primary">
      <ZenTooltip :text="generateTooltip" position="top">
        <div
          ref="generateBtnRef"
          class="generate-btn-wrapper"
          :class="{ 'is-pressing': isLongPressing }"
        >
          <v-btn
            :loading="loading"
            :disabled="loading"
            :aria-busy="loading"
            :aria-label="generateTooltip"
            class="zen-btn gutenku-btn gutenku-btn-generate toolbar-panel__button toolbar-panel__button--generate"
            :class="{
              'toolbar-panel__button--loading': loading,
              'toolbar-panel__button--pulse': showPulse && !isTouchDevice,
            }"
            data-cy="fetch-btn"
            variant="outlined"
            size="large"
            block
            @click="extractGenerate"
          >
            <Loader2
              v-if="loading"
              :size="20"
              class="toolbar-panel__icon animate-spin"
            />
            <Sparkles v-else :size="20" class="toolbar-panel__icon" />
            <span class="toolbar-panel__button-text">{{ buttonLabel }}</span>
          </v-btn>

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
        </div>
      </ZenTooltip>
    </div>

    <!-- Secondary: Action Buttons Row -->
    <div class="toolbar-panel__secondary">
      <!-- Previous Button -->
      <ZenTooltip :text="previousTooltip" position="bottom">
        <v-btn
          class="zen-btn toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--disabled': !canGoBack }"
          :style="{ '--stagger-index': 0 }"
          variant="text"
          size="small"
          icon
          :disabled="!canGoBack || loading"
          :aria-label="previousTooltip"
          @click="navigateBack"
        >
          <ChevronLeft :size="20" />
        </v-btn>
      </ZenTooltip>

      <!-- Copy Button -->
      <ZenTooltip :text="copyTooltip" position="bottom">
        <v-btn
          class="zen-btn toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--success': copied }"
          :style="{ '--stagger-index': 1 }"
          data-cy="copy-btn"
          variant="text"
          size="small"
          icon
          :disabled="!haiku?.verses?.length"
          :aria-label="copied ? t('toolbar.copiedLabel') : copyTooltip"
          @click="copyHaiku"
        >
          <Check v-if="copied" :size="18" class="success-checkmark" />
          <Copy v-else :size="18" />
        </v-btn>
      </ZenTooltip>

      <!-- Share Button -->
      <ZenTooltip :text="shareTooltip" position="bottom">
        <v-btn
          class="zen-btn toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--success': shared }"
          :style="{ '--stagger-index': 2 }"
          data-cy="share-btn"
          variant="text"
          size="small"
          icon
          :disabled="!haiku?.verses?.length"
          :aria-label="shareTooltip"
          @click="shareHaiku"
        >
          <Check v-if="shared" :size="18" class="success-checkmark" />
          <Share2 v-else :size="18" />
        </v-btn>
      </ZenTooltip>

      <!-- Download Button -->
      <ZenTooltip :text="downloadTooltip" position="bottom">
        <v-btn
          class="zen-btn toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :style="{ '--stagger-index': 3 }"
          data-cy="download-btn"
          variant="text"
          size="small"
          icon
          :loading="downloadInProgress"
          :disabled="!haiku?.image || loading"
          :aria-label="downloadTooltip"
          @click="downloadImage"
        >
          <Loader2 v-if="downloadInProgress" :size="18" class="animate-spin" />
          <Download v-else :size="18" />
        </v-btn>
      </ZenTooltip>

      <!-- Next Button -->
      <ZenTooltip :text="nextTooltip" position="bottom">
        <v-btn
          class="zen-btn toolbar-panel__action-btn toolbar-panel__action-btn--stagger"
          :class="{ 'toolbar-panel__action-btn--disabled': !canGoForward }"
          :style="{ '--stagger-index': 4 }"
          variant="text"
          size="small"
          icon
          :disabled="!canGoForward || loading"
          :aria-label="nextTooltip"
          @click="navigateForward"
        >
          <ChevronRight :size="20" />
        </v-btn>
      </ZenTooltip>
    </div>

    <!-- History Indicator Dots -->
    <div
      v-if="historyLength > 0"
      class="toolbar-panel__history"
      role="navigation"
      :aria-label="t('toolbar.historyLabel')"
    >
      <span
        v-for="n in historyLength"
        :key="n"
        class="toolbar-panel__history-dot"
        :class="{ 'toolbar-panel__history-dot--active': n === historyPosition }"
        :aria-current="n === historyPosition ? 'step' : undefined"
      />
    </div>

    <SwipeHint v-if="isTouchDevice" />
  </div>
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
    stroke: oklch(0.8 0.15 145);
  }
}

.toolbar-panel {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 1.25rem 0;

  &__primary {
    width: 100%;
  }

  &__secondary {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 0;
  }

  &__action-btn {
    width: 2.5rem;
    height: 2.5rem;
    min-width: 2.5rem;
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
      color: oklch(0.65 0.18 145) !important;
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
        color: oklch(0.75 0.18 145) !important;
      }
    }
  }

  &__history {
    display: flex;
    gap: 0.35rem;
    justify-content: center;
  }

  &__history-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gutenku-zen-secondary);
    transition: all 0.2s ease;
    animation: dot-bounce-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: calc(#{$i - 1} * 40ms);
      }
    }

    &--active {
      background: var(--gutenku-zen-primary) !important;
      transform: scale(1.2) !important;
      opacity: 1 !important;
      animation: dot-active-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    [data-theme='dark'] & {
      background: oklch(0.4 0.02 60);

      &--active {
        background: oklch(0.7 0.1 145);
      }
    }
  }

  &__button {
    border-width: 1.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &--generate {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
    }

    &--pulse {
      animation: generate-pulse 2.5s ease-in-out infinite;
    }

    [data-theme='dark'] & {
      background: oklch(1 0 0 / 0.12) !important;
      color: oklch(1 0 0 / 0.95) !important;
      border-color: oklch(1 0 0 / 0.25);
      box-shadow:
        0 2px 8px oklch(0 0 0 / 0.3),
        0 1px 3px oklch(0 0 0 / 0.2),
        inset 0 1px 0 oklch(1 0 0 / 0.15);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px oklch(0 0 0 / 0.15);

      [data-theme='dark'] & {
        background: oklch(1 0 0 / 0.18) !important;
        border-color: oklch(1 0 0 / 0.4);
        box-shadow:
          0 4px 16px oklch(0 0 0 / 0.4),
          0 2px 6px oklch(0 0 0 / 0.3),
          inset 0 1px 0 oklch(1 0 0 / 0.2);

        .toolbar-panel__icon {
          color: oklch(1 0 0) !important;
          filter: drop-shadow(0 2px 3px oklch(0 0 0 / 0.5));
        }

        .toolbar-panel__button-text {
          color: oklch(1 0 0) !important;
          text-shadow: 0 1px 3px oklch(0 0 0 / 0.5);
        }
      }
    }
  }

  &__icon {
    margin-right: 0.5rem;

    [data-theme='dark'] .toolbar-panel__button & {
      color: oklch(1 0 0 / 0.95) !important;
      filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.4));
    }
  }

  &__button-text {
    [data-theme='dark'] .toolbar-panel__button & {
      color: oklch(1 0 0 / 0.95) !important;
      text-shadow: 0 1px 2px oklch(0 0 0 / 0.4);
    }
  }
}

@keyframes generate-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 oklch(0.55 0.15 145 / 0.4);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 0 0 6px oklch(0.55 0.15 145 / 0);
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

@keyframes dot-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dot-active-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1.2);
  }
}

@media (max-width: 768px) {
  .toolbar-panel {
    &__button {
      min-height: 2.75rem;
    }

    &__action-btn {
      width: 2.75rem;
      height: 2.75rem;
      min-width: 2.75rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .toolbar-panel {
    &__button {
      transition: none;

      &--pulse {
        animation: none;
      }

      &:hover {
        transform: none;
      }
    }

    &__action-btn {
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

    &__history-dot {
      animation: none;
      opacity: 1;

      &--active {
        animation: none;
      }
    }

    &__icon.animate-spin {
      animation: none;
    }
  }
}
</style>
