import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock urql client
vi.mock('@/client', () => ({
  urqlClient: {
    query: vi.fn().mockReturnValue({
      toPromise: vi.fn().mockResolvedValue({
        data: { haiku: null },
        error: null,
      }),
    }),
    subscription: vi.fn().mockReturnValue({
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
  },
}));

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Leaf: {},
}));

describe('useHaikuStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be importable', async () => {
    const module = await import('@/features/haiku/store/haiku');
    expect(module.useHaikuStore).toBeDefined();
  });

  it('should create store with initial state', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.loading).toBe(false);
    expect(store.firstLoaded).toBe(false);
    expect(store.isDailyHaiku).toBe(false);
    expect(store.error).toBe('');
    expect(store.isGenerating).toBe(false);
  });

  it('should have default option values', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.optionDrawerOpened).toBe(false);
    expect(store.optionUseCache).toBe(true);
    expect(store.optionUseAI).toBe(false);
    expect(store.optionImageAI).toBe(false);
    expect(store.optionTheme).toBe('random');
    expect(store.optionIterations).toBe(10);
  });

  it('should initialize stats correctly', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.stats.haikusGenerated).toBe(0);
    expect(store.stats.dailyHaikuViews).toBe(0);
    expect(store.stats.booksBrowsed).toBe(0);
    expect(store.stats.totalExecutionTime).toBe(0);
    expect(store.stats.books).toEqual([]);
    expect(store.stats.bookCounts).toEqual({});
  });

  it('should have correct computed properties', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.networkError).toBe(false);
    expect(store.notificationError).toBe(false);
    expect(store.shouldUseCache).toBe(true);
    expect(store.shouldUseDaily).toBe(true);
    expect(store.avgExecutionTime).toBe(0);
  });

  it('should have history navigation properties', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.canGoBack).toBe(false);
    expect(store.canGoForward).toBe(false);
    expect(store.historyLength).toBe(0);
    expect(store.historyPosition).toBe(0);
  });

  it('should expose theme options', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.themeOptions).toBeDefined();
    expect(Array.isArray(store.themeOptions)).toBe(true);
    expect(store.themeOptions.length).toBeGreaterThan(0);
  });

  it('should have goBack function', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(typeof store.goBack).toBe('function');
    expect(store.goBack()).toBe(false); // No history
  });

  it('should have goForward function', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(typeof store.goForward).toBe('function');
    expect(store.goForward()).toBe(false); // No history
  });

  it('should have fetchNewHaiku function', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(typeof store.fetchNewHaiku).toBe('function');
  });

  it('should have resetConfigToDefaults function', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    store.optionIterations = 20;
    expect(store.optionIterations).toBe(20);

    store.resetConfigToDefaults();
    expect(store.optionIterations).toBe(10);
  });

  it('should have stopGeneration function', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(typeof store.stopGeneration).toBe('function');
    expect(() => store.stopGeneration()).not.toThrow();
  });

  it('should expose imageAIThemes', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.imageAIThemes).toBeDefined();
    expect(Array.isArray(store.imageAIThemes)).toBe(true);
    expect(store.imageAIThemes).toContain('nihonga');
    expect(store.imageAIThemes).toContain('sumie');
  });

  it('should have generationProgress with correct structure', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.generationProgress).toEqual({
      current: 0,
      total: 0,
      bestScore: 0,
    });
  });

  it('should have craftingMessages as empty array', async () => {
    const { useHaikuStore } = await import('@/features/haiku/store/haiku');
    const store = useHaikuStore();

    expect(store.craftingMessages).toEqual([]);
  });
});
