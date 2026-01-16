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

  private getWeekString(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  private num(doc: StatsDocument | null, key: string): number {
    return (doc?.[key] as number) ?? 0;
  }

  private dailyNum(
    doc: StatsDocument | null,
    key: string,
    isDayStale: boolean,
  ): number {
    return isDayStale ? 0 : this.num(doc, key);
  }

  private weeklyNum(
    doc: StatsDocument | null,
    key: string,
    isWeekStale: boolean,
  ): number {
    return isWeekStale ? 0 : this.num(doc, key);
  }

  private buildDailyReset(today: string): Record<string, unknown> {
    return {
      currentDay: today,
      todayHaikusGenerated: 0,
      todayGamesPlayed: 0,
      todayGamesWon: 0,
      todayEmoticonScratches: 0,
      todayHaikuReveals: 0,
      todayRoundHints: 0,
    };
  }

  private buildWeeklyReset(week: string): Record<string, unknown> {
    return {
      currentWeek: week,
      weekHaikusGenerated: 0,
      weekGamesPlayed: 0,
      weekGamesWon: 0,
      weekEmoticonScratches: 0,
      weekHaikuReveals: 0,
      weekRoundHints: 0,
    };
  }

  private parseDocument(
    doc: StatsDocument | null,
    today: string,
    week: string,
  ): GlobalStatsValue {
    const docDay = (doc?.currentDay as string) ?? '';
    const isDayStale = docDay !== today;
    const docWeek = (doc?.currentWeek as string) ?? '';
    const isWeekStale = docWeek !== week;

    return {
      totalHaikusGenerated: this.num(doc, 'totalHaikusGenerated'),
      totalGamesPlayed: this.num(doc, 'totalGamesPlayed'),
      totalGamesWon: this.num(doc, 'totalGamesWon'),
      totalEmoticonScratches: this.num(doc, 'totalEmoticonScratches'),
      totalHaikuReveals: this.num(doc, 'totalHaikuReveals'),
      totalRoundHints: this.num(doc, 'totalRoundHints'),
      todayHaikusGenerated: this.dailyNum(
        doc,
        'todayHaikusGenerated',
        isDayStale,
      ),
      todayEmoticonScratches: this.dailyNum(
        doc,
        'todayEmoticonScratches',
        isDayStale,
      ),
      todayHaikuReveals: this.dailyNum(doc, 'todayHaikuReveals', isDayStale),
      todayRoundHints: this.dailyNum(doc, 'todayRoundHints', isDayStale),
      todayGamesPlayed: this.dailyNum(doc, 'todayGamesPlayed', isDayStale),
      todayGamesWon: this.dailyNum(doc, 'todayGamesWon', isDayStale),
      currentDay: today,
      weekHaikusGenerated: this.weeklyNum(doc, 'weekHaikusGenerated', isWeekStale),
      weekGamesPlayed: this.weeklyNum(doc, 'weekGamesPlayed', isWeekStale),
      weekGamesWon: this.weeklyNum(doc, 'weekGamesWon', isWeekStale),
      weekEmoticonScratches: this.weeklyNum(doc, 'weekEmoticonScratches', isWeekStale),
      weekHaikuReveals: this.weeklyNum(doc, 'weekHaikuReveals', isWeekStale),
      weekRoundHints: this.weeklyNum(doc, 'weekRoundHints', isWeekStale),
      currentWeek: week,
    };
  }

  private getDefaultStats(): GlobalStatsValue {
    return this.parseDocument(
      null,
      this.getTodayString(),
      this.getWeekString(),
    );
  }

  async incrementHaikuCount(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const collection = this.db.collection('globalstats');
      const today = this.getTodayString();
      const week = this.getWeekString();
      const currentDoc = await collection.findOne({
        _id: STATS_DOC_ID,
      } as object);
      const currentDay = (currentDoc?.currentDay as string) ?? '';
      const currentWeek = (currentDoc?.currentWeek as string) ?? '';
      const isNewDay = currentDay !== today;
      const isNewWeek = currentWeek !== week;

      const inc: Record<string, number> = { totalHaikusGenerated: 1 };
      let set: Record<string, unknown> = { lastUpdated: new Date() };

      if (isNewDay) {
        set = {
          ...set,
          ...this.buildDailyReset(today),
          todayHaikusGenerated: 1,
        };
      }

      if (isNewWeek) {
        set = {
          ...set,
          ...this.buildWeeklyReset(week),
          weekHaikusGenerated: 1,
        };
      }

      if (!isNewDay) {
        inc.todayHaikusGenerated = 1;
      }

      if (!isNewWeek) {
        inc.weekHaikusGenerated = 1;
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

  private buildGameIncrements(
    won: boolean,
    hints: HintStats | undefined,
    isNewDay: boolean,
    isNewWeek: boolean,
  ): Record<string, number> {
    const inc: Record<string, number> = { totalGamesPlayed: 1 };

    if (won) {
      inc.totalGamesWon = 1;
    }
    if (hints) {
      inc.totalEmoticonScratches = hints.emoticonScratches;
      inc.totalHaikuReveals = hints.haikuReveals;
      inc.totalRoundHints = hints.roundHints;
    }
    if (!isNewDay) {
      inc.todayGamesPlayed = 1;
      if (won) {
        inc.todayGamesWon = 1;
      }
      if (hints) {
        inc.todayEmoticonScratches = hints.emoticonScratches;
        inc.todayHaikuReveals = hints.haikuReveals;
        inc.todayRoundHints = hints.roundHints;
      }
    }
    if (!isNewWeek) {
      inc.weekGamesPlayed = 1;
      if (won) {
        inc.weekGamesWon = 1;
      }
      if (hints) {
        inc.weekEmoticonScratches = hints.emoticonScratches;
        inc.weekHaikuReveals = hints.haikuReveals;
        inc.weekRoundHints = hints.roundHints;
      }
    }
    return inc;
  }

  private buildGameStats(
    won: boolean,
    hints: HintStats | undefined,
    prefix: 'today' | 'week',
  ): Record<string, number> {
    return {
      [`${prefix}GamesPlayed`]: 1,
      [`${prefix}GamesWon`]: won ? 1 : 0,
      [`${prefix}EmoticonScratches`]: hints?.emoticonScratches ?? 0,
      [`${prefix}HaikuReveals`]: hints?.haikuReveals ?? 0,
      [`${prefix}RoundHints`]: hints?.roundHints ?? 0,
    };
  }

  private buildGameSetFields(
    won: boolean,
    hints: HintStats | undefined,
    isNewDay: boolean,
    isNewWeek: boolean,
    today: string,
    week: string,
  ): Record<string, unknown> {
    const set: Record<string, unknown> = { lastUpdated: new Date() };

    if (isNewDay) {
      Object.assign(
        set,
        this.buildDailyReset(today),
        this.buildGameStats(won, hints, 'today'),
      );
    }
    if (isNewWeek) {
      Object.assign(
        set,
        this.buildWeeklyReset(week),
        this.buildGameStats(won, hints, 'week'),
      );
    }
    return set;
  }

  async incrementGamePlayed(won: boolean, hints?: HintStats): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const collection = this.db.collection('globalstats');
      const today = this.getTodayString();
      const week = this.getWeekString();
      const currentDoc = await collection.findOne({
        _id: STATS_DOC_ID,
      } as object);
      const currentDay = (currentDoc?.currentDay as string) ?? '';
      const currentWeek = (currentDoc?.currentWeek as string) ?? '';
      const isNewDay = currentDay !== today;
      const isNewWeek = currentWeek !== week;

      const inc = this.buildGameIncrements(won, hints, isNewDay, isNewWeek);
      const set = this.buildGameSetFields(won, hints, isNewDay, isNewWeek, today, week);

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
    const week = this.getWeekString();

    if (this.statsCache && now < this.statsCacheExpiry) {
      if (
        this.statsCache.currentDay === today &&
        this.statsCache.currentWeek === week
      ) {
        return this.statsCache;
      }
      this.invalidateCache();
    }

    try {
      const collection = this.db.collection('globalstats');
      const doc = await collection.findOne({ _id: STATS_DOC_ID } as object);
      const stats = this.parseDocument(doc as StatsDocument, today, week);

      this.statsCache = stats;
      this.statsCacheExpiry = now + GlobalStatsRepository.CACHE_TTL_MS;

      return stats;
    } catch (error) {
      log.warn({ err: error }, 'Failed to get global stats');
      return this.getDefaultStats();
    }
  }
}
