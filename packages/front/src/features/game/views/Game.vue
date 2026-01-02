<script lang="ts" setup>
import { defineAsyncComponent, onMounted, onUnmounted, ref, computed, watch, nextTick, Teleport } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useSwipe } from '@vueuse/core';
import { useSeoMeta } from '@unhead/vue';
import { ChevronLeft, ChevronRight, RefreshCw, Unlock, Drama, LockOpen, Filter, Check } from 'lucide-vue-next';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenTooltip from '@/core/components/ui/ZenTooltip.vue';
import InkBrushNav from '@/core/components/ui/InkBrushNav.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';
import ZenPaginationDots from '@/core/components/ui/ZenPaginationDots.vue';
import { useGameStore } from '@/features/game/store/game';
import { useHapticFeedback } from '@/core/composables/haptic-feedback';
import { usePwaInstall } from '@/core/composables/pwa-install';
import HintPanel from '@/features/game/components/HintPanel.vue';
import BookBoard from '@/features/game/components/BookBoard.vue';
import GuessHistory from '@/features/game/components/GuessHistory.vue';
import GameHeader from '@/features/game/components/GameHeader.vue';
import AppLoading from '@/core/components/AppLoading.vue';
import GuessConfirmModal from '@/features/game/components/GuessConfirmModal.vue';
import ReduceBooksConfirmModal from '@/features/game/components/ReduceBooksConfirmModal.vue';
import type { BookValue } from '@gutenku/shared';

const GameResult = defineAsyncComponent(
  () => import('@/features/game/components/GameResult.vue'),
);
const GameStats = defineAsyncComponent(
  () => import('@/features/game/components/GameStats.vue'),
);
const GameHelp = defineAsyncComponent(
  () => import('@/features/game/components/GameHelp.vue'),
);

const { t } = useI18n();

useSeoMeta({
  ogImage: 'https://gutenku.xyz/og-image.png',
  ogTitle: 'GutenGuess - Daily Literary Guessing Game',
  ogDescription: 'Guess the classic book from emoji clues! A daily puzzle for book lovers.',
  twitterImage: 'https://gutenku.xyz/og-image.png',
});

const showHelp = ref(false);
const showConfirmModal = ref(false);
const showReduceBooksModal = ref(false);
const showHaikuTooltip = ref(false);
const haikuSealRef = ref<HTMLElement | null>(null);
const haikuTooltipRef = ref<HTMLElement | null>(null);
const selectedBook = ref<BookValue | null>(null);

const tooltipPosition = ref({ top: 0, left: 0 });
const tooltipStyle = computed(() => ({
  position: 'absolute' as const,
  top: `${tooltipPosition.value.top}px`,
  left: `${tooltipPosition.value.left}px`,
  transform: 'translateX(-50%)',
}));

function updateTooltipPosition() {
  if (!haikuSealRef.value) {return;}
  const rect = haikuSealRef.value.getBoundingClientRect();
  tooltipPosition.value = {
    top: rect.bottom + window.scrollY + 8,
    left: rect.left + rect.width / 2 + window.scrollX,
  };
}

const isSubmitting = ref(false);
const bookBoardRef = ref<{ clearSelection: () => void; clearEliminated: () => void } | null>(null);
const gameStarted = ref(false);
const showHintUnlockedToast = ref(false);
const currentHaikuIndex = ref(0);
const haikuCarouselRef = ref<HTMLElement | null>(null);

const { direction } = useSwipe(haikuCarouselRef, {
  onSwipeEnd() {
    const maxIndex = (puzzle.value?.haikus.length ?? 1) - 1;
    if (direction.value === 'left' && currentHaikuIndex.value < maxIndex) {
      currentHaikuIndex.value++;
    } else if (direction.value === 'right' && currentHaikuIndex.value > 0) {
      currentHaikuIndex.value--;
    }
  },
});

function prevHaiku() {
  if (currentHaikuIndex.value > 0) {
    currentHaikuIndex.value--;
  }
}

function nextHaiku() {
  const maxIndex = (puzzle.value?.haikus.length ?? 1) - 1;
  if (currentHaikuIndex.value < maxIndex) {
    currentHaikuIndex.value++;
  }
}

