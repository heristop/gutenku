import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { gameEnabled } from './game-enabled';

const { mutation, query, analytics } = vi.hoisted(() => ({
  mutation: vi.fn(),
  query: vi.fn(),
  analytics: {
    completed: vi.fn(),
    guessAccepted: vi.fn(),
    helperUsed: vi.fn(),
    action: vi.fn(),
    shareRequested: vi.fn(),
  },
}));
vi.mock('@/client', () => ({ urqlClient: { mutation, query } }));
vi.mock('@/locales', () => ({ i18n: { global: { t: (key: string) => key } } }));
vi.mock('@/core/composables/toast', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn() }),
}));
vi.mock('@/features/game/composables/game-analytics', () => ({
  gameAnalytics: analytics,
}));

async function board(round = 1) {
  const { useGameStore } = await import('@/features/game/store/game');
  const store = useGameStore();
  const date = new Date().toISOString().slice(0, 10);
  store.locale = 'fr';
  store.currentGame = {
    date,
    puzzleNumber: 308,
    currentRound: round,
    guesses: [],
    isComplete: false,
    isWon: false,
    scratchedPositions: [],
    revealedHaikus: [],
  };
  store.puzzle = {
    date,
    puzzleNumber: 308,
    hints: [{ round: 1, type: 'emoticons', content: '🐰' }],
    haikus: [],
    emoticonCount: 5,
    visibleIndices: [0, 1],
    nextPuzzleAvailableAt: '',
  } as never;
  store.availableBooks = [
    { reference: '11', title: 'Alice', author: 'Lewis Carroll' },
  ];

  return store;
}

describe.runIf(gameEnabled)('measurement at actual game transitions', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    query.mockReturnValue({ toPromise: async () => ({ data: null }) });
  });
  it.each([true, false])(
    'records a terminal response once with the prior completion count (won=%s)',
    async (won) => {
      const store = await board(won ? 1 : 6);
      mutation.mockReturnValue({
        toPromise: async () => ({
          data: {
            submitGuess: {
              isCorrect: won,
              correctBook: store.availableBooks[0],
            },
          },
        }),
      });
      expect(await store.submitGuess('11', 'Alice')).toBe(
        won ? 'correct' : 'lost',
      );
      expect(analytics.guessAccepted).toHaveBeenCalledWith(
        { puzzleNumber: 308, locale: 'fr' },
        won ? 1 : 6,
      );
      expect(analytics.completed).toHaveBeenCalledWith(
        { puzzleNumber: 308, locale: 'fr' },
        {
          outcome: won ? 'won' : 'lost',
          round: won ? 1 : 6,
          score: won ? 100 : 0,
        },
        0,
      );
      expect(store.stats.gamesPlayed).toBe(1);
      await store.submitGuess('11', 'Alice');
      expect(analytics.completed).toHaveBeenCalledTimes(1);
    },
  );
  it('records an accepted miss, but no completion', async () => {
    const store = await board();
    mutation.mockReturnValue({
      toPromise: async () => ({
        data: {
          submitGuess: {
            isCorrect: false,
            nextHint: { round: 2, type: 'era', content: '19th century' },
          },
        },
      }),
    });
    expect(await store.submitGuess('11', 'Alice')).toBe('wrong');
    expect(analytics.guessAccepted).toHaveBeenCalledWith(
      { puzzleNumber: 308, locale: 'fr' },
      1,
    );
    expect(analytics.completed).not.toHaveBeenCalled();
  });
  it('records neither accepted actions nor completion on a failed request', async () => {
    const store = await board();
    mutation.mockReturnValue({
      toPromise: async () => ({ error: new Error('offline') }),
    });
    expect(await store.submitGuess('11', 'Alice')).toBe('error');
    expect(await store.scratchEmoticon(2)).toBeFalsy();
    await expect(store.revealHaiku()).rejects.toThrow('offline');
    expect(analytics.guessAccepted).not.toHaveBeenCalled();
    expect(analytics.helperUsed).not.toHaveBeenCalled();
    expect(analytics.completed).not.toHaveBeenCalled();
    expect(store.stats.gamesPlayed).toBe(0);
  });
  it('records each applied helper before any guess', async () => {
    const store = await board();
    mutation.mockReturnValueOnce({
      toPromise: async () => ({
        data: {
          revealEmoticon: {
            emoticons: '🐰⌚',
            emoticonCount: 5,
            visibleIndices: [0, 1, 2],
          },
        },
      }),
    });
    expect(await store.scratchEmoticon(2)).toBeTruthy();
    mutation.mockReturnValueOnce({
      toPromise: async () => ({ data: { revealHaiku: 'A rabbit passes' } }),
    });
    expect(await store.revealHaiku()).toBe('A rabbit passes');
    expect(analytics.helperUsed).toHaveBeenNthCalledWith(
      1,
      { puzzleNumber: 308, locale: 'fr' },
      { helper: 'emoticon', round: 1 },
      1,
    );
    expect(analytics.helperUsed).toHaveBeenNthCalledWith(
      2,
      { puzzleNumber: 308, locale: 'fr' },
      { helper: 'haiku', round: 1 },
      1,
    );
    expect(analytics.guessAccepted).not.toHaveBeenCalled();
    expect(store.stats.gamesPlayed).toBe(0);
  });
});
