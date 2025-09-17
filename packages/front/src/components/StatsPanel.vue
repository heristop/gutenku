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
  <v-card class="gutenku-card stats-card pa-5 mb-4 w-100" rounded>
    <div
      class="d-flex align-center mb-2 stats-header"
      @click="toggleStats"
      role="button"
      tabindex="0"
      :aria-expanded="expanded"
      @keydown.enter="toggleStats"
      @keydown.space="toggleStats"
    >
      <v-icon size="large" color="primary" class="mr-2"
        >mdi-book-open-page-variant</v-icon
      >
      <div class="flex-grow-1">
        <div class="text-subtitle-1 gutenku-stats__title">Your Zen Journey</div>
        <div class="text-body-2 text-medium-emphasis">
          Reading the wind of words
        </div>
      </div>
      <v-icon
        color="primary"
        class="stats-toggle-icon"
        :class="{ rotated: !expanded }"
      >
        mdi-chevron-up
      </v-icon>
    </div>

    <v-expand-transition>
      <div v-show="expanded" class="stats-content">
        <div class="gutenku-book-page stats-compact pa-3 mb-2">
          <v-row dense>
            <v-col cols="6" class="text-center">
              <div class="text-caption text-medium-emphasis">Haiku forged</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ stats.haikusGenerated }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center">
              <div class="text-caption text-medium-emphasis">Books browsed</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ stats.booksBrowsed }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center mt-2">
              <div class="text-caption text-medium-emphasis">From cache</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ stats.cachedHaikus }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center mt-2">
              <div class="text-caption text-medium-emphasis">Avg time</div>
              <div class="text-subtitle-1 font-weight-bold">{{ avgTime }}s</div>
            </v-col>
          </v-row>
        </div>

        <div class="mb-1 d-flex align-center justify-space-between">
          <div class="text-caption text-medium-emphasis">
            Calm waters (cache usage)
          </div>
          <div class="text-caption">{{ progress }}%</div>
        </div>
        <v-progress-linear
          :model-value="progress"
          color="primary"
          rounded
          height="6"
        />

        <div class="mt-2">
          <div class="text-subtitle-2 mb-2 d-flex align-center">
            <v-icon size="small" class="mr-2" color="primary"
              >mdi-star-circle</v-icon
            >
            Top books inspiring your haiku
          </div>
          <v-row dense>
            <v-col
              v-for="([name, count], idx) in topBooks"
              :key="name"
              cols="12"
            >
              <div
                class="d-flex align-center justify-space-between stats-top-book"
              >
                <div class="d-flex align-center">
                  <v-chip
                    class="mr-2"
                    color="accent"
                    variant="elevated"
                    size="small"
                    >#{{ idx + 1 }}</v-chip
                  >
                  <span class="stats-top-book__title">{{ name }}</span>
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ count }} time{{ count > 1 ? 's' : '' }}
                </div>
              </div>
            </v-col>
            <v-col
              v-if="topBooks.length === 0"
              cols="12"
              class="text-center text-medium-emphasis text-caption"
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
.stats-card {
  position: relative;
}

.gutenku-stats__title {
  font-family: 'JMH Typewriter', monospace !important;
  letter-spacing: 0.5px;
}

.gutenku-book-page {
  background: var(--gutenku-paper-bg-aged);
  border-radius: 8px;
  box-shadow: var(--gutenku-shadow-book);
  border: 1px solid var(--gutenku-paper-border);
}

.stats-top-book {
  padding: 4px 0;
}

.stats-top-book__title {
  font-family: 'JMH Typewriter', monospace !important;
  font-size: 0.8rem; /* smaller than text-body-2 */
  line-height: 1.2;
  color: var(--gutenku-text-primary);
  letter-spacing: 0.2px;
}

.gutenku-book-page.stats-compact {
  min-height: auto !important;
  padding: 12px !important;
}

.stats-header {
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

.stats-toggle-icon {
  transition: transform 0.2s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.stats-content {
  padding-top: 0.5rem;
}
</style>
