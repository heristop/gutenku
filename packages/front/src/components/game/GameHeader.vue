<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { BarChart2, Flame, HelpCircle, RotateCcw, Volume2, VolumeX } from 'lucide-vue-next';
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
      <!-- Left: Title -->
      <div class="header-left">
        <h1 class="game-title">
          <span class="game-title__guten">Guten</span
          ><span class="game-title__guess">Guess</span>
        </h1>
      </div>

      <!-- Center: Puzzle number -->
      <div class="header-center">
        <ZenChip
          class="puzzle-number"
          :ariaLabel="t('game.puzzleNumber', { number: formattedPuzzleId })"
        >
          #{{ formattedPuzzleId }}
        </ZenChip>
      </div>

      <span class="header-separator" aria-hidden="true"></span>

      <!-- Right: Streak + Actions -->
      <div class="header-right">
        <!-- Streak badge -->
        <ZenTooltip
          v-if="stats.currentStreak > 0"
          :text="t('game.currentStreak')"
          position="bottom"
        >
          <div class="streak-badge">
            <Flame class="streak-badge__icon" :size="16" aria-hidden="true" />
            <span class="streak-badge__count">{{ stats.currentStreak }}</span>
          </div>
        </ZenTooltip>

        <div class="actions-section">
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
  position: sticky;
  top: 0;
  z-index: 100;
  // Extend to full width of parent container (offset parent padding)
  margin: -0.5rem -0.5rem 0;
  padding: 0.5rem 0.75rem;
  background: var(--gutenku-paper-bg);
  border-bottom: 1px solid var(--gutenku-paper-border);
  backdrop-filter: blur(8px);
  // Ensure rounded corners at top match container
  border-radius: var(--gutenku-radius-lg) var(--gutenku-radius-lg) 0 0;

  @media (min-width: 600px) {
    padding: 0.75rem 1rem;
  }

  // Ink wash separator
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.3;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (min-width: 600px) {
    position: relative;
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 1rem;
  }
}

// Left section - Title
.header-left {
  flex: 0 0 100%;
  text-align: center;
  margin-bottom: 0.25rem;

  @media (min-width: 600px) {
    flex: 0 0 auto;
    text-align: left;
    margin-bottom: 0;
  }
}

.game-title {
  font-size: 1.75rem;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow:
    0 1px 1px oklch(0 0 0 / 0.1),
    0 2px 4px oklch(0 0 0 / 0.08);

  @media (min-width: 600px) {
    font-size: 2rem;
    letter-spacing: 0.08em;
  }

  &__guten {
    font-family: 'JMH Typewriter', serif;
    font-weight: 400;
    color: var(--gutenku-zen-primary);
  }

  &__guess {
    font-family: var(--gutenku-font-body);
    font-weight: 300;
    font-style: italic;
    color: var(--gutenku-zen-secondary);
  }
}

// Center section - Progress info
.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  order: 2;

  @media (min-width: 600px) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    gap: 0.75rem;
  }
}

.puzzle-number {
  font-size: 0.75rem;
  font-weight: 700;

  @media (min-width: 600px) {
    font-size: 0.8rem;
  }
}

.header-separator {
  width: 1px;
  height: 1.25rem;
  background: var(--gutenku-zen-secondary);
  opacity: 0.4;
  order: 3;
  margin: 0 0.25rem;

  @media (min-width: 600px) {
    display: none;
  }
}

// Right section - Actions
.header-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  order: 4;

  @media (min-width: 600px) {
    gap: 0.375rem;
  }
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 0;
}

// Streak badge
.streak-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  min-width: 2.25rem;
  height: 1.75rem;
  padding: 0 0.375rem;
  background: linear-gradient(
    135deg,
    oklch(0.65 0.18 40 / 0.2) 0%,
    oklch(0.55 0.2 30 / 0.15) 100%
  );
  border: 1px solid oklch(0.6 0.18 35 / 0.4);
  border-radius: var(--gutenku-radius-md);
  animation: streak-glow 2s ease-in-out infinite;

  @media (min-width: 600px) {
    height: 2rem;
    padding: 0 0.5rem;
    gap: 0.25rem;
  }

  &__icon {
    color: oklch(0.65 0.2 35);

    @media (min-width: 600px) {
      width: 18px;
      height: 18px;
    }
  }

  &__count {
    font-size: 0.8rem;
    font-weight: 700;
    color: oklch(0.4 0.15 35);
    font-variant-numeric: tabular-nums;

    @media (min-width: 600px) {
      font-size: 0.875rem;
    }
  }
}

@keyframes streak-glow {
  0%, 100% {
    box-shadow: 0 0 8px oklch(0.6 0.18 35 / 0.3);
  }
  50% {
    box-shadow: 0 0 16px oklch(0.6 0.18 35 / 0.5);
  }
}

// Dark mode
[data-theme='dark'] {
  .game-header {
    background: oklch(0.18 0.02 60 / 0.95);
  }

  .streak-badge {
    background: linear-gradient(
      135deg,
      oklch(0.55 0.15 40 / 0.3) 0%,
      oklch(0.5 0.18 30 / 0.25) 100%
    );
    border-color: oklch(0.55 0.15 35 / 0.5);

    &__icon {
      color: oklch(0.75 0.18 40);
    }

    &__count {
      color: oklch(0.85 0.1 40);
    }
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
    color: oklch(0.55 0.2 25);
    transform: rotate(-180deg);
  }
}

// High contrast mode
@media (forced-colors: active) {
  .streak-badge {
    border: 2px solid CanvasText;
  }
}
</style>
