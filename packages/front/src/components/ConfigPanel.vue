<script lang="ts" setup>
import { computed, ref, watch, useTemplateRef, type Component } from 'vue';
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
} from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useExpandedState } from '@/composables/local-storage';
import { useInView } from '@/composables/in-view';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

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
  loading,
} = storeToRefs(haikuStore);

const { value: expanded, toggle: toggleConfig } = useExpandedState('appConfig-expanded');
const { value: showAdvanced, toggle: toggleAdvanced } = useExpandedState('appConfig-advanced', false);

const sentimentPulse = ref(false);
const markovPulse = ref(false);
const posPulse = ref(false);
const trigramPulse = ref(false);
const tfidfPulse = ref(false);
const phoneticsPulse = ref(false);

watch(optionMinSentimentScore, () => {
  sentimentPulse.value = true;
  setTimeout(() => {
    sentimentPulse.value = false;
  }, 200);
});

watch(optionMinMarkovScore, () => {
  markovPulse.value = true;
  setTimeout(() => {
    markovPulse.value = false;
  }, 200);
});

watch(optionMinPosScore, () => {
  posPulse.value = true;
  setTimeout(() => {
    posPulse.value = false;
  }, 200);
});

watch(optionMinTrigramScore, () => {
  trigramPulse.value = true;
  setTimeout(() => {
    trigramPulse.value = false;
  }, 200);
});

watch(optionMinTfidfScore, () => {
  tfidfPulse.value = true;
  setTimeout(() => {
    tfidfPulse.value = false;
  }, 200);
});

watch(optionMinPhoneticsScore, () => {
  phoneticsPulse.value = true;
  setTimeout(() => {
    phoneticsPulse.value = false;
  }, 200);
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
  <v-card
    ref="cardRef"
    class="gutenku-card config-panel config-panel--card config-panel-container pa-5 mb-4 w-100 animate-in"
    :class="{ 'is-visible': isInView }"
    rounded
  >
    <div
      class="config-panel__header"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      aria-controls="config-panel-content"
      :aria-label="t('config.ariaLabel')"
      data-cy="menu-btn"
      @click="toggleConfig"
      @keydown.enter="toggleConfig"
      @keydown.space.prevent="toggleConfig"
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
    </div>

    <v-expand-transition>
      <div
        v-show="expanded"
        id="config-panel-content"
        class="config-panel__content"
      >
        <div class="config-panel__inner gutenku-book-page pa-3 mb-2">
          <div class="config-panel__section">
            <div class="config-panel__label">
              <component
                :is="sentimentIcon"
                :size="20"
                class="config-panel__icon text-primary"
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
              aria-label="Sentiment score"
              :aria-valuetext="`Sentiment: ${optionMinSentimentScore.toFixed(2)}`"
            />
          </div>

          <ZenTooltip :text="t('config.advancedTooltip')" position="bottom">
            <div
              class="config-panel__advanced-toggle"
              role="button"
              tabindex="0"
              :aria-expanded="showAdvanced"
              @click="toggleAdvanced"
              @keydown.enter="toggleAdvanced"
              @keydown.space.prevent="toggleAdvanced"
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
            </div>
          </ZenTooltip>

          <v-expand-transition>
            <div v-show="showAdvanced">
              <div class="config-panel__section">
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
                  aria-label="Markov chain score"
                  :aria-valuetext="`Markov chain: ${optionMinMarkovScore.toFixed(2)}`"
                />
              </div>

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
                  aria-label="Grammar POS score"
                  :aria-valuetext="`Grammar: ${optionMinPosScore.toFixed(2)}`"
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
                  aria-label="Trigram flow score"
                  :aria-valuetext="`Trigram: ${optionMinTrigramScore.toFixed(2)}`"
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
                  aria-label="TF-IDF word uniqueness score"
                  :aria-valuetext="`Word uniqueness: ${optionMinTfidfScore.toFixed(2)}`"
                />
              </div>

              <div class="config-panel__section config-panel__section--last">
                <div class="config-panel__label">
                  <Volume2 :size="20" class="config-panel__icon text-primary" />
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
                  aria-label="Phonetics alliteration score"
                  :aria-valuetext="`Alliteration: ${optionMinPhoneticsScore.toFixed(2)}`"
                />
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped lang="scss">
.config-panel {
  position: relative;

  &__header {
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
