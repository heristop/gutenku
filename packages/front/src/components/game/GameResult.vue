<script lang="ts" setup>
import { computed, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { Share2, Trophy, BookX, Clock, Sparkles } from 'lucide-vue-next';
import { useAudioFeedback } from '@/composables/audio-feedback';
import ZenModal from '@/components/ui/ZenModal.vue';
import ZenButton from '@/components/ui/ZenButton.vue';
import ScoreStars from '@/components/ui/ScoreStars.vue';
import { useGameStore } from '@/store/game';
import { useToast } from '@/composables/toast';
import { useCountdown } from '@/composables/countdown';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();
const { success } = useToast();
const gameStore = useGameStore();
const { currentGame, puzzle, stats, score, numericScore } = storeToRefs(gameStore);

const newPuzzleReady = ref(false);

function handleCountdownComplete() {
  newPuzzleReady.value = true;
}

const { formattedTime, hours, minutes, seconds, start, stop } = useCountdown({
  onComplete: handleCountdownComplete,
});

const { playVictory, preload: preloadAudio } = useAudioFeedback();

function getCelebrationKey(): string {
  return `gutenguess-celebrated-${currentGame.value?.puzzleNumber}`;
}

function checkIfCelebrated(): boolean {
  if (!currentGame.value?.puzzleNumber) {return true;}
  return localStorage.getItem(getCelebrationKey()) === 'true';
}

function markCelebrated() {
  if (currentGame.value?.puzzleNumber) {
    localStorage.setItem(getCelebrationKey(), 'true');
  }
}

const hoursDigits = computed(() => [...String(hours.value).padStart(2, '0')]);
const minutesDigits = computed(() => [...String(minutes.value).padStart(2, '0')]);
const secondsDigits = computed(() => [...String(seconds.value).padStart(2, '0')]);

const isWon = computed(() => currentGame.value?.isWon ?? false);
const attemptsUsed = computed(() => currentGame.value?.guesses.length ?? 0);

const particleKey = ref(0);
const showConfetti = ref(false);

watch(modelValue, (isOpen) => {
  if (isOpen) {
    newPuzzleReady.value = false;
    start();

    const shouldCelebrate = isWon.value && !checkIfCelebrated();
    showConfetti.value = shouldCelebrate;

    if (shouldCelebrate) {
      markCelebrated();
      particleKey.value++;
      setTimeout(() => {
        playVictory();
      }, 200);
    }
  } else {
    stop();
  }
}, { immediate: true });

preloadAudio();

const correctBook = computed(() => currentGame.value?.correctBook ?? null);

function splitEmojis(str: string): string[] {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return [...segmenter.segment(str)].map((s) => s.segment).filter((char) => char.trim());
}

const bookEmoticons = computed(() =>
  correctBook.value?.emoticons ? splitEmojis(correctBook.value.emoticons) : [],
);

function generateSakuraParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: -80 + Math.random() * 160,
    midX: -60 + Math.random() * 120,
    endX: -90 + Math.random() * 180,
    endY: 80 + Math.random() * 100,
    rotation: -250 + Math.random() * 500,
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.8,
    duration: 3 + Math.random() * 2,
  }));
}

const sakuraParticles = computed(() => generateSakuraParticles(55));

async function share() {
  await gameStore.shareResult();
  success(t('game.shareCopied'));
}

async function playNewPuzzle() {
  gameStore.resetGame();
  await gameStore.fetchDailyPuzzle();
}
</script>

