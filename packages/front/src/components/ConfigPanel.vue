<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef, onUnmounted, type Component, type Ref } from 'vue';
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
import ZenTooltip from '@/components/ui/ZenTooltip.vue';
import ZenCard from '@/components/ui/ZenCard.vue';
import ZenButton from '@/components/ui/ZenButton.vue';
import ZenAccordion from '@/components/ui/ZenAccordion.vue';
import ZenSwitch from '@/components/ui/ZenSwitch.vue';
import ZenSlider from '@/components/ui/ZenSlider.vue';
import ZenExpandTransition from '@/components/ui/ZenExpandTransition.vue';

const PULSE_DURATION = 200;

const { t } = useI18n();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
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

const expanded = ref(true);
const { value: showAdvanced, toggle: toggleAdvanced } = useExpandedState('appConfig-advanced', false);

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
    :loading="loading"
    :aria-label="t('config.ariaLabel')"
    class="config-panel config-panel--card config-panel-container pa-5 mb-6 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <h2 class="sr-only">{{ t('config.title') }}</h2>

    <ZenAccordion
      v-model="expanded"
      :icon="SlidersHorizontal"
      :title="t('config.title')"
      :subtitle="t('config.subtitle')"
      storage-key="appConfig-expanded"
      :default-expanded="true"
      :aria-label="t('config.ariaLabel')"
      data-cy="menu-btn"
    >
      <template #actions>
        <ZenTooltip :text="t('config.generateTooltip')" position="top">
          <ZenButton
            variant="text"
            size="sm"
            :disabled="loading"
            :loading="loading"
            class="config-panel__button config-panel__button--generate"
            :aria-label="t('config.generateTooltip')"
            @click="fetchNewHaiku"
          >
            <template #icon-left>
              <Sparkles :size="18" />
            </template>
          </ZenButton>
        </ZenTooltip>
        <ZenTooltip
          :text="t('config.resetTooltip')"
          position="top"
          :disabled="!hasChanges"
        >
          <ZenButton
            variant="text"
            size="sm"
            :disabled="!hasChanges"
            class="config-panel__button config-panel__button--reset"
            :class="{ 'config-panel__button--disabled': !hasChanges }"
            :aria-label="t('config.resetTooltip')"
            @click="resetAdvancedConfig"
          >
            <template #icon-left>
              <RefreshCw :size="18" />
            </template>
          </ZenButton>
        </ZenTooltip>
      </template>

      <div class="config-panel__content">
        <div class="config-panel__inner pa-3 mb-2">
          <!-- AI toggles (dev mode only) -->
          <div v-if="isDev" class="config-panel__dev-section mb-4">
            <div class="config-panel__dev-label mb-2">
              <Bot :size="16" class="text-primary mr-1" />
              <span>Dev Mode</span>
            </div>
            <div class="config-panel__toggle-row">
              <ZenSwitch
                v-model="optionImageAI"
                label="ImageAI Theme"
                size="sm"
              />
            </div>
            <div class="config-panel__toggle-row">
              <ZenSwitch
                v-model="optionUseAI"
                label="AI Description"
                size="sm"
              />
            </div>

            <!-- AI parameters (only when optionUseAI is on) -->
            <ZenExpandTransition>
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
                  <ZenSlider
                    v-model="optionSelectionCount"
                    :min="1"
                    :max="20"
                    :step="1"
                    size="sm"
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
                  <ZenSlider
                    v-model="optionDescriptionTemperature"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    size="sm"
                    aria-label="Temperature"
                    :aria-valuetext="`Temperature: ${optionDescriptionTemperature.toFixed(1)}`"
                  />
                </div>
              </div>
            </ZenExpandTransition>
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
            <ZenSlider
              v-model="optionMinSentimentScore"
              :min="-1"
              :max="0.2"
              :step="0.05"
              size="sm"
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

          <ZenExpandTransition>
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
                <ZenSlider
                  v-model="optionMinMarkovScore"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  size="sm"
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
                  <ZenSlider
                    v-model="optionMinPosScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    size="sm"
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
                  <ZenSlider
                    v-model="optionMinTrigramScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    size="sm"
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
                  <ZenSlider
                    v-model="optionMinTfidfScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    size="sm"
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
                  <ZenSlider
                    v-model="optionMinPhoneticsScore"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    size="sm"
                    :aria-label="t('config.filters.phonetics')"
                    :aria-valuetext="t('config.sliderValue', { label: t('config.filters.phonetics'), value: optionMinPhoneticsScore.toFixed(2) })"
                  />
                </div>
              </template>
            </div>
          </ZenExpandTransition>
        </div>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
.config-panel {
  position: relative;

  &__button.zen-btn {
    transition: all 0.2s ease;
    min-width: 2rem;
    min-height: 2rem;
    padding: 0.25rem;

    &--generate {
      color: var(--gutenku-zen-primary);

      &:hover:not(:disabled):not([aria-disabled='true']) {
        color: var(--gutenku-text-primary);
        transform: scale(1.1);
      }
    }

    &--reset {
      color: var(--gutenku-text-muted);

      &:hover:not(:disabled):not([aria-disabled='true']) {
        color: var(--gutenku-text-primary);
        transform: rotate(180deg);
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

  &__content {
    padding-top: 0.5rem;
  }

  &__inner {
    background: var(--gutenku-paper-bg-aged);
    border-radius: var(--gutenku-radius-sm);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.06);
    border: 1px solid var(--gutenku-paper-border);
    min-height: auto !important;
    padding: 0.75rem 1.25rem !important;
  }

  &__section {
    margin-bottom: 0.75rem;

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
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    color: var(--gutenku-text-primary);
    font-weight: 500;
  }

  &__icon {
    margin-right: 0.625rem;
    flex-shrink: 0;
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
  }
}
</style>
