import { inject, injectable } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';
import type {
  IGlobalStatsRepository,
  GlobalStatsValue,
} from '~/domain/repositories/IGlobalStatsRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import type { Connection } from 'mongoose';

const log = createLogger('global-stats-repo');

const STATS_DOC_ID = 'global_stats';

@injectable()
export default class GlobalStatsRepository implements IGlobalStatsRepository {
  private db: Connection;
  private statsCache: GlobalStatsValue | null = null;
  private statsCacheExpiry = 0;
  private static readonly CACHE_TTL_MS = 30000; // 30 seconds

  constructor(@inject(MongoConnection) mongoConnection: MongoConnection) {
    this.db = mongoConnection.db;
  }

  private invalidateCache(): void {
    this.statsCache = null;
    this.statsCacheExpiry = 0;
  }

  async incrementHaikuCount(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const collection = this.db.collection('globalstats');
      await collection.findOneAndUpdate(
        { _id: STATS_DOC_ID } as object,
        {
          $inc: { totalHaikusGenerated: 1 },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true },
      );
      this.invalidateCache();
    } catch (error) {
      log.warn({ err: error }, 'Failed to increment haiku count');
    }
  }

  async incrementGamePlayed(won: boolean): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const update: Record<string, unknown> = {
        $inc: { totalGamesPlayed: 1 },
        $set: { lastUpdated: new Date() },
      };

      if (won) {
        (update.$inc as Record<string, number>).totalGamesWon = 1;
      }

      const collection = this.db.collection('globalstats');
      await collection.findOneAndUpdate(
        { _id: STATS_DOC_ID } as object,
        update,
        { upsert: true },
      );
      this.invalidateCache();
    } catch (error) {
      log.warn({ err: error }, 'Failed to increment game count');
    }
  }

  async getGlobalStats(): Promise<GlobalStatsValue> {
    if (!this.db) {
      return {
        totalHaikusGenerated: 0,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
      };
    }

    // Return cached value if still valid
    const now = Date.now();
    if (this.statsCache && now < this.statsCacheExpiry) {
      return this.statsCache;
    }

    try {
      const collection = this.db.collection('globalstats');
      const doc = await collection.findOne({ _id: STATS_DOC_ID } as object);

      const stats: GlobalStatsValue = {
        totalHaikusGenerated: (doc?.totalHaikusGenerated as number) ?? 0,
        totalGamesPlayed: (doc?.totalGamesPlayed as number) ?? 0,
        totalGamesWon: (doc?.totalGamesWon as number) ?? 0,
      };

      // Cache the result
      this.statsCache = stats;
      this.statsCacheExpiry = now + GlobalStatsRepository.CACHE_TTL_MS;

      return stats;
    } catch (error) {
      log.warn({ err: error }, 'Failed to get global stats');
      return {
        totalHaikusGenerated: 0,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
      };
    }
  }
}
