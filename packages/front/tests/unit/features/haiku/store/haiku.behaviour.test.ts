import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createApp } from 'vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import type { HaikuValue } from '@gutenku/shared';

// --- urql client mock with controllable query/subscription behaviour ---
const queryToPromise = vi.fn();
let subscribeImpl: (sink: (result: unknown) => void) => {
  unsubscribe: () => void;
};

vi.mock('@/client', () => ({
  urqlClient: {
    query: vi.fn(() => ({ toPromise: queryToPromise })),
    subscription: vi.fn(() => ({
      subscribe: (sink: (result: unknown) => void) => subscribeImpl(sink),
    })),
  },
}));

vi.mock('@lucide/vue', () => ({ Leaf: { name: 'Leaf' } }));

function makeHaiku(overrides: Partial<HaikuValue> = {}): HaikuValue {
  return {
    book: { title: 'Moby Dick', author: 'Melville' },
    chapter: { title: 'Ch1', content: 'content' },
    verses: ['one', 'two', 'three'],
    cacheUsed: false,
    executionTime: 5,
    ...overrides,
  } as unknown as HaikuValue;
}

async function freshStore() {
  const { useHaikuStore } = await import('@/features/haiku/store/haiku');
  
return useHaikuStore();
}

describe('useHaikuStore behaviour', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'));
    // default subscription does nothing
    subscribeImpl = () => ({ unsubscribe: vi.fn() });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches the daily haiku and updates state + stats', async () => {
    const daily = makeHaiku();
    queryToPromise
      // first call: DAILY_HAIKU_QUERY
      .mockResolvedValueOnce({ data: { haiku: daily }, error: null })
      // second call: HAIKU_VERSION_QUERY (cacheDailyHaiku)
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v1' } },
        error: null,
      });

    const store = await freshStore();
    await store.fetchNewHaiku();
    await vi.runOnlyPendingTimersAsync();

    expect(store.haiku).toEqual(daily);
    expect(store.isDailyHaiku).toBeTruthy();
    expect(store.firstLoaded).toBeTruthy();
    expect(store.loading).toBeFalsy();
    expect(store.stats.dailyHaikuViews).toBe(1);
    expect(store.historyLength).toBe(1);
    expect(store.cachedVersion).toBe('v1');
    expect(store.cachedDailyHaiku?.date).toBe('2026-05-22');
  });

  it('records a network error when the daily query fails', async () => {
    queryToPromise.mockResolvedValueOnce({
      data: null,
      error: new Error('boom'),
    });

    const store = await freshStore();
    await store.fetchNewHaiku();

    expect(store.error).toBe('network-error');
    expect(store.networkError).toBeTruthy();
    expect(store.notificationError).toBeTruthy();
  });

  it('surfaces a friendly message for max-attempts errors', async () => {
    queryToPromise.mockResolvedValueOnce({
      data: null,
      error: { graphQLErrors: [{ message: 'max-attempts-error' }] },
    });

    const store = await freshStore();
    await store.fetchNewHaiku();

    expect(store.error).toContain('No haiku found matching your filters');
  });

  it('uses a valid cached daily haiku without refetching', async () => {
    const cached = makeHaiku({ title: 'Cached' });
    // version check returns matching version
    queryToPromise.mockResolvedValueOnce({
      data: { haikuVersion: { version: 'v1' } },
      error: null,
    });

    const store = await freshStore();
    store.cachedVersion = 'v1';
    store.cachedDailyHaiku = { haiku: cached, date: '2026-05-22' };

    await store.fetchNewHaiku();

    expect(store.haiku).toEqual(cached);
    expect(store.isDailyHaiku).toBeTruthy();
    expect(store.historyLength).toBe(1);
  });

  it('runs the iterative subscription flow once daily was already loaded', async () => {
    const best = makeHaiku({ verses: ['a', 'b', 'c'], cacheUsed: false });

    subscribeImpl = (sink) => {
      // progress with a best haiku (adds a crafting message)
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 1,
            totalIterations: 10,
            bestScore: 5,
            isComplete: false,
            bestHaiku: best,
          },
        },
      });
      // completion
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 10,
            totalIterations: 10,
            bestScore: 8,
            isComplete: true,
            bestHaiku: best,
          },
        },
      });
      
