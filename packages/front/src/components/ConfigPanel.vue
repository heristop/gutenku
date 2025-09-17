<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { optionMinSentimentScore, optionMinMarkovScore, loading } =
  storeToRefs(haikuStore);

const expanded = ref(true);

// Define default values (no hardcoding in functions)
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
  <v-card class="gutenku-card config-card pa-5 mb-4 w-100" rounded>
    <div
      class="d-flex align-center mb-2 config-header"
      @click="toggleConfig"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @keydown.enter="toggleConfig"
      @keydown.space="toggleConfig"
      data-cy="menu-btn"
    >
      <v-icon size="large" color="primary" class="mr-2"> mdi-tune </v-icon>
      <div class="flex-grow-1">
        <div class="text-subtitle-1 gutenku-config__title">
          Advanced Configuration
        </div>
        <div
          class="d-flex align-center justify-space-between text-body-2 text-medium-emphasis"
        >
          <span>Fine-tune your haiku generation</span>
          <div class="d-flex align-center">
            <v-tooltip text="Generate with current settings" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click.stop="fetchNewHaiku"
                  :disabled="loading"
                  :loading="loading"
                  class="generate-btn mr-1"
                  variant="text"
                  size="x-small"
                  icon="mdi-creation"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Reset to defaults" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click.stop="resetAdvancedConfig"
                  :disabled="!hasChanges"
                  class="reset-btn ml-1"
                  variant="text"
                  size="x-small"
                  icon="mdi-refresh"
                  :class="{ 'reset-btn--disabled': !hasChanges }"
                />
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
      <v-icon
        color="primary"
        class="config-toggle-icon"
        :class="{ rotated: !expanded }"
      >
        mdi-chevron-up
      </v-icon>
    </div>

    <v-expand-transition>
      <div v-show="expanded" class="config-content">
        <div class="gutenku-book-page config-compact pa-3 mb-2">
          <div class="config-section">
            <div class="config-label">
              <v-icon class="config-icon">{{ sentimentIcon }}</v-icon>
              <span class="label-text">Sentiment</span>
              <span class="config-value">{{
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
              track-color="rgba(0,0,0,0.2)"
              thumb-size="14"
              class="config-slider"
            />
          </div>

          <div class="config-section">
            <div class="config-label">
              <v-icon class="config-icon">mdi-link-variant</v-icon>
              <span class="label-text">Markov Chain</span>
              <span class="config-value">{{
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
              track-color="rgba(0,0,0,0.2)"
              thumb-size="14"
              class="config-slider"
            />
          </div>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped lang="scss">
.config-card {
  position: relative;
}

.gutenku-config__title {
  font-family: 'JMH Typewriter', monospace !important;
  letter-spacing: 0.5px;
}

.gutenku-book-page {
  background: var(--gutenku-paper-bg-aged);
  border-radius: 8px;
  box-shadow: var(--gutenku-shadow-book);
  border: 1px solid var(--gutenku-paper-border);
}

.gutenku-book-page.config-compact {
  min-height: auto !important;
  padding: 12px !important;
}

.config-header {
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

.config-toggle-icon {
  transition: transform 0.2s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.config-content {
  padding-top: 0.5rem;
}

.config-actions-header {
  display: flex;
  justify-content: flex-end;
}

.generate-btn {
  color: rgb(var(--v-theme-primary));
  transition: all 0.2s ease;

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

.reset-btn {
  color: var(--gutenku-text-muted);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--gutenku-text-primary);
    transform: rotate(180deg);
  }

  &:disabled,
  &.reset-btn--disabled {
    opacity: 0.3;
    cursor: not-allowed;

    &:hover {
      transform: none;
      color: var(--gutenku-text-muted);
    }
  }

  &:not(:disabled) {
    opacity: 1;
    cursor: pointer;
  }
}

.config-section {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.config-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--gutenku-text-primary);
  font-weight: 500;
}

.config-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  color: rgb(var(--v-theme-primary));
}

.label-text {
  flex: 1;
  font-family: 'JMH Typewriter', monospace !important;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: var(--gutenku-text-primary);
}

.config-value {
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

.config-slider {
  margin: 0.5rem 0;

  :deep(.v-slider-track__fill) {
    background: linear-gradient(
      90deg,
      rgb(var(--v-theme-primary)) 0%,
      rgba(var(--v-theme-primary), 0.8) 100%
    );
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.4);
  }

  /* Editor caret-style thumb (thicker, shorter vertical bar) */
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

  :deep(.v-slider-thumb) {
    width: 18px;
    height: 24px;
    border-radius: 4px;
  }
}

// Responsive improvements
@media (max-width: 768px) {
  .config-card {
    padding: 1.25rem !important;
  }

  .config-content {
    padding-top: 1rem;
  }

  .config-actions-header {
    margin-bottom: 1rem;
  }

  .gutenku-book-page.config-compact {
    padding: 1rem !important;
  }

  .config-label {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .config-icon {
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .config-value {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
    min-width: 2.5rem;
  }

  .config-section {
    margin-bottom: 1.5rem;
  }

  .config-slider {
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
