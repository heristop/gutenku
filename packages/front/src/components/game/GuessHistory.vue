<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CircleCheck, CircleX } from 'lucide-vue-next';
import type { GameGuess, PuzzleHint } from '@gutenku/shared';

const props = defineProps<{
  guesses: GameGuess[];
  hints: PuzzleHint[];
}>();

const { t } = useI18n();

const hintIcons: Record<string, string> = {
  emoticons: '😀',
  haiku: '🎭',
  genre_era: '📖',
  quote: '💬',
  letter_author: '🔤',
  author_name: '👤',
};

const guessesWithHints = computed(() => {
  return props.guesses.map((guess, index) => {
    const hint = props.hints[index];
    return {
      ...guess,
      hintIcon: hint ? hintIcons[hint.type] || '❓' : '❓',
      hintType: hint?.type || 'unknown',
    };
  });
});
</script>

<template>
  <div class="guess-history">
    <div
      v-for="(guess, index) in guessesWithHints"
      :key="index"
      class="guess-item"
      :class="{
        'guess-correct': guess.isCorrect,
        'guess-wrong': !guess.isCorrect,
      }"
    >
      <div class="guess-hint-icon">
        {{ guess.hintIcon }}
      </div>
      <div class="guess-book">
        {{ guess.bookTitle }}
      </div>
      <div class="guess-result">
        <CircleCheck
          v-if="guess.isCorrect"
          :size="18"
          class="result-icon correct"
        />
        <CircleX v-else :size="18" class="result-icon wrong" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.guess-history {
  border-bottom: 1px solid var(--gutenku-paper-border);
}

.guess-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--gutenku-paper-border);

  @media (min-width: 600px) {
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
  }
  animation: guess-appear 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    transform: translateX(4px);
    background: oklch(0.5 0.05 55 / 0.04);
  }

  &.guess-correct {
    background: oklch(0.65 0.18 145 / 0.08);
    animation:
      guess-appear 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
      correct-glow 1.5s ease-out;

    &:hover {
      background: oklch(0.65 0.18 145 / 0.12);
    }
  }

  @keyframes correct-glow {
    0% {
      box-shadow: 0 0 0 0 oklch(0.65 0.18 145 / 0.4);
    }
    50% {
      box-shadow: 0 0 20px 4px oklch(0.65 0.18 145 / 0.2);
    }
    100% {
      box-shadow: none;
    }
  }

  &.guess-wrong {
    background: oklch(0.6 0.2 25 / 0.05);
    animation: guess-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);

    &:hover {
      background: oklch(0.6 0.2 25 / 0.08);
    }
  }
}

@keyframes guess-appear {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes guess-shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px);
  }
  40%, 80% {
    transform: translateX(4px);
  }
}

.guess-hint-icon {
  font-size: 1rem;
  flex-shrink: 0;

  @media (min-width: 600px) {
    font-size: 1.25rem;
  }
}

.guess-book {
  flex: 1;
  font-size: 0.8rem;
  color: var(--gutenku-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 600px) {
    font-size: 0.9rem;
  }
}

.guess-result {
  flex-shrink: 0;
}

.result-icon {
  &.correct {
    color: oklch(0.65 0.18 145);
  }

  &.wrong {
    color: oklch(0.6 0.2 25);
  }
}

@media (prefers-reduced-motion: reduce) {
  .guess-item {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
