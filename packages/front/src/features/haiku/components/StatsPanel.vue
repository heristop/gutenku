<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { BookOpenText, Star } from 'lucide-vue-next';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useInView } from '@/features/haiku/composables/in-view';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenChip from '@/core/components/ui/ZenChip.vue';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import ZenAccordion from '@/core/components/ui/ZenAccordion.vue';

const { t } = useI18n();

const cardRef = useTemplateRef<HTMLElement>('cardRef');
const { isInView } = useInView(cardRef, { delay: 300 });

const store = useHaikuStore();
const { stats, loading } = storeToRefs(store);
const avgTime = computed(() => store.avgExecutionTime.toFixed(2));

const topBooks = computed(() => {
  const entries = Object.entries(stats.value.bookCounts || {});
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3);
});

const expanded = ref(true);

const animatedHaikus = ref(0);
const animatedCached = ref(0);
const animatedBooks = ref(0);
const animatedTime = ref(0);
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
}

watch(
  expanded,
  (isExpanded) => {
    if (isExpanded) {
      triggerAnimations();
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
</script>

<template>
  <ZenCard
    ref="cardRef"
    variant="panel"
    :loading="loading"
    :aria-label="t('stats.ariaLabel')"
    class="stats-panel stats-panel--card stats-panel-container animate-in"
    :class="{ 'is-visible': isInView }"
  >
    <ZenAccordion
      v-model="expanded"
      :icon="BookOpenText"
      :title="t('stats.title')"
      :subtitle="t('stats.subtitle')"
      storage-key="statsPanel-expanded"
      :default-expanded="true"
      :aria-label="t('stats.ariaLabel')"
    >
      <div class="stats-panel__content">
        <div class="stats-panel__inner">
          <div class="stats-panel__metrics-grid">
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.haikuForged') }}
              </div>
              <div
                class="stats-panel__metric-value"
                :class="{ 'stats-panel__metric-value--pulse': pulsingHaikus }"
              >
                {{ animatedHaikus }}
              </div>
            </div>
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.booksBrowsed') }}
              </div>
              <div
                class="stats-panel__metric-value"
                :class="{ 'stats-panel__metric-value--pulse': pulsingBooks }"
              >
                {{ animatedBooks }}
              </div>
            </div>
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.fromCache') }}
              </div>
              <div
                class="stats-panel__metric-value"
                :class="{ 'stats-panel__metric-value--pulse': pulsingCached }"
              >
                {{ animatedCached }}
              </div>
            </div>
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.avgTime') }}
              </div>
              <div
                class="stats-panel__metric-value"
                :class="{ 'stats-panel__metric-value--pulse': pulsingTime }"
              >
                {{ animatedTime.toFixed(2) }}s
              </div>
            </div>
          </div>
        </div>

        <div class="stats-panel__books-section">
          <div class="stats-panel__books-header">
            <Star :size="18" class="stats-panel__books-icon" />
            <span
              class="stats-panel__books-title"
              >{{ t('stats.topBooks') }}</span
            >
          </div>
          <div class="stats-panel__books-list">
            <div
              v-for="([name, count], idx) in topBooks"
              :key="name"
              class="stats-panel__book-item"
              :style="{ '--book-index': idx }"
            >
              <div class="stats-panel__book">
                <div class="stats-panel__book-info">
                  <ZenTooltip :text="name" position="top">
                    <ZenChip
                      class="stats-panel__book-rank"
                      variant="accent"
                      size="sm"
                      :ariaLabel="t('stats.bookRank', { rank: idx + 1 })"
                    >
                      #{{ idx + 1 }}
                    </ZenChip>
                  </ZenTooltip>
                  <span class="stats-panel__book-title">{{ name }}</span>
                </div>
                <div class="stats-panel__book-count">
                  {{ t('stats.times', { count }, count) }}
                </div>
              </div>
            </div>
            <div v-if="topBooks.length === 0" class="stats-panel__empty-state">
              {{ t('stats.emptyState') }}
            </div>
          </div>
        </div>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
.stats-panel {
  position: relative;
  padding: var(--gutenku-space-5);
  margin-bottom: var(--gutenku-space-4);

  &__content {
    padding-top: 0.5rem;
  }

  &__inner {
    background: var(--gutenku-paper-bg-aged);
    border-radius: var(--gutenku-radius-sm);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.06);
    border: 1px solid var(--gutenku-paper-border);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }

  &__metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 0;
  }

  &__metric {
    text-align: center;
  }

  &__metric-label {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
  }

  &__metric-value {
    font-size: 1rem;
    font-weight: 700;
    color: var(--gutenku-text-primary);
    transition: transform 0.2s ease, color 0.2s ease;

    &--pulse {
      animation: value-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }

  &__books-section {
    margin-top: 0.5rem;
  }

  &__books-header {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--gutenku-text-primary);
  }

  &__books-icon {
    color: var(--gutenku-zen-primary);
    margin-right: 0.5rem;
  }

  &__books-list {
    display: flex;
    flex-direction: column;
  }

  &__book-item {
    animation: book-slide-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(600ms + var(--book-index, 0) * 100ms);
    opacity: 0;
  }

  &__book {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  &__book-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  &__book-rank {
    margin-right: 0.5rem;
  }

  &__book-count {
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
    white-space: nowrap;
    margin-left: 0.5rem;
    flex-shrink: 0;
  }

  &__book-title {
    display: block;
    font-family: 'JMH Typewriter', monospace !important;
    font-size: 0.8rem;
    line-height: 1.2;
    color: var(--gutenku-text-primary);
    letter-spacing: 0.2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__empty-state {
    text-align: center;
    font-size: 0.75rem;
    color: var(--gutenku-text-muted);
  }
}

@keyframes value-pulse {
  0% {
    transform: scale(1);
    color: inherit;
  }
  50% {
    transform: scale(1.1);
    color: var(--gutenku-zen-secondary);
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
  &__book-count,
  &__empty-state {
    color: var(--gutenku-text-muted);
  }
}

@media (min-width: 769px) {
  .stats-panel {
    &--card {
      margin-bottom: 1.5rem !important;
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
