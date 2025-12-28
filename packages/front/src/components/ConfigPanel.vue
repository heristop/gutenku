<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef, nextTick, onUnmounted, onMounted, type Component, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Smile,
  Frown,
  Meh,
  Link,
  BookText,
  Workflow,
  Hash,
  Volume2,
  Settings2,
  Bot,
  ListFilter,
  Thermometer,
} from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useExpandedState } from '@/composables/local-storage';
import { useInView } from '@/composables/in-view';
import { useTouchGestures } from '@/composables/touch-gestures';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';
import ZenCard from '@/components/ui/ZenCard.vue';

const PULSE_DURATION = 200;

const { t } = useI18n();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const configContentRef = useTemplateRef<HTMLElement>('configContentRef');
const { isInView } = useInView(cardRef, { delay: 200 });

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const {
  optionMinSentimentScore,
  optionMinMarkovScore,
  optionMinPosScore,
  optionMinTrigramScore,
  optionMinTfidfScore,
  optionMinPhoneticsScore,
  optionUseAI,
  optionImageAI,
  optionSelectionCount,
  optionDescriptionTemperature,
  loading,
} = storeToRefs(haikuStore);

const isDev = import.meta.env.DEV;

const { value: expanded, toggle: toggleConfig } = useExpandedState('appConfig-expanded');
const { value: showAdvanced, toggle: toggleAdvanced } = useExpandedState('appConfig-advanced', false);

// Swipe gestures for touch devices
const headerRef = ref<HTMLElement | null>(null);
const { isTouchDevice, isSwiping: isHeaderSwiping } = useTouchGestures(headerRef, {
  threshold: 40,
  onSwipeDown: () => {
    if (!expanded.value) {
      expanded.value = true;
    }
  },
  onSwipeUp: () => {
    if (expanded.value) {
      expanded.value = false;
    }
  },
  vibrate: true,
  vibrationPattern: [10],
});

// Swipe on advanced toggle
const advancedRef = ref<HTMLElement | null>(null);
useTouchGestures(advancedRef, {
  threshold: 40,
  onSwipeDown: () => {
    if (!showAdvanced.value) {
      showAdvanced.value = true;
    }
  },
  onSwipeUp: () => {
    if (showAdvanced.value) {
      showAdvanced.value = false;
    }
  },
  vibrate: true,
  vibrationPattern: [10],
});

