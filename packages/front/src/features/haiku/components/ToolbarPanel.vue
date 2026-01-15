<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef, onMounted } from 'vue';
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
  ChevronDown,
  Feather,
  Repeat,
  Square,
  Trophy,
  Image as ImageIcon,
} from 'lucide-vue-next';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useClipboard } from '@/core/composables/clipboard';
import { useShare } from '@/core/composables/share';
import { useImageDownload } from '@/core/composables/image-download';
import { useInView } from '@/features/haiku/composables/in-view';
import { useToast } from '@/core/composables/toast';
import {
  useLongPress,
  useTouchGestures,
} from '@/core/composables/touch-gestures';
import { useKeyboardShortcuts } from '@/features/haiku/composables/keyboard-shortcuts';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import SwipeHint from '@/core/components/ui/SwipeHint.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenPaginationDots from '@/core/components/ui/ZenPaginationDots.vue';
import ZenSlider from '@/core/components/ui/ZenSlider.vue';
import ZenSwitch from '@/core/components/ui/ZenSwitch.vue';
import ZenExpandTransition from '@/core/components/ui/ZenExpandTransition.vue';
import ZenProgress from '@/core/components/ui/ZenProgress.vue';

const isDev = import.meta.env.DEV;
const devOptionsExpanded = ref(false);

const { t } = useI18n();
const { success, error } = useToast();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const generateBtnRef = ref<HTMLElement | null>(null);
const { isInView } = useInView(cardRef, { delay: 0 });

const haikuStore = useHaikuStore();
const { fetchNewHaiku, goBack, goForward, stopGeneration } = haikuStore;
const {
  haiku,
  loading,
  firstLoaded,
  optionIterations,
  optionUseAI,
  optionImageAI,
  isGenerating,
  generationProgress,
} = storeToRefs(haikuStore);

const historyLength = computed(() => haikuStore.historyLength);
const historyPosition = computed(() => haikuStore.historyPosition);
const canGoBack = computed(() => haikuStore.canGoBack);
const canGoForward = computed(() => haikuStore.canGoForward);

const progressPercent = computed(() => {
  if (generationProgress.value.total === 0) {
    return 0;
  }
  return Math.round(
    (generationProgress.value.current / generationProgress.value.total) * 100,
  );
});

const WOW_DURATION = 600;
const scoreWow = ref(false);
let lastBestScore = 0;

watch(
  () => generationProgress.value.bestScore,
  (newScore) => {
    if (newScore > lastBestScore && newScore > 0) {
      scoreWow.value = true;
      setTimeout(() => {
        scoreWow.value = false;
      }, WOW_DURATION);
    }
    lastBestScore = newScore;
  },
);

watch(isGenerating, (generating) => {
  if (generating) {
    lastBestScore = 0;
  }
});

const showCelebration = ref(false);
watch(isGenerating, (generating, wasGenerating) => {
  if (wasGenerating && !generating && generationProgress.value.bestScore > 0) {
    showCelebration.value = true;
    setTimeout(() => {
      showCelebration.value = false;
    }, 1500);
  }
});

// ETA tracking
const iterationTimes = ref<number[]>([]);
const lastIterationTime = ref(Date.now());

watch(
  () => generationProgress.value.current,
  (current, prev) => {
    if (current > prev && current > 0) {
      const elapsed = Date.now() - lastIterationTime.value;
      iterationTimes.value.push(elapsed);
      lastIterationTime.value = Date.now();
    }
  },
);

watch(isGenerating, (generating) => {
  if (generating) {
    iterationTimes.value = [];
    lastIterationTime.value = Date.now();
  }
});

const estimatedTimeLeft = computed(() => {
  if (iterationTimes.value.length === 0) {
    return null;
  }
  const avgTime =
    iterationTimes.value.reduce((a, b) => a + b, 0) /
    iterationTimes.value.length;
  const remaining =
    generationProgress.value.total - generationProgress.value.current;
  return Math.ceil((avgTime * remaining) / 1000);
});

// Iteration presets (number of full GA runs)
const iterationPresets = [1, 5, 10, 25, 50];

const { copy, copied } = useClipboard();
const { share, shared } = useShare();
const { inProgress: downloadInProgress, download } = useImageDownload();

