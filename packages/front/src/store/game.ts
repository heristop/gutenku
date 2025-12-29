import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  BookValue,
  DailyPuzzle,
  DailyPuzzleResponse,
  GameGuess,
  GameState,
  GameStats,
  GuessResult,
  PuzzleHint,
} from '@gutenku/shared';
import { gql } from '@urql/vue';
import { urqlClient } from '@/client';

const LAUNCH_DATE = '2025-01-01';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function calculatePuzzleNumber(dateStr: string): number {
  const launch = new Date(LAUNCH_DATE);
  const current = new Date(dateStr);
  return Math.floor((current.getTime() - launch.getTime()) / 86400000) + 1;
}

function isYesterday(dateStr: string | null): boolean {
  if (!dateStr) {
    return false;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

export const useGameStore = defineStore(
  'game',
  () => {
    // State
    const puzzle = ref<DailyPuzzle | null>(null);
    const availableBooks = ref<BookValue[]>([]);
    const currentGame = ref<GameState | null>(null);
    const stats = ref<GameStats>({
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    });
    const loading = ref(false);
    const error = ref('');
    const showStats = ref(false);
    const showResult = ref(false);

    // Getters
    const todayDate = computed(() => getTodayDate());
    const puzzleNumber = computed(
      () => puzzle.value?.puzzleNumber ?? calculatePuzzleNumber(getTodayDate()),
    );
    const currentRound = computed(() => currentGame.value?.currentRound ?? 1);
    const revealedHints = computed((): PuzzleHint[] => {
      if (!puzzle.value || !currentGame.value) {
        return [];
      }
      return puzzle.value.hints.filter(
        (h) => h.round <= currentGame.value!.currentRound,
      );
    });
    const isGameComplete = computed(
      () => currentGame.value?.isComplete ?? false,
    );
    const isGameWon = computed(() => currentGame.value?.isWon ?? false);
    const guesses = computed(
      (): GameGuess[] => currentGame.value?.guesses ?? [],
    );
    const attemptsRemaining = computed(
      () => 6 - (currentGame.value?.guesses.length ?? 0),
    );
    const winRate = computed(() =>
      stats.value.gamesPlayed > 0
        ? Math.round((stats.value.gamesWon / stats.value.gamesPlayed) * 100)
        : 0,
    );
    const hasPlayedToday = computed(
      () =>
        currentGame.value?.date === getTodayDate() &&
        currentGame.value?.isComplete,
    );

    // Actions
    async function fetchDailyPuzzle(): Promise<void> {
      const today = getTodayDate();

      if (
        currentGame.value &&
        currentGame.value.date === today &&
        puzzle.value
      ) {
        return;
      }

      if (currentGame.value && currentGame.value.date !== today) {
        currentGame.value = null;
      }

      try {
        loading.value = true;
        error.value = '';

        const revealedRounds = currentGame.value
          ? Array.from(
              { length: currentGame.value.currentRound },
              (_, i) => i + 1,
            )
          : [1];

        const query = gql`
          query DailyPuzzle($date: String!, $revealedRounds: [Int!]) {
            dailyPuzzle(date: $date, revealedRounds: $revealedRounds) {
              puzzle {
                date
                puzzleNumber
                hints {
                  round
                  type
                  content
                }
              }
              availableBooks {
                reference
                title
                author
                emoticons
              }
            }
          }
        `;

        const result = await urqlClient
          .query<{ dailyPuzzle: DailyPuzzleResponse }>(query, {
            date: today,
            revealedRounds,
          })
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        const data = result.data?.dailyPuzzle;
        if (data) {
          puzzle.value = data.puzzle;
          availableBooks.value = data.availableBooks;

          if (!currentGame.value) {
            currentGame.value = {
              puzzleNumber: data.puzzle.puzzleNumber,
              date: today,
              guesses: [],
              currentRound: 1,
              isComplete: false,
              isWon: false,
            };
          }
        }
      } catch {
        error.value = 'Failed to load puzzle';
      } finally {
        loading.value = false;
      }
    }

    async function submitGuess(
      bookId: string,
      bookTitle: string,
    ): Promise<boolean> {
      if (!currentGame.value || currentGame.value.isComplete) {
        return false;
      }

      try {
        loading.value = true;

        const mutation = gql`
          query SubmitGuess(
            $date: String!
            $guessedBookId: ID!
            $currentRound: Int!
          ) {
            submitGuess(
              date: $date
              guessedBookId: $guessedBookId
              currentRound: $currentRound
            ) {
              isCorrect
              correctBook {
                reference
                title
                author
                emoticons
              }
              nextHint {
                round
                type
                content
              }
            }
          }
        `;

        const result = await urqlClient
          .query<{ submitGuess: GuessResult }>(mutation, {
            date: currentGame.value.date,
            guessedBookId: bookId,
            currentRound: currentGame.value.currentRound,
          })
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        const guessResult = result.data?.submitGuess;
        if (!guessResult) {
          return false;
        }

        const round = currentGame.value.currentRound;
        currentGame.value.guesses.push({
          bookId,
          bookTitle,
          isCorrect: guessResult.isCorrect,
          round,
        });

        if (guessResult.isCorrect) {
          currentGame.value.isComplete = true;
          currentGame.value.isWon = true;
          recordWin(currentGame.value.currentRound);
          showResult.value = true;
          return true;
        }

        if (guessResult.nextHint && puzzle.value) {
          puzzle.value.hints.push(guessResult.nextHint);
          currentGame.value.currentRound = guessResult.nextHint.round;
        } else if (guessResult.correctBook) {
          currentGame.value.isComplete = true;
          currentGame.value.isWon = false;
          recordLoss();
          showResult.value = true;
        }

        return guessResult.isCorrect;
      } catch {
        error.value = 'Failed to submit guess';
        return false;
      } finally {
        loading.value = false;
      }
    }

    function recordWin(round: number): void {
      stats.value.gamesPlayed++;
      stats.value.gamesWon++;
      stats.value.guessDistribution[round as 1 | 2 | 3 | 4 | 5 | 6]++;

      if (
        isYesterday(stats.value.lastPlayedDate) ||
        stats.value.lastPlayedDate === null
      ) {
        stats.value.currentStreak++;
      } else {
        stats.value.currentStreak = 1;
      }

      stats.value.maxStreak = Math.max(
        stats.value.maxStreak,
        stats.value.currentStreak,
      );
      stats.value.lastPlayedDate = getTodayDate();
    }

    function recordLoss(): void {
      stats.value.gamesPlayed++;
      stats.value.currentStreak = 0;
      stats.value.lastPlayedDate = getTodayDate();
    }

    function generateShareText(): string {
      if (!currentGame.value) {
        return '';
      }

      const hintEmojis: Record<string, string> = {
        emoticons: '😀',
        haiku: '🎭',
        genre_era: '📖',
        quote: '💬',
        letter_author: '🔤',
        author_name: '👤',
      };

      const roundCount = currentGame.value.isWon
        ? currentGame.value.guesses.length
        : 'X';

      let shareText = `GutenGuess #${currentGame.value.puzzleNumber} ${roundCount}/6\n\n`;

      currentGame.value.guesses.forEach((guess, index) => {
        const hint = puzzle.value?.hints.find((h) => h.round === index + 1);
        const hintEmoji = hint ? hintEmojis[hint.type] || '❓' : '❓';
        const resultEmoji = guess.isCorrect ? '🟩' : '🟥';
        shareText += `${hintEmoji} ${resultEmoji}\n`;
      });

      shareText += '\ngutenku.xyz/game';
      return shareText;
    }

    async function shareResult(): Promise<void> {
      const text = generateShareText();

      if (navigator.share) {
        try {
          await navigator.share({ text });
        } catch {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
    }

    function resetGame(): void {
      currentGame.value = null;
      puzzle.value = null;
      showResult.value = false;
      showStats.value = false;
    }

    return {
      // State
      puzzle,
      availableBooks,
      currentGame,
      stats,
      loading,
      error,
      showStats,
      showResult,
      // Getters
      todayDate,
      puzzleNumber,
      currentRound,
      revealedHints,
      isGameComplete,
      isGameWon,
      guesses,
      attemptsRemaining,
      winRate,
      hasPlayedToday,
      // Actions
      fetchDailyPuzzle,
      submitGuess,
      recordWin,
      recordLoss,
      generateShareText,
      shareResult,
      resetGame,
    };
  },
  {
    persist: {
      storage: localStorage,
      paths: ['currentGame', 'stats'],
    },
  },
);