return { unsubscribe: vi.fn() };
    };

    const store = await freshStore();
    store.firstLoaded = true; // forces iterative path

    await store.fetchNewHaiku();

    expect(store.haiku).toEqual(best);
    expect(store.isDailyHaiku).toBeFalsy();
    expect(store.stats.haikusGenerated).toBe(1);
    expect(store.craftingMessages.length).toBeGreaterThan(0);
    expect(store.generationProgress.current).toBe(10);
  });

  it('handles subscription errors by rejecting and recording the error', async () => {
    subscribeImpl = (sink) => {
      sink({ error: new Error('sub failed') });
      
return { unsubscribe: vi.fn() };
    };

    const store = await freshStore();
    store.firstLoaded = true;

    await store.fetchNewHaiku();

    expect(store.error).toBe('network-error');
    expect(store.isGenerating).toBeFalsy();
  });

  it('stopGeneration resolves the in-flight subscription', async () => {
    const unsubscribe = vi.fn();
    let resolved = false;
    subscribeImpl = () => ({ unsubscribe });

    const store = await freshStore();
    store.firstLoaded = true;

    const promise = store.fetchNewHaiku().then(() => {
      resolved = true;
    });

    store.stopGeneration();
    await promise;

    expect(resolved).toBeTruthy();
    expect(unsubscribe).toHaveBeenCalled();
    expect(store.isGenerating).toBeFalsy();
  });

  it('navigates history with goBack and goForward', async () => {
    const best1 = makeHaiku({ title: 'H1' });
    const best2 = makeHaiku({ title: 'H2' });
    let call = 0;

    subscribeImpl = (sink) => {
      const h = call++ === 0 ? best1 : best2;
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 1,
            totalIterations: 1,
            bestScore: 1,
            isComplete: true,
            bestHaiku: h,
          },
        },
      });
      