function handleClickOutside(event: PointerEvent | MouseEvent) {
  const target = event.target as Node;
  if (haikuSealRef.value?.contains(target) || haikuTooltipRef.value?.contains(target)) {
    return;
  }
  showHaikuTooltip.value = false;
}

watch(showHaikuTooltip, async (visible) => {
  if (visible) {
    await nextTick();
    document.addEventListener('pointerdown', handleClickOutside);
  } else {
    document.removeEventListener('pointerdown', handleClickOutside);
  }
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleClickOutside);
});

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
  visibleEmoticonCount,
  canScratchEmoticon,
  canRevealHaiku,
  hasReducedBooks,
  canReduceBooks,
  score,
  numericScore,
} = storeToRefs(gameStore);

const hasGuesses = computed(() => (currentGame.value?.guesses.length ?? 0) > 0);

const currentRound = computed(() => currentGame.value?.guesses.length ?? 0);

const attemptsRemaining = computed(() => 6 - (currentGame.value?.guesses.length ?? 0));

const revealedHaikusList = computed(() => currentGame.value?.revealedHaikus ?? []);
const hasRevealedHaiku = computed(() => revealedHaikusList.value.length > 0);
const selectedHaikuIndex = ref(0);
const selectedHaiku = computed(() => revealedHaikusList.value[selectedHaikuIndex.value] ?? null);
const haikuLines = computed(() =>
  selectedHaiku.value?.split('\n').map((line) => line.trim()) || [],
);
const haikuCount = computed(() => revealedHaikusList.value.length);
const maxHaikus = computed(() => puzzle.value?.haikus.length ?? 3);

function showHaiku(index: number) {
  selectedHaikuIndex.value = index;
  updateTooltipPosition();
  showHaikuTooltip.value = true;
}

function handleRevealHaiku() {
  if (!canRevealHaiku.value) {
    return;
  }
  gameStore.revealHaiku();
  selectedHaikuIndex.value = haikuCount.value - 1;
  updateTooltipPosition();
  showHaikuTooltip.value = true;
}

function handleScratch() {
  gameStore.scratchEmoticon();
}

function handleReduceBooks() {
  if (!canReduceBooks.value || loading.value) {
    return;
  }
  showReduceBooksModal.value = true;
}

const isReducingBooks = ref(false);

async function handleConfirmReduceBooks() {
  if (isReducingBooks.value) {return;}
  isReducingBooks.value = true;
  try {
    await gameStore.reduceBooks();
    showReduceBooksModal.value = false;
  } finally {
    isReducingBooks.value = false;
  }
}

function handleCancelReduceBooks() {
  showReduceBooksModal.value = false;
}

function handleStartGame() {
  gameStarted.value = true;
}

onMounted(async () => {
  await gameStore.fetchDailyPuzzle();

  if (isGameComplete.value && gameStore.puzzle) {
    showResult.value = true;
  }
});

function toggleHaikuTooltip() {
  showHaikuTooltip.value = !showHaikuTooltip.value;
}

function handleBookSelect(book: BookValue) {
  selectedBook.value = book;
  showConfirmModal.value = true;
}

const { vibrateSuccess, vibrateError } = useHapticFeedback();
const { trackGamePlayed } = usePwaInstall();

