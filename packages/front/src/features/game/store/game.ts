/* eslint-disable max-lines */
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
import { useToast } from '@/core/composables/toast';

const LAUNCH_DATE = '2026-01-01';

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

function cleanupCelebrationKeys(): void {
  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith('gutenguess-celebrated-'))
    .sort((a, b) => {
      const numA = Number.parseInt(a.split('-').pop() || '0', 10);
      const numB = Number.parseInt(b.split('-').pop() || '0', 10);
      return numB - numA;
    });
  for (const k of keys.slice(30)) {
    localStorage.removeItem(k);
  }
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
    const revealingCorrectBook = ref(false);
    const correctBookReference = ref<string | null>(null);

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

    // 100-point score: -10/wrong guess, -5/extra hint, -5/haiku (1st free), -2/scratch, -20/reduce books
    const numericScore = computed(() => {
      if (!currentGame.value) {
        return 0;
      }
      const wrongGuesses = currentGame.value.guesses.filter(
        (g) => !g.isCorrect,
      ).length;
      const hintsRevealed = currentGame.value.currentRound - 1; // hints beyond the first
      const haikusUsed = currentGame.value.revealedHaikus?.length ?? 0;
      const paidHaikus = Math.max(0, haikusUsed - 1); // first haiku is free
      const scratches = currentGame.value.scratchedEmoticons ?? 0;
      const bookReduction = currentGame.value.hasReducedBooks ? 20 : 0;

      const calculated =
        100 -
        wrongGuesses * 10 - // -10 per wrong guess
        hintsRevealed * 5 - // -5 per hint beyond first
        paidHaikus * 5 - // -5 per extra haiku (1st is free)
        scratches * 2 - // -2 per emoticon scratch
        bookReduction; // -20 for reducing books

      return Math.max(0, calculated);
    });

    // Star count (0-5) derived from numeric score
    const score = computed(() => {
      const s = numericScore.value;
      if (s >= 80) {
        return 5;
      }
      if (s >= 60) {
        return 4;
      }
      if (s >= 40) {
        return 3;
      }
      if (s >= 20) {
        return 2;
      }
      if (s >= 1) {
        return 1;
      }
      return 0;
    });

    // 2 base emoticons + scratched count, or all on win
    const visibleEmoticonCount = computed(() => {
      if (currentGame.value?.allEmoticonsRevealed) {
        return 99;
      }
      return 2 + (currentGame.value?.scratchedEmoticons ?? 0);
    });

    const canScratchEmoticon = computed(() => {
      if (!puzzle.value || !currentGame.value) {
        return false;
      }
      return visibleEmoticonCount.value < puzzle.value.emoticonCount;
    });

    const canRevealHaiku = computed(() => {
      if (!puzzle.value || !currentGame.value) {
        return false;
      }
      return (
        (currentGame.value.revealedHaikus?.length ?? 0) <
        puzzle.value.haikus.length
      );
    });

    const hasReducedBooks = computed(
      () => currentGame.value?.hasReducedBooks ?? false,
    );

    const canReduceBooks = computed(() => {
      if (!currentGame.value || currentGame.value.isComplete) {
        return false;
      }
      return !currentGame.value.hasReducedBooks;
    });

    // Actions
    async function fetchDailyPuzzle(): Promise<void> {
      cleanupCelebrationKeys();
      const today = getTodayDate();

      if (
        currentGame.value &&
        currentGame.value.date === today &&
        puzzle.value &&
        (!currentGame.value.isComplete || puzzle.value.hints.length >= 6)
      ) {
        return;
      }

      if (currentGame.value && currentGame.value.date !== today) {
        currentGame.value = null;
        puzzle.value = null;
        showResult.value = false;
      }

      try {
        loading.value = true;
        error.value = '';

        let revealedRounds = [1];
        if (currentGame.value?.isComplete) {
          revealedRounds = [1, 2, 3, 4, 5, 6];
        } else if (currentGame.value) {
          revealedRounds = Array.from(
            { length: currentGame.value.currentRound },
            (_, i) => i + 1,
          );
        }

        const query = gql`
          query DailyPuzzle($date: String!, $revealedRounds: [Int!]) {
            dailyPuzzle(date: $date, revealedRounds: $revealedRounds) {
              puzzle {
                date
                puzzleNumber
                haikus
                emoticonCount
                nextPuzzleAvailableAt
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
            // First haiku is always revealed
            const firstHaiku = data.puzzle.haikus[0];
            currentGame.value = {
              puzzleNumber: data.puzzle.puzzleNumber,
              date: today,
              guesses: [],
              currentRound: 1,
              isComplete: false,
              isWon: false,
              scratchedEmoticons: 0,
              allEmoticonsRevealed: false,
              revealedHaikus: firstHaiku ? [firstHaiku] : [],
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
              allHints {
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
          currentGame.value.correctBook = availableBooks.value.find(
            (b) => b.reference === bookId,
          );
          currentGame.value.allEmoticonsRevealed = true;
          if (guessResult.allHints && puzzle.value) {
            puzzle.value.hints = guessResult.allHints;
          }
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
          currentGame.value.correctBook = guessResult.correctBook;
          if (guessResult.allHints && puzzle.value) {
            puzzle.value.hints = guessResult.allHints;
          }
          recordLoss();

          // Show correct book for 1.5s before modal
          correctBookReference.value = guessResult.correctBook.reference;
          revealingCorrectBook.value = true;
          await new Promise((resolve) => {
            setTimeout(resolve, 1500);
          });
          revealingCorrectBook.value = false;
          correctBookReference.value = null;
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

      const isWon = currentGame.value.isWon;
      const roundCount = isWon ? currentGame.value.guesses.length : 'X';

      // Generate star display (only for wins)
      let starsLine = '';
      if (isWon) {
        const starCount = score.value;
        starsLine = '⭐'.repeat(starCount);
      }

      // Header with book emoji and puzzle number
      let shareText = `📚 GutenGuess #${currentGame.value.puzzleNumber}\n`;

      // Guess progression grid (6 squares total)
      const guessSquares: string[] = [];
      for (let i = 0; i < 6; i++) {
        const guess = currentGame.value.guesses[i];
        if (!guess) {
          guessSquares.push('⬜'); // Unused attempt
        } else if (guess.isCorrect) {
          guessSquares.push('🟩'); // Correct
        } else {
          guessSquares.push('🟥'); // Wrong
        }
      }
      shareText += `${guessSquares.join('')} ${roundCount}/6\n`;

      // Score line (wins only)
      if (isWon) {
        shareText += `${starsLine} ${numericScore.value}pts\n`;
      }

      shareText += '\n🎮 gutenku.xyz/game #GutenGuess';
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
      if (currentGame.value?.puzzleNumber) {
        localStorage.removeItem(
          `gutenguess-celebrated-${currentGame.value.puzzleNumber}`,
        );
      }
      currentGame.value = null;
      puzzle.value = null;
      showResult.value = false;
      showStats.value = false;
    }

    function scratchEmoticon(): boolean {
      if (!currentGame.value || !canScratchEmoticon.value) {
        return false;
      }
      if (currentGame.value.scratchedEmoticons === undefined) {
        currentGame.value.scratchedEmoticons = 0;
      }
      currentGame.value.scratchedEmoticons++;
      return true;
    }

    function revealHaiku(): string | null {
      if (!puzzle.value || !currentGame.value || !canRevealHaiku.value) {
        return null;
      }
      if (!currentGame.value.revealedHaikus) {
        currentGame.value.revealedHaikus = [];
      }
      const nextIndex = currentGame.value.revealedHaikus.length;
      const haiku = puzzle.value.haikus[nextIndex];
      if (haiku) {
        currentGame.value.revealedHaikus.push(haiku);
      }
      return haiku ?? null;
    }

    async function reduceBooks(): Promise<boolean> {
      if (!currentGame.value || !canReduceBooks.value) {
        return false;
      }

      const toast = useToast();

      try {
        loading.value = true;

        const query = gql`
          query ReduceBooks($date: String!) {
            reduceBooks(date: $date) {
              reference
              title
              author
              emoticons
            }
          }
        `;

        const result = await urqlClient
          .query<{ reduceBooks: BookValue[] }>(query, {
            date: currentGame.value.date,
          })
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        if (result.data?.reduceBooks) {
          availableBooks.value = result.data.reduceBooks;
          currentGame.value.hasReducedBooks = true;
          toast.success('Books reduced to 30!');
          return true;
        }
        return false;
      } catch {
        toast.error('Failed to reduce books. Please try again.');
        return false;
      } finally {
        loading.value = false;
      }
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
      revealingCorrectBook,
      correctBookReference,
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
      score,
      numericScore,
      visibleEmoticonCount,
      canScratchEmoticon,
      canRevealHaiku,
      hasReducedBooks,
      canReduceBooks,
      // Actions
      fetchDailyPuzzle,
      submitGuess,
      recordWin,
      recordLoss,
      generateShareText,
      shareResult,
      resetGame,
      scratchEmoticon,
      revealHaiku,
      reduceBooks,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['currentGame', 'stats', 'showResult'],
      afterHydrate: (ctx) => {
        const today = new Date().toISOString().split('T')[0];
        const state = ctx.store.$state as {
          currentGame: GameState | null;
          showResult: boolean;
        };

        if (state.currentGame?.date && state.currentGame.date !== today) {
          state.currentGame = null;
          state.showResult = false;
        }
      },
    },
  },
);
