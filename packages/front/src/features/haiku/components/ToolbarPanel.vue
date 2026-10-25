<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaQuery } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import {
  Check,
  Copy,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Feather,
  Repeat,
  Sparkles,
  Square,
  Ruler,
} from '@/core/components/icons/ink';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useClipboard } from '@/core/composables/clipboard';
import { useShare } from '@/core/composables/share';
import { useImageDownload } from '@/core/composables/image-download';
import { useToast } from '@/core/composables/toast';
import {
  useLongPress,
  useTouchGestures,
} from '@/core/composables/touch-gestures';
import { useKeyboardShortcuts } from '@/features/haiku/composables/keyboard-shortcuts';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenSlider from '@/core/components/ui/ZenSlider.vue';
import AiKeyPanel from '@/features/haiku/components/AiKeyPanel.vue';
import {
  bestScoreLabel,
  etaLabel,
} from '@/features/haiku/composables/progress-readout';
import ZenExpandTransition from '@/core/components/ui/ZenExpandTransition.vue';
import ZenProgress from '@/core/components/ui/ZenProgress.vue';

const isDev = import.meta.env.DEV;
const devOptionsExpanded = ref(false);

const { t } = useI18n();
const { success, error } = useToast();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const generateBtnRef = ref<HTMLElement | null>(null);

const haikuStore = useHaikuStore();
const { fetchNewHaiku, goBack, goForward, stopGeneration } = haikuStore;
const {
  haiku,
  loading,
  firstLoaded,
  optionIterations,
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

// Options and progress take turns in one slot. Crafting holds the slot at the
// height it had, so the panel (and everything under it) never jumps while the
// reader watches the poem; it lets go once the options are back.
const SLOT_RELEASE_MS = 400;
const slotRef = useTemplateRef<HTMLElement>('slotRef');
const slotHold = ref<number | null>(null);
let slotRelease: ReturnType<typeof setTimeout> | undefined;

watch(isGenerating, (generating) => {
  clearTimeout(slotRelease);

  if (generating) {
    iterationTimes.value = [];
    lastIterationTime.value = Date.now();
    slotHold.value = slotRef.value?.offsetHeight || null;

    return;
  }

  slotRelease = setTimeout(() => {
    slotHold.value = null;
  }, SLOT_RELEASE_MS);
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

async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) {
    return;
  }

  // Success is confirmed inline: the key turns to a check and says "Copied"
  const copySuccess = await copy(haiku.value.verses.join('\n'));

  if (!copySuccess) {
    error(t('toolbar.copyError'));
  }
}

async function shareHaiku(): Promise<void> {
  if (!haiku.value) {
    return;
  }

  // Same inline confirmation as copy: no second voice in a toast
  await share(haiku.value);
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
    class="toolbar-panel toolbar-panel--card toolbar-container"
  >
    <!-- Who this card is: the crafter, in two quiet lines -->
    <div class="toolbar-panel__header">
      <Feather
        :size="24"
        class="toolbar-panel__header-icon"
        aria-hidden="true"
      />
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
          <!-- Busy keeps the icon and width: only the label changes, the
               site-wide quill carries the loading signal -->
          <ZenButton
            :disabled="loading && !isGenerating"
            :aria-busy="loading || undefined"
            class="toolbar-panel__button toolbar-panel__button--generate"
            :class="{
              'toolbar-panel__button--busy': loading && !isGenerating,
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

          <!-- Long press: an ink rule fills under the key until it fires -->
          <span
            v-if="isTouchDevice && isLongPressing && !isGenerating"
            class="long-press-progress"
            :style="{ transform: `scaleX(${longPressProgress / 100})` }"
            aria-hidden="true"
          />
        </span>
      </ZenTooltip>
    </div>

    <!-- Options and progress take turns in one slot (see slotHold) -->
    <div
      ref="slotRef"
      class="toolbar-panel__slot"
      :style="slotHold ? { minHeight: `${slotHold}px` } : undefined"
    >
      <!-- Hidden, not removed, while crafting: what the reader opened stays open -->
      <Transition name="slot-turn">
        <div
          v-if="firstLoaded"
          v-show="!isGenerating"
          class="toolbar-panel__config"
        >
          <div v-if="isDev" class="toolbar-panel__dev-section">
            <!-- Collapsible Header -->
            <button
              class="toolbar-panel__dev-header"
              type="button"
              :aria-expanded="devOptionsExpanded"
              aria-controls="dev-options-content"
              @click="devOptionsExpanded = !devOptionsExpanded"
            >
              <Ruler
                :size="14"
                class="toolbar-panel__dev-lead"
                aria-hidden="true"
              />
              <span class="toolbar-panel__dev-title">Developer options</span>
              <ChevronDown
                :size="14"
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
                <div
                  class="toolbar-panel__presets"
                  role="group"
                  :aria-label="t('toolbar.iterationPresets')"
                >
                  <button
                    type="button"
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
              </div>
            </ZenExpandTransition>
          </div>

          <!-- AI, on the visitor's own OpenAI key (the server's in dev) -->
          <AiKeyPanel />
        </div>
      </Transition>

      <!-- Progress display (visible during generation) -->
      <Transition name="slot-turn">
        <div v-if="isGenerating" class="toolbar-panel__progress">
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
                  etaLabel(estimatedTimeLeft) && !generationProgress.stopReason
                "
                class="toolbar-panel__progress-eta"
              >
                {{ etaLabel(estimatedTimeLeft) }}
              </span>
            </div>
            <div
              v-if="bestScoreLabel(generationProgress.bestScore) !== null"
              class="toolbar-panel__progress-score"
            >
              {{
                t('toolbar.bestScore', {
                  score: bestScoreLabel(generationProgress.bestScore),
                })
              }}
            </div>
          </div>
          <ZenProgress
            :model-value="progressPercent"
            :height="4"
            :aria-label="t('toolbar.generating')"
          />
        </div>
      </Transition>
    </div>

    <!-- One row: the history arrows either side of what you can do with the
         haiku. Icons only, each named; the tooltip says it with a pointer -->
    <div class="toolbar-panel__secondary">
      <ZenTooltip :text="previousTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__icon-btn toolbar-panel__icon-btn--step"
          :disabled="!canGoBack || loading"
          :aria-label="previousTooltip"
          @click="navigateBack"
        >
          <template #icon-left>
            <ChevronLeft :size="20" />
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip
        :text="copied ? t('toolbar.copiedLabel') : copyTooltip"
        position="bottom"
      >
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__icon-btn"
          :class="{ 'toolbar-panel__icon-btn--done': copied }"
          data-cy="copy-btn"
          :disabled="!haiku?.verses?.length"
          :aria-label="copied ? t('toolbar.copiedLabel') : copyTooltip"
          @click="copyHaiku"
        >
          <template #icon-left>
            <Transition name="ink-swap" mode="out-in">
              <Check v-if="copied" key="done" :size="18" />
              <Copy v-else key="copy" :size="18" />
            </Transition>
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip :text="shareTooltip" position="bottom">
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__icon-btn"
          :class="{ 'toolbar-panel__icon-btn--done': shared }"
          data-cy="share-btn"
          :disabled="!haiku?.verses?.length"
          :aria-label="shareTooltip"
          @click="shareHaiku"
        >
          <template #icon-left>
            <Transition name="ink-swap" mode="out-in">
              <Check v-if="shared" key="done" :size="18" />
              <Share2 v-else key="share" :size="18" />
            </Transition>
          </template>
        </ZenButton>
      </ZenTooltip>

      <ZenTooltip
        :text="haiku?.image ? downloadTooltip : t('toolbar.saveUnavailable')"
        position="bottom"
      >
        <ZenButton
          variant="text"
          size="sm"
          class="toolbar-panel__icon-btn"
          data-cy="download-btn"
          :loading="downloadInProgress"
          :disabled="!haiku?.image || loading"
          :aria-label="
            haiku?.image ? downloadTooltip : t('toolbar.saveUnavailable')
          "
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
          class="toolbar-panel__icon-btn toolbar-panel__icon-btn--step"
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

    <!-- Where the reader is in this visit's haiku, said, not printed -->
    <p v-if="historyLength > 1" class="sr-only" aria-live="polite">
      {{
        t('toolbar.historyPosition', {
          current: historyPosition,
          total: historyLength,
        })
      }}
    </p>
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
      transition: transform var(--gk-dur-press) var(--gk-ease-out);
    }
  }
}

