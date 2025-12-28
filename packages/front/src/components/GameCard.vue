<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { BarChart2, HelpCircle, Sun, Moon, Monitor, RotateCcw } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import { useTheme } from '@/composables/theme';
import GameHint from './game/GameHint.vue';
import BookSearch from './game/BookSearch.vue';
import GuessHistory from './game/GuessHistory.vue';
import GameResult from './game/GameResult.vue';
import GameStats from './game/GameStats.vue';
import GameHelp from './game/GameHelp.vue';
import AppLoading from '@/components/AppLoading.vue';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

defineProps<{
  expanded?: boolean;
}>();

const { t } = useI18n();
const gameStore = useGameStore();
const {
  puzzle,
  loading,
  error,
  currentGame,
  showResult,
  showStats,
  revealedHints,
  isGameComplete,
  stats,
  puzzleNumber,
} = storeToRefs(gameStore);

const latestHint = computed(() =>
  revealedHints.value.length > 0 ? revealedHints.value.at(-1) : null,
);

const showHelp = ref(false);

const {
  isDarkMode,
  toggleTheme,
  systemPreferenceEnabled,
  saveSystemPreferenceEnabled,
} = useTheme();

const isDev = import.meta.env.DEV;

function toggleThemeManually() {
  if (systemPreferenceEnabled.value) {
    saveSystemPreferenceEnabled(false);
  }
  toggleTheme();
}

function toggleSystemPreference() {
  saveSystemPreferenceEnabled(!systemPreferenceEnabled.value);
}

async function resetAndReplay() {
  gameStore.resetGame();
  await gameStore.fetchDailyPuzzle();
}

// Auto-fetch puzzle on mount
onMounted(() => {
  if (!puzzle.value) {
    gameStore.fetchDailyPuzzle();
  }
});
</script>

<template>
  <div
    class="game-card gutenku-card"
    :class="{ 'game-card--expanded': expanded }"
  >
    <!-- Card Header with Illustration -->
    <div class="game-card__header">
      <img
        src="@/assets/img/sumi-e-books.webp"
        alt=""
        class="game-card__illustration"
        loading="lazy"
      />
      <div class="game-card__header-content">
        <div class="game-card__title-row">
          <div>
            <h2 class="game-card__title">GutenGuess</h2>
            <span class="game-card__puzzle-number">#{{ puzzleNumber }}</span>
          </div>
          <div v-if="stats.currentStreak > 0" class="game-card__streak">
            {{ stats.currentStreak }}
          </div>
        </div>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="game-card__actions">
      <ZenTooltip
        :text="isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')"
        position="bottom"
      >
        <v-btn
          icon
          variant="text"
          size="x-small"
          class="action-btn"
          :class="{ 'system-active': systemPreferenceEnabled }"
          @click="toggleThemeManually"
        >
          <Moon v-if="isDarkMode" :size="16" />
          <Sun v-else :size="16" />
        </v-btn>
      </ZenTooltip>

      <ZenTooltip :text="t('theme.systemPreference')" position="bottom">
        <v-btn
          icon
          variant="text"
          size="x-small"
          class="action-btn"
          :class="{ active: systemPreferenceEnabled }"
          @click="toggleSystemPreference"
        >
          <Monitor :size="16" />
        </v-btn>
      </ZenTooltip>

      <div v-if="isDev" class="action-divider" />

      <ZenTooltip v-if="isDev" :text="t('game.resetGame')" position="bottom">
        <v-btn
          icon
          variant="text"
          size="x-small"
          class="action-btn action-btn--dev"
          @click="resetAndReplay"
        >
          <RotateCcw :size="16" />
        </v-btn>
      </ZenTooltip>

      <div class="action-divider" />

      <ZenTooltip :text="t('game.howToPlay')" position="bottom">
        <v-btn
          icon
          variant="text"
          size="x-small"
          class="action-btn"
          @click="showHelp = true"
        >
          <HelpCircle :size="16" />
        </v-btn>
      </ZenTooltip>

      <ZenTooltip :text="t('game.statistics')" position="bottom">
        <v-btn
          icon
          variant="text"
          size="x-small"
          class="action-btn"
          @click="showStats = true"
        >
          <BarChart2 :size="16" />
        </v-btn>
      </ZenTooltip>
    </div>

    <!-- Card Content -->
    <div class="game-card__content">
      <div v-if="loading && !puzzle" class="game-card__loading">
        <AppLoading :text="t('game.loading')" />
      </div>

      <div v-else-if="error" class="game-card__error">
        <p class="gutenku-text-primary">{{ error }}</p>
        <v-btn
          class="gutenku-btn gutenku-btn-generate mt-3"
          size="small"
          @click="gameStore.fetchDailyPuzzle()"
        >
          {{ t('common.retry') }}
        </v-btn>
      </div>

      <template v-else-if="puzzle && currentGame">
        <GameHint
          v-if="latestHint"
          :hint="latestHint"
          :round="currentGame.currentRound"
          class="mb-3"
        />

        <BookSearch v-if="!isGameComplete" :loading="loading" class="mb-3" />

        <GuessHistory :guesses="currentGame.guesses" :hints="revealedHints" />
      </template>
    </div>

    <!-- Dialogs -->
    <GameResult v-model="showResult" />
    <GameStats v-model="showStats" />
    <GameHelp v-model="showHelp" />
  </div>
</template>

<style lang="scss" scoped>
.game-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 450px;
  background: var(--gutenku-paper-bg);
  border-radius: var(--gutenku-radius-xl);
  overflow: hidden;
  transition: var(--gutenku-transition-zen);

  &--expanded {
    min-height: 550px;
  }
}

.game-card__header {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.game-card__illustration {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
  filter: grayscale(30%);

  [data-theme='dark'] & {
    opacity: 0.4;
    filter: grayscale(40%) brightness(0.8);
  }
}

.game-card__header-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  background: linear-gradient(
    to top,
    var(--gutenku-paper-bg) 0%,
    transparent 100%
  );
}

.game-card__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.game-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gutenku-text-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.game-card__puzzle-number {
  font-size: 0.875rem;
  color: var(--gutenku-text-muted);
  margin-left: 0.5rem;
}

.game-card__streak {
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
}

.game-card__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--gutenku-paper-border);
}

.action-btn {
  color: var(--gutenku-text-muted);
  transition: var(--gutenku-transition-fast);

  &:hover {
    color: var(--gutenku-zen-accent);
  }

  &.system-active {
    opacity: 0.5;
  }

  &.active {
    color: var(--gutenku-zen-accent);
  }

  &--dev:hover {
    color: #e74c3c;
  }
}

.action-divider {
  width: 1px;
  height: 1rem;
  background: var(--gutenku-paper-border);
  margin: 0 0.25rem;
}

.game-card__content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.game-card__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.game-card__error {
  text-align: center;
  padding: 1rem;
}

@media (max-width: 600px) {
  .game-card {
    min-height: 400px;
  }

  .game-card__header {
    height: 100px;
  }

  .game-card__title {
    font-size: 1.25rem;
  }
}
</style>
