<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { useGameStore } from '@/store/game';
import ZenModal from '@/components/ui/ZenModal.vue';
import GameHeader from './GameHeader.vue';
import GameHint from './GameHint.vue';
import BookSearch from './BookSearch.vue';
import GuessHistory from './GuessHistory.vue';
import GameResult from './GameResult.vue';
import GameStats from './GameStats.vue';
import GameHelp from './GameHelp.vue';
import AppLoading from '@/components/AppLoading.vue';
import ZenButton from '@/components/ui/ZenButton.vue';

const modelValue = defineModel<boolean>({ default: false });

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
} = storeToRefs(gameStore);

// Responsive breakpoints
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('sm');

const latestHint = computed(() =>
  revealedHints.value.length > 0 ? revealedHints.value.at(-1) : null,
);

const showHelp = ref(false);

watch(modelValue, (isOpen) => {
  if (isOpen && !puzzle.value) {
    gameStore.fetchDailyPuzzle();
  }
});

function close() {
  modelValue.value = false;
}
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :fullscreen="isMobile"
    max-width="700"
    :show-close="false"
    variant="book"
    title="GutenGuess"
    description="Daily literary guessing game - identify the book from hints"
    content-class="game-modal"
  >
    <GameHeader
      @show-stats="showStats = true"
      @show-help="showHelp = true"
      @close="close"
    />

    <div class="game-modal-content">
      <div v-if="loading && !puzzle" class="game-loading">
        <AppLoading :text="t('game.loading')" />
      </div>

      <div
        v-else-if="error"
        class="game-error gutenku-paper"
        role="alert"
        aria-live="assertive"
      >
        <p class="game-error__text gutenku-text-primary">{{ error }}</p>
        <ZenButton
          class="game-error__btn"
          @click="gameStore.fetchDailyPuzzle()"
        >
          {{ t('common.retry') }}
        </ZenButton>
      </div>

      <template v-else-if="puzzle && currentGame">
        <GameHint
          v-if="latestHint"
          :hint="latestHint"
          :round="currentGame.currentRound"
          class="game-modal__hint"
        />

        <BookSearch
          v-if="!isGameComplete"
          :loading="loading"
          class="game-modal__search"
        />

        <GuessHistory
          :guesses="currentGame.guesses"
          :hints="revealedHints"
          class="game-modal__history"
        />
      </template>
    </div>

    <GameResult v-model="showResult" />
    <GameStats v-model="showStats" />
    <GameHelp v-model="showHelp" />
  </ZenModal>
</template>

<style lang="scss" scoped>
.game-modal {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-height: 100vh;
  overflow: hidden;
  background: var(--gutenku-paper-bg);
}

.game-modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.game-error {
  text-align: center;
  padding: var(--gutenku-space-4);
  border-radius: var(--gutenku-radius-md);

  &__text {
    text-align: center;
  }

  &__btn {
    margin-top: var(--gutenku-space-4);
    width: 100%;
  }
}

.game-modal__hint,
.game-modal__search,
.game-modal__history {
  margin-bottom: var(--gutenku-space-4);
}
</style>