async function handleConfirmGuess() {
  if (!selectedBook.value?.reference || isSubmitting.value) {return;}

  if (currentGame.value?.guesses.length === 0) {
    trackGamePlayed();
  }

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
      if (!isGameComplete.value) {
        showHintUnlockedToast.value = true;
        setTimeout(() => { showHintUnlockedToast.value = false; }, 2500);
      }
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
  <div class="game-container">
    <InkBrushNav />

    <main class="game-board gutenku-paper">
      <div class="game-board__texture" aria-hidden="true" />

      <GameHeader @show-stats="showStats = true" @show-help="showHelp = true" />

      <div v-if="loading && !puzzle" class="game-loading">
        <img
          src="/gutenmage.webp"
          alt=""
          aria-hidden="true"
          class="game-loading__illustration"
          width="1536"
          height="1024"
          draggable="false"
          @contextmenu.prevent
        />
        <AppLoading :text="t('game.loading')" />
      </div>

      <div
        v-else-if="error"
        class="game-error"
        role="alert"
        aria-live="assertive"
      >
        <p class="game-error__message gutenku-text-primary">{{ error }}</p>
        <ZenButton
          class="game-error__retry"
          @click="gameStore.fetchDailyPuzzle()"
        >
          <template #icon-left>
            <RefreshCw :size="18" />
          </template>
          {{ t('common.retry') }}
        </ZenButton>
      </div>

      <template v-else-if="puzzle && currentGame">
        <HintPanel
          v-if="revealedHints.length > 0 || isGameComplete"
          :hints="isGameComplete ? puzzle.hints : revealedHints"
          :current-round="currentRound"
          :visible-emoticon-count="visibleEmoticonCount"
          :can-scratch="canScratchEmoticon"
          :attempts-remaining="attemptsRemaining"
          :score="score"
          :numeric-score="numericScore"
          :is-game-complete="isGameComplete"
          @scratch="handleScratch"
        />

        <Transition name="gate">
          <div
            v-if="!gameStarted && !hasGuesses && !isGameComplete"
            class="start-gate"
          >
            <div class="start-gate__content">
              <img
                src="/gutenmage.webp"
                alt=""
                aria-hidden="true"
                class="start-gate__illustration"
                width="1536"
                height="1024"
                loading="lazy"
                draggable="false"
                @contextmenu.prevent
              />
              <h2 class="start-gate__title">{{ t('game.startGate.title') }}</h2>
              <p class="start-gate__subtitle">
                {{ t('game.startGate.subtitle') }}
              </p>
              <button
                type="button"
                class="start-gate__cta"
                @click="handleStartGame"
              >
                <Unlock :size="20" />
                {{ t('game.startGate.cta') }}
              </button>
              <p class="start-gate__hint">{{ t('game.startGate.hint') }}</p>
            </div>
          </div>
        </Transition>

        <div
          v-if="puzzle?.haikus?.length && !isGameComplete && (gameStarted || hasGuesses)"
          ref="haikuSealRef"
          class="haiku-cards-wrapper"
        >
          <button
            v-for="(_, index) in 3"
            :key="index"
            class="haiku-card"
            :class="{
              'haiku-card--revealed': index < haikuCount,
              'haiku-card--next': index === haikuCount && canRevealHaiku,
              'haiku-card--free': index === 0,
            }"
            :style="{ '--card-index': index }"
            :disabled="index > haikuCount || (index === haikuCount && !canRevealHaiku)"
            :aria-label="index < haikuCount ? t('game.viewHaiku') : t('game.revealHaiku')"
            @click="index < haikuCount ? showHaiku(index) : handleRevealHaiku()"
          >
            <Drama :size="18" class="haiku-card__icon" />
            <span class="haiku-card__label">Haiku</span>
            <span class="haiku-card__number">{{ index + 1 }}</span>
            <span
              v-if="index === 0 && index < haikuCount"
              class="haiku-card__cost haiku-card__cost--free"
              >{{ t('game.free') }}</span
            >
            <span
              v-else-if="index > 0 && index === haikuCount && canRevealHaiku"
              class="haiku-card__cost haiku-card__cost--paid"
              >-5 pts</span
            >
          </button>

          <!-- Reduce Books Lifeline -->
          <button
            class="lifeline-card lifeline-card--books"
            :class="{ 'lifeline-card--used': hasReducedBooks }"
            :disabled="!canReduceBooks || loading"
            :aria-label="t('game.reduceBooks')"
            @click="handleReduceBooks"
          >
            <Filter :size="18" class="lifeline-card__icon" />
            <span class="lifeline-card__label">50 → 30</span>
            <span v-if="canReduceBooks" class="lifeline-card__cost"
              >-20 pts</span
            >
            <Check v-else :size="14" class="lifeline-card__check" />
          </button>
        </div>

        <Teleport to="body">
          <Transition name="tooltip">
            <div
              v-if="showHaikuTooltip && hasRevealedHaiku"
              ref="haikuTooltipRef"
              role="dialog"
              aria-labelledby="haiku-tooltip-title"
              class="haiku-tooltip"
              :style="tooltipStyle"
            >
              <div class="haiku-tooltip-header">
                <div id="haiku-tooltip-title" class="haiku-tooltip-label">
                  {{ t('game.haikuHint') }}
                  {{ selectedHaikuIndex + 1 }}/{{ maxHaikus }}
                </div>
                <button
                  class="haiku-tooltip-close"
                  :aria-label="t('common.close')"
                  @click="showHaikuTooltip = false"
                >
                  <span class="haiku-tooltip-close__icon">✕</span>
                </button>
              </div>
              <ZenHaiku
                :lines="haikuLines"
                size="sm"
                :animated="false"
                :show-brush-stroke="false"
                class="haiku-tooltip-content"
              />
              <button
                v-if="canRevealHaiku"
                class="haiku-tooltip-more"
                @click="handleRevealHaiku"
              >
                {{ t('game.revealAnotherHaiku') }}
                <span class="haiku-tooltip-cost">-5 pts</span>
              </button>
            </div>
          </Transition>
        </Teleport>

        <GuessHistory
          v-if="hasGuesses"
          :guesses="currentGame.guesses"
          :hints="puzzle.hints"
          class="game-board__history"
        />

        <Transition name="books">
          <div
            v-if="!isGameComplete && (gameStarted || hasGuesses)"
            class="game-board__books"
          >
            <BookBoard ref="bookBoardRef" @select="handleBookSelect" />
          </div>
        </Transition>

        <section
          v-if="isGameComplete && puzzle?.haikus?.length"
          class="haiku-review"
          aria-labelledby="haiku-review-heading"
        >
          <h2 id="haiku-review-heading" class="sr-only">
            {{ t('game.review.haikuHints') }}
          </h2>
          <div class="haiku-review__header" aria-hidden="true">
            <Drama :size="22" class="haiku-review__icon" />
            <span
              class="haiku-review__title"
              >{{ t('game.review.haikuHints') }}</span
            >
          </div>
          <div class="haiku-carousel-wrapper">
            <ZenTooltip
              v-if="puzzle.haikus.length > 1"
              :text="t('toolbar.previousTooltip')"
              position="left"
            >
              <button
                class="haiku-nav haiku-nav--prev"
                :disabled="currentHaikuIndex === 0"
                :aria-label="t('toolbar.previousTooltip')"
                @click="prevHaiku"
              >
                <ChevronLeft :size="20" />
              </button>
            </ZenTooltip>

            <div ref="haikuCarouselRef" class="haiku-carousel">
              <div
                class="haiku-carousel__track"
                :style="{ transform: `translateX(-${currentHaikuIndex * 100}%)` }"
              >
                <div
                  v-for="(haiku, idx) in puzzle.haikus"
                  :key="idx"
                  class="haiku-carousel__slide"
                >
                  <ZenHaiku
                    :lines="haiku.split('\n').map((l: string) => l.trim())"
                    size="sm"
                    :animated="false"
                    :show-brush-stroke="false"
                  />
                </div>
              </div>
            </div>

            <ZenTooltip
              v-if="puzzle.haikus.length > 1"
              :text="t('toolbar.nextTooltip')"
              position="right"
            >
              <button
                class="haiku-nav haiku-nav--next"
                :disabled="currentHaikuIndex === puzzle.haikus.length - 1"
                :aria-label="t('toolbar.nextTooltip')"
                @click="nextHaiku"
              >
                <ChevronRight :size="20" />
              </button>
            </ZenTooltip>
          </div>

          <ZenPaginationDots
            v-model="currentHaikuIndex"
            :total="puzzle.haikus.length"
            :aria-label="t('game.haikuPagination')"
            item-label="Haiku"
            class="haiku-pagination"
          />
        </section>
      </template>

      <Transition name="toast">
        <div
          v-if="showHintUnlockedToast"
          class="hint-toast"
          role="status"
          aria-live="polite"
        >
          <LockOpen :size="18" class="hint-toast__icon" />
          <span class="hint-toast__text">{{ t('game.hintUnlocked') }}</span>
        </div>
      </Transition>
    </main>

    <GuessConfirmModal
      v-model="showConfirmModal"
      :book="selectedBook"
      :loading="isSubmitting"
      @confirm="handleConfirmGuess"
      @cancel="handleCancelGuess"
    />
    <ReduceBooksConfirmModal
      v-model="showReduceBooksModal"
      :loading="isReducingBooks"
      @confirm="handleConfirmReduceBooks"
      @cancel="handleCancelReduceBooks"
    />
    <GameResult v-model="showResult" />
    <GameStats v-model="showStats" />
    <GameHelp v-model="showHelp" />
  </div>
