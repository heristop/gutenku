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

    // 100-point score calculation
    // Base: 100, deductions: -10/wrong guess, -5/extra hint, -5/haiku, -2/scratch
    const numericScore = computed(() => {
      if (!currentGame.value) {
        return 0;
      }
      const wrongGuesses = currentGame.value.guesses.filter(
        (g) => !g.isCorrect,
      ).length;
      const hintsRevealed = currentGame.value.currentRound - 1; // hints beyond the first
      const haikusUsed = currentGame.value.revealedHaikus?.length ?? 0;
      const scratches = currentGame.value.scratchedEmoticons ?? 0;

      const calculated =
        100 -
        wrongGuesses * 10 - // -10 per wrong guess
        hintsRevealed * 5 - // -5 per hint beyond first
        haikusUsed * 5 - // -5 per haiku lifeline
        scratches * 2; // -2 per emoticon scratch

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

    // Actions
    async function fetchDailyPuzzle(): Promise<void> {
      cleanupCelebrationKeys();
      const today = getTodayDate();

      // Skip fetch if current puzzle is still valid
      if (
        currentGame.value &&
        currentGame.value.date === today &&
        puzzle.value &&
        (!currentGame.value.isComplete || puzzle.value.hints.length >= 6)
      ) {
        return;
      }

      // Clear game data when date changes
      if (currentGame.value && currentGame.value.date !== today) {
        currentGame.value = null;
        showResult.value = false;
      }

      try {
        loading.value = true;
        error.value = '';

        // Fetch all hints if game complete, otherwise only current round hints
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
              scratchedEmoticons: 0,
              allEmoticonsRevealed: false,
              revealedHaikus: [],
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
      let starsDisplay = '';
      if (isWon) {
        const starCount = score.value;
        const emptyStars = 5 - starCount;
        starsDisplay =
          '⭐'.repeat(starCount) + '☆'.repeat(Math.max(0, emptyStars));
      }

      // Header with puzzle number, stars and score (format: #YYYY-N)
      const year = currentGame.value.date.split('-')[0];
      let shareText = `GutenGuess #${year}-${currentGame.value.puzzleNumber}`;
      if (isWon) {
        shareText += ` ${starsDisplay} (${numericScore.value}/100)`;
      } else {
        shareText += ' 💔';
      }
      shareText += '\n\n';

      // Guess progression with result squares
      const guessLine = currentGame.value.guesses
        .map((g) => (g.isCorrect ? '🟩' : '🟥'))
        .join('');
      shareText += `${guessLine} ${roundCount}/6\n`;

      // Lifelines summary
      const scratches = currentGame.value.scratchedEmoticons ?? 0;
      const haikusUsed = currentGame.value.revealedHaikus?.length ?? 0;
      const emoticonTotal = puzzle.value?.emoticonCount ?? 5;

      // Emoticon progress bar: ██░░░
      const visibleEmoticons = 2 + scratches;
      const filledBlocks = '█'.repeat(visibleEmoticons);
      const emptyBlocks = '░'.repeat(
        Math.max(0, emoticonTotal - visibleEmoticons),
      );
      shareText += `😀 ${filledBlocks}${emptyBlocks} ${visibleEmoticons}/${emoticonTotal}\n`;

      // Haiku usage indicator
      const maxHaikus = puzzle.value?.haikus.length ?? 3;
      const haikuBars =
        '━'.repeat(haikusUsed) +
        '┄'.repeat(Math.max(0, maxHaikus - haikusUsed));
      shareText += `🎭 ${haikuBars} ${haikusUsed}/${maxHaikus}\n`;

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
      // Initialize if missing (for old persisted state)
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
      // Initialize revealedHaikus if missing (for old persisted state)
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
      score,
      numericScore,
      visibleEmoticonCount,
      canScratchEmoticon,
      canRevealHaiku,
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
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ['currentGame', 'stats', 'showResult'],
    },
  },
);