const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
const isTouchDevice = ref(false);

onMounted(() => {
  isTouchDevice.value =
    'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
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
    return firstLoaded.value
      ? t('toolbar.generating')
      : t('toolbar.extracting');
  }
  return firstLoaded.value ? t('toolbar.generate') : t('toolbar.extract');
});

const generateTooltip = computed(() =>
  t('toolbar.generateTooltip', { action: buttonLabel.value }),
);
const copyTooltip = computed(() => `${t('toolbar.copyTooltip')} (C)`);
const shareTooltip = computed(() => `${t('toolbar.shareTooltip')} (S)`);
const downloadTooltip = computed(() => `${t('toolbar.downloadTooltip')} (D)`);
const previousTooltip = computed(
  () => `${t('toolbar.previousTooltip')} (\u2190)`,
);
const nextTooltip = computed(() => `${t('toolbar.nextTooltip')} (\u2192)`);

const showPulse = computed(
  () => firstLoaded.value && !loading.value && haiku.value?.verses?.length,
);

async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) {
    return;
  }

  const copySuccess = await copy(haiku.value.verses.join('\n'));

  if (copySuccess) {
    success(t('toolbar.copySuccess'));
    return;
  }

  error(t('toolbar.copyError'));
}

async function shareHaiku(): Promise<void> {
  if (!haiku.value) {
    return;
  }

  const shareSuccess = await share(haiku.value);

  if (shareSuccess) {
    success(t('toolbar.shareSuccess'));
  }
}

