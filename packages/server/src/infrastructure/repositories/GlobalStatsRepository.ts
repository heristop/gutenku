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

  constructor(@inject(MongoConnection) mongoConnection: MongoConnection) {
    this.db = mongoConnection.db;
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

    try {
      const collection = this.db.collection('globalstats');
      const doc = await collection.findOne({ _id: STATS_DOC_ID } as object);

      return {
        totalHaikusGenerated: (doc?.totalHaikusGenerated as number) ?? 0,
        totalGamesPlayed: (doc?.totalGamesPlayed as number) ?? 0,
        totalGamesWon: (doc?.totalGamesWon as number) ?? 0,
      };
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
