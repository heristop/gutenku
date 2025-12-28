import { defineStore } from 'pinia';
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

export const useGameStore = defineStore({
  id: 'game',
  state: () => ({
    puzzle: null as DailyPuzzle | null,
    availableBooks: [] as BookValue[],
    currentGame: null as GameState | null,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    } as GameStats,
    loading: false,
    error: '' as string,
    showStats: false,
    showResult: false,
  }),
  persist: {
    storage: localStorage,
    paths: ['currentGame', 'stats'],
  },
  getters: {
    todayDate: () => getTodayDate(),
    puzzleNumber: (state) =>
      state.puzzle?.puzzleNumber ?? calculatePuzzleNumber(getTodayDate()),
    currentRound: (state) => state.currentGame?.currentRound ?? 1,
    revealedHints: (state): PuzzleHint[] => {
      if (!state.puzzle || !state.currentGame) {
        return [];
      }
      return state.puzzle.hints.filter(
        (h) => h.round <= state.currentGame!.currentRound,
      );
    },
    isGameComplete: (state) => state.currentGame?.isComplete ?? false,
    isGameWon: (state) => state.currentGame?.isWon ?? false,
    guesses: (state): GameGuess[] => state.currentGame?.guesses ?? [],
    attemptsRemaining: (state) => 6 - (state.currentGame?.guesses.length ?? 0),
    winRate: (state) =>
      state.stats.gamesPlayed > 0
        ? Math.round((state.stats.gamesWon / state.stats.gamesPlayed) * 100)
        : 0,
    hasPlayedToday: (state) =>
      state.currentGame?.date === getTodayDate() &&
      state.currentGame?.isComplete,
  },
  actions: {
    async fetchDailyPuzzle(): Promise<void> {
      const today = getTodayDate();

      if (this.currentGame && this.currentGame.date === today && this.puzzle) {
        return;
      }

      if (this.currentGame && this.currentGame.date !== today) {
        this.currentGame = null;
      }

      try {
        this.loading = true;
        this.error = '';

        const revealedRounds = this.currentGame
          ? Array.from(
              { length: this.currentGame.currentRound },
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
          this.puzzle = data.puzzle;
          this.availableBooks = data.availableBooks;

          if (!this.currentGame) {
            this.currentGame = {
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
        this.error = 'Failed to load puzzle';
      } finally {
        this.loading = false;
      }
    },

    async submitGuess(bookId: string, bookTitle: string): Promise<boolean> {
      if (!this.currentGame || this.currentGame.isComplete) {
        return false;
      }

      try {
        this.loading = true;

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
            date: this.currentGame.date,
            guessedBookId: bookId,
            currentRound: this.currentGame.currentRound,
          })
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        const guessResult = result.data?.submitGuess;
        if (!guessResult) {
          return false;
        }

        const currentRound = this.currentGame.currentRound;
        this.currentGame.guesses.push({
          bookId,
          bookTitle,
          isCorrect: guessResult.isCorrect,
          round: currentRound,
        });

        if (guessResult.isCorrect) {
          this.currentGame.isComplete = true;
          this.currentGame.isWon = true;
          this.recordWin(this.currentGame.currentRound);
          this.showResult = true;
          return true;
        }

        if (guessResult.nextHint && this.puzzle) {
          this.puzzle.hints.push(guessResult.nextHint);
          this.currentGame.currentRound = guessResult.nextHint.round;
        } else if (guessResult.correctBook) {
          this.currentGame.isComplete = true;
          this.currentGame.isWon = false;
          this.recordLoss();
          this.showResult = true;
        }

        return guessResult.isCorrect;
      } catch {
        this.error = 'Failed to submit guess';
        return false;
      } finally {
        this.loading = false;
      }
    },

    recordWin(round: number): void {
      this.stats.gamesPlayed++;
      this.stats.gamesWon++;
      this.stats.guessDistribution[round as 1 | 2 | 3 | 4 | 5 | 6]++;

      if (
        isYesterday(this.stats.lastPlayedDate) ||
        this.stats.lastPlayedDate === null
      ) {
        this.stats.currentStreak++;
      } else {
        this.stats.currentStreak = 1;
      }

      this.stats.maxStreak = Math.max(
        this.stats.maxStreak,
        this.stats.currentStreak,
      );
      this.stats.lastPlayedDate = getTodayDate();
    },

    recordLoss(): void {
      this.stats.gamesPlayed++;
      this.stats.currentStreak = 0;
      this.stats.lastPlayedDate = getTodayDate();
    },

    generateShareText(): string {
      if (!this.currentGame) {
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

      const roundCount = this.currentGame.isWon
        ? this.currentGame.guesses.length
        : 'X';

      let shareText = `GutenGuess #${this.currentGame.puzzleNumber} ${roundCount}/6\n\n`;

      this.currentGame.guesses.forEach((guess, index) => {
        const hint = this.puzzle?.hints.find((h) => h.round === index + 1);
        const hintEmoji = hint ? hintEmojis[hint.type] || '❓' : '❓';
        const resultEmoji = guess.isCorrect ? '🟩' : '🟥';
        shareText += `${hintEmoji} ${resultEmoji}\n`;
      });

      shareText += '\ngutenku.xyz/game';
      return shareText;
    },

    async shareResult(): Promise<void> {
      const text = this.generateShareText();

      if (navigator.share) {
        try {
          await navigator.share({ text });
        } catch {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
    },

    resetGame(): void {
      this.currentGame = null;
      this.puzzle = null;
      this.showResult = false;
      this.showStats = false;
    },
  },
});
