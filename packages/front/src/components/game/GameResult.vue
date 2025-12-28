<script lang="ts" setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Share2, Trophy, BookX, Clock } from 'lucide-vue-next';
import { useGameStore } from '@/store/game';
import { useToast } from '@/composables/toast';
import { useCountdown } from '@/composables/countdown';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();
const { success } = useToast();
const gameStore = useGameStore();
const { currentGame, puzzle, stats } = storeToRefs(gameStore);
const { formattedTime, start, stop } = useCountdown();

watch(modelValue, (isOpen) => {
  if (isOpen) {
    start();
  } else {
    stop();
  }
});

const isWon = computed(() => currentGame.value?.isWon ?? false);
const attemptsUsed = computed(() => currentGame.value?.guesses.length ?? 0);

const correctBook = computed(() => {
  if (!puzzle.value) {return null;}
  return gameStore.availableBooks.find(
    (book) => book.reference === currentGame.value?.guesses.find((g) => g.isCorrect)?.bookId,
  );
});

async function share() {
  await gameStore.shareResult();
  success(t('game.shareCopied'));
}

function close() {
  modelValue.value = false;
}
</script>

<template>
  <v-dialog v-model="modelValue" max-width="400" :persistent="false">
    <div class="game-result gutenku-paper pa-6">
      <!-- Celebration particles for wins -->
      <div v-if="isWon" class="celebration-particles" aria-hidden="true">
        <span v-for="i in 12" :key="i" class="particle" :style="{ '--i': i }" />
      </div>

      <div class="result-header text-center mb-4">
        <div
          class="result-icon-wrapper mb-3"
          :class="{ won: isWon, lost: !isWon }"
        >
          <Trophy v-if="isWon" :size="48" class="result-icon" />
          <BookX v-else :size="48" class="result-icon" />
        </div>

        <h2 class="result-title gutenku-text-primary">
          {{ isWon ? t('game.result.won') : t('game.result.lost') }}
        </h2>

        <p class="result-subtitle gutenku-text-muted">
          {{ isWon
            ? t('game.result.wonSubtitle', { attempts: attemptsUsed })
            : t('game.result.lostSubtitle')
          }}
        </p>
      </div>

      <div v-if="correctBook" class="correct-book text-center mb-4">
        <div class="book-emoticons mb-2">
          {{ correctBook.emoticons }}
        </div>
        <div class="book-title gutenku-text-primary">
          {{ correctBook.title }}
        </div>
        <div class="book-author gutenku-text-muted">
          {{ correctBook.author }}
        </div>
      </div>

      <div class="stats-summary d-flex justify-center ga-4 mb-4">
        <div class="stat-item text-center" style="--delay: 0">
          <div class="stat-value gutenku-text-primary">
            {{ stats.gamesPlayed }}
          </div>
          <div class="stat-label gutenku-text-muted">
            {{ t('game.stats.played') }}
          </div>
        </div>
        <div class="stat-item text-center" style="--delay: 1">
          <div class="stat-value gutenku-text-primary">
            {{ stats.currentStreak }}
          </div>
          <div class="stat-label gutenku-text-muted">
            {{ t('game.stats.streak') }}
          </div>
        </div>
        <div class="stat-item text-center" style="--delay: 2">
          <div class="stat-value gutenku-text-primary">
            {{ stats.maxStreak }}
          </div>
          <div class="stat-label gutenku-text-muted">
            {{ t('game.stats.maxStreak') }}
          </div>
        </div>
      </div>

      <div class="next-puzzle text-center mb-4">
        <div class="next-puzzle-label gutenku-text-muted">
          <Clock :size="14" class="mr-1" />
          {{ t('game.nextPuzzle') }}
        </div>
        <div class="next-puzzle-time gutenku-text-primary">
          {{ formattedTime }}
        </div>
      </div>

      <div class="result-actions d-flex flex-column ga-2">
        <v-btn
          class="gutenku-btn gutenku-btn-generate share-btn"
          block
          @click="share"
        >
          <span class="share-btn__shimmer" aria-hidden="true" />
          <Share2 :size="18" class="mr-2" />
          {{ t('game.share') }}
        </v-btn>

        <v-btn
          class="gutenku-btn gutenku-btn-copy"
          block
          variant="outlined"
          @click="close"
        >
          {{ t('common.close') }}
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.game-result {
  position: relative;
  border-radius: var(--gutenku-radius-md);
  overflow: hidden;
}

// Celebration particles
.celebration-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-burst 1.5s ease-out forwards;
  animation-delay: calc(var(--i) * 0.05s);
  opacity: 0;

  @for $i from 1 through 12 {
    &:nth-child(#{$i}) {
      --angle: calc(#{$i} * 30deg);
      --color: if($i % 3 == 0, oklch(0.7 0.15 145), if($i % 3 == 1, oklch(0.7 0.15 55), oklch(0.7 0.15 200)));
      background: var(--color);
    }
  }
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform:
      translate(
        calc(-50% + cos(var(--angle)) * 120px),
        calc(-50% + sin(var(--angle)) * 120px)
      )
      scale(0);
    opacity: 0;
  }
}

.result-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--gutenku-radius-full);

  &.won {
    background: oklch(0.65 0.18 145 / 0.15);
    color: oklch(0.55 0.18 145);
    animation: win-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &.lost {
    background: oklch(0.6 0.15 25 / 0.15);
    color: oklch(0.5 0.15 25);
  }
}

@keyframes win-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.result-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.result-subtitle {
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.correct-book {
  padding: 1rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-md);
}

.book-emoticons {
  font-size: 2rem;
  letter-spacing: 0.1rem;
}

.book-title {
  font-size: 1.1rem;
  font-weight: 500;
}

.book-author {
  font-size: 0.875rem;
}

.stat-item {
  min-width: 60px;
  opacity: 0;
  transform: translateY(10px);
  animation: stat-appear 0.4s ease-out forwards;
  animation-delay: calc(var(--delay) * 0.1s + 0.3s);
}

@keyframes stat-appear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.next-puzzle {
  padding: 0.75rem 1rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-md);
}

.next-puzzle-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.next-puzzle-time {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  animation: time-pulse 2s ease-in-out infinite;
}

@keyframes time-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// Share button shimmer effect
.share-btn {
  position: relative;
  overflow: hidden;

  &__shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent 30%,
      oklch(1 0 0 / 0.2) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    animation: shimmer 3s ease-in-out infinite;
    animation-delay: 1s;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  50%, 100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-icon-wrapper.won,
  .stat-item,
  .next-puzzle-time,
  .share-btn__shimmer,
  .particle {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
