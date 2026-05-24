import { describe, it, expect, vi, beforeEach } from 'vitest';

const toPromise = vi.fn();

vi.mock('@/client', () => ({
  urqlClient: {
    query: vi.fn(() => ({ toPromise })),
  },
}));

describe('useGlobalStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with zeroed stats and not loading', async () => {
    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { globalStats, loading, error } = useGlobalStats();

    expect(globalStats.value.totalHaikusGenerated).toBe(0);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBeNull();
  });

  it('formats numbers using locale grouping', async () => {
    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { formatNumber } = useGlobalStats();

    expect(formatNumber(1000)).toBe((1000).toLocaleString());
  });

  it('populates stats on a successful fetch', async () => {
    toPromise.mockResolvedValue({
      data: { globalStats: { totalHaikusGenerated: 42 } },
      error: null,
    });

    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { fetchGlobalStats, globalStats, loading, error } = useGlobalStats();

    await fetchGlobalStats();

    expect(globalStats.value.totalHaikusGenerated).toBe(42);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBeNull();
  });

  it('leaves stats untouched when the response has no globalStats payload', async () => {
    toPromise.mockResolvedValue({ data: {}, error: null });

    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { fetchGlobalStats, globalStats, error } = useGlobalStats();
    const before = globalStats.value.totalHaikusGenerated;

    await fetchGlobalStats();

    // payload-less response must not overwrite existing stats
    expect(globalStats.value.totalHaikusGenerated).toBe(before);
    expect(error.value).toBeNull();
  });

  it('sets an error message when the query returns an error', async () => {
    toPromise.mockResolvedValue({
      data: null,
      error: new Error('graphql failed'),
    });

    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { fetchGlobalStats, error, loading } = useGlobalStats();

    await fetchGlobalStats();

    expect(error.value).toBe('Failed to load global stats');
    expect(loading.value).toBeFalsy();
  });

  it('handles a rejected promise gracefully', async () => {
    toPromise.mockRejectedValue(new Error('network down'));

    const { useGlobalStats } = await import('@/core/composables/global-stats');
    const { fetchGlobalStats, error, loading } = useGlobalStats();

    await fetchGlobalStats();

    expect(error.value).toBe('Failed to load global stats');
    expect(loading.value).toBeFalsy();
  });
});