</template>

<style lang="scss" scoped>
.game-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  view-transition-name: game-page;

  @media (min-width: 600px) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}


.game-board {
  position: relative;
  border-radius: var(--gutenku-radius-lg);
  overflow: hidden;
  padding: 0.5rem;
  animation: fade-in 0.4s ease-out;
  margin-bottom: 1rem;

  background: oklch(0.985 0.008 85 / 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow:
    0 1px 3px oklch(0 0 0 / 0.04),
    0 4px 12px oklch(0 0 0 / 0.06),
    0 8px 24px oklch(0 0 0 / 0.04),
    inset 0 1px 0 oklch(1 0 0 / 0.6);
  border: 1px solid oklch(0.9 0.015 75 / 0.5);

  &__texture {
    position: absolute;
    inset: 0;
    background-image:
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
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
    background-repeat: repeat;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }

  > *:not(.game-board__texture) {
    position: relative;
    z-index: 1;
  }
}

.haiku-cards-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.75rem 1.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

.haiku-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  width: 3.25rem;
  height: 3.25rem;
  background: oklch(0.94 0.015 85);
  border: 1.5px solid oklch(0.85 0.03 85);
  border-radius: 6px;
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  transform: rotate(calc((var(--card-index) - 1) * 4deg)); // -4deg, 0deg, 4deg

  &:hover:not(:disabled) {
    transform: rotate(calc((var(--card-index) - 1) * 4deg)) scale(1.1);
    box-shadow: 0 4px 8px oklch(0 0 0 / 0.12);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &--revealed {
    background: oklch(from var(--gutenku-zen-accent) 0.92 0.06 h / 0.5);
    border-color: var(--gutenku-zen-accent);
    box-shadow: 0 2px 6px oklch(from var(--gutenku-zen-accent) l c h / 0.25);
  }

  &--next {
    background: oklch(from var(--gutenku-zen-primary) l c h / 0.12);
    border-color: oklch(from var(--gutenku-zen-primary) l c h / 0.3);
    animation: card-pulse 3s ease-in-out infinite;
  }

  &:disabled:not(.haiku-card--revealed) {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }
}

@keyframes card-pulse {
  0%, 100% { transform: rotate(calc((var(--card-index) - 1) * 4deg)) scale(1); }
  50% { transform: rotate(calc((var(--card-index) - 1) * 4deg)) scale(1.03); }
}

.haiku-card__icon {
  color: oklch(0.55 0.15 280);
  filter: drop-shadow(0 0 2px oklch(0.6 0.15 280 / 0.3));
}

.haiku-card--revealed .haiku-card__icon {
  color: oklch(0.5 0.12 195);
  filter: drop-shadow(0 0 3px oklch(0.5 0.15 195 / 0.4));
}

.haiku-card--next .haiku-card__icon {
  color: var(--gutenku-zen-primary);
}

.haiku-card__label {
  font-size: 0.45rem;
  font-weight: 700;
  color: oklch(0.5 0.08 85);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
}

.haiku-card__number {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  background: oklch(0.6 0.05 85);
  border-radius: 50%;
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.15);
}