.long-press-progress {
  position: absolute;
  right: 0.375rem;
  bottom: -0.375rem;
  left: 0.375rem;
  height: 2px;
  background: var(--gk-ink);
  transform-origin: left center;
  pointer-events: none;
}

.toolbar-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.25rem 1rem;
  font-family: var(--gk-font);

  // The tooltip trigger is inline by default: stretch it so the craft key
  // keeps one width whatever its label says
  &__primary {
    width: 100%;

    > :deep(.zen-tooltip-trigger) {
      display: block;
      width: 100%;
    }
  }

  // Done reads in ink with its check: the action has happened
  &__icon-btn--done.zen-btn {
    color: var(--gk-ink);
  }

  &__button.zen-btn {
    width: 100%;
    min-height: 2.875rem;

    // Busy: stays a calm indigo key (not the faded disabled look)
    &--busy:disabled {
      opacity: 0.8;
      cursor: wait;
    }

    // Stop is a quieter ghost key: it ends the work, it is not a warning
    &--stop {
      background: transparent !important;
      color: var(--gk-ink) !important;
      box-shadow: inset 0 0 0 1.5px var(--gk-ink) !important;
    }
  }

  // The crafter names itself: a feather, the title, a quiet line under it
  &__header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1rem;
  }

  &__header-icon {
    flex-shrink: 0;
    color: var(--gk-indigo);
  }

  &__header-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  &__header-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--gk-ink);
  }

  &__header-subtitle {
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--gk-ink-soft);
  }

  // One row of icons, the arrows at either end
  &__secondary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.5rem;
  }

  &__icon-btn.zen-btn {
    width: 2.75rem !important;
    min-width: 2.75rem !important;
    height: 2.75rem !important;
    padding: 0 !important;
    color: var(--gk-indigo);
    background: transparent !important;
    border-radius: var(--gk-radius-control);
    transition:
      color var(--gk-dur-fast) var(--gk-ease-out),
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(:disabled) {
        background: color-mix(
          in oklch,
          var(--gk-indigo) 8%,
          transparent
        ) !important;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:disabled {
      color: var(--gk-ink-soft);
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  // The arrows step through history: a shade quieter than the actions
  &__icon-btn--step.zen-btn {
    color: var(--gk-ink-soft);
  }

  // One cell for both: whichever is shown sits there, the other fades out
  // in place on top of it
  &__slot {
    display: grid;
    // The panel's width, never its content's: an open form must not push the
    // column past the card's edge
    grid-template-columns: minmax(0, 1fr);

    > * {
      grid-area: 1 / 1;
      min-width: 0;
    }
  }

  &__config {
    width: 100%;
    padding: 0.5rem 0 1rem;
  }

  // A read-out, not a field: no rule under it
  &__config-value {
    min-width: 2ch;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--gk-ink);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  &__progress {
    width: 100%;
    padding: 0.5rem 0 1rem;
  }

  &__progress-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
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
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--gk-ink-soft);
  }

  &__progress-count {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--gk-ink);
    font-variant-numeric: tabular-nums;
  }

  &__progress-eta {
    font-size: 0.75rem;
    color: var(--gk-ink-soft);
    white-space: nowrap;
  }

  // A labelled readout on the Quality Score's scale, not a bare decimal
  &__progress-score {
    font-size: 0.875rem;
    line-height: 1;
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  // Presets: typewritten ruled tabs, like the haiku tabs; the chosen one is
  // underlined in ink, the others are indigo because they act
  &__presets {
    display: flex;
    justify-content: space-between;
    margin: -0.25rem -0.5rem 0;
  }

  &__preset {
    position: relative;
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0 0.5rem;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--gk-indigo);
    background: transparent;
    border: 0;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    // The rule is drawn under the figure only, scaled in from its centre
    &::after {
      content: '';
      position: absolute;
      inset: auto 0.75rem 0.5rem;
      height: 1.5px;
      background: currentcolor;
      transform: scaleX(0);
      transition: transform var(--gk-dur-fast) var(--gk-ease-out);
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(&--active)::after {
        transform: scaleX(0.6);
        opacity: 0.4;
      }
    }

    &:active:not(&--active) {
      transform: scale(0.96);
    }

    &--active {
      font-weight: 700;
      color: var(--gk-ink);
      cursor: default;

      &::after {
        transform: scaleX(1);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: -2px;
      border-radius: var(--gk-radius-control);
    }
  }

  &__dev-section {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // A quiet inline disclosure: icon, words, chevron, nothing stretched
  &__dev-header {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2.75rem;
    margin: 0 auto;
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--gk-ink-soft);
    background: transparent;
    border: none;
    border-radius: var(--gk-radius-control);
    cursor: pointer;
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: var(--gk-ink);
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__dev-lead {
    opacity: 0.8;
  }

  &__dev-title {
    font-weight: 400;
  }

  &__dev-chevron {
    color: currentColor;
    transition: transform var(--gk-dur-fast) var(--gk-ease-out);

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dev-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    // Printed on the card itself: no tinted leaf, one faint rule above
    margin-top: 0.25rem;
    padding: 0.875rem 0 0.25rem;
    border-top: var(--gk-rule-faint);
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
    font-size: 0.8125rem;
    color: var(--gk-ink);
  }

  &__dev-icon {
    color: var(--gk-ink-soft);
    flex-shrink: 0;
  }
}

@container toolbar (max-width: 600px) {
  .toolbar-panel {
    &__button.zen-btn {
      min-height: 3rem;
    }
  }
}

// Icon swap on copy/share: the check settles in, the glyph steps aside
.ink-swap-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    transform var(--gk-dur-fast) var(--gk-ease-out);
}

.ink-swap-leave-active {
  transition: opacity 100ms var(--gk-ease-out);
}

.ink-swap-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.ink-swap-leave-to {
  opacity: 0;
}

// Options and progress hand over in place: a short crossfade, no height
.slot-turn-enter-active,
.slot-turn-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.slot-turn-enter-from,
.slot-turn-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ink-swap-enter-active {
    transition: opacity 120ms ease;
  }

  .ink-swap-enter-from {
    transform: none;
  }

  .toolbar-panel {
    &__icon-btn.zen-btn,
    &__preset,
    &__dev-header,
    &__dev-chevron {
      transition: none;
    }

    &__icon-btn.zen-btn:active:not(:disabled) {
      transform: none;
    }
  }

  .generate-btn-wrapper.is-pressing .toolbar-panel__button--generate {
    transform: none;
  }

  .long-press-progress {
    display: none;
  }
}
</style>