watch(expanded, (isExpanded) => {
  if (isExpanded) {
    nextTick(() => {
      const firstFocusable = configContentRef.value?.querySelector<HTMLElement>(
        'input, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    });
  }
});

const pulseTimeouts: ReturnType<typeof setTimeout>[] = [];

function createPulseWatcher(source: Ref<number>) {
  const pulse = ref(false);
  watch(source, () => {
    pulse.value = true;
    const timeout = setTimeout(() => {
      pulse.value = false;
    }, PULSE_DURATION);
    pulseTimeouts.push(timeout);
  });
  return pulse;
}

const sentimentPulse = createPulseWatcher(optionMinSentimentScore);
const markovPulse = createPulseWatcher(optionMinMarkovScore);
const posPulse = createPulseWatcher(optionMinPosScore);
const trigramPulse = createPulseWatcher(optionMinTrigramScore);
const tfidfPulse = createPulseWatcher(optionMinTfidfScore);
const phoneticsPulse = createPulseWatcher(optionMinPhoneticsScore);

onUnmounted(() => {
  pulseTimeouts.forEach(clearTimeout);
});

const DEFAULT_CONFIG = {
  optionMinSentimentScore: 0.1,
  optionMinMarkovScore: 0.1,
  optionMinPosScore: 0,
  optionMinTrigramScore: 0,
  optionMinTfidfScore: 0,
  optionMinPhoneticsScore: 0,
} as const;

const hasChanges = computed(() => {
  return (
    optionMinSentimentScore.value !== DEFAULT_CONFIG.optionMinSentimentScore ||
    optionMinMarkovScore.value !== DEFAULT_CONFIG.optionMinMarkovScore ||
    optionMinPosScore.value !== DEFAULT_CONFIG.optionMinPosScore ||
    optionMinTrigramScore.value !== DEFAULT_CONFIG.optionMinTrigramScore ||
    optionMinTfidfScore.value !== DEFAULT_CONFIG.optionMinTfidfScore ||
    optionMinPhoneticsScore.value !== DEFAULT_CONFIG.optionMinPhoneticsScore
  );
});

const sentimentIcon = computed<Component>(() => {
  if (optionMinSentimentScore.value > 0) {
    return Smile;
  }
  if (optionMinSentimentScore.value < 0) {
    return Frown;
  }
  return Meh;
});

function resetAdvancedConfig(): void {
  optionMinSentimentScore.value = DEFAULT_CONFIG.optionMinSentimentScore;
  optionMinMarkovScore.value = DEFAULT_CONFIG.optionMinMarkovScore;
  optionMinPosScore.value = DEFAULT_CONFIG.optionMinPosScore;
  optionMinTrigramScore.value = DEFAULT_CONFIG.optionMinTrigramScore;
  optionMinTfidfScore.value = DEFAULT_CONFIG.optionMinTfidfScore;
  optionMinPhoneticsScore.value = DEFAULT_CONFIG.optionMinPhoneticsScore;
}
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="panel"
    :aria-label="t('config.ariaLabel')"
    class="config-panel config-panel--card config-panel-container pa-5 mb-6 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <h2 class="sr-only">{{ t('config.title') }}</h2>

    <button
      ref="headerRef"
      type="button"
      class="config-panel__header"
      :class="{ 'is-swiping': isHeaderSwiping }"
      :aria-expanded="expanded"
      aria-controls="config-panel-content"
      :aria-label="t('config.ariaLabel')"
      data-cy="menu-btn"
      @click="toggleConfig"
    >
      <SlidersHorizontal
        :size="28"
        class="config-panel__icon config-panel__icon--main mr-2 text-primary"
      />
      <div class="config-panel__header-content flex-grow-1">
        <div class="config-panel__title text-subtitle-1">
          {{ t('config.title') }}
        </div>
        <div
          class="config-panel__subtitle d-flex align-center justify-space-between text-body-2 text-medium-emphasis"
        >
          <span
            class="config-panel__subtitle-text"
            >{{ t('config.subtitle') }}</span
          >
          <div class="config-panel__actions d-flex align-center">
            <ZenTooltip :text="t('config.generateTooltip')" position="top">
              <v-btn
                :disabled="loading"
                :loading="loading"
                class="config-panel__button config-panel__button--generate mr-1"
                variant="text"
                size="x-small"
                @click.stop="fetchNewHaiku"
              >
                <Sparkles :size="18" />
              </v-btn>
            </ZenTooltip>
            <ZenTooltip
              :text="t('config.resetTooltip')"
              position="top"
              :disabled="!hasChanges"
            >
              <v-btn
                :disabled="!hasChanges"
                class="config-panel__button config-panel__button--reset ml-1"
                :class="{ 'config-panel__button--disabled': !hasChanges }"
                variant="text"
                size="x-small"
                @click.stop="resetAdvancedConfig"
              >
                <RefreshCw :size="18" />
              </v-btn>
            </ZenTooltip>
          </div>
        </div>
      </div>
      <ChevronUp
        :size="24"
        class="config-panel__toggle-icon text-primary"
        :class="{ 'config-panel__toggle-icon--rotated': !expanded }"
      />
    </button>

    <v-expand-transition>
      <div
        v-show="expanded"
        ref="configContentRef"
        id="config-panel-content"
        class="config-panel__content"
      >
        <div class="config-panel__inner gutenku-book-page pa-3 mb-2">
          <!-- OpenAI toggles (dev mode only) -->
          <div v-if="isDev" class="config-panel__dev-section mb-4">
            <div class="config-panel__dev-label mb-2">
              <Bot :size="16" class="text-primary mr-1" />
              <span>Dev Mode</span>
            </div>
            <div class="config-panel__toggle-row">
              <v-switch
                v-model="optionUseAI"
                hide-details
                density="compact"
                color="primary"
                label="OpenAI Description"
                class="config-panel__switch"
              />
            </div>
            <div class="config-panel__toggle-row">
              <v-switch
                v-model="optionImageAI"
                hide-details
                density="compact"
                color="primary"
                label="OpenAI Image Theme"
                class="config-panel__switch"
              />
            </div>

            <!-- OpenAI parameters (only when optionUseAI is on) -->
            <v-expand-transition>
              <div v-if="optionUseAI" class="config-panel__dev-params mt-3">
                <div
                  class="config-panel__section config-panel__section--compact"
                >
                  <div class="config-panel__label">
                    <ListFilter
                      :size="18"
                      class="config-panel__icon text-primary"
                      aria-hidden="true"
                    />
                    <span class="config-panel__label-text">Selection</span>
                    <span
                      class="config-panel__value"
                      >{{ optionSelectionCount }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionSelectionCount"
                    :min="1"
                    :max="20"
                    :step="1"
                    hide-details
                    color="primary"
                    thumb-size="12"
                    class="config-panel__slider config-panel__slider--compact"
                    aria-label="Selection count"
                    :aria-valuetext="`${optionSelectionCount} selections`"
                  />
                </div>

                <div
                  class="config-panel__section config-panel__section--compact config-panel__section--last"
                >
                  <div class="config-panel__label">
                    <Thermometer
                      :size="18"
                      class="config-panel__icon text-primary"
                      aria-hidden="true"
                    />
                    <span class="config-panel__label-text">Temperature</span>
                    <span
                      class="config-panel__value"
                      >{{ optionDescriptionTemperature.toFixed(1) }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionDescriptionTemperature"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    hide-details
                    color="primary"
                    thumb-size="12"
                    class="config-panel__slider config-panel__slider--compact"
                    aria-label="Temperature"
                    :aria-valuetext="`Temperature: ${optionDescriptionTemperature.toFixed(1)}`"
                  />
                </div>
              </div>
            </v-expand-transition>
          </div>

          <div class="config-panel__section">
            <div class="config-panel__label">
              <component
                :is="sentimentIcon"
                :size="20"
                class="config-panel__icon text-primary"
                aria-hidden="true"
              />
              <span
                class="config-panel__label-text"
                >{{ t('config.filters.sentiment') }}</span
              >
              <span
                class="config-panel__value"
                :class="{ 'config-panel__value--pulse': sentimentPulse }"
                >{{
                optionMinSentimentScore.toFixed(2)
                }}</span
              >
            </div>
            <v-slider
              v-model="optionMinSentimentScore"
              :min="-1"
              :max="0.2"
              :step="0.05"
              hide-details
              color="primary"
              thumb-size="14"
              class="config-panel__slider"
              :aria-label="t('config.filters.sentiment')"
              :aria-valuetext="t('config.sliderValue', { label: t('config.filters.sentiment'), value: optionMinSentimentScore.toFixed(2) })"
            />
          </div>

          <div class="config-panel__advanced-wrapper">
            <ZenTooltip :text="t('config.advancedTooltip')" position="bottom">
              <button
                ref="advancedRef"
                type="button"
                class="config-panel__advanced-toggle"
                :aria-expanded="showAdvanced"
                @click="toggleAdvanced"
              >
                <Settings2 :size="16" class="config-panel__advanced-icon" />
                <span class="config-panel__advanced-text">
                  {{ showAdvanced ? t('config.hideAdvanced') : t('config.showAdvanced') }}
                </span>
                <component
                  :is="showAdvanced ? ChevronUp : ChevronDown"
                  :size="16"
                  class="config-panel__advanced-chevron"
                />
              </button>
            </ZenTooltip>
          </div>

          <v-expand-transition>
            <div v-show="showAdvanced">
              <div
                class="config-panel__section"
                :class="{ 'config-panel__section--last': !isDev }"
              >
                <div class="config-panel__label">
                  <Link :size="20" class="config-panel__icon text-primary" />
                  <span
                    class="config-panel__label-text"
                    >{{ t('config.filters.markov') }}</span
                  >
                  <span
                    class="config-panel__value"
                    :class="{ 'config-panel__value--pulse': markovPulse }"
                    >{{
                optionMinMarkovScore.toFixed(2)
                    }}</span
                  >
                </div>
                <v-slider
                  v-model="optionMinMarkovScore"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  hide-details
                  color="primary"
                  thumb-size="14"
                  class="config-panel__slider"
                  :aria-label="t('config.filters.markov')"
                  :aria-valuetext="t('config.sliderValue', { label: t('config.filters.markov'), value: optionMinMarkovScore.toFixed(2) })"
                />
              </div>

              <template v-if="isDev">
                <div class="config-panel__section">
                  <div class="config-panel__label">
                    <BookText
                      :size="20"
                      class="config-panel__icon text-primary"
                    />
                    <span
                      class="config-panel__label-text"
                      >{{ t('config.filters.grammar') }}</span
                    >
                    <span
                      class="config-panel__value"
                      :class="{ 'config-panel__value--pulse': posPulse }"
                      >{{
                  optionMinPosScore.toFixed(2)
                      }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionMinPosScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    hide-details
                    color="primary"
                    thumb-size="14"
                    class="config-panel__slider"
                    :aria-label="t('config.filters.grammar')"
                    :aria-valuetext="t('config.sliderValue', { label: t('config.filters.grammar'), value: optionMinPosScore.toFixed(2) })"
                  />
                </div>

                <div class="config-panel__section">
                  <div class="config-panel__label">
                    <Workflow
                      :size="20"
                      class="config-panel__icon text-primary"
                    />
                    <span
                      class="config-panel__label-text"
                      >{{ t('config.filters.trigram') }}</span
                    >
                    <span
                      class="config-panel__value"
                      :class="{ 'config-panel__value--pulse': trigramPulse }"
                      >{{
                  optionMinTrigramScore.toFixed(2)
                      }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionMinTrigramScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    hide-details
                    color="primary"
                    thumb-size="14"
                    class="config-panel__slider"
                    :aria-label="t('config.filters.trigram')"
                    :aria-valuetext="t('config.sliderValue', { label: t('config.filters.trigram'), value: optionMinTrigramScore.toFixed(2) })"
                  />
                </div>

                <div class="config-panel__section">
                  <div class="config-panel__label">
                    <Hash :size="20" class="config-panel__icon text-primary" />
                    <span
                      class="config-panel__label-text"
                      >{{ t('config.filters.tfidf') }}</span
                    >
                    <span
                      class="config-panel__value"
                      :class="{ 'config-panel__value--pulse': tfidfPulse }"
                      >{{
                  optionMinTfidfScore.toFixed(2)
                      }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionMinTfidfScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    hide-details
                    color="primary"
                    thumb-size="14"
                    class="config-panel__slider"
                    :aria-label="t('config.filters.tfidf')"
                    :aria-valuetext="t('config.sliderValue', { label: t('config.filters.tfidf'), value: optionMinTfidfScore.toFixed(2) })"
                  />
                </div>

                <div class="config-panel__section config-panel__section--last">
                  <div class="config-panel__label">
                    <Volume2
                      :size="20"
                      class="config-panel__icon text-primary"
                    />
                    <span
                      class="config-panel__label-text"
                      >{{ t('config.filters.phonetics') }}</span
                    >
                    <span
                      class="config-panel__value"
                      :class="{ 'config-panel__value--pulse': phoneticsPulse }"
                      >{{
                      optionMinPhoneticsScore.toFixed(2)
                      }}</span
                    >
                  </div>
                  <v-slider
                    v-model="optionMinPhoneticsScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    hide-details
                    color="primary"
                    thumb-size="14"
                    class="config-panel__slider"
                    :aria-label="t('config.filters.phonetics')"
                    :aria-valuetext="t('config.sliderValue', { label: t('config.filters.phonetics'), value: optionMinPhoneticsScore.toFixed(2) })"
                  />
                </div>
              </template>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-expand-transition>
  </ZenCard>
</template>

<style scoped lang="scss">
.config-panel {
  position: relative;

  &__header {
    // Reset button styles
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-align: left;
    width: 100%;

    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: var(--gutenku-radius-sm);

    &:hover {
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 5%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }

    // Swipe feedback
    &.is-swiping {
      transform: scale(0.98);
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 8%, transparent);
    }
  }

  &__title {
    font-family: 'JMH Typewriter', monospace !important;
    letter-spacing: 0.5px;
  }

  &__button {
    transition: all 0.2s ease;

    &--generate {
      color: rgb(var(--v-theme-primary));

      &:hover:not(:disabled) {
        color: var(--gutenku-text-primary);
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &:not(:disabled) {
        opacity: 1;
        cursor: pointer;
      }
    }

    &--reset {
      color: var(--gutenku-text-muted);

      &:hover:not(:disabled) {
        color: var(--gutenku-text-primary);
        transform: rotate(180deg);
      }

      &:not(:disabled) {
        opacity: 1;
        cursor: pointer;
      }
    }

    &--disabled {
      opacity: 0.3;
      cursor: not-allowed;

      &:hover {
        transform: none;
        color: var(--gutenku-text-muted);
      }
    }
  }

  &__icon {
    margin-right: 0.75rem;
    font-size: 1.5rem;
    color: rgb(var(--v-theme-primary));
  }

  &__toggle-icon {
    padding: 0.5rem;
    margin: -0.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__content {
    padding-top: 0.5rem;
  }

  &__inner {
    background: var(--gutenku-paper-bg-aged);
    border-radius: var(--gutenku-radius-md);
    box-shadow: var(--gutenku-shadow-book);
    border: 1px solid var(--gutenku-paper-border);
    min-height: auto !important;
    padding: 0.75rem !important;  // 12px
  }

  &__section {
    margin-bottom: 1.5rem;

    &--last {
      margin-bottom: 0;
    }
  }

  &__advanced-wrapper {
    display: flex;
    justify-content: center;
  }

  &__advanced-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin: 0.75rem 0;
    border-radius: var(--gutenku-radius-sm);
    cursor: pointer;
    color: var(--gutenku-text-muted);
    font-size: 0.8rem;
    transition: all 0.2s ease;
    border: 1px dashed var(--gutenku-border-visible);

    &:hover {
      color: var(--gutenku-text-primary);
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 5%, transparent);
      border-color: var(--gutenku-border-visible-hover);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  &__dev-section {
    padding: 0.75rem;
    background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 8%, transparent);
    border: 1px dashed var(--gutenku-zen-primary);
    border-radius: var(--gutenku-radius-sm);
  }

  &__dev-label {
    display: flex;
    align-items: center;
    font-family: 'JMH Typewriter', monospace !important;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gutenku-zen-primary);
  }

  &__toggle-row {
    margin-top: 0.25rem;
  }

  &__dev-params {
    padding-top: 0.75rem;
    border-top: 1px dashed var(--gutenku-border-visible);
  }

  &__section--compact {
    margin-bottom: 0.75rem;

    .config-panel__label {
      margin-bottom: 0.25rem;
      font-size: 0.8rem;
    }

    .config-panel__value {
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
      min-width: 2rem;
    }
  }

  &__slider--compact {
    margin: 0.25rem 0;

    :deep(.v-slider-track) {
      height: 0.35rem;
    }

    :deep(.v-slider-thumb) {
      width: 1rem;
      height: 1rem;
    }

    :deep(.v-slider-thumb__surface) {
      width: 0.85rem;
      height: 0.85rem;
      border-width: 2px;
    }
  }

  &__switch {
    :deep(.v-label) {
      font-family: 'JMH Typewriter', monospace !important;
      font-size: 0.85rem;
      color: var(--gutenku-text-primary);
    }

    :deep(.v-switch__track) {
      opacity: 1;
      background: oklch(0.82 0.015 60);
      border: 1px solid oklch(0.72 0.02 60);
      transition: all 0.25s ease;
      box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.1);
    }

    :deep(.v-switch__thumb) {
      background: linear-gradient(145deg, oklch(0.99 0 0), oklch(0.94 0.01 60));
      box-shadow:
        0 2px 4px oklch(0 0 0 / 0.15),
        0 1px 2px oklch(0 0 0 / 0.1);
      transition: all 0.25s ease;
    }

    &:hover :deep(.v-switch__track) {
      border-color: oklch(0.6 0.03 60);
    }

    &:hover :deep(.v-switch__thumb) {
      box-shadow:
        0 3px 6px oklch(0 0 0 / 0.18),
        0 2px 4px oklch(0 0 0 / 0.12);
    }

    :deep(.v-selection-control--dirty .v-switch__track) {
      background: linear-gradient(90deg, var(--gutenku-zen-secondary), var(--gutenku-zen-primary));
      border: none;
      box-shadow:
        inset 0 1px 2px oklch(0 0 0 / 0.1),
        0 0 8px oklch(0.6 0.1 180 / 0.3);
    }

    :deep(.v-selection-control--dirty .v-switch__thumb) {
      background: linear-gradient(145deg, oklch(1 0 0), oklch(0.96 0.01 60));
      box-shadow:
        0 2px 6px oklch(0 0 0 / 0.2),
        0 0 4px oklch(0.6 0.1 180 / 0.2);
    }

    [data-theme='dark'] & {
      :deep(.v-switch__track) {
        background: oklch(0.35 0.02 60);
        border: 1px solid oklch(0.45 0.03 60);
        box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.3);
      }

      :deep(.v-switch__thumb) {
        background: linear-gradient(145deg, oklch(0.8 0.01 60), oklch(0.7 0.02 60));
        box-shadow:
          0 2px 4px oklch(0 0 0 / 0.3),
          0 1px 2px oklch(0 0 0 / 0.2);
      }

      &:hover :deep(.v-switch__track) {
        border-color: oklch(0.55 0.04 60);
        background: oklch(0.4 0.02 60);
      }

      &:hover :deep(.v-switch__thumb) {
        background: linear-gradient(145deg, oklch(0.85 0.01 60), oklch(0.75 0.02 60));
      }

      :deep(.v-selection-control--dirty .v-switch__track) {
        background: linear-gradient(90deg, var(--gutenku-zen-accent), var(--gutenku-zen-secondary));
        border: none;
        box-shadow:
          inset 0 1px 2px oklch(0 0 0 / 0.2),
          0 0 12px oklch(0.7 0.1 178 / 0.4);
      }

      :deep(.v-selection-control--dirty .v-switch__thumb) {
        background: linear-gradient(145deg, oklch(0.98 0 0), oklch(0.92 0.01 60));
        box-shadow:
          0 2px 6px oklch(0 0 0 / 0.3),
          0 0 6px oklch(0.7 0.1 178 / 0.3);
      }
    }
  }

  &__advanced-icon {
    opacity: 0.7;
  }

  &__advanced-text {
    font-family: 'JMH Typewriter', monospace !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__advanced-chevron {
    opacity: 0.7;
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: var(--gutenku-text-primary);
    font-weight: 500;
  }

  &__label-text {
    flex: 1;
    font-family: 'JMH Typewriter', monospace !important;
    font-weight: 600;
    letter-spacing: 0.025em;
    color: var(--gutenku-text-primary);
  }

  &__value {
    font-family: 'JMH Typewriter', monospace !important;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.3rem 0.5rem;
    background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 10%, transparent);
    border: 1px solid color-mix(in oklch, var(--gutenku-theme-primary-oklch) 30%, transparent);
    border-radius: var(--gutenku-radius-sm);
    min-width: 2.5rem;
    text-align: center;
    color: rgb(var(--v-theme-primary));
    transition: all 0.2s ease;

    &:hover {
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 15%, transparent);
      transform: scale(1.05);
    }

    &--pulse {
      transform: scale(1.15);
      background: color-mix(in oklch, var(--gutenku-theme-primary-oklch) 25%, transparent);
      box-shadow: 0 0 12px color-mix(in oklch, var(--gutenku-theme-primary-oklch) 40%, transparent);
    }
  }

  &__slider {
    margin: 0.5rem 0;

    :deep(.v-slider-thumb__ripple) {
      display: none;
    }

    :deep(.v-slider-track) {
      height: 0.5rem;
      border-radius: var(--gutenku-radius-sm);
    }

    :deep(.v-slider-track__background) {
      background: linear-gradient(
        180deg,
        oklch(0 0 0 / 0.08) 0%,
        oklch(0 0 0 / 0.12) 100%
      );
      border-radius: var(--gutenku-radius-sm);
      box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.1);
    }

    :deep(.v-slider-track__fill) {
      background: linear-gradient(
        90deg,
        var(--gutenku-zen-secondary) 0%,
        var(--gutenku-zen-primary) 100%
      );
      border-radius: var(--gutenku-radius-sm);
      box-shadow:
        0 2px 8px oklch(0.45 0.08 195 / 0.3),
        inset 0 1px 0 oklch(1 0 0 / 0.2);
      transition: box-shadow 0.3s ease;
    }

    :deep(.v-slider-thumb) {
      width: 1.5rem;
      height: 1.5rem;
      background: transparent;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    :deep(.v-slider-thumb:hover) {
      transform: scale(1.1);
    }

    :deep(.v-slider-thumb:active),
    :deep(.v-slider-thumb--focused) {
      transform: scale(1.15);
    }

    :deep(.v-slider-thumb__surface) {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background: linear-gradient(
        145deg,
        var(--gutenku-paper-bg) 0%,
        var(--gutenku-paper-bg-aged) 100%
      );
      border: 3px solid var(--gutenku-zen-primary);
      box-shadow:
        0 2px 8px oklch(0 0 0 / 0.15),
        0 4px 12px oklch(0.45 0.08 195 / 0.2),
        inset 0 1px 2px oklch(1 0 0 / 0.8);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
        background: var(--gutenku-zen-primary);
        transition: all 0.2s ease;
      }
    }

    :deep(.v-slider-thumb:hover .v-slider-thumb__surface) {
      border-color: var(--gutenku-zen-accent);
      box-shadow:
        0 4px 12px oklch(0 0 0 / 0.2),
        0 6px 20px oklch(0.45 0.08 195 / 0.25),
        inset 0 1px 2px oklch(1 0 0 / 0.8);

      &::after {
        background: var(--gutenku-zen-accent);
        transform: translate(-50%, -50%) scale(1.2);
      }
    }

    :deep(.v-slider-thumb:active .v-slider-thumb__surface),
    :deep(.v-slider-thumb--focused .v-slider-thumb__surface) {
      border-color: var(--gutenku-zen-accent);
      box-shadow:
        0 0 0 4px oklch(0.45 0.08 195 / 0.15),
        0 4px 16px oklch(0.45 0.08 195 / 0.3),
        inset 0 1px 2px oklch(1 0 0 / 0.8);

      &::after {
        background: var(--gutenku-zen-accent);
        transform: translate(-50%, -50%) scale(1.3);
      }
    }

    [data-theme='dark'] & {
      :deep(.v-slider-track__background) {
        background: linear-gradient(
          180deg,
          oklch(1 0 0 / 0.08) 0%,
          oklch(1 0 0 / 0.04) 100%
        );
        box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.3);
      }

      :deep(.v-slider-track__fill) {
        background: linear-gradient(
          90deg,
          var(--gutenku-zen-secondary) 0%,
          var(--gutenku-zen-accent) 100%
        );
        box-shadow:
          0 2px 12px oklch(0.72 0.04 178 / 0.4),
          inset 0 1px 0 oklch(1 0 0 / 0.1);
      }

      :deep(.v-slider-thumb__surface) {
        background: linear-gradient(
          145deg,
          var(--gutenku-paper-bg-warm) 0%,
          var(--gutenku-paper-bg) 100%
        );
        border-color: var(--gutenku-zen-secondary);
        box-shadow:
          0 2px 8px oklch(0 0 0 / 0.3),
          0 4px 16px oklch(0.72 0.04 178 / 0.2),
          inset 0 1px 2px oklch(1 0 0 / 0.1);

        &::after {
          background: var(--gutenku-zen-secondary);
        }
      }

      :deep(.v-slider-thumb:hover .v-slider-thumb__surface) {
        border-color: var(--gutenku-zen-accent);
        box-shadow:
          0 4px 16px oklch(0 0 0 / 0.4),
          0 6px 24px oklch(0.72 0.04 178 / 0.3),
          inset 0 1px 2px oklch(1 0 0 / 0.1);

        &::after {
          background: var(--gutenku-zen-accent);
        }
      }

      :deep(.v-slider-thumb:active .v-slider-thumb__surface),
      :deep(.v-slider-thumb--focused .v-slider-thumb__surface) {
        border-color: var(--gutenku-zen-accent);
        box-shadow:
          0 0 0 4px oklch(0.72 0.04 178 / 0.2),
          0 4px 20px oklch(0.72 0.04 178 / 0.4),
          inset 0 1px 2px oklch(1 0 0 / 0.1);

        &::after {
          background: var(--gutenku-zen-accent);
        }
      }
    }
  }
}

[data-theme='dark'] .config-panel {
  &__title,
  &__label,
  &__label-text {
    color: var(--gutenku-text-primary);
  }

  &__subtitle,
  &__subtitle-text {
    color: var(--gutenku-text-muted);
  }
}

@media (max-width: 768px) {
  .config-panel {
    &--card {
      padding: 1.25rem !important;
    }

    &__content {
      padding-top: 1rem;
    }

    &__inner {
      padding: 1rem !important;
    }

    &__label {
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }

    &__icon {
      font-size: 1rem;
      margin-right: 0.5rem;
    }

    &__value {
      font-size: 0.8rem;
      padding: 0.4rem 0.6rem;
      min-width: 2.5rem;
    }

    &__section {
      margin-bottom: 1.5rem;
    }

    &__slider {
      margin: 0.75rem 0;

      :deep(.v-slider-track) {
        height: 0.375rem;
      }

      :deep(.v-slider-thumb) {
        width: 1.25rem;
        height: 1.25rem;
      }

      :deep(.v-slider-thumb__surface) {
        width: 1rem;
        height: 1rem;
        border-width: 2px;

        &::after {
          width: 0.25rem;
          height: 0.25rem;
        }
      }
    }
  }
}
</style>
