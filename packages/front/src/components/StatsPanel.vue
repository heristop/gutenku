<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';

const store = useHaikuStore();
const { stats } = storeToRefs(store);
const avgTime = computed(() => store.avgExecutionTime.toFixed(2));
const progress = computed(() => {
  const total = Math.max(stats.value.haikusGenerated, 1);
  return Math.min(100, Math.round((stats.value.cachedHaikus / total) * 100));
});

const topBooks = computed(() => {
  const entries = Object.entries(stats.value.bookCounts || {});
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3);
});

// Collapsible functionality
const expanded = ref(true);

const toggleStats = () => {
  expanded.value = !expanded.value;
  localStorage.setItem('statsPanel-expanded', expanded.value.toString());
};

onMounted(() => {
  const savedState = localStorage.getItem('statsPanel-expanded');
  if (savedState !== null) {
    expanded.value = savedState === 'true';
  }
});
</script>

<template>
  <v-card
    class="gutenku-card stats-panel stats-panel--card pa-5 mb-4 w-100"
    rounded
  >
    <div
      class="stats-panel__header d-flex align-center mb-2"
      @click="toggleStats"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @keydown.enter="toggleStats"
      @keydown.space="toggleStats"
    >
      <v-icon
        size="large"
        color="primary"
        class="stats-panel__icon stats-panel__icon--main mr-2"
      >
        mdi-book-open-page-variant
      </v-icon>
      <div class="stats-panel__header-content flex-grow-1">
        <div class="stats-panel__title text-subtitle-1">
          Your Zen Journey
        </div>
        <div class="stats-panel__subtitle text-body-2 text-medium-emphasis">
          Reading the wind of words
        </div>
      </div>
      <v-icon
        color="primary"
        class="stats-panel__toggle-icon"
        :class="{ 'stats-panel__toggle-icon--rotated': !expanded }"
      >
        mdi-chevron-up
      </v-icon>
    </div>

    <v-expand-transition>
      <div
        v-show="expanded"
        class="stats-panel__content"
      >
        <div class="stats-panel__inner gutenku-book-page pa-3 mb-2">
          <v-row dense>
            <v-col
              cols="6"
              class="text-center"
            >
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                Haiku forged
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
              >
                {{ stats.haikusGenerated }}
              </div>
            </v-col>
            <v-col
              cols="6"
              class="text-center"
            >
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                Books browsed
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
              >
                {{ stats.booksBrowsed }}
              </div>
            </v-col>
            <v-col
              cols="6"
              class="text-center mt-2"
            >
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                From cache
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
              >
                {{ stats.cachedHaikus }}
              </div>
            </v-col>
            <v-col
              cols="6"
              class="text-center mt-2"
            >
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                Avg time
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
              >
                {{ avgTime }}s
              </div>
            </v-col>
          </v-row>
        </div>

        <div
          class="stats-panel__progress-wrapper mb-1 d-flex align-center justify-space-between"
        >
          <div
            class="stats-panel__progress-label text-caption text-medium-emphasis"
          >
            Calm waters (cache usage)
          </div>
          <div class="stats-panel__progress-percentage text-caption">
            {{ progress }}%
          </div>
        </div>
        <v-progress-linear
          :model-value="progress"
          color="primary"
          rounded
          height="6"
          class="stats-panel__progress-bar"
        />

        <div class="stats-panel__books-section mt-2">
          <div
            class="stats-panel__books-header text-subtitle-2 mb-2 d-flex align-center"
          >
            <v-icon
              size="small"
              class="stats-panel__books-icon mr-2"
              color="primary"
            >
              mdi-star-circle
            </v-icon>
            <span class="stats-panel__books-title">Top books inspiring your haiku</span>
          </div>
          <v-row dense>
            <v-col
              v-for="([name, count], idx) in topBooks"
              :key="name"
              cols="12"
            >
              <div
                class="stats-panel__book d-flex align-center justify-space-between"
              >
                <div class="stats-panel__book-info d-flex align-center">
                  <v-chip
                    class="stats-panel__book-rank mr-2"
                    color="accent"
                    variant="elevated"
                    size="small"
                  >
                    #{{ idx + 1 }}
                  </v-chip>
                  <span class="stats-panel__book-title">{{ name }}</span>
                </div>
                <div
                  class="stats-panel__book-count text-caption text-medium-emphasis"
                >
                  {{ count }} time{{ count > 1 ? 's' : '' }}
                </div>
              </div>
            </v-col>
            <v-col
              v-if="topBooks.length === 0"
              cols="12"
              class="stats-panel__empty-state text-center text-medium-emphasis text-caption"
            >
              Awaiting your first poems...
            </v-col>
          </v-row>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped lang="scss">
