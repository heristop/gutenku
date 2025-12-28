<script setup lang="ts">
import { computed, ref, watch, useTemplateRef, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { BookOpenText, ChevronUp, Star } from 'lucide-vue-next';
import { useHaikuStore } from '@/store/haiku';
import { useExpandedState } from '@/composables/local-storage';
import { useInView } from '@/composables/in-view';
import ZenCard from '@/components/ui/ZenCard.vue';

const { t } = useI18n();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const statsContentRef = useTemplateRef<HTMLElement>('statsContentRef');
const { isInView } = useInView(cardRef, { delay: 300 });

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

const { value: expanded, toggle: toggleStats } = useExpandedState('statsPanel-expanded', true);

const animatedHaikus = ref(0);
const animatedCached = ref(0);
const animatedBooks = ref(0);
const animatedTime = ref(0);
const animatedProgress = ref(0);
const hasAnimated = ref(false);

// Pulse states for value updates
const pulsingHaikus = ref(false);
const pulsingBooks = ref(false);
const pulsingCached = ref(false);
const pulsingTime = ref(false);

function triggerPulse(pulseRef: typeof pulsingHaikus) {
  pulseRef.value = true;
  setTimeout(() => {
    pulseRef.value = false;
  }, 400);
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function animateValue(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void,
) {
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = start + (end - start) * easedProgress;

    callback(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function triggerAnimations() {
  if (hasAnimated.value) {return;}
  hasAnimated.value = true;

  setTimeout(() => {
    animateValue(0, stats.value.haikusGenerated, 800, (v) => {
      animatedHaikus.value = Math.round(v);
    });
  }, 100);

  setTimeout(() => {
    animateValue(0, stats.value.booksBrowsed, 800, (v) => {
      animatedBooks.value = Math.round(v);
    });
  }, 200);

  setTimeout(() => {
    animateValue(0, stats.value.cachedHaikus, 800, (v) => {
      animatedCached.value = Math.round(v);
    });
  }, 300);

  setTimeout(() => {
    animateValue(0, Number.parseFloat(avgTime.value), 800, (v) => {
      animatedTime.value = v;
    });
  }, 400);

  setTimeout(() => {
    animateValue(0, progress.value, 600, (v) => {
      animatedProgress.value = v;
    });
  }, 500);
}

watch(
  expanded,
  (isExpanded) => {
    if (isExpanded) {
      triggerAnimations();
      nextTick(() => {
        const firstFocusable = statsContentRef.value?.querySelector<HTMLElement>(
          '[tabindex]:not([tabindex="-1"]), button, a',
        );
        firstFocusable?.focus();
      });
    }
  },
  { immediate: true },
);

watch(
  () => stats.value.haikusGenerated,
  (val, oldVal) => {
    if (hasAnimated.value) {
      animatedHaikus.value = val;
      if (val !== oldVal) {triggerPulse(pulsingHaikus);}
    }
  },
);
watch(
  () => stats.value.booksBrowsed,
  (val, oldVal) => {
    if (hasAnimated.value) {
      animatedBooks.value = val;
      if (val !== oldVal) {triggerPulse(pulsingBooks);}
    }
  },
);
watch(
  () => stats.value.cachedHaikus,
  (val, oldVal) => {
    if (hasAnimated.value) {
      animatedCached.value = val;
      if (val !== oldVal) {triggerPulse(pulsingCached);}
    }
  },
);
watch(avgTime, (val, oldVal) => {
  if (hasAnimated.value) {
    animatedTime.value = Number.parseFloat(val);
    if (val !== oldVal) {triggerPulse(pulsingTime);}
  }
});
watch(progress, (val) => {
  if (hasAnimated.value) {animatedProgress.value = val;}
});
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="panel"
    :aria-label="t('stats.ariaLabel')"
    class="stats-panel stats-panel--card stats-panel-container pa-5 mb-4 animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <button
      type="button"
      class="stats-panel__header d-flex align-center mb-2"
      :aria-expanded="expanded"
      aria-controls="stats-panel-content"
      :aria-label="t('stats.ariaLabel')"
      @click="toggleStats"
    >
      <BookOpenText
        :size="28"
        class="stats-panel__icon stats-panel__icon--main mr-2 text-primary"
      />
      <div class="stats-panel__header-content flex-grow-1">
        <div class="stats-panel__title text-subtitle-1">
          {{ t('stats.title') }}
        </div>
        <div class="stats-panel__subtitle text-body-2 text-medium-emphasis">
          {{ t('stats.subtitle') }}
        </div>
      </div>
      <ChevronUp
        :size="24"
        class="stats-panel__toggle-icon text-primary"
        :class="{ 'stats-panel__toggle-icon--rotated': !expanded }"
      />
    </button>

    <v-expand-transition>
      <div
        v-show="expanded"
        ref="statsContentRef"
        id="stats-panel-content"
        class="stats-panel__content"
      >
        <div class="stats-panel__inner gutenku-book-page pa-3 mb-2">
          <v-row dense>
            <v-col cols="6" class="text-center">
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                {{ t('stats.metrics.haikuForged') }}
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
                :class="{ 'stats-panel__metric-value--pulse': pulsingHaikus }"
              >
                {{ animatedHaikus }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center">
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                {{ t('stats.metrics.booksBrowsed') }}
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
                :class="{ 'stats-panel__metric-value--pulse': pulsingBooks }"
              >
                {{ animatedBooks }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center mt-2">
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                {{ t('stats.metrics.fromCache') }}
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
                :class="{ 'stats-panel__metric-value--pulse': pulsingCached }"
              >
                {{ animatedCached }}
              </div>
            </v-col>
            <v-col cols="6" class="text-center mt-2">
              <div
                class="stats-panel__metric-label text-caption text-medium-emphasis"
              >
                {{ t('stats.metrics.avgTime') }}
              </div>
              <div
                class="stats-panel__metric-value text-subtitle-1 font-weight-bold"
                :class="{ 'stats-panel__metric-value--pulse': pulsingTime }"
              >
                {{ animatedTime.toFixed(2) }}s
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
            {{ t('stats.cacheUsage') }}
          </div>
          <div class="stats-panel__progress-percentage text-caption">
            {{ Math.round(animatedProgress) }}%
          </div>
        </div>
        <v-progress-linear
          :model-value="animatedProgress"
          color="primary"
          rounded
          height="6"
          class="stats-panel__progress-bar"
          role="progressbar"
          :aria-valuenow="Math.round(animatedProgress)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="t('stats.cacheUsage')"
        />

        <div class="stats-panel__books-section mt-2">
          <div
            class="stats-panel__books-header text-subtitle-2 mb-2 d-flex align-center"
          >
            <Star
              :size="18"
              class="stats-panel__books-icon mr-2 text-primary"
            />
            <span
              class="stats-panel__books-title"
              >{{ t('stats.topBooks') }}</span
            >
          </div>
          <v-row dense>
            <v-col
              v-for="([name, count], idx) in topBooks"
              :key="name"
              cols="12"
              class="stats-panel__book-item"
              :style="{ '--book-index': idx }"
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
                  {{ t('stats.times', { count }, count) }}
                </div>
              </div>
            </v-col>
            <v-col
              v-if="topBooks.length === 0"
              cols="12"
              class="stats-panel__empty-state text-center text-medium-emphasis text-caption"
            >
              {{ t('stats.emptyState') }}
            </v-col>
          </v-row>
        </div>
      </div>
    </v-expand-transition>
  </ZenCard>
</template>

<style scoped lang="scss">
.stats-panel {
  position: relative;

  &__header {
    // Reset button styles
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    text-align: left;
    width: 100%;

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

  &__metric-value {
    transition: transform 0.2s ease, color 0.2s ease;

    &--pulse {
      animation: value-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  &__book-item {
    animation: book-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(600ms + var(--book-index, 0) * 100ms);
    opacity: 0;
  }

  &__book {
    padding: 4px 0;
  }

  &__book-title {
    font-family: 'JMH Typewriter', monospace !important;
    font-size: 0.8rem;
    line-height: 1.2;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.2px;
  }
}

@keyframes value-pulse {
  0% {
    transform: scale(1);
    color: inherit;
  }
  50% {
    transform: scale(1.1);
    color: oklch(0.65 0.18 145);
  }
  100% {
    transform: scale(1);
    color: inherit;
  }
}

@keyframes book-slide-in {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-panel {
    &__metric-value--pulse {
      animation: none;
    }

    &__book-item {
      animation: none;
      opacity: 1;
    }
  }
}

[data-theme='dark'] .stats-panel {
  &__title,
  &__books-title,
  &__book-title,
  &__metric-value {
    color: var(--gutenku-text-primary);
  }

  &__subtitle,
  &__metric-label,
  &__progress-label,
  &__book-count,
  &__empty-state {
    color: var(--gutenku-text-muted);
  }

  &__progress-percentage {
    color: var(--gutenku-text-secondary);
  }

  &__progress-bar {
    :deep(.v-progress-linear__determinate) {
      background: linear-gradient(
        90deg,
        rgb(var(--v-theme-primary)) 0%,
        rgb(var(--v-theme-secondary)) 100%
      );
    }
  }
}

@media (max-width: 768px) {
  .stats-panel {
    &--card {
      padding: 1.25rem !important;
      margin-bottom: 1.5rem !important;
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

  [data-theme='dark'] .stats-panel {
    &__inner {
      background: oklch(0.12 0.02 60 / 0.8);
      border: 1px solid oklch(0.72 0.04 178 / 0.3);
    }
  }
}
</style>