return { unsubscribe: vi.fn() };
    };

    const store = await freshStore();
    store.firstLoaded = true;

    await store.fetchNewHaiku();
    await store.fetchNewHaiku();

    expect(store.historyLength).toBe(2);
    expect(store.canGoBack).toBeTruthy();
    expect(store.canGoForward).toBeFalsy();

    expect(store.goBack()).toBeTruthy();
    expect(store.haiku.title).toBe('H1');
    expect(store.canGoForward).toBeTruthy();

    expect(store.goForward()).toBeTruthy();
    expect(store.haiku.title).toBe('H2');

    // boundaries
    store.goForward();
    expect(store.goForward()).toBeFalsy();
    store.goBack();
    store.goBack();
    expect(store.goBack()).toBeFalsy();
  });

  it('exposes AI image themes only when image AI + DEV are enabled', async () => {
    const store = await freshStore();
    const baseGroups = store.themeOptions.map((g) => g.group);
    expect(baseGroups).toEqual(['random', 'classic']);

    store.optionImageAI = true;
    // import.meta.env.DEV is true in the test setup
    const aiGroups = store.themeOptions.map((g) => g.group);
    expect(aiGroups).toContain('ai');
  });

  it('computes avgExecutionTime from generated stats', async () => {
    const store = await freshStore();
    expect(store.avgExecutionTime).toBe(0);

    store.stats.haikusGenerated = 2;
    store.stats.totalExecutionTime = 10;
    expect(store.avgExecutionTime).toBe(5);
  });

  it('refetches the daily haiku when the cached version is stale', async () => {
    const fresh = makeHaiku({ title: 'Fresh' });
    queryToPromise
      // checkHaikuVersion -> different version than cached
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v2' } },
        error: null,
      })
      // DAILY_HAIKU_QUERY
      .mockResolvedValueOnce({ data: { haiku: fresh }, error: null })
      // cacheDailyHaiku version query
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v2' } },
        error: null,
      });

    const store = await freshStore();
    store.cachedVersion = 'v1';
    store.cachedDailyHaiku = {
      haiku: makeHaiku({ title: 'Old' }),
      date: '2026-05-22',
    };

    await store.fetchNewHaiku();
    await vi.runOnlyPendingTimersAsync();

    expect(store.haiku.title).toBe('Fresh');
  });

  it('treats a missing version response as invalid during the version check', async () => {
    queryToPromise
      // checkHaikuVersion -> error
      .mockResolvedValueOnce({ data: null, error: new Error('x') })
      // DAILY_HAIKU_QUERY (falls through to fetch)
      .mockResolvedValueOnce({
        data: { haiku: makeHaiku() },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });

    const store = await freshStore();
    store.cachedVersion = 'v1';
    store.cachedDailyHaiku = { haiku: makeHaiku(), date: '2026-05-22' };

    await store.fetchNewHaiku();
    await vi.runOnlyPendingTimersAsync();

    expect(store.firstLoaded).toBeTruthy();
  });

  it('counts books and avoids double counting cached daily views in stats', async () => {
    const daily = makeHaiku({
      book: { title: 'Frankenstein', author: 'Shelley' },
    } as Partial<HaikuValue>);
    queryToPromise
      .mockResolvedValueOnce({ data: { haiku: daily }, error: null })
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v1' } },
        error: null,
      });

    const store = await freshStore();
    await store.fetchNewHaiku();
    await vi.runOnlyPendingTimersAsync();

    expect(store.stats.books).toContain('Frankenstein');
    expect(store.stats.booksBrowsed).toBe(1);
    expect(store.stats.bookCounts.Frankenstein).toBe(1);
    // daily view increments dailyHaikuViews, not haikusGenerated
    expect(store.stats.dailyHaikuViews).toBe(1);
    expect(store.stats.haikusGenerated).toBe(0);
  });

  it('does not increment generated count for cache-used haiku', async () => {
    const best = makeHaiku({ cacheUsed: true });
    subscribeImpl = (sink) => {
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 1,
            totalIterations: 1,
            bestScore: 1,
            isComplete: true,
            bestHaiku: best,
          },
        },
      });
      
return { unsubscribe: vi.fn() };
    };

    const store = await freshStore();
    store.firstLoaded = true;
    await store.fetchNewHaiku();

    expect(store.stats.haikusGenerated).toBe(0);
  });

  it('handles a null haiku response without updating state', async () => {
    queryToPromise.mockResolvedValueOnce({
      data: { haiku: null },
      error: null,
    });

    const store = await freshStore();
    await store.fetchNewHaiku();

    expect(store.historyLength).toBe(0);
    expect(store.firstLoaded).toBeTruthy();
  });

  function completeWith(h: HaikuValue) {
    return (sink: (r: unknown) => void) => {
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 1,
            totalIterations: 1,
            bestScore: 1,
            isComplete: true,
            bestHaiku: h,
          },
        },
      });
      
