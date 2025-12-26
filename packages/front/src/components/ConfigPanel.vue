<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { optionMinSentimentScore, optionMinMarkovScore, loading } =
  storeToRefs(haikuStore);

const expanded = ref(true);

// Define default values
const DEFAULT_CONFIG = {
  optionMinSentimentScore: 0.1,
  optionMinMarkovScore: 0.1,
} as const;

const toggleConfig = () => {
  expanded.value = !expanded.value;
  localStorage.setItem('appConfig-expanded', expanded.value.toString());
};

onMounted(() => {
  const savedState = localStorage.getItem('appConfig-expanded');
  if (savedState !== null) {
    expanded.value = savedState === 'true';
  }
});

// Check if current values differ from defaults
const hasChanges = computed(() => {
  return (
    optionMinSentimentScore.value !== DEFAULT_CONFIG.optionMinSentimentScore ||
    optionMinMarkovScore.value !== DEFAULT_CONFIG.optionMinMarkovScore
  );
});

// Sentiment icon based on value
const sentimentIcon = computed(() => {
  if (optionMinSentimentScore.value > 0) {
    return 'mdi-emoticon-outline';
  }
  if (optionMinSentimentScore.value < 0) {
    return 'mdi-emoticon-sad-outline';
  }
  return 'mdi-emoticon-neutral-outline';
});

// Reset advanced config to defaults
function resetAdvancedConfig(): void {
  optionMinSentimentScore.value = DEFAULT_CONFIG.optionMinSentimentScore;
  optionMinMarkovScore.value = DEFAULT_CONFIG.optionMinMarkovScore;
}
</script>

<template>
  <v-card
    class="gutenku-card config-panel config-panel--card pa-5 mb-4 w-100"
    rounded
  >
    <div
      class="config-panel__header"
      @click="toggleConfig"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @keydown.enter="toggleConfig"
      @keydown.space="toggleConfig"
      data-cy="menu-btn"
    >
      <v-icon
        size="large"
        color="primary"
        class="config-panel__icon config-panel__icon--main mr-2"
      >
        mdi-tune
      </v-icon>
      <div class="config-panel__header-content flex-grow-1">
        <div class="config-panel__title text-subtitle-1">
          Advanced Configuration
        </div>
        <div
          class="config-panel__subtitle d-flex align-center justify-space-between text-body-2 text-medium-emphasis"
        >
          <span class="config-panel__subtitle-text">Fine-tune your haiku generation</span>
          <div class="config-panel__actions d-flex align-center">
            <v-tooltip
              text="Generate with current settings"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click.stop="fetchNewHaiku"
                  :disabled="loading"
                  :loading="loading"
                  class="config-panel__button config-panel__button--generate mr-1"
                  variant="text"
                  size="x-small"
                  icon="mdi-creation"
                />
              </template>
            </v-tooltip>
            <v-tooltip
              text="Reset to defaults"
              location="top"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click.stop="resetAdvancedConfig"
                  :disabled="!hasChanges"
                  class="config-panel__button config-panel__button--reset ml-1"
                  :class="{ 'config-panel__button--disabled': !hasChanges }"
                  variant="text"
                  size="x-small"
                  icon="mdi-refresh"
                />
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
      <v-icon
        color="primary"
        class="config-panel__toggle-icon"
        :class="{ 'config-panel__toggle-icon--rotated': !expanded }"
      >
        mdi-chevron-up
      </v-icon>
    </div>

    <v-expand-transition>
      <div
        v-show="expanded"
        class="config-panel__content"
      >
        <div class="config-panel__inner gutenku-book-page pa-3 mb-2">
          <div class="config-panel__section">
            <div class="config-panel__label">
              <v-icon class="config-panel__icon">
                {{ sentimentIcon }}
              </v-icon>
              <span class="config-panel__label-text">Sentiment</span>
              <span class="config-panel__value">{{
                optionMinSentimentScore.toFixed(2)
              }}</span>
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
            />
          </div>

          <div class="config-panel__section config-panel__section--last">
            <div class="config-panel__label">
              <v-icon class="config-panel__icon">
                mdi-link-variant
              </v-icon>
              <span class="config-panel__label-text">Markov Chain</span>
              <span class="config-panel__value">{{
                optionMinMarkovScore.toFixed(2)
              }}</span>
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
            />
          </div>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped lang="scss">
// ====================================
// CONFIG PANEL - BEM STRUCTURE
// ====================================

