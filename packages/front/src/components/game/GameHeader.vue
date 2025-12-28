<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { BarChart2, HelpCircle, RotateCcw } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const emit = defineEmits<{
  showStats: [];
  showHelp: [];
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const { puzzleNumber, stats } = storeToRefs(gameStore);

const isDev = import.meta.env.DEV;

async function resetAndReplay() {
  gameStore.resetGame();
  await gameStore.fetchDailyPuzzle();
}
</script>

<template>
  <header class="game-header">
    <div class="header-content d-flex align-center justify-space-between">
      <div class="title-section">
        <h1 class="game-title gutenku-text-primary">GutenGuess</h1>
        <span class="puzzle-number gutenku-text-muted">
          #{{ puzzleNumber }}
        </span>
      </div>

      <div class="actions-section d-flex align-center ga-1">
        <ZenTooltip :text="t('game.currentStreak')" position="bottom">
          <div v-if="stats.currentStreak > 0" class="streak-badge">
            {{ stats.currentStreak }}
          </div>
        </ZenTooltip>

        <ZenTooltip v-if="isDev" :text="t('game.resetGame')" position="bottom">
          <v-btn
            icon
            variant="text"
            size="small"
            class="dev-reset-btn"
            :aria-label="t('game.resetGame')"
            @click="resetAndReplay"
          >
            <RotateCcw :size="18" />
          </v-btn>
        </ZenTooltip>

        <ZenTooltip :text="t('game.howToPlay')" position="bottom">
          <v-btn
            icon
            variant="text"
            size="small"
            :aria-label="t('game.howToPlay')"
            @click="emit('showHelp')"
          >
            <HelpCircle :size="18" />
          </v-btn>
        </ZenTooltip>

        <ZenTooltip :text="t('game.statistics')" position="bottom">
          <v-btn
            icon
            variant="text"
            size="small"
            :aria-label="t('game.statistics')"
            @click="emit('showStats')"
          >
            <BarChart2 :size="18" />
          </v-btn>
        </ZenTooltip>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(
    180deg,
    oklch(1 0 0 / 0.03) 0%,
    transparent 100%
  );
  border-bottom: 1px solid var(--gutenku-paper-border);
}

[data-theme='dark'] .game-header {
  background: linear-gradient(
    180deg,
    oklch(1 0 0 / 0.02) 0%,
    transparent 100%
  );
}

.game-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.05em;
}

.puzzle-number {
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.streak-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: var(--gutenku-btn-generate-bg);
  border: 1px solid var(--gutenku-btn-generate);
  border-radius: var(--gutenku-radius-full);
  color: var(--gutenku-btn-generate-text);
  font-weight: 600;
  font-size: 0.875rem;
  animation: streak-pulse 2s ease-in-out infinite;
}

@keyframes streak-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .streak-badge {
    animation: none;
  }
}

.dev-reset-btn {
  color: var(--gutenku-zen-accent);
  transition: var(--gutenku-transition-fast);

  &:hover {
    color: #e74c3c;
    transform: rotate(-180deg);
  }
}
</style>