.haiku-card--revealed .haiku-card__number {
  background: oklch(0.55 0.12 195);
}

.haiku-card--next .haiku-card__number {
  background: var(--gutenku-zen-primary);
}

.haiku-card--revealed .haiku-card__label {
  color: oklch(0.4 0.1 195);
}

.haiku-card--next .haiku-card__label {
  color: var(--gutenku-zen-primary);
}

[data-theme='dark'] .haiku-card {
  background: oklch(0.22 0.015 85);
  border-color: oklch(0.35 0.03 85);
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.3);

  &--revealed {
    background: oklch(0.28 0.08 195 / 0.5);
    border-color: var(--gutenku-zen-accent);
  }

  &--next {
    background: oklch(from var(--gutenku-zen-primary) l c h / 0.15);
    border-color: oklch(from var(--gutenku-zen-primary) l c h / 0.35);
  }
}

[data-theme='dark'] .haiku-card__icon {
  color: oklch(0.65 0.18 280);
  filter: drop-shadow(0 0 3px oklch(0.7 0.18 280 / 0.4));
}

[data-theme='dark'] .haiku-card--revealed .haiku-card__icon {
  color: oklch(0.6 0.14 195);
  filter: drop-shadow(0 0 4px oklch(0.6 0.14 195 / 0.5));
}

