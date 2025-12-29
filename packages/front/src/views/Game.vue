<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ChevronLeft, RefreshCw } from 'lucide-vue-next';
import ZenButton from '@/components/ui/ZenButton.vue';
import { useGameStore } from '@/store/game';
import { useHapticFeedback } from '@/composables/haptic-feedback';
import GameHint from '@/components/game/GameHint.vue';
import BookBoard from '@/components/game/BookBoard.vue';
import GuessHistory from '@/components/game/GuessHistory.vue';
import GameHeader from '@/components/game/GameHeader.vue';
import AppLoading from '@/components/AppLoading.vue';
import type { BookValue } from '@gutenku/shared';

const GuessConfirmModal = defineAsyncComponent(
  () => import('@/components/game/GuessConfirmModal.vue'),
);
const GameResult = defineAsyncComponent(
  () => import('@/components/game/GameResult.vue'),
);
const GameStats = defineAsyncComponent(
  () => import('@/components/game/GameStats.vue'),
);
const GameHelp = defineAsyncComponent(
  () => import('@/components/game/GameHelp.vue'),
);

const { t } = useI18n();
const showHelp = ref(false);
const showConfirmModal = ref(false);
const selectedBook = ref<BookValue | null>(null);
const isSubmitting = ref(false);
const bookBoardRef = ref<{ clearSelection: () => void; clearEliminated: () => void } | null>(null);

const gameStore = useGameStore();
const {
  puzzle,
  loading,
  error,
  currentGame,
  showResult,
  showStats,
  isGameComplete,
  revealedHints,
} = storeToRefs(gameStore);

const hasGuesses = computed(() => (currentGame.value?.guesses.length ?? 0) > 0);

const latestHint = computed(() => {
  const hints = revealedHints.value;
  return hints.length > 0 ? hints.at(-1)! : null;
});

const currentRound = computed(() => currentGame.value?.guesses.length ?? 0);

onMounted(() => {
  gameStore.fetchDailyPuzzle();
});

function handleBookSelect(book: BookValue) {
  selectedBook.value = book;
  showConfirmModal.value = true;
}

const { vibrateSuccess, vibrateError } = useHapticFeedback();

async function handleConfirmGuess() {
  if (!selectedBook.value?.reference || isSubmitting.value) {return;}

  isSubmitting.value = true;
  try {
    const isCorrect = await gameStore.submitGuess(
      selectedBook.value.reference,
      selectedBook.value.title || '',
    );

    if (isCorrect) {
      vibrateSuccess();
    } else {
      vibrateError();
    }

    showConfirmModal.value = false;
    selectedBook.value = null;
    bookBoardRef.value?.clearSelection();
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancelGuess() {
  showConfirmModal.value = false;
  selectedBook.value = null;
  bookBoardRef.value?.clearSelection();
}
</script>

<template>
  <v-container class="game-container px-5 py-2 pa-sm-4">
    <ZenButton
      to="/"
      variant="ghost"
      spring
      class="game-page__back-wrapper"
      :aria-label="t('common.back')"
    >
      <template #icon-left>
        <ChevronLeft :size="18" />
      </template>
      {{ t('common.back') }}
    </ZenButton>

    <div class="game-board gutenku-paper">
      <div class="game-board__texture" aria-hidden="true" />

      <GameHeader @show-stats="showStats = true" @show-help="showHelp = true" />

      <div v-if="loading && !puzzle" class="game-loading">
        <AppLoading :text="t('game.loading')" />
      </div>

      <div
        v-else-if="error"
        class="game-error"
        role="alert"
        aria-live="assertive"
      >
        <p class="text-center gutenku-text-primary">{{ error }}</p>
        <ZenButton class="mt-4" @click="gameStore.fetchDailyPuzzle()">
          <template #icon-left>
            <RefreshCw :size="18" />
          </template>
          {{ t('common.retry') }}
        </ZenButton>
      </div>

      <template v-else-if="puzzle && currentGame">
        <div v-if="latestHint" class="game-board__hint">
          <GameHint :hint="latestHint" :round="currentRound" />
        </div>

        <GuessHistory
          v-if="hasGuesses"
          :guesses="currentGame.guesses"
          :hints="puzzle.hints"
          class="game-board__history"
        />

        <div v-if="!isGameComplete" class="game-board__books">
          <BookBoard ref="bookBoardRef" @select="handleBookSelect" />
        </div>
      </template>
    </div>

    <GuessConfirmModal
      v-model="showConfirmModal"
      :book="selectedBook"
      :loading="isSubmitting"
      @confirm="handleConfirmGuess"
      @cancel="handleCancelGuess"
    />
    <GameResult v-model="showResult" />
    <GameStats v-model="showStats" />
    <GameHelp v-model="showHelp" />
  </v-container>
</template>

<style lang="scss" scoped>
.game-container {
  max-width: 900px;
  margin: 0 auto;
  view-transition-name: game-page;
}

.game-page__back-wrapper {
  margin-bottom: 1.5rem;
  margin-left: 0.5rem;
  margin-top: 1rem;

  @media (min-width: 600px) {
    margin-left: 0;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}

.game-board {
  position: relative;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
  animation: fade-in 0.4s ease-out;
  box-shadow:
    0 4px 6px -1px oklch(0 0 0 / 0.1),
    0 2px 4px -2px oklch(0 0 0 / 0.1),
    inset 0 1px 0 oklch(1 0 0 / 0.1);
  margin-bottom: 1rem;

  &__texture {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(
        circle at 20% 30%,
        oklch(0.5 0.05 55 / 0.03) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 70%,
        oklch(0.5 0.05 55 / 0.03) 0%,
        transparent 50%
      );
    pointer-events: none;
    z-index: 0;
  }

  > *:not(.game-board__texture) {
    position: relative;
    z-index: 1;
  }
}

.game-board__hint {
  padding: 0.5rem;
  border-bottom: 1px solid var(--gutenku-paper-border);
  background: oklch(0.97 0.02 68 / 0.5);

  @media (min-width: 600px) {
    padding: 0.75rem;
  }
}

[data-theme='dark'] .game-board__hint {
  background: oklch(0.22 0.02 65 / 0.5);
}

.game-board__history {
  border-bottom: 1px solid var(--gutenku-paper-border);
}

.game-board__books {
  padding: 0.75rem;

  @media (min-width: 600px) {
    padding: 1rem;
  }
}

[data-theme='dark'] .game-board {
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.3),
    0 2px 4px oklch(0 0 0 / 0.2),
    inset 0 1px 0 oklch(1 0 0 / 0.05);
}

.game-loading {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.game-error {
  text-align: center;
  padding: 2rem;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-board {
    animation: none;
  }
}
</style>
