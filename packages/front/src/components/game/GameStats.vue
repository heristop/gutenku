<script lang="ts" setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import ZenModal from '@/components/ui/ZenModal.vue';
import { useGameStore } from '@/store/game';
import { useGlobalStats } from '@/composables/global-stats';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();
const gameStore = useGameStore();
const { stats, winRate } = storeToRefs(gameStore);
const { globalStats, fetchGlobalStats, formatNumber } = useGlobalStats();

watch(
  modelValue,
  (isOpen) => {
    if (isOpen) {
      fetchGlobalStats();
    }
  },
  { immediate: true },
);

const maxDistribution = computed(() => {
  const values = Object.values(stats.value.guessDistribution);
  return Math.max(...values, 1);
});

const globalWinRate = computed(() => {
  if (globalStats.value.totalGamesPlayed === 0) {return 0;}
  return Math.round(
    (globalStats.value.totalGamesWon / globalStats.value.totalGamesPlayed) * 100,
  );
});

function getBarWidth(count: number): string {
  return `${(count / maxDistribution.value) * 100}%`;
}
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :max-width="400"
    title="statistics"
    description="Your GutenGuess game statistics including win rate and guess distribution"
  >
    <h2 class="stats-title gutenku-text-primary mb-4">
      {{ t('game.statistics') }}
    </h2>

    <div class="stats-grid d-flex justify-center ga-4 mb-6">
      <div class="stat-item text-center">
        <div class="stat-value stat-value--split gutenku-text-primary">
          <span class="stat-local">{{ stats.gamesPlayed }}</span>
          <span class="stat-divider">/</span>
          <span
            class="stat-global"
            >{{ formatNumber(globalStats.totalGamesPlayed) }}</span
          >
        </div>
        <div class="stat-label gutenku-text-muted">
          {{ t('game.stats.played') }}
        </div>
      </div>
      <div class="stat-item text-center">
        <div class="stat-value stat-value--split gutenku-text-primary">
          <span class="stat-local">{{ winRate }}%</span>
          <span class="stat-divider">/</span>
          <span class="stat-global">{{ globalWinRate }}%</span>
        </div>
        <div class="stat-label gutenku-text-muted">
          {{ t('game.stats.winRate') }}
        </div>
      </div>
      <div class="stat-item text-center">
        <div class="stat-value gutenku-text-primary">
          {{ stats.currentStreak }}
        </div>
        <div class="stat-label gutenku-text-muted">
          {{ t('game.stats.streak') }}
        </div>
      </div>
      <div class="stat-item text-center">
        <div class="stat-value gutenku-text-primary">
          {{ stats.maxStreak }}
        </div>
        <div class="stat-label gutenku-text-muted">
          {{ t('game.stats.maxStreak') }}
        </div>
      </div>
    </div>

    <div class="distribution-section">
      <h3 class="distribution-title gutenku-text-muted mb-3">
        {{ t('game.stats.distribution') }}
      </h3>

      <div class="distribution-chart">
        <div
          v-for="round in 6"
          :key="round"
          class="distribution-row d-flex align-center ga-2 mb-2"
        >
          <div class="round-label gutenku-text-muted">
            {{ round }}
          </div>
          <div class="bar-container">
            <div
              class="bar"
              :style="{ width: getBarWidth(stats.guessDistribution[round] || 0) }"
            >
              <span class="bar-value">
                {{ stats.guessDistribution[round] || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ZenModal>
</template>

<style lang="scss" scoped>
.stats-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.stat-item {
  min-width: 50px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  animation: value-appear 0.3s ease-out;

  &--split {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.15rem;
  }
}

.stat-local {
  font-weight: 600;
}

.stat-divider {
  font-size: 0.9rem;
  opacity: 0.4;
  margin: 0 0.1rem;
}

.stat-global {
  font-size: 0.85rem;
  opacity: 0.7;
  font-weight: 400;
}

@keyframes value-appear {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.distribution-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.round-label {
  width: 1rem;
  text-align: center;
  font-weight: 500;
}

.bar-container {
  flex: 1;
  height: 1.5rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-sm);
  overflow: hidden;
}

.bar {
  height: 100%;
  min-width: 1.5rem;
  background: var(--gutenku-zen-primary);
  border-radius: var(--gutenku-radius-sm);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  transition: width 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .stat-value {
    animation: none;
  }

  .bar {
    transition: none;
  }
}
</style>