[data-theme='dark'] .haiku-card__label {
  color: oklch(0.7 0.05 85);
}

[data-theme='dark'] .haiku-card--revealed .haiku-card__label {
  color: oklch(0.75 0.1 195);
}

.haiku-card__cost {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.15rem 0.4rem;
  font-size: 0.55rem;
  font-weight: 700;
  color: oklch(0.35 0.1 25);
  background: oklch(0.85 0.12 45);
  border-radius: var(--gutenku-radius-sm);
  white-space: nowrap;

  &--free {
    color: oklch(0.45 0.08 55);
    background: oklch(0.96 0.02 85);
    border: 1px solid oklch(0.85 0.03 85);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  }

  &--paid {
    color: oklch(0.4 0.1 25);
    background: oklch(0.95 0.03 55);
    border: 1px solid oklch(0.85 0.05 45);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  }
}

[data-theme='dark'] .haiku-card__cost {
  color: oklch(0.95 0.08 45);
  background: oklch(0.45 0.12 45);

  &--free {
    color: oklch(0.85 0.02 85);
    background: oklch(0.28 0.015 85);
    border: 1px solid oklch(0.4 0.02 85);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.2);
  }

  &--paid {
    color: oklch(0.9 0.08 45);
    background: oklch(0.32 0.04 45);
    border: 1px solid oklch(0.45 0.06 45);
    box-shadow: 0 1px 2px oklch(0 0 0 / 0.2);
  }
}

/* Lifeline Card (Reduce Books) */
.lifeline-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  width: 3.25rem;
  height: 3.25rem;
  background: oklch(0.94 0.015 85);
  border: 1.5px solid oklch(0.85 0.03 85);
  border-radius: 6px;
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 8px oklch(0 0 0 / 0.12);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }

  &--used {
    background: oklch(from var(--gutenku-zen-accent) 0.92 0.06 h / 0.5);
    border-color: var(--gutenku-zen-accent);
    box-shadow: 0 2px 6px oklch(from var(--gutenku-zen-accent) l c h / 0.25);
  }

  &:disabled:not(.lifeline-card--used) {
    opacity: 0.35;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.lifeline-card__icon {
  color: oklch(0.5 0.12 200);
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 2px oklch(0.5 0.12 200 / 0.3));
}

.lifeline-card--used .lifeline-card__icon {
  color: oklch(0.5 0.12 195);
  filter: drop-shadow(0 0 3px oklch(0.5 0.15 195 / 0.4));
}

.lifeline-card__label {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: oklch(0.45 0.05 200);
}

.lifeline-card--used .lifeline-card__label {
  color: oklch(0.4 0.1 195);
}

.lifeline-card__cost {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.15rem 0.4rem;
  font-size: 0.55rem;
  font-weight: 700;
  color: oklch(0.4 0.1 25);
  background: oklch(0.95 0.03 55);
  border: 1px solid oklch(0.85 0.05 45);
  border-radius: var(--gutenku-radius-sm);
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  white-space: nowrap;
}

.lifeline-card__check {
  color: oklch(0.5 0.12 195);
}

[data-theme='dark'] .lifeline-card {
  background: oklch(0.22 0.015 85);
  border-color: oklch(0.35 0.03 85);
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.3);

  &--used {
    background: oklch(0.28 0.08 195 / 0.5);
    border-color: var(--gutenku-zen-accent);
  }
}

[data-theme='dark'] .lifeline-card__icon {
  color: oklch(0.65 0.15 200);
  filter: drop-shadow(0 0 3px oklch(0.65 0.15 200 / 0.4));
}

[data-theme='dark'] .lifeline-card--used .lifeline-card__icon {
  color: oklch(0.6 0.14 195);
  filter: drop-shadow(0 0 4px oklch(0.6 0.14 195 / 0.5));
}

[data-theme='dark'] .lifeline-card__label {
  color: oklch(0.7 0.05 200);
}

[data-theme='dark'] .lifeline-card--used .lifeline-card__label {
  color: oklch(0.75 0.1 195);
}

