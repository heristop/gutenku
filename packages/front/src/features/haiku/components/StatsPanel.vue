<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { BookOpenText } from '@/core/components/icons/ink';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { useCountUp } from '@/features/haiku/composables/count-up';
import ZenCard from '@/core/components/ui/ZenCard.vue';
import ZenAccordion from '@/core/components/ui/ZenAccordion.vue';

const { t } = useI18n();

const store = useHaikuStore();
const { stats, loading } = storeToRefs(store);

const topBooks = computed(() => {
  const entries = Object.entries(stats.value.bookCounts || {}) as [
    string,
    number,
  ][];
  entries.sort((a, b) => b[1] - a[1]);

  return entries.slice(0, 3);
});

const expanded = ref(true);

// Figures read at rest and count up (≤400ms) only when a new haiku moves them
const { value: dailyViews } = useCountUp(() => stats.value.dailyHaikuViews);
const { value: booksBrowsed } = useCountUp(() => stats.value.booksBrowsed);
const { value: haikusForged } = useCountUp(() => stats.value.haikusGenerated);
const { value: avgSeconds } = useCountUp(() => store.avgExecutionTime, {
  decimals: 2,
});

// No timed generation yet: the cell stays away rather than print a dash
const hasAvgTime = computed(() => store.avgExecutionTime > 0);
const avgTimeLabel = computed(() => `${avgSeconds.value.toFixed(2)}s`);

// Ranks set like the Sources list on the same page
const RANKS = ['i', 'ii', 'iii'];
</script>

<template>
  <ZenCard
    variant="panel"
    :loading="loading"
    :aria-label="t('stats.ariaLabel')"
    class="stats-panel stats-panel--card stats-panel-container"
  >
    <ZenAccordion
      v-model="expanded"
      :icon="BookOpenText"
      :title="t('stats.title')"
      storage-key="statsPanel-expanded"
      :default-expanded="true"
    >
      <div class="stats-panel__content">
        <div class="stats-panel__inner">
          <div class="stats-panel__metrics-grid">
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.dailyViews') }}
              </div>
              <div class="stats-panel__metric-value">{{ dailyViews }}</div>
            </div>
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.booksBrowsed') }}
              </div>
              <div class="stats-panel__metric-value">{{ booksBrowsed }}</div>
            </div>
            <div class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.haikuForged') }}
              </div>
              <div class="stats-panel__metric-value">{{ haikusForged }}</div>
            </div>
            <div v-if="hasAvgTime" class="stats-panel__metric">
              <div class="stats-panel__metric-label">
                {{ t('stats.metrics.avgTime') }}
              </div>
              <div class="stats-panel__metric-value">{{ avgTimeLabel }}</div>
            </div>
          </div>
        </div>

        <div class="stats-panel__books-section">
          <h3 class="stats-panel__books-header">{{ t('stats.topBooks') }}</h3>
          <ol v-if="topBooks.length" class="stats-panel__books-list">
            <li
              v-for="([name, count], idx) in topBooks"
              :key="name"
              class="stats-panel__book"
            >
              <span class="stats-panel__book-rank" aria-hidden="true">{{
                RANKS[idx]
              }}</span>
              <span class="stats-panel__book-title" :title="name">{{
                name
              }}</span>
              <span class="stats-panel__book-count">
                {{ t('stats.times', { count }, count) }}
              </span>
            </li>
          </ol>
          <p v-else class="stats-panel__empty-state">
            {{ t('stats.emptyState') }}
          </p>
        </div>
      </div>
    </ZenAccordion>
  </ZenCard>
</template>

<style scoped lang="scss">
.stats-panel {
  position: relative;
  padding: 1.25rem;

  &__content {
    padding-top: 0.5rem;
  }

  // The figures sit on the card itself: groups are parted by ma, not frames
  &__inner {
    background: transparent;
    border: 0;
    padding: 0;
    margin-block: 0.5rem 1rem;
  }

  // A ledger: one figure per line, label left, number right, the same
  // rhythm as the books list below; three or four figures never leave a gap
  &__metrics-grid {
    display: grid;
    gap: 0.375rem;
  }

  &__metric {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  &__metric-label {
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--gk-ink-soft);
  }

  &__metric-value {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: var(--gk-ink);
    font-variant-numeric: tabular-nums;
  }

  &__books-section {
    padding-top: 1rem;
    border-top: var(--gk-rule-faint);
  }

  &__books-header {
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.4;
    margin: 0 0 0.5rem;
    color: var(--gk-ink);
  }

  &__books-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // A plain ruled list, numbered like the Sources beside the poem
  &__book {
    display: grid;
    grid-template-columns: 2em minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  &__book-rank {
    font-weight: 700;
    color: var(--gk-ink);
  }

  &__book-count {
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__book-title {
    color: var(--gk-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__empty-state {
    margin: 0;
    padding: 0.75rem 0;
    text-align: center;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);
  }
}
</style>
