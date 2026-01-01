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
        class="game-error gutenku-paper pa-4"
        role="alert"
        aria-live="assertive"
      >
        <p class="text-center gutenku-text-primary">{{ error }}</p>
        <ZenButton class="mt-4 w-100" @click="gameStore.fetchDailyPuzzle()">
          {{ t('common.retry') }}
        </ZenButton>
      </div>

      <template v-else-if="puzzle && currentGame">
        <GameHint
          v-if="latestHint"
          :hint="latestHint"
          :round="currentGame.currentRound"
          class="mb-4"
        />

        <BookSearch v-if="!isGameComplete" :loading="loading" class="mb-4" />

        <GuessHistory
          :guesses="currentGame.guesses"
          :hints="revealedHints"
          class="mb-4"
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
  border-radius: var(--gutenku-radius-md);
}
</style>
