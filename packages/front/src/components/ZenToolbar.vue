<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

// Store setup
const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const {
  haiku,
  loading,
  firstLoaded,
  optionMinSentimentScore,
  optionMinMarkovScore,
} = storeToRefs(haikuStore);

// Advanced config state
const showAdvancedConfig = ref(false);

// Copy status with error handling
const copyStatus = ref<{ copied: boolean; error: string | null }>({
  copied: false,
  error: null,
});

// Dynamic button label based on auto-cache mode
const buttonLabel = computed<string>(() => {
  if (loading.value) {
    return firstLoaded.value ? 'Generating' : 'Extracting';
  }
  return firstLoaded.value ? 'Generate' : 'Extract';
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

// Haiku generation
async function extractGenerate(): Promise<void> {
  await fetchNewHaiku();
}

// Copy haiku to clipboard
async function copyHaiku(): Promise<void> {
  if (!haiku.value?.verses) return;

  try {
    await navigator.clipboard.writeText(haiku.value.verses.join('\n'));
    copyStatus.value = { copied: true, error: null };
    setTimeout(() => {
      copyStatus.value.copied = false;
    }, 2000);
  } catch (err) {
    copyStatus.value = {
      copied: false,
      error: err instanceof Error ? err.message : 'Failed to copy',
    };
  }
}

// Reset advanced config to defaults
function resetAdvancedConfig(): void {
  optionMinSentimentScore.value = 0.1;
  optionMinMarkovScore.value = 0.1;
}
</script>

<template>
  <div class="gutenku-card mt-2 mt-sm-0 mb-6">
    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- Extract/Generate Button -->
      <v-tooltip :text="`${buttonLabel} a new haiku`" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="extractGenerate"
            :loading="loading"
            :disabled="loading"
            class="zen-btn gutenku-btn gutenku-btn-generate"
            data-cy="fetch-btn"
            variant="outlined"
            size="small"
          >
            <v-icon>{{
              loading ? 'mdi-loading mdi-spin' : 'mdi-creation'
            }}</v-icon>
            <span class="btn-text">{{ buttonLabel }}</span>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Copy Button -->
      <v-tooltip text="Copy haiku to clipboard" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="copyHaiku"
            :class="{ success: copyStatus.copied }"
            class="zen-btn gutenku-btn gutenku-btn-copy"
            data-cy="copy-btn"
            variant="outlined"
            size="small"
            :disabled="!haiku?.verses?.length"
          >
            <v-icon>{{
              copyStatus.copied ? 'mdi-check' : 'mdi-content-copy'
            }}</v-icon>
            <span class="btn-text">{{
              copyStatus.copied ? 'Copied!' : 'Copy'
            }}</span>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Advanced Config Toggle -->
      <v-tooltip text="Advanced configuration" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            @click="showAdvancedConfig = !showAdvancedConfig"
            class="zen-btn gutenku-btn"
            data-cy="menu-btn"
            variant="outlined"
            size="small"
            :class="{ 'config-active': showAdvancedConfig }"
          >
            <v-icon>{{
              showAdvancedConfig ? 'mdi-tune-vertical' : 'mdi-tune'
            }}</v-icon>
            <span class="btn-text">Config</span>
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- Advanced Configuration Panel -->
    <v-expand-transition>
      <div v-show="showAdvancedConfig" class="advanced-config">
        <!-- Config Header with Reset -->
        <div class="config-header">
          <span class="config-title">Advanced Configuration</span>
          <v-tooltip text="Reset to defaults" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                @click="resetAdvancedConfig"
                class="reset-btn"
                variant="text"
                size="small"
                icon="mdi-refresh"
              />
            </template>
          </v-tooltip>
        </div>

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
            track-color="rgba(255,255,255,0.3)"
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
            track-color="rgba(255,255,255,0.3)"
            thumb-size="14"
            class="config-slider"
          />
        </div>
      </div>
    </v-expand-transition>

    <!-- Copy Success Snackbar ---->
    <v-snackbar
      v-model="copyStatus.copied"
      color="primary"
      location="top"
      class="elevation-24 copy-snack"
      timeout="2000"
    >
      <template #default>
        <div class="d-flex align-center">
          <v-icon class="mr-2" data-cy="copy-success-icon">
            mdi-check-circle
          </v-icon>
          <span>Haiku copied to clipboard!</span>
        </div>
      </template>

      <template #actions="{ isActive }">
        <v-btn
          :active="isActive.value"
          icon="mdi-close"
          size="small"
          variant="text"
          @click="copyStatus.copied = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<style lang="scss" scoped>
// Action buttons layout
.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

// Component-specific overrides only
.zen-btn {
  &.v-btn--variant-outlined {
    border-width: 1.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.config-active {
    background-color: rgba(var(--v-theme-primary), 0.15);
    border-color: rgb(var(--v-theme-primary));
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
  }

  &:hover:not(.config-active) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.advanced-config {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  color: #2c2c2c;
  font-weight: 500;
}

.config-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  color: rgb(var(--v-theme-primary));
}

.label-text {
  flex: 1;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: #2c2c2c;
}

.config-value {
  font-family: 'Monaco', 'Consolas', monospace;
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

  :deep(.v-slider-track__background) {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
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

// Smooth transitions for the expand animation
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-expand-transition-enter-from,
.v-expand-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

// Responsive improvements
@media (max-width: 768px) {
  .advanced-config {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .config-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .config-icon {
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  .config-value {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
    min-width: 2.5rem;
  }

  .config-section {
    margin-bottom: 1rem;
  }

  .config-slider {
    margin: 0.25rem 0;

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

/* Note: overlay content is teleported; prefer using the :offset prop */

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