// ====================================
// STATS PANEL - BEM STRUCTURE
// ====================================

.stats-panel {
  position: relative;

  // Modifiers
  &--card {
    // Inherits from global gutenku-card styles
  }

  // Elements
  &__header {
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
    // Uses Vuetify utility classes
  }

  &__icon {
    // Icon styles

    &--main {
      // Main stats icon styling
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

  &__metric-label {
    // Metric label styles
  }

  &__metric-value {
    // Metric value styles
  }

  &__progress-wrapper {
    // Progress section container
  }

  &__progress-label {
    // Progress label styles
  }

  &__progress-percentage {
    // Progress percentage display
  }

  &__progress-bar {
    // Progress bar styles
  }

  &__books-section {
    // Books section container
  }

  &__books-header {
    // Books section header
  }

  &__books-icon {
    // Books section icon
  }

  &__books-title {
    // Books section title
  }

  &__book {
    padding: 4px 0;

    // Book modifiers can be added here if needed
  }

  &__book-info {
    // Book info container
  }

  &__book-rank {
    // Book ranking chip
  }

  &__book-title {
    font-family: 'JMH Typewriter', monospace !important;
    font-size: 0.8rem; /* smaller than text-body-2 */
    line-height: 1.2;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.2px;
  }

  &__book-count {
    // Book usage count
  }

  &__empty-state {
    // Empty state message
  }
}

// Enhanced dark mode fix - comprehensive text visibility with maximum specificity
[data-theme='dark'] .stats-panel {
  // Fix title text that appears black with !important for override
  &__title {
    color: var(--gutenku-text-primary) !important;
  }

  &__books-title {
    color: var(--gutenku-text-primary) !important;
  }

  &__book-title {
    color: var(--gutenku-text-primary) !important;
  }

  &__metric-value {
    color: var(--gutenku-text-primary) !important;
  }

  // Fix subtitle and secondary text with !important
  &__subtitle {
    color: var(--gutenku-text-muted) !important;
  }

  &__metric-label {
    color: var(--gutenku-text-muted) !important;
  }

  &__progress-label {
    color: var(--gutenku-text-muted) !important;
  }

  &__book-count {
    color: var(--gutenku-text-muted) !important;
  }

  &__empty-state {
    color: var(--gutenku-text-muted) !important;
  }

  &__progress-percentage {
    color: var(--gutenku-text-secondary) !important;
  }

  // Fix Vuetify utility classes with maximum specificity
  .text-subtitle-1 {
    color: var(--gutenku-text-primary) !important;
  }

  .text-subtitle-2 {
    color: var(--gutenku-text-primary) !important;
  }

  .text-body-2 {
    color: var(--gutenku-text-muted) !important;
  }

  .text-caption {
    color: var(--gutenku-text-muted) !important;
  }

  .text-medium-emphasis {
    color: var(--gutenku-text-muted) !important;
  }

  // Fix combined utility classes with higher specificity using :deep()
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
  .stats-panel {
    &--card {
      padding: 1.25rem !important;
    }

    &__content {
      padding-top: 1rem;
    }

    &__inner {
      padding: 1rem !important;
    }

    &__title {
      font-size: 0.9rem;
    }

    &__book-title {
      font-size: 0.75rem;
    }
  }

  // Dark mode responsive adjustments
  [data-theme='dark'] .stats-panel {
    &__inner {
      background: rgba(26, 22, 17, 0.8);
      border: 1px solid rgba(155, 182, 180, 0.3);
    }
  }
}
</style>