[data-theme='dark'] .lifeline-card__cost {
  color: oklch(0.9 0.08 45);
  background: oklch(0.32 0.04 45);
  border: 1px solid oklch(0.45 0.06 45);
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.2);
}

[data-theme='dark'] .lifeline-card__check {
  color: oklch(0.65 0.14 195);
}

.haiku-tooltip {
  z-index: 9999;
  padding: 0.75rem 1rem;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-left: 3px solid var(--gutenku-zen-accent);
  border-radius: var(--gutenku-radius-md);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.12),
    0 8px 32px oklch(0 0 0 / 0.08);
  min-width: 220px;
  max-width: calc(100dvw - 2rem);

  @media (min-width: 600px) {
    padding: 1rem 1.25rem;
    min-width: 260px;
    max-width: 340px;
  }
}

[data-theme='dark'] .haiku-tooltip {
  background: oklch(0.2 0.02 55);
  box-shadow:
    0 4px 16px oklch(0 0 0 / 0.4),
    0 8px 32px oklch(0 0 0 / 0.3);
}

.haiku-tooltip-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-secondary);
  margin-bottom: 0.25rem;
  text-align: center;
}

.haiku-tooltip-subtitle {
  font-size: 0.65rem;
  font-style: italic;
  color: var(--gutenku-text-muted);
  margin-bottom: 0.5rem;
  text-align: center;
}

.haiku-tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.haiku-tooltip-close {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: oklch(0 0 0 / 0.06);
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

.haiku-tooltip-close__icon {
  font-size: 1rem;
  font-weight: 300;
  color: var(--gutenku-text-muted);
  line-height: 1;
}

[data-theme='dark'] .haiku-tooltip-close:hover {
  background: oklch(1 0 0 / 0.1);
}

.haiku-tooltip-content {
  margin: 0 -0.25rem;
}

.haiku-tooltip-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gutenku-zen-primary);
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: oklch(0.9 0.04 195 / 0.6);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 2px;
  }
}

.haiku-tooltip-cost {
  font-size: 0.7rem;
  font-weight: 600;
  color: oklch(0.55 0.15 45);
}

[data-theme='dark'] .haiku-tooltip-more {
  background: oklch(0.28 0.03 195 / 0.4);
  border-color: oklch(0.4 0.04 195 / 0.5);

  &:hover {
    background: oklch(0.32 0.04 195 / 0.5);
  }
}

[data-theme='dark'] .haiku-tooltip-cost {
  color: oklch(0.75 0.12 45);
}

// Tooltip transition
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.start-gate {
  position: relative;
  padding: 1.5rem 1rem;
  text-align: center;
  background: linear-gradient(
    180deg,
    oklch(0.97 0.02 85 / 0.5) 0%,
    oklch(0.96 0.01 55 / 0.3) 100%
  );

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

.start-gate__content {
  max-width: 320px;
  margin: 0 auto;
}

.start-gate__illustration {
  display: block;
  width: 180px;
  height: auto;
  margin: 0 auto 1rem;
  opacity: 0.95;
  filter: grayscale(10%) drop-shadow(0 4px 12px oklch(0.45 0.08 195 / 0.2));
  animation: illustration-breathe 4s ease-in-out infinite;
  border-radius: var(--gutenku-radius-md);

  @media (min-width: 640px) {
    width: 220px;
  }

  @media (min-width: 1024px) {
    width: 260px;
  }
}

@keyframes illustration-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-1.5px); }
}

[data-theme='dark'] .start-gate__illustration {
  filter: brightness(0.9) grayscale(15%) drop-shadow(0 4px 12px oklch(0.5 0.1 195 / 0.3));
}

@media (prefers-reduced-motion: reduce) {
  .start-gate__illustration {
    animation: none;
  }
}

.start-gate__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gutenku-text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.4;

  @media (min-width: 600px) {
    font-size: 1.25rem;
  }
}

.start-gate__subtitle {
  font-size: 0.9rem;
  color: var(--gutenku-text-secondary);
  margin: 0 0 1.25rem;

  @media (min-width: 600px) {
    font-size: 1rem;
  }
}