return { unsubscribe: vi.fn() };
    };
  }

  it('truncates forward history when generating after going back', async () => {
    const haikus = [
      makeHaiku({ title: 'A' }),
      makeHaiku({ title: 'B' }),
      makeHaiku({ title: 'C' }),
    ];
    let i = 0;
    subscribeImpl = (sink) => completeWith(haikus[i++])(sink);

    const store = await freshStore();
    store.firstLoaded = true;

    await store.fetchNewHaiku(); // A
    await store.fetchNewHaiku(); // B
    expect(store.historyLength).toBe(2);

    store.goBack(); // now at A
    await store.fetchNewHaiku(); // C replaces forward (B dropped)

    expect(store.historyLength).toBe(2);
    expect(store.haiku.title).toBe('C');
    expect(store.canGoForward).toBeFalsy();
  });

  it('caps history at the maximum size', async () => {
    let n = 0;
    subscribeImpl = (sink) =>
      completeWith(makeHaiku({ title: `H${n++}` }))(sink);

    const store = await freshStore();
    store.firstLoaded = true;

    for (let k = 0; k < 12; k++) {
      await store.fetchNewHaiku();
    }

    expect(store.historyLength).toBe(10);
  });

  it('counts generated haiku without an executionTime', async () => {
    subscribeImpl = completeWith(
      makeHaiku({ executionTime: undefined, cacheUsed: false }),
    );

    const store = await freshStore();
    store.firstLoaded = true;
    await store.fetchNewHaiku();

    expect(store.stats.haikusGenerated).toBe(1);
    expect(store.stats.totalExecutionTime).toBe(0);
  });

  it('skips book stats when the haiku has no book title', async () => {
    subscribeImpl = completeWith(
      makeHaiku({ book: undefined } as Partial<HaikuValue>),
    );

    const store = await freshStore();
    store.firstLoaded = true;
    await store.fetchNewHaiku();

    expect(store.stats.booksBrowsed).toBe(0);
    expect(store.stats.books).toEqual([]);
  });

  it('ignores cached daily haiku when no cached version is present', async () => {
    const daily = makeHaiku({ title: 'Server' });
    queryToPromise
      // checkHaikuVersion (cachedDailyHaiku.date === today triggers it)
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v1' } },
        error: null,
      })
      // DAILY_HAIKU_QUERY (cachedVersion null -> tryUseCached fails -> fetch)
      .mockResolvedValueOnce({ data: { haiku: daily }, error: null })
      // cacheDailyHaiku version query
      .mockResolvedValueOnce({
        data: { haikuVersion: { version: 'v1' } },
        error: null,
      });

    const store = await freshStore();
    store.cachedDailyHaiku = {
      haiku: makeHaiku({ title: 'Stale' }),
      date: '2026-05-22',
    };
    store.cachedVersion = null;

    await store.fetchNewHaiku();
    await vi.runOnlyPendingTimersAsync();

    expect(store.haiku.title).toBe('Server');
  });

  it('clears a stale cached daily haiku on hydration via persisted state', async () => {
    const staleHaiku = makeHaiku({ title: 'Yesterday' });
    // persisted under the store id "haiku"
    localStorage.setItem(
      'haiku',
      JSON.stringify({
        cachedVersion: 'v1',
        cachedDailyHaiku: { haiku: staleHaiku, date: '2020-01-01' },
        stats: {
          haikusGenerated: 0,
          dailyHaikuViews: 0,
          booksBrowsed: 0,
          totalExecutionTime: 0,
          books: [],
          bookCounts: {},
        },
      }),
    );

    // pinia with the persistedstate plugin so afterHydrate runs
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);
    const app = createApp({ render: () => null });
    app.use(pinia);
    setActivePinia(pinia);

    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    // afterHydrate detects the stale date and clears the cache
    expect(store.cachedDailyHaiku).toBeNull();
    expect(store.cachedVersion).toBeNull();
  });

  it('completes generation even when no bestHaiku is provided', async () => {
    subscribeImpl = (sink) => {
      // progress update without verses
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 1,
            totalIterations: 2,
            bestScore: 0,
            isComplete: false,
          },
        },
      });
      // completion without bestHaiku
      sink({
        data: {
          haikuGeneration: {
            currentIteration: 2,
            totalIterations: 2,
            bestScore: 0,
            isComplete: true,
          },
        },
      });
      
return { unsubscribe: vi.fn() };
    };

    const store = await freshStore();
    store.firstLoaded = true;
    await store.fetchNewHaiku();

    expect(store.craftingMessages).toEqual([]);
    expect(store.isGenerating).toBeFalsy();
  });
});
