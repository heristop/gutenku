<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { BarChart2, HelpCircle, RotateCcw, Volume2, VolumeX } from 'lucide-vue-next';
import { useAudioFeedback } from '@/composables/audio-feedback';
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
const { isMuted, toggleMute } = useAudioFeedback();

const isDev = import.meta.env.DEV;

// Format puzzle ID
const formattedPuzzleId = computed(() => puzzleNumber.value);

async function resetAndReplay() {
  gameStore.resetGame();
  await gameStore.fetchDailyPuzzle();
}
</script>

<template>
  <header class="game-header">
    <div class="header-content">
      <!-- Title -->
      <h1 class="game-title gutenku-text-primary">GutenGuess</h1>

      <!-- Info row: puzzle number + score + actions -->
      <div class="header-info">
        <ZenChip
          class="puzzle-number"
          :ariaLabel="t('game.puzzleNumber', { number: formattedPuzzleId })"
        >
          #{{ formattedPuzzleId }}
        </ZenChip>

        <div class="header-divider" />

        <div class="actions-section">
          <ZenTooltip :text="t('game.currentStreak')" position="bottom">
            <div v-if="stats.currentStreak > 0" class="streak-badge mr-2">
              {{ stats.currentStreak }}
            </div>
          </ZenTooltip>

          <ZenTooltip
            :text="isMuted ? t('game.soundOn') : t('game.soundOff')"
            position="bottom"
          >
            <ZenButton
              variant="text"
              size="sm"
              :aria-label="isMuted ? t('game.soundOn') : t('game.soundOff')"
              @click="toggleMute"
            >
              <template #icon-left>
                <VolumeX v-if="isMuted" :size="18" />
                <Volume2 v-else :size="18" />
              </template>
            </ZenButton>
          </ZenTooltip>

          <ZenTooltip
            v-if="isDev"
            :text="t('game.resetGame')"
            position="bottom"
          >
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
    </div>
  </header>
</template>

<style lang="scss" scoped>
.game-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gutenku-paper-border);

  @media (min-width: 600px) {
    padding: 1rem 1.25rem;
  }
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
  }
}

.game-title {
  font-size: 1.35rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.08em;

  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-divider {
  width: 1px;
  height: 1.25rem;
  background: var(--gutenku-paper-border);
}

.puzzle-number {
  font-size: 0.8rem;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 0.125rem;
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
