<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { BarChart2, HelpCircle, RotateCcw } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';
import ZenButton from '@/components/ui/ZenButton.vue';
import ZenChip from '@/components/ui/ZenChip.vue';

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
        <ZenChip
          class="puzzle-number"
          :ariaLabel="t('game.puzzleNumber', { number: puzzleNumber })"
        >
          #{{ puzzleNumber }}
        </ZenChip>
      </div>

      <div class="actions-section d-flex align-center ga-1">
        <ZenTooltip :text="t('game.currentStreak')" position="bottom">
          <div v-if="stats.currentStreak > 0" class="streak-badge">
            {{ stats.currentStreak }}
          </div>
        </ZenTooltip>

        <ZenTooltip v-if="isDev" :text="t('game.resetGame')" position="bottom">
          <ZenButton
            variant="text"
            size="sm"
            class="dev-reset-btn"
            :aria-label="t('game.resetGame')"
            @click="resetAndReplay"
          >
            <template #icon-left>
              <RotateCcw :size="18" />
            </template>
          </ZenButton>
        </ZenTooltip>

        <ZenTooltip :text="t('game.howToPlay')" position="bottom">
          <ZenButton
            variant="text"
            size="sm"
            :aria-label="t('game.howToPlay')"
            @click="emit('showHelp')"
          >
            <template #icon-left>
              <HelpCircle :size="18" />
            </template>
          </ZenButton>
        </ZenTooltip>

        <ZenTooltip :text="t('game.statistics')" position="bottom">
          <ZenButton
            variant="text"
            size="sm"
            :aria-label="t('game.statistics')"
            @click="emit('showStats')"
          >
            <template #icon-left>
              <BarChart2 :size="18" />
            </template>
          </ZenButton>
        </ZenTooltip>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gutenku-paper-border);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.05em;
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
