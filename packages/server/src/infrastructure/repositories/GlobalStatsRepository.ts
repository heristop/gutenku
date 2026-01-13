import { inject, injectable } from 'tsyringe';
import { createLogger } from '~/infrastructure/services/Logger';
import type {
  IGlobalStatsRepository,
  GlobalStatsValue,
  HintStats,
} from '~/domain/repositories/IGlobalStatsRepository';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import type { Connection } from 'mongoose';

const log = createLogger('global-stats-repo');

const STATS_DOC_ID = 'global_stats';

type StatsDocument = Record<string, unknown>;

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

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private num(doc: StatsDocument | null, key: string): number {
    return (doc?.[key] as number) ?? 0;
  }

  private dailyNum(doc: StatsDocument | null, key: string, isDayStale: boolean): number {
    return isDayStale ? 0 : this.num(doc, key);
  }

  private buildDailyReset(today: string): Record<string, unknown> {
    return {
      currentDay: today,
      todayHaikusGenerated: 0,
      todayGamesPlayed: 0,
      todayGamesWon: 0,
      todayEmoticonScratches: 0,
      todayHaikuReveals: 0,
    };
  }

  private parseDocument(doc: StatsDocument | null, today: string): GlobalStatsValue {
    const docDay = (doc?.currentDay as string) ?? '';
    const isDayStale = docDay !== today;

    return {
      totalHaikusGenerated: this.num(doc, 'totalHaikusGenerated'),
      totalGamesPlayed: this.num(doc, 'totalGamesPlayed'),
      totalGamesWon: this.num(doc, 'totalGamesWon'),
      totalEmoticonScratches: this.num(doc, 'totalEmoticonScratches'),
      totalHaikuReveals: this.num(doc, 'totalHaikuReveals'),
      todayHaikusGenerated: this.dailyNum(doc, 'todayHaikusGenerated', isDayStale),
      todayEmoticonScratches: this.dailyNum(doc, 'todayEmoticonScratches', isDayStale),
      todayHaikuReveals: this.dailyNum(doc, 'todayHaikuReveals', isDayStale),
      todayGamesPlayed: this.dailyNum(doc, 'todayGamesPlayed', isDayStale),
      todayGamesWon: this.dailyNum(doc, 'todayGamesWon', isDayStale),
      currentDay: today,
    };
  }

  private getDefaultStats(): GlobalStatsValue {
    return this.parseDocument(null, this.getTodayString());
  }

  async incrementHaikuCount(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const collection = this.db.collection('globalstats');
      const today = this.getTodayString();
      const currentDoc = await collection.findOne({ _id: STATS_DOC_ID } as object);
      const currentDay = (currentDoc?.currentDay as string) ?? '';
      const isNewDay = currentDay !== today;

      const inc: Record<string, number> = { totalHaikusGenerated: 1 };
      let set: Record<string, unknown> = { lastUpdated: new Date() };

      if (isNewDay) {
        set = { ...set, ...this.buildDailyReset(today), todayHaikusGenerated: 1 };
      } else {
        inc.todayHaikusGenerated = 1;
      }

      await collection.findOneAndUpdate(
        { _id: STATS_DOC_ID } as object,
        { $inc: inc, $set: set },
        { upsert: true },
      );
      this.invalidateCache();
    } catch (error) {
      log.warn({ err: error }, 'Failed to increment haiku count');
    }
  }

  async incrementGamePlayed(won: boolean, hints?: HintStats): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const collection = this.db.collection('globalstats');
      const today = this.getTodayString();
      const currentDoc = await collection.findOne({ _id: STATS_DOC_ID } as object);
      const currentDay = (currentDoc?.currentDay as string) ?? '';
      const isNewDay = currentDay !== today;

      const inc: Record<string, number> = { totalGamesPlayed: 1 };
      let set: Record<string, unknown> = { lastUpdated: new Date() };

      if (won) {
        inc.totalGamesWon = 1;
      }

      if (hints) {
        inc.totalEmoticonScratches = hints.emoticonScratches;
        inc.totalHaikuReveals = hints.haikuReveals;
      }

      if (isNewDay) {
        set = {
          ...set,
          ...this.buildDailyReset(today),
          todayGamesPlayed: 1,
          todayGamesWon: won ? 1 : 0,
          todayEmoticonScratches: hints?.emoticonScratches ?? 0,
          todayHaikuReveals: hints?.haikuReveals ?? 0,
        };
      } else {
        inc.todayGamesPlayed = 1;
        if (won) {
          inc.todayGamesWon = 1;
        }
        if (hints) {
          inc.todayEmoticonScratches = hints.emoticonScratches;
          inc.todayHaikuReveals = hints.haikuReveals;
        }
      }

      await collection.findOneAndUpdate(
        { _id: STATS_DOC_ID } as object,
        { $inc: inc, $set: set },
        { upsert: true },
      );
      this.invalidateCache();
    } catch (error) {
      log.warn({ err: error }, 'Failed to increment game count');
    }
  }

  async getGlobalStats(): Promise<GlobalStatsValue> {
    if (!this.db) {
      return this.getDefaultStats();
    }

    const now = Date.now();
    const today = this.getTodayString();

    if (this.statsCache && now < this.statsCacheExpiry) {
      if (this.statsCache.currentDay === today) {
        return this.statsCache;
      }
      this.invalidateCache();
    }

    try {
      const collection = this.db.collection('globalstats');
      const doc = await collection.findOne({ _id: STATS_DOC_ID } as object);
      const stats = this.parseDocument(doc as StatsDocument, today);

      this.statsCache = stats;
      this.statsCacheExpiry = now + GlobalStatsRepository.CACHE_TTL_MS;

      return stats;
    } catch (error) {
      log.warn({ err: error }, 'Failed to get global stats');
      return this.getDefaultStats();
    }
  }
}
