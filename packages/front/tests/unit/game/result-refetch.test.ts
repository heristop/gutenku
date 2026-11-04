import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { gameEnabled } from './game-enabled';

const { query, mutation } = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('@/client', () => ({ urqlClient: { query, mutation } }));
vi.mock('@/locales', () => ({
  i18n: { global: { t: (key: string) => key } },
}));
vi.mock('@/core/composables/toast', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));

describe.runIf(gameEnabled)('completed result puzzle refresh', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  it.each([true, false])(
    'preserves the stored anecdote after a refresh (won: %s)',
    async (isWon) => {
      const { useGameStore } = await import('@/features/game/store/game');
      const { getTodayDate } =
        await import('@/features/game/store/game-store-helpers');
      const today = getTodayDate();
      const store = useGameStore();
      const correctBook = {
        reference: '11',
        title: 'Alice',
        author: 'Lewis Carroll',
        emoticons: '🐰',
        anecdote: 'Alice began as a story told on a boat trip in 1862.',
      };
      store.currentGame = {
        date: today,
        puzzleNumber: 308,
        currentRound: 6,
        guesses: [],
        isComplete: true,
        isWon,
        correctBook,
      };
      const refreshedPuzzle = {
        date: today,
        puzzleNumber: 308,
        hints: [],
        haikus: [],
        emoticonCount: 5,
        visibleIndices: [],
        nextPuzzleAvailableAt: new Date(Date.now() + 86_400_000).toISOString(),
      };
      query.mockReturnValue({
        toPromise: () =>
          Promise.resolve({
            data: {
              dailyPuzzle: {
                puzzle: refreshedPuzzle,
                availableBooks: [
                  { reference: '11', title: 'Alice', author: 'Lewis Carroll' },
                ],
              },
            },
          }),
      });

      await store.fetchDailyPuzzle(true);

      expect(store.error).toBe('');
      expect(store.puzzle).toEqual(refreshedPuzzle);
      expect(store.correctBook).toEqual(correctBook);
      expect(mutation).not.toHaveBeenCalled();

      // A legacy cached result stays usable without replaying a guess to enrich it.
      delete store.currentGame!.correctBook!.anecdote;
      await store.fetchDailyPuzzle(true);
      expect(store.correctBook?.title).toBe('Alice');
      expect(store.correctBook?.anecdote).toBeUndefined();
      expect(mutation).not.toHaveBeenCalled();
    },
  );
});