async function downloadImage(): Promise<void> {
  if (!haiku.value?.image) {
    return;
  }

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
    variant="panel"
    :loading="loading"
    :aria-label="t('toolbar.ariaLabel')"
    class="toolbar-panel toolbar-panel--card toolbar-container animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <!-- Celebration shimmer effect -->
    <div v-if="showCelebration" class="toolbar-panel__celebration">
      <div class="toolbar-panel__shimmer" />
    </div>

    <!-- Header -->
    <div class="toolbar-panel__header">
      <span class="toolbar-panel__header-icon" aria-hidden="true">
        <Feather :size="24" />
      </span>
      <span class="toolbar-panel__header-content">
        <h2 class="toolbar-panel__header-title">{{ t('toolbar.title') }}</h2>
        <span class="toolbar-panel__header-subtitle">{{
          t('toolbar.subtitle')
        }}</span>
      </span>
    </div>

    <div class="toolbar-panel__primary">
      <ZenTooltip
        :text="isGenerating ? t('toolbar.stopTooltip') : generateTooltip"
        position="top"
      >
        <span
          ref="generateBtnRef"
          class="generate-btn-wrapper"
          :class="{ 'is-pressing': isLongPressing && !isGenerating }"
        >
          <ZenButton
            :loading="loading && !isGenerating"
            :disabled="loading && !isGenerating"
            :aria-label="
              isGenerating ? t('toolbar.stopTooltip') : generateTooltip
            "
            class="toolbar-panel__button toolbar-panel__button--generate"
            :class="{
              'toolbar-panel__button--loading': loading && !isGenerating,
              'toolbar-panel__button--pulse': showPulse && !isTouchDevice,
              'toolbar-panel__button--stop': isGenerating,
            }"
            data-cy="fetch-btn"
            size="lg"
            @click="isGenerating ? stopGeneration() : extractGenerate()"
          >
            <template #icon-left>
              <Square v-if="isGenerating" :size="20" />
              <Sparkles v-else :size="20" />
            </template>
            {{ isGenerating ? t('toolbar.stop') : buttonLabel }}
          </ZenButton>

          <svg
            v-if="isTouchDevice && isLongPressing && !isGenerating"
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

    <!-- Dev options (shown after first load, hidden during generation) -->
    <ZenExpandTransition>
      <div
        v-if="isDev && firstLoaded && !isGenerating"
        class="toolbar-panel__config"
      >
        <div class="toolbar-panel__ink-separator" aria-hidden="true" />
        <div class="toolbar-panel__dev-section">
          <!-- Collapsible Header -->
          <button
            class="toolbar-panel__dev-header"
            type="button"
            :aria-expanded="devOptionsExpanded"
            aria-controls="dev-options-content"
            @click="devOptionsExpanded = !devOptionsExpanded"
          >
            <span class="toolbar-panel__dev-badge">DEV</span>
            <span class="toolbar-panel__dev-title">Developer Options</span>
            <ChevronDown
              :size="16"
              class="toolbar-panel__dev-chevron"
              :class="{
                'toolbar-panel__dev-chevron--open': devOptionsExpanded,
              }"
            />
          </button>

          <!-- Collapsible Content -->
          <ZenExpandTransition>
            <div
              v-if="devOptionsExpanded"
              id="dev-options-content"
              class="toolbar-panel__dev-content"
            >
              <!-- Iterations/Raffinement slider -->
              <div
                class="toolbar-panel__dev-option toolbar-panel__dev-iterations"
              >
                <Repeat
                  :size="14"
                  class="toolbar-panel__dev-icon"
                  aria-hidden="true"
                />
                <span class="toolbar-panel__dev-iterations-label">{{
                  t('toolbar.iterations')
                }}</span>
                <span class="toolbar-panel__config-value">{{
                  optionIterations
                }}</span>
              </div>
              <ZenSlider
                v-model="optionIterations"
                :min="1"
                :max="50"
                :step="1"
                size="sm"
                :aria-label="t('toolbar.iterations')"
              />
              <div class="toolbar-panel__presets">
                <button
                  v-for="preset in iterationPresets"
                  :key="preset"
                  class="toolbar-panel__preset"
                  :class="{
                    'toolbar-panel__preset--active':
                      optionIterations === preset,
                  }"
                  :aria-pressed="optionIterations === preset"
                  @click="optionIterations = preset"
                >
                  {{ preset }}
                </button>
              </div>

              <div class="toolbar-panel__dev-separator" />

              <!-- AI toggles -->
              <div class="toolbar-panel__dev-option">
                <Sparkles :size="14" class="toolbar-panel__dev-icon" />
                <ZenSwitch v-model="optionUseAI" label="AI Text" size="sm" />
              </div>
              <div class="toolbar-panel__dev-option">
                <ImageIcon :size="14" class="toolbar-panel__dev-icon" />
                <ZenSwitch v-model="optionImageAI" label="AI Image" size="sm" />
              </div>
            </div>
          </ZenExpandTransition>
        </div>
      </div>
    </ZenExpandTransition>

    <!-- Progress display (visible during generation) -->
    <ZenExpandTransition>
      <div v-if="isGenerating" class="toolbar-panel__progress">
        <div class="toolbar-panel__ink-separator" aria-hidden="true" />
        <div class="toolbar-panel__progress-header">
          <div class="toolbar-panel__progress-info">
            <span class="toolbar-panel__progress-label">
              {{
                generationProgress.stopReason
                  ? t('toolbar.converged')
                  : t('toolbar.generating')
              }}
            </span>
            <span
              v-if="!generationProgress.stopReason"
              class="toolbar-panel__progress-count"
            >
              {{ generationProgress.current }}/{{ generationProgress.total }}
            </span>
            <span
              v-if="
                estimatedTimeLeft !== null && !generationProgress.stopReason
              "
              class="toolbar-panel__progress-eta"
            >
              ~{{ estimatedTimeLeft }}s
            </span>
          </div>
          <div
            class="toolbar-panel__progress-score"
            :class="{ 'toolbar-panel__progress-score--wow': scoreWow }"
          >
            <Trophy
              :size="16"
              class="toolbar-panel__score-icon"
              :class="{ 'toolbar-panel__score-icon--bounce': scoreWow }"
            />
            <span>{{ generationProgress.bestScore.toFixed(1) }}</span>
          </div>
        </div>
        <ZenProgress
          :model-value="progressPercent"
          :height="4"
          :aria-label="t('toolbar.generating')"
        />
      </div>
    </ZenExpandTransition>

    <div class="toolbar-panel__secondary">
      <ZenTooltip
        v-if="!hasCoarsePointer"
        :text="previousTooltip"
        position="bottom"
      >
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

      <ZenTooltip
        v-if="!hasCoarsePointer"
        :text="nextTooltip"
        position="bottom"
      >
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

    <div class="toolbar-panel__navigation">
      <SwipeHint
        v-if="isTouchDevice"
        @prev="navigateBack"
        @next="navigateForward"
      />

      <div v-if="historyLength > 0" class="toolbar-panel__history">
        <span class="sr-only">
          {{
            t('toolbar.historyPosition', {
              current: historyPosition,
              total: historyLength,
            })
          }}
        </span>
        <ZenPaginationDots
          :model-value="historyPosition - 1"
          :total="historyLength"
          :clickable="false"
          :aria-label="t('toolbar.historyLabel')"
          item-label="Haiku"
        />
      </div>
    </div>
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
  gap: 1rem;
  width: 100%;
  padding: 1.5rem;
  margin-bottom: var(--gutenku-space-6);

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    animation: header-fade-in 0.5s ease-out 0.2s both;
  }

  &__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--gutenku-zen-primary);
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  &__header-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.025em;
    margin: 0;
  }

  &__header-subtitle {
    font-size: 0.875rem;
    color: var(--gutenku-text-muted);
    margin-top: 0.125rem;
  }

  &__primary {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__secondary {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0;
  }

  &__action-btn.zen-btn {
    aspect-ratio: 1;
    width: 2.5rem !important;
    height: 2.5rem !important;
    min-width: 2.5rem !important;
    min-height: 2.5rem !important;
    padding: 0 !important;
    border-radius: var(--gutenku-radius-md);
    transition: all 0.2s ease;

    &--stagger {
      animation: btn-stagger-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(var(--stagger-index, 0) * 50ms);
      opacity: 0;
    }

    &:hover:not(:disabled) {
      background: color-mix(
        in oklch,
        var(--gutenku-zen-primary) 10%,
        transparent
      );
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

    &--stop {
      background: var(--gutenku-error, #ef4444) !important;
      border-color: var(--gutenku-error, #ef4444) !important;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  &__config {
    width: 100%;
    padding: 0.5rem 0 1rem;
  }

  &__config-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  &__config-icon {
    color: var(--gutenku-zen-primary);
    margin-right: 0.5rem;
    opacity: 0.8;
  }

  &__config-label {
    flex: 1;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
  }

  &__config-value {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    background: color-mix(
      in oklch,
      var(--gutenku-theme-primary-oklch) 10%,
      transparent
    );
    border: 1px solid
      color-mix(in oklch, var(--gutenku-theme-primary-oklch) 25%, transparent);
    border-radius: var(--gutenku-radius-sm);
    color: var(--gutenku-zen-primary);
    min-width: 2.5rem;
    text-align: center;
    transition: all 0.2s ease;
  }

  &__progress {
    width: 100%;
    padding: 0.5rem 0 1rem;
  }

  &__progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  &__progress-info {
    display: flex;
    align-items: baseline;
    gap: 0.25rem 0.5rem;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;
  }

  &__progress-label {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gutenku-text-muted);
  }

  &__progress-count {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--gutenku-text-primary);
  }

  &__progress-eta {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    white-space: nowrap;
  }

  &__progress-score {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.9rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    background: color-mix(
      in oklch,
      var(--gutenku-theme-primary-oklch) 12%,
      transparent
    );
    border-radius: var(--gutenku-radius-sm);
    color: var(--gutenku-zen-primary);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &--wow {
      transform: scale(1.15);
      background: color-mix(
        in oklch,
        var(--gutenku-theme-primary-oklch) 30%,
        transparent
      );
      box-shadow:
        0 0 12px
          color-mix(
            in oklch,
            var(--gutenku-theme-primary-oklch) 40%,
            transparent
          ),
        0 0 24px
          color-mix(
            in oklch,
            var(--gutenku-theme-primary-oklch) 20%,
            transparent
          );
    }
  }

  &__score-icon {
    flex-shrink: 0;

    &--bounce {
      animation: trophy-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  &__celebration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
    z-index: 10;
  }

  &__shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in oklch, var(--gutenku-zen-primary) 20%, transparent) 50%,
      transparent 100%
    );
    animation: shimmer-sweep 1s ease-out forwards;
  }

  &__presets {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  &__ink-separator {
    height: 1px;
    margin: 0.75rem 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }

  &__preset {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    border: none;
    border-radius: var(--gutenku-radius-sm);
    background: transparent;
    color: var(--gutenku-text-muted);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;

    // Subtle ink dot indicator
    &::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      width: 3px;
      height: 3px;
      background: var(--gutenku-zen-primary);
      border-radius: 50%;
      transform: translateX(-50%) scale(0);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover {
      color: var(--gutenku-zen-primary);
      transform: translateY(-1px);
    }

    &--active {
      background: color-mix(
        in oklch,
        var(--gutenku-zen-primary) 15%,
        transparent
      );
      color: var(--gutenku-zen-primary);
      font-weight: 700;

      &::before {
        transform: translateX(-50%) scale(1);
      }
    }
  }

  &__dev-section {
    background: color-mix(in oklch, var(--gutenku-zen-primary) 5%, transparent);
    border: 1px dashed
      color-mix(in oklch, var(--gutenku-zen-primary) 20%, transparent);
    border-radius: var(--gutenku-radius-md);
    overflow: hidden;
  }

  &__dev-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: color-mix(
        in oklch,
        var(--gutenku-zen-primary) 8%,
        transparent
      );
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: -2px;
    }
  }

  &__dev-badge {
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.15rem 0.4rem;
    background: color-mix(
      in oklch,
      var(--gutenku-zen-primary) 20%,
      transparent
    );
    color: var(--gutenku-zen-primary);
    border-radius: var(--gutenku-radius-sm);
  }

  &__dev-title {
    flex: 1;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--gutenku-text-muted);
    text-align: left;
  }

  &__dev-chevron {
    color: var(--gutenku-text-muted);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dev-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-top: 1px dashed
      color-mix(in oklch, var(--gutenku-zen-primary) 15%, transparent);
  }

  &__dev-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__dev-iterations {
    margin-bottom: 0;
  }

  &__dev-iterations-label {
    flex: 1;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
  }

  &__dev-separator {
    height: 1px;
    margin: 0.75rem 0;
    background: color-mix(
      in oklch,
      var(--gutenku-zen-primary) 15%,
      transparent
    );
  }

  &__dev-icon {
    color: var(--gutenku-zen-primary);
    opacity: 0.7;
    flex-shrink: 0;
  }

  &__navigation {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}