.config-panel {
  position: relative;

  // Modifiers
  &--card {
    // Inherits from global gutenku-card styles
  }

  // Elements
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;

    &:hover {
      background: rgba(var(--v-theme-primary), 0.05);
    }

    &:focus {
      outline: 2px solid rgba(var(--v-theme-primary), 0.3);
      outline-offset: 2px;
    }
  }

  &__header-content {
    // Uses flex-grow-1 utility class
  }

  &__title {
    font-family: 'JMH Typewriter', monospace !important;
    letter-spacing: 0.5px;
  }

  &__subtitle {
    // Uses Vuetify utility classes for layout
  }

  &__subtitle-text {
    // Plain text element
  }

  &__actions {
    // Uses d-flex utility classes
  }

  &__button {
    transition: all 0.2s ease;

    // Button modifiers
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

    // Icon modifiers
    &--main {
      // Main config icon styling
    }
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
    border-radius: 8px;
    box-shadow: var(--gutenku-shadow-book);
    border: 1px solid var(--gutenku-paper-border);
    min-height: auto !important;
    padding: 12px !important;
  }

  &__section {
    margin-bottom: 1.5rem;

    &--last {
      margin-bottom: 0;
    }
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
    background: rgba(var(--v-theme-primary), 0.1);
    border: 1px solid rgba(var(--v-theme-primary), 0.3);
    border-radius: 4px;
    min-width: 2.5rem;
    text-align: center;
    color: rgb(var(--v-theme-primary));
    transition: all 0.2s ease;

    &:hover {
      background: rgba(var(--v-theme-primary), 0.15);
      transform: scale(1.05);
    }
  }

  &__slider {
    margin: 0.5rem 0;

    // Light mode track background
    :deep(.v-slider-track__background) {
      background: rgba(0, 0, 0, 0.15);
    }

    :deep(.v-slider-track__fill) {
      background: linear-gradient(
        90deg,
        rgb(var(--v-theme-primary)) 0%,
        rgba(var(--v-theme-primary), 0.8) 100%
      );
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.4);
    }

    :deep(.v-slider-thumb) {
      width: 18px;
      height: 24px;
      background: transparent;
      border-radius: 4px;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :deep(.v-slider-thumb__surface) {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 7px;
      height: 80%;
      border-radius: 3px;
      background: rgb(var(--v-theme-primary));
      box-shadow:
        0 0 0 2px rgba(var(--v-theme-primary), 0.18),
        0 0 6px rgba(var(--v-theme-primary), 0.25);
      animation: caret-blink 1s steps(2, start) infinite;
    }

    :deep(.v-slider-thumb:hover .v-slider-thumb__surface),
    :deep(.v-slider-thumb--focused .v-slider-thumb__surface) {
      width: 8px;
      box-shadow:
        0 0 0 3px rgba(var(--v-theme-primary), 0.25),
        0 0 10px rgba(var(--v-theme-primary), 0.35);
      animation: none;
    }

    :deep(.v-slider-track) {
      height: 5px;
    }

    // Dark mode improvements
    [data-theme='dark'] & {
      :deep(.v-slider-track__background) {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      :deep(.v-slider-track__fill) {
        background: linear-gradient(
          90deg,
          rgba(90, 138, 143, 1) 0%,
          rgba(90, 138, 143, 0.9) 100%
        );
        box-shadow: 0 0 12px rgba(90, 138, 143, 0.6);
      }

      :deep(.v-slider-thumb__surface) {
        background: rgba(90, 138, 143, 1);
        box-shadow:
          0 0 0 2px rgba(90, 138, 143, 0.3),
          0 0 8px rgba(90, 138, 143, 0.4);
      }

      :deep(.v-slider-thumb:hover .v-slider-thumb__surface),
      :deep(.v-slider-thumb--focused .v-slider-thumb__surface) {
        background: rgba(155, 182, 180, 1);
        box-shadow:
          0 0 0 3px rgba(155, 182, 180, 0.4),
          0 0 12px rgba(155, 182, 180, 0.5);
      }
    }
  }
}

// Dark mode text visibility overrides
[data-theme='dark'] .config-panel {
  // Override title text color
  &__title {
    color: var(--gutenku-text-primary) !important;
  }

  &__label {
    color: var(--gutenku-text-primary) !important;
  }

  &__label-text {
    color: var(--gutenku-text-primary) !important;
  }

  // Override subtitle and secondary text
  &__subtitle {
    color: var(--gutenku-text-muted) !important;
  }

  &__subtitle-text {
    color: var(--gutenku-text-muted) !important;
  }

  // Override Vuetify utility classes
  .text-subtitle-1 {
    color: var(--gutenku-text-primary) !important;
  }

  .text-body-2 {
    color: var(--gutenku-text-muted) !important;
  }

  .text-medium-emphasis {
    color: var(--gutenku-text-muted) !important;
  }

  // Override combined utility classes
  :deep(.text-body-2.text-medium-emphasis) {
    color: var(--gutenku-text-muted) !important;
  }

  :deep(.text-caption.text-medium-emphasis) {
    color: var(--gutenku-text-muted) !important;
  }

  :deep(.text-subtitle-1.text-medium-emphasis) {
    color: var(--gutenku-text-muted) !important;
  }

  :deep(.text-subtitle-2.text-medium-emphasis) {
    color: var(--gutenku-text-muted) !important;
  }

  // Nuclear option: fix any remaining text elements
  * {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      &:not(.v-btn):not(.v-chip) {
        color: var(--gutenku-text-primary);
      }
    }
  }

  // Specific element targeting for stubborn text
  span,
  div,
  p {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      &:not(.v-btn__content):not(.v-chip__content) {
        color: var(--gutenku-text-primary);
      }
    }
  }
}

// Responsive improvements using BEM modifiers
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
        height: 4px;
      }

      :deep(.v-slider-thumb) {
        width: 14px;
        height: 20px;
        border-radius: 4px;
      }

      :deep(.v-slider-thumb__surface) {
        width: 7px;
        height: 80%;
      }
    }
  }
}

@keyframes caret-blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