<template>
  <ZenModal v-model="modelValue" :max-width="400" content-class="game-result">
    <div
      v-if="showConfetti"
      :key="particleKey"
      class="celebration-particles"
      aria-hidden="true"
    >
      <span
        v-for="sakura in sakuraParticles"
        :key="`sakura-${sakura.id}`"
        class="particle particle--sakura"
        :style="{
          '--start-x': `${sakura.startX}px`,
          '--mid-x': `${sakura.midX}px`,
          '--end-x': `${sakura.endX}px`,
          '--end-y': `${sakura.endY}px`,
          '--rot': `${sakura.rotation}deg`,
          '--size': `${sakura.size}px`,
          '--delay': `${sakura.delay}s`,
          '--duration': `${sakura.duration}s`,
        }"
      />
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

      <div v-if="isWon" class="score-stars-wrapper mt-3">
        <ScoreStars :score="score" size="xl" animated />
        <div class="numeric-score gutenku-text-muted">
          {{ numericScore }}/100 pts
        </div>
      </div>
    </div>

    <div v-if="correctBook" class="correct-book text-center mb-4">
      <div v-if="bookEmoticons.length > 0" class="book-emoticons mb-3">
        <span
          v-for="(emoji, idx) in bookEmoticons"
          :key="idx"
          class="emoji-card"
          :style="{ '--delay': idx }"
          >{{ emoji }}</span
        >
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
      <Transition name="reveal" mode="out-in">
        <div v-if="newPuzzleReady" key="ready" class="new-puzzle-ready">
          <div class="new-puzzle-ready__particles" aria-hidden="true">
            <span
              v-for="i in 8"
              :key="i"
              class="sparkle"
              :style="{ '--i': i }"
            />
          </div>
          <Sparkles :size="20" class="new-puzzle-ready__icon" />
          <span
            class="new-puzzle-ready__text"
            >{{ t('game.newPuzzleReady') }}</span
          >
        </div>

        <div v-else key="countdown" class="countdown-container">
          <div class="next-puzzle-label gutenku-text-muted">
            <Clock :size="14" class="mr-1" />
            {{ t('game.nextPuzzle') }}
          </div>
          <div class="countdown-digits">
            <div class="countdown-unit">
              <div class="digit-wrapper">
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="hoursDigits[0]"
                      class="digit"
                      >{{ hoursDigits[0] }}</span
                    >
                  </Transition>
                </div>
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="hoursDigits[1]"
                      class="digit"
                      >{{ hoursDigits[1] }}</span
                    >
                  </Transition>
                </div>
              </div>
              <span class="unit-label">{{ t('game.hours') }}</span>
            </div>
            <span class="countdown-separator">:</span>
            <div class="countdown-unit">
              <div class="digit-wrapper">
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="minutesDigits[0]"
                      class="digit"
                      >{{ minutesDigits[0] }}</span
                    >
                  </Transition>
                </div>
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="minutesDigits[1]"
                      class="digit"
                      >{{ minutesDigits[1] }}</span
                    >
                  </Transition>
                </div>
              </div>
              <span class="unit-label">{{ t('game.minutes') }}</span>
            </div>
            <span class="countdown-separator">:</span>
            <div class="countdown-unit">
              <div class="digit-wrapper">
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="secondsDigits[0]"
                      class="digit"
                      >{{ secondsDigits[0] }}</span
                    >
                  </Transition>
                </div>
                <div class="digit-slot">
                  <Transition name="flip" mode="out-in">
                    <span
                      :key="secondsDigits[1]"
                      class="digit"
                      >{{ secondsDigits[1] }}</span
                    >
                  </Transition>
                </div>
              </div>
              <span class="unit-label">{{ t('game.seconds') }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <Transition name="fade-up">
      <ZenButton
        v-if="newPuzzleReady"
        class="play-new-btn w-100 mb-2"
        @click="playNewPuzzle"
      >
        <template #icon-left>
          <Sparkles :size="18" />
        </template>
        {{ t('game.playNewPuzzle') }}
      </ZenButton>
    </Transition>

    <div class="result-actions">
      <ZenButton class="share-btn w-100" @click="share">
        <span class="share-btn__shimmer" aria-hidden="true" />
        <template #icon-left>
          <Share2 :size="18" />
        </template>
        {{ t('game.share') }}
      </ZenButton>
    </div>
  </ZenModal>
</template>

<style lang="scss" scoped>
:deep(.game-result) {
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.celebration-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle--sakura {
  position: absolute;
  top: 0;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(145deg, #ffc0cb 0%, #ffb7c5 40%, #ffd1dc 70%, #fff5f7 100%);
  border-radius: 50% 0 50% 50%;
  animation: sakura-drift var(--duration) cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  animation-delay: var(--delay);
  box-shadow:
    0 1px 2px oklch(0 0 0 / 0.06),
    inset 0 1px 1px oklch(1 0 0 / 0.3);
}

@keyframes sakura-drift {
  0% {
    transform: translate(calc(-50% + var(--start-x)), -10px) scale(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    opacity: 0.95;
    transform: translate(calc(-50% + var(--start-x)), 5px) scale(1) rotate(calc(var(--rot) * 0.05));
  }
  15% {
    transform: translate(calc(-50% + var(--start-x) * 0.7 + var(--mid-x) * 0.3), 40px) scale(0.98) rotate(calc(var(--rot) * 0.15));
    opacity: 0.92;
  }
  28% {
    transform: translate(calc(-50% + var(--mid-x) * 0.8), 95px) scale(0.96) rotate(calc(var(--rot) * 0.28));
    opacity: 0.9;
  }
  38% {
    transform: translate(calc(-50% + var(--start-x) * 0.4 + var(--mid-x) * 0.6), 140px) scale(0.94) rotate(calc(var(--rot) * 0.4));
    opacity: 0.88;
  }
  52% {
    transform: translate(calc(-50% + var(--mid-x) * 0.5 + var(--end-x) * 0.5), 200px) scale(0.92) rotate(calc(var(--rot) * 0.55));
    opacity: 0.82;
  }
  65% {
    transform: translate(calc(-50% + var(--end-x) * 0.6 + var(--mid-x) * 0.4), 270px) scale(0.88) rotate(calc(var(--rot) * 0.7));
    opacity: 0.7;
  }
  80% {
    transform: translate(calc(-50% + var(--end-x) * 0.85), 340px) scale(0.82) rotate(calc(var(--rot) * 0.85));
    opacity: 0.45;
  }
  100% {
    transform: translate(calc(-50% + var(--end-x)), 420px) scale(0.7) rotate(var(--rot));
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
    background: color-mix(in oklch, var(--gutenku-zen-primary) 15%, transparent);
    color: var(--gutenku-zen-primary);
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

.score-stars-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.numeric-score {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.85;
}

.correct-book {
  padding: 1.25rem 1rem;
  background: var(--gutenku-zen-water);
  border-radius: var(--gutenku-radius-md);
}

.book-emoticons {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 0.25rem;
}

.emoji-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 1.1rem;
  background: var(--gutenku-paper-bg);
  border-radius: var(--gutenku-radius-sm);
  border: 1px solid var(--gutenku-paper-border);
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.06),
    0 1px 2px oklch(0 0 0 / 0.04);
  opacity: 0;
  animation: emoji-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--delay) * 60ms + 200ms);
}

[data-theme='dark'] .emoji-card {
  background: oklch(0.22 0.02 60);
  border-color: oklch(0.35 0.03 55);
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.2),
    0 1px 2px oklch(0 0 0 / 0.1);
}

@keyframes emoji-pop {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.book-title {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.3;
}

.book-author {
  font-size: 0.875rem;
  margin-top: 0.25rem;
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
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-container {
  width: 100%;
}

.next-puzzle-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.countdown-digits {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.25rem;
}

.countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.digit-wrapper {
  display: flex;
  gap: 3px;
}

.digit-slot {
  position: relative;
  width: 1.5rem;
  height: 2rem;
  perspective: 100px;
}

.digit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--gutenku-text-primary);
  background: oklch(0.96 0.02 65);
  border-radius: var(--gutenku-radius-sm);
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.1);
}