.start-gate__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 240px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--gutenku-zen-primary);
  border: none;
  border-radius: var(--gutenku-radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px oklch(0.5 0.12 195 / 0.25);

  &:hover {
    background: oklch(0.45 0.12 195);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px oklch(0.5 0.12 195 / 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--gutenku-zen-accent);
    outline-offset: 3px;
  }

  @media (min-width: 600px) {
    font-size: 1.1rem;
    padding: 1rem 2rem;
  }
}

.start-gate__hint {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gutenku-text-muted);
  margin: 1rem 0 0;

  @media (min-width: 600px) {
    font-size: 0.8rem;
  }
}

[data-theme='dark'] .start-gate {
  background: linear-gradient(
    180deg,
    oklch(0.22 0.02 85 / 0.5) 0%,
    oklch(0.2 0.01 55 / 0.3) 100%
  );
}

// Gate transition
.gate-enter-active,
.gate-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.gate-enter-from,
.gate-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.books-enter-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.books-leave-active {
  transition: opacity 0.3s ease;
}

.books-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.books-leave-to {
  opacity: 0;
}

.game-board__history {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

.game-board__books {
  padding: 1rem;

  @media (min-width: 600px) {
    padding: 1.5rem;
  }
}

[data-theme='dark'] .game-board {
  background: oklch(0.16 0.015 70 / 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid oklch(0.35 0.02 75 / 0.4);
  box-shadow:
    0 1px 3px oklch(0 0 0 / 0.15),
    0 4px 12px oklch(0 0 0 / 0.2),
    0 8px 24px oklch(0 0 0 / 0.15),
    inset 0 1px 0 oklch(1 0 0 / 0.04);
}

// Reserve space for game content to prevent CLS
.game-board {
  min-height: 400px;
  contain: layout style;
}

.game-board__books {
  min-height: 280px;
}

.game-loading {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.game-loading__illustration {
  width: 180px;
  height: auto;
  margin-bottom: 1rem;
  filter: hue-rotate(150deg) saturate(0.7) brightness(1.05);
  opacity: 0.85;
  animation: gentle-float 3s ease-in-out infinite;
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.game-error {
  text-align: center;
  padding: 2rem;

  &__retry {
    margin-top: var(--gutenku-space-4);
  }
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

.haiku-review {
  position: relative;
  padding: 0.75rem;

  @media (min-width: 600px) {
    padding: 1rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gutenku-zen-accent) 20%,
      var(--gutenku-zen-accent) 80%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

.haiku-review__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.haiku-review__icon {
  color: oklch(0.55 0.15 280);
  filter: drop-shadow(0 0 3px oklch(0.6 0.15 280 / 0.4));
}

[data-theme='dark'] .haiku-review__icon {
  color: oklch(0.65 0.18 280);
  filter: drop-shadow(0 0 4px oklch(0.65 0.18 280 / 0.5));
}

.haiku-review__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gutenku-text-muted);
}

.haiku-carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.haiku-nav {
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-full);
  background: var(--gutenku-paper-bg);
  color: var(--gutenku-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  @media (min-width: 600px) {
    display: flex;
  }

  &:hover:not(:disabled) {
    background: var(--gutenku-zen-water);
    color: var(--gutenku-text-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.haiku-carousel {
  flex: 1;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.haiku-carousel__track {
  display: flex;
  transition: transform 0.3s ease;
}

.haiku-carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
  padding: 0 0.25rem;
}

.haiku-pagination {
  margin-top: 0.5rem;
}

.hint-toast {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-zen-accent);
  border-radius: var(--gutenku-radius-full);
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.12),
    0 0 0 3px oklch(from var(--gutenku-zen-accent) l c h / 0.15);
  z-index: 10;

  &__icon {
    color: oklch(0.55 0.15 145);
    filter: drop-shadow(0 0 3px oklch(0.6 0.18 145 / 0.5));
  }

  &__text {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
    white-space: nowrap;
  }
}

[data-theme='dark'] .hint-toast {
  background: oklch(0.22 0.02 55);
  box-shadow:
    0 4px 12px oklch(0 0 0 / 0.35),
    0 0 0 3px oklch(from var(--gutenku-zen-accent) l c h / 0.2);
}

.toast-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

@media (prefers-reduced-motion: reduce) {
  .game-board,
  .seal-free-badge {
    animation: none;
  }

  .gate-enter-active,
  .gate-leave-active,
  .books-enter-active,
  .books-leave-active,
  .start-gate__cta,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