@keyframes generate-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0
      color-mix(in oklch, var(--gutenku-zen-primary) 40%, transparent);
  }
  50% {
    transform: scale(1.01);
    box-shadow: 0 0 0 6px transparent;
  }
}

@keyframes header-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode for header
[data-theme='dark'] .toolbar-panel {
  &__header-icon {
    color: var(--gutenku-zen-accent);
  }

  &__header-title {
    color: var(--gutenku-text-primary);
  }

  &__header-subtitle {
    color: var(--gutenku-text-muted);
  }

  &__dev-section {
    background: color-mix(in oklch, var(--gutenku-zen-accent) 8%, transparent);
    border-color: color-mix(
      in oklch,
      var(--gutenku-zen-accent) 25%,
      transparent
    );
  }

  &__dev-header:hover {
    background: color-mix(in oklch, var(--gutenku-zen-accent) 12%, transparent);
  }

  &__dev-badge {
    background: color-mix(in oklch, var(--gutenku-zen-accent) 25%, transparent);
    color: var(--gutenku-zen-accent);
  }

  &__dev-content {
    border-top-color: color-mix(
      in oklch,
      var(--gutenku-zen-accent) 20%,
      transparent
    );
  }

  &__dev-icon {
    color: var(--gutenku-zen-accent);
  }

  &__dev-separator {
    background: color-mix(in oklch, var(--gutenku-zen-accent) 20%, transparent);
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

@keyframes trophy-bounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.3) rotate(-8deg);
  }
  50% {
    transform: scale(1.2) rotate(8deg);
  }
  75% {
    transform: scale(1.1) rotate(-4deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes shimmer-sweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
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
      min-height: 2.75rem !important;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .toolbar-panel {
    &__header {
      animation: none;
      opacity: 1;
    }

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

    &__preset {
      transition: none;

      &:hover {
        transform: none;
      }

      &::before {
        transition: none;
      }
    }

    &__shimmer {
      animation: none;
    }

    &__celebration {
      display: none;
    }

    &__dev-header {
      transition: none;
    }

    &__dev-chevron {
      transition: none;
    }
  }
}
</style>
