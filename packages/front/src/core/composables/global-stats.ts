import { ref, readonly } from 'vue';
import { gql } from '@urql/vue';
import { urqlClient } from '@/client';
import type { GlobalStats } from '@gutenku/shared';

const globalStats = ref<GlobalStats>({
  totalHaikusGenerated: 0,
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalEmoticonScratches: 0,
  totalHaikuReveals: 0,
  todayHaikusGenerated: 0,
  todayAverageEmoticonScratches: 0,
  todayAverageHaikuReveals: 0,
  todayGamesPlayed: 0,
  todayGamesWon: 0,
  todayTotalHints: 0,
});

const loading = ref(false);
const error = ref<string | null>(null);

export function useGlobalStats() {
  async function fetchGlobalStats(): Promise<void> {
    try {
      loading.value = true;
      error.value = null;

      const query = gql`
        query GlobalStats {
          globalStats {
            totalHaikusGenerated
            totalGamesPlayed
            totalGamesWon
            totalEmoticonScratches
            totalHaikuReveals
            todayHaikusGenerated
            todayAverageEmoticonScratches
            todayAverageHaikuReveals
            todayGamesPlayed
            todayGamesWon
            todayTotalHints
          }
        }
      `;

      const result = await urqlClient
        .query<{ globalStats: GlobalStats }>(query, {})
        .toPromise();

      if (result.error) {
        throw result.error;
      }

      if (result.data?.globalStats) {
        globalStats.value = result.data.globalStats;
      }
    } catch {
      error.value = 'Failed to load global stats';
    } finally {
      loading.value = false;
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  return {
    globalStats: readonly(globalStats),
    loading: readonly(loading),
    error: readonly(error),
    fetchGlobalStats,
    formatNumber,
  };
}