[data-theme='dark'] .digit {
  background: oklch(0.28 0.02 60);
}

.unit-label {
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--gutenku-text-muted);
  margin-top: 0.25rem;
}

.countdown-separator {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gutenku-text-muted);
  padding: 0 0.125rem;
  line-height: 2rem;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.flip-enter-active,
.flip-leave-active {
  transition: all 0.15s ease-out;
}

.flip-enter-from {
  transform: translateY(-100%) rotateX(-45deg);
  opacity: 0;
}

.flip-leave-to {
  transform: translateY(100%) rotateX(45deg);
  opacity: 0;
}

.new-puzzle-ready {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--gutenku-zen-primary);
  animation: ready-pulse 1.5s ease-in-out infinite;
}

[data-theme='dark'] .new-puzzle-ready {
  color: var(--gutenku-zen-accent);
}

.new-puzzle-ready__icon {
  animation: sparkle-spin 2s linear infinite;
}

@keyframes sparkle-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.new-puzzle-ready__text {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

@keyframes ready-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.new-puzzle-ready__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--gutenku-zen-primary);
  border-radius: 50%;
  opacity: 0;
  animation: sparkle-burst 1.5s ease-out infinite;
  animation-delay: calc(var(--i) * 0.15s);

  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      left: calc(50% + cos(#{$i * 45deg}) * 40px);
      top: calc(50% + sin(#{$i * 45deg}) * 20px);
    }
  }
}

@keyframes sparkle-burst {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.play-new-btn {
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in oklch, var(--gutenku-zen-primary) 40%, transparent);
  }
  50% {
    box-shadow: 0 0 20px 4px color-mix(in oklch, var(--gutenku-zen-primary) 20%, transparent);
  }
}

.reveal-enter-active {
  animation: reveal-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal-leave-active {
  animation: reveal-out 0.3s ease-in;
}

@keyframes reveal-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes reveal-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

.fade-up-enter-active {
  animation: fade-up-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-delay: 0.2s;
  animation-fill-mode: backwards;
}

.fade-up-leave-active {
  animation: fade-up-out 0.2s ease-in;
}

@keyframes fade-up-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-up-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

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

@media (max-width: 400px) {
  :deep(.game-result) {
    padding: 1rem !important;
  }

  :deep(.score-stars--xl .star) {
    font-size: 1.5rem;
  }

  .result-header {
    margin-bottom: 0.75rem !important;
  }

  .result-icon-wrapper {
    width: 60px;
    height: 60px;
    margin-bottom: 0.5rem !important;

    svg {
      width: 36px;
      height: 36px;
    }
  }

  .score-stars-wrapper {
    margin-top: 0.5rem !important;
  }

  .correct-book {
    padding: 0.75rem;
    margin-bottom: 0.75rem !important;
  }

  .stats-summary {
    margin-bottom: 0.75rem !important;
  }

  .next-puzzle {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-icon-wrapper.won,
  .stat-item,
  .share-btn__shimmer,
  .particle--sakura,
  .todays-poem .haiku-line,
  .todays-poem-seal,
  .countdown-separator,
  .new-puzzle-ready,
  .new-puzzle-ready__icon,
  .sparkle,
  .play-new-btn,
  .emoji-card,
  .flip-enter-active,
  .flip-leave-active,
  .reveal-enter-active,
  .reveal-leave-active,
  .fade-up-enter-active,
  .fade-up-leave-active {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .todays-poem-seal {
    transform: rotate(5deg);
  }

  // Static glow effect as alternative for particles
  .result-icon-wrapper.won {
    box-shadow: 0 0 20px color-mix(in oklch, var(--gutenku-zen-primary) 30%, transparent);
  }
}
</style>
