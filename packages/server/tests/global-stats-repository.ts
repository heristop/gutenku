import { describe, it, expect } from 'vitest';
import type {
  GlobalStatsValue,
  HintStats,
} from '~/domain/repositories/IGlobalStatsRepository';

/**
 * Tests for the GlobalStatsRepository logic.
 * Uses mock implementations to test the business logic without MongoDB.
 */

interface MockDocument {
  totalHaikusGenerated?: number;
  totalGamesPlayed?: number;
  totalGamesWon?: number;
  totalEmoticonScratches?: number;
  totalHaikuReveals?: number;
  totalRoundHints?: number;
  todayHaikusGenerated?: number;
  todayEmoticonScratches?: number;
  todayHaikuReveals?: number;
  todayRoundHints?: number;
  todayGamesPlayed?: number;
  todayGamesWon?: number;
  currentDay?: string;
  weekHaikusGenerated?: number;
  weekGamesPlayed?: number;
  weekGamesWon?: number;
  weekEmoticonScratches?: number;
  weekHaikuReveals?: number;
  weekRoundHints?: number;
  currentWeek?: string;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function getWeekString(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getLastWeekString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

function num(doc: MockDocument | null, key: keyof MockDocument): number {
  return (doc?.[key] as number) ?? 0;
}

function dailyNum(
  doc: MockDocument | null,
  key: keyof MockDocument,
  isDayStale: boolean,
): number {
  return isDayStale ? 0 : num(doc, key);
}

function weeklyNum(
  doc: MockDocument | null,
  key: keyof MockDocument,
  isWeekStale: boolean,
): number {
  return isWeekStale ? 0 : num(doc, key);
}

function createDefaultStats(): GlobalStatsValue {
  return getGlobalStats(null);
}

function getGlobalStats(doc: MockDocument | null): GlobalStatsValue {
  const today = getTodayString();
  const week = getWeekString();
  const docDay = doc?.currentDay ?? '';
  const docWeek = doc?.currentWeek ?? '';
  const isDayStale = docDay !== today;
  const isWeekStale = docWeek !== week;

  return {
    totalHaikusGenerated: num(doc, 'totalHaikusGenerated'),
    totalGamesPlayed: num(doc, 'totalGamesPlayed'),
    totalGamesWon: num(doc, 'totalGamesWon'),
    totalEmoticonScratches: num(doc, 'totalEmoticonScratches'),
    totalHaikuReveals: num(doc, 'totalHaikuReveals'),
    totalRoundHints: num(doc, 'totalRoundHints'),
    todayHaikusGenerated: dailyNum(doc, 'todayHaikusGenerated', isDayStale),
    todayEmoticonScratches: dailyNum(doc, 'todayEmoticonScratches', isDayStale),
    todayHaikuReveals: dailyNum(doc, 'todayHaikuReveals', isDayStale),
    todayRoundHints: dailyNum(doc, 'todayRoundHints', isDayStale),
    todayGamesPlayed: dailyNum(doc, 'todayGamesPlayed', isDayStale),
    todayGamesWon: dailyNum(doc, 'todayGamesWon', isDayStale),
    currentDay: today,
    weekHaikusGenerated: weeklyNum(doc, 'weekHaikusGenerated', isWeekStale),
    weekGamesPlayed: weeklyNum(doc, 'weekGamesPlayed', isWeekStale),
    weekGamesWon: weeklyNum(doc, 'weekGamesWon', isWeekStale),
    weekEmoticonScratches: weeklyNum(doc, 'weekEmoticonScratches', isWeekStale),
    weekHaikuReveals: weeklyNum(doc, 'weekHaikuReveals', isWeekStale),
    weekRoundHints: weeklyNum(doc, 'weekRoundHints', isWeekStale),
    currentWeek: week,
  };
}

function buildDailyReset(today: string): Record<string, unknown> {
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

function buildWeeklyReset(week: string): Record<string, unknown> {
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

/**
 * Simulates incrementHaikuCount logic
 */
function simulateIncrementHaikuCount(doc: MockDocument): {
  inc: Record<string, number>;
  set: Record<string, unknown>;
} {
  const today = getTodayString();
  const week = getWeekString();
  const currentDay = doc.currentDay ?? '';
  const currentWeek = doc.currentWeek ?? '';
  const isNewDay = currentDay !== today;
  const isNewWeek = currentWeek !== week;

  const inc: Record<string, number> = { totalHaikusGenerated: 1 };
  let set: Record<string, unknown> = { lastUpdated: new Date() };

  if (isNewDay) {
    set = {
      ...set,
      ...buildDailyReset(today),
      todayHaikusGenerated: 1,
    };
  }

  if (isNewWeek) {
    set = {
      ...set,
      ...buildWeeklyReset(week),
      weekHaikusGenerated: 1,
    };
  }

  if (!isNewDay) {
    inc.todayHaikusGenerated = 1;
  }

  if (!isNewWeek) {
    inc.weekHaikusGenerated = 1;
  }

  return { inc, set };
}

/**
 * Simulates incrementGamePlayed logic
 */
function simulateIncrementGamePlayed(
  doc: MockDocument,
  won: boolean,
  hints?: HintStats,
): {
  inc: Record<string, number>;
  set: Record<string, unknown>;
} {
  const today = getTodayString();
  const week = getWeekString();
  const currentDay = doc.currentDay ?? '';
  const currentWeek = doc.currentWeek ?? '';
  const isNewDay = currentDay !== today;
  const isNewWeek = currentWeek !== week;

  const inc: Record<string, number> = { totalGamesPlayed: 1 };
  let set: Record<string, unknown> = { lastUpdated: new Date() };

  if (won) {
    inc.totalGamesWon = 1;
  }

  if (hints) {
    inc.totalEmoticonScratches = hints.emoticonScratches;
    inc.totalHaikuReveals = hints.haikuReveals;
    inc.totalRoundHints = hints.roundHints;
  }

  if (isNewDay) {
    set = {
      ...set,
      ...buildDailyReset(today),
      todayGamesPlayed: 1,
      todayGamesWon: won ? 1 : 0,
      todayEmoticonScratches: hints?.emoticonScratches ?? 0,
      todayHaikuReveals: hints?.haikuReveals ?? 0,
      todayRoundHints: hints?.roundHints ?? 0,
    };
  } else {
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

  if (isNewWeek) {
    set = {
      ...set,
      ...buildWeeklyReset(week),
      weekGamesPlayed: 1,
      weekGamesWon: won ? 1 : 0,
      weekEmoticonScratches: hints?.emoticonScratches ?? 0,
      weekHaikuReveals: hints?.haikuReveals ?? 0,
      weekRoundHints: hints?.roundHints ?? 0,
    };
  } else {
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

  return { inc, set };
}

/**
 * Apply MongoDB-like update to document
 */
function applyUpdate(
  doc: MockDocument,
  update: { inc: Record<string, number>; set: Record<string, unknown> },
): MockDocument {
  const result = { ...doc };

  for (const [key, value] of Object.entries(update.inc)) {
    result[key as keyof MockDocument] =
      ((result[key as keyof MockDocument] as number) ?? 0) + value;
  }

  for (const [key, value] of Object.entries(update.set)) {
    if (key !== 'lastUpdated') {
      result[key as keyof MockDocument] = value as never;
    }
  }

  return result;
}

/**
 * Compute resolver output from stats (weekly averages)
 */
function computeResolverOutput(stats: GlobalStatsValue): {
  weekAverageEmoticonScratches: number;
  weekAverageHaikuReveals: number;
  weekAverageHints: number;
  weekTotalHints: number;
} {
  const weekGames = stats.weekGamesPlayed || 0;
  const weekAverageEmoticonScratches =
    weekGames > 0 ? stats.weekEmoticonScratches / weekGames : 0;
  const weekAverageHaikuReveals =
    weekGames > 0 ? stats.weekHaikuReveals / weekGames : 0;
  const weekTotalHints =
    stats.weekEmoticonScratches + stats.weekHaikuReveals + stats.weekRoundHints;
  const weekAverageHints = weekGames > 0 ? weekTotalHints / weekGames : 0;

  return {
    weekAverageEmoticonScratches,
    weekAverageHaikuReveals,
    weekAverageHints,
    weekTotalHints,
  };
}

describe('GlobalStatsRepository', () => {
  describe('getGlobalStats', () => {
    it('should return default stats when document is null', () => {
      const stats = getGlobalStats(null);

      expect(stats.totalHaikusGenerated).toBe(0);
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.todayGamesPlayed).toBe(0);
      expect(stats.weekGamesPlayed).toBe(0);
      expect(stats.currentDay).toBe(getTodayString());
      expect(stats.currentWeek).toBe(getWeekString());
    });

    it('should return stored values when day and week are current', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayHaikusGenerated: 10,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        weekHaikusGenerated: 25,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      const stats = getGlobalStats(doc);

      expect(stats.totalHaikusGenerated).toBe(100);
      expect(stats.totalGamesPlayed).toBe(50);
      expect(stats.todayHaikusGenerated).toBe(10);
      expect(stats.todayGamesPlayed).toBe(5);
      expect(stats.todayGamesWon).toBe(3);
      expect(stats.weekHaikusGenerated).toBe(25);
      expect(stats.weekGamesPlayed).toBe(12);
      expect(stats.weekGamesWon).toBe(8);
    });

    it('should reset daily counters when day is stale', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        totalGamesPlayed: 50,
        todayHaikusGenerated: 10,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        todayEmoticonScratches: 15,
        todayHaikuReveals: 8,
        weekHaikusGenerated: 25,
        weekGamesPlayed: 12,
        currentDay: getYesterdayString(),
        currentWeek: getWeekString(),
      };

      const stats = getGlobalStats(doc);

      expect(stats.totalHaikusGenerated).toBe(100);
      expect(stats.totalGamesPlayed).toBe(50);
      expect(stats.todayHaikusGenerated).toBe(0);
      expect(stats.todayGamesPlayed).toBe(0);
      expect(stats.todayGamesWon).toBe(0);
      expect(stats.todayEmoticonScratches).toBe(0);
      expect(stats.todayHaikuReveals).toBe(0);
      expect(stats.currentDay).toBe(getTodayString());
      // Weekly should still be valid
      expect(stats.weekHaikusGenerated).toBe(25);
      expect(stats.weekGamesPlayed).toBe(12);
    });

    it('should reset weekly counters when week is stale', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        totalGamesPlayed: 50,
        todayHaikusGenerated: 10,
        todayGamesPlayed: 5,
        weekHaikusGenerated: 25,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        weekEmoticonScratches: 30,
        weekHaikuReveals: 15,
        currentDay: getTodayString(),
        currentWeek: getLastWeekString(),
      };

      const stats = getGlobalStats(doc);

      expect(stats.totalHaikusGenerated).toBe(100);
      expect(stats.totalGamesPlayed).toBe(50);
      // Daily should be valid
      expect(stats.todayHaikusGenerated).toBe(10);
      expect(stats.todayGamesPlayed).toBe(5);
      // Weekly should be reset
      expect(stats.weekHaikusGenerated).toBe(0);
      expect(stats.weekGamesPlayed).toBe(0);
      expect(stats.weekGamesWon).toBe(0);
      expect(stats.weekEmoticonScratches).toBe(0);
      expect(stats.weekHaikuReveals).toBe(0);
      expect(stats.currentWeek).toBe(getWeekString());
    });
  });

  describe('incrementHaikuCount', () => {
    it('should increment total, daily and weekly haiku count on same day/week', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        todayHaikusGenerated: 10,
        weekHaikusGenerated: 25,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(101);
      expect(result.todayHaikusGenerated).toBe(11);
      expect(result.weekHaikusGenerated).toBe(26);
    });

    it('should reset daily count on day rollover but keep weekly', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        todayHaikusGenerated: 10,
        weekHaikusGenerated: 25,
        currentDay: getYesterdayString(),
        currentWeek: getWeekString(),
      };

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(101);
      expect(result.todayHaikusGenerated).toBe(1);
      expect(result.weekHaikusGenerated).toBe(26);
      expect(result.currentDay).toBe(getTodayString());
    });

    it('should reset weekly count on week rollover', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        todayHaikusGenerated: 10,
        weekHaikusGenerated: 25,
        currentDay: getTodayString(),
        currentWeek: getLastWeekString(),
      };

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(101);
      expect(result.todayHaikusGenerated).toBe(11);
      expect(result.weekHaikusGenerated).toBe(1);
      expect(result.currentWeek).toBe(getWeekString());
    });

    it('should initialize counters from zero', () => {
      const doc: MockDocument = {};

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(1);
      expect(result.todayHaikusGenerated).toBe(1);
      expect(result.weekHaikusGenerated).toBe(1);
      expect(result.currentDay).toBe(getTodayString());
      expect(result.currentWeek).toBe(getWeekString());
    });
  });

  describe('incrementGamePlayed', () => {
    it('should increment game counters for a win', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      const update = simulateIncrementGamePlayed(doc, true);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(31);
      expect(result.todayGamesPlayed).toBe(6);
      expect(result.todayGamesWon).toBe(4);
      expect(result.weekGamesPlayed).toBe(13);
      expect(result.weekGamesWon).toBe(9);
    });

    it('should increment game counters for a loss', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      const update = simulateIncrementGamePlayed(doc, false);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(30);
      expect(result.todayGamesPlayed).toBe(6);
      expect(result.todayGamesWon).toBe(3);
      expect(result.weekGamesPlayed).toBe(13);
      expect(result.weekGamesWon).toBe(8);
    });

    it('should track hint usage including round hints', () => {
      const doc: MockDocument = {
        totalEmoticonScratches: 100,
        totalHaikuReveals: 50,
        totalRoundHints: 200,
        todayEmoticonScratches: 10,
        todayHaikuReveals: 5,
        todayRoundHints: 20,
        weekEmoticonScratches: 25,
        weekHaikuReveals: 12,
        weekRoundHints: 50,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      const hints: HintStats = {
        emoticonScratches: 3,
        haikuReveals: 2,
        roundHints: 4,
      };
      const update = simulateIncrementGamePlayed(doc, true, hints);
      const result = applyUpdate(doc, update);

      expect(result.totalEmoticonScratches).toBe(103);
      expect(result.totalHaikuReveals).toBe(52);
      expect(result.totalRoundHints).toBe(204);
      expect(result.todayEmoticonScratches).toBe(13);
      expect(result.todayHaikuReveals).toBe(7);
      expect(result.todayRoundHints).toBe(24);
      expect(result.weekEmoticonScratches).toBe(28);
      expect(result.weekHaikuReveals).toBe(14);
      expect(result.weekRoundHints).toBe(54);
    });

    it('should reset daily counters on day rollover for win', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        todayEmoticonScratches: 15,
        todayHaikuReveals: 8,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        currentDay: getYesterdayString(),
        currentWeek: getWeekString(),
      };

      const hints: HintStats = {
        emoticonScratches: 2,
        haikuReveals: 1,
        roundHints: 3,
      };
      const update = simulateIncrementGamePlayed(doc, true, hints);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(31);
      expect(result.todayGamesPlayed).toBe(1);
      expect(result.todayGamesWon).toBe(1);
      expect(result.todayEmoticonScratches).toBe(2);
      expect(result.todayHaikuReveals).toBe(1);
      expect(result.currentDay).toBe(getTodayString());
      // Weekly should still increment
      expect(result.weekGamesPlayed).toBe(13);
      expect(result.weekGamesWon).toBe(9);
    });

    it('should reset weekly counters on week rollover', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        weekGamesPlayed: 12,
        weekGamesWon: 8,
        weekEmoticonScratches: 30,
        weekHaikuReveals: 15,
        currentDay: getTodayString(),
        currentWeek: getLastWeekString(),
      };

      const hints: HintStats = {
        emoticonScratches: 2,
        haikuReveals: 1,
        roundHints: 3,
      };
      const update = simulateIncrementGamePlayed(doc, true, hints);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(31);
      // Daily should still increment
      expect(result.todayGamesPlayed).toBe(6);
      expect(result.todayGamesWon).toBe(4);
      // Weekly should reset
      expect(result.weekGamesPlayed).toBe(1);
      expect(result.weekGamesWon).toBe(1);
      expect(result.weekEmoticonScratches).toBe(2);
      expect(result.weekHaikuReveals).toBe(1);
      expect(result.currentWeek).toBe(getWeekString());
    });

    it('should reset daily counters on day rollover for loss', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        currentDay: getYesterdayString(),
        currentWeek: getWeekString(),
      };

      const update = simulateIncrementGamePlayed(doc, false);
      const result = applyUpdate(doc, update);

      expect(result.todayGamesPlayed).toBe(1);
      expect(result.todayGamesWon).toBe(0);
    });
  });

  describe('Resolver computations (weekly averages)', () => {
    it('should compute correct weekly averages', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        weekGamesPlayed: 10,
        weekEmoticonScratches: 25,
        weekHaikuReveals: 15,
        weekRoundHints: 20,
      };

      const output = computeResolverOutput(stats);

      expect(output.weekAverageEmoticonScratches).toBe(2.5);
      expect(output.weekAverageHaikuReveals).toBe(1.5);
      expect(output.weekTotalHints).toBe(60);
      expect(output.weekAverageHints).toBe(6);
    });

    it('should return zero averages when no games played this week', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        weekGamesPlayed: 0,
        weekEmoticonScratches: 0,
        weekHaikuReveals: 0,
        weekRoundHints: 0,
      };

      const output = computeResolverOutput(stats);

      expect(output.weekAverageEmoticonScratches).toBe(0);
      expect(output.weekAverageHaikuReveals).toBe(0);
      expect(output.weekTotalHints).toBe(0);
      expect(output.weekAverageHints).toBe(0);
    });

    it('should compute weekly win rate correctly', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        weekGamesPlayed: 12,
        weekGamesWon: 9,
      };

      const winRate =
        stats.weekGamesPlayed > 0
          ? Math.round((stats.weekGamesWon / stats.weekGamesPlayed) * 100)
          : 0;

      expect(winRate).toBe(75);
    });
  });

  describe('Full game session simulation', () => {
    it('should correctly track a typical day of activity', () => {
      let doc: MockDocument = {
        totalHaikusGenerated: 1000,
        totalGamesPlayed: 400,
        totalGamesWon: 280,
        totalEmoticonScratches: 800,
        totalHaikuReveals: 500,
        totalRoundHints: 1000,
        todayHaikusGenerated: 0,
        todayGamesPlayed: 0,
        todayGamesWon: 0,
        todayEmoticonScratches: 0,
        todayHaikuReveals: 0,
        todayRoundHints: 0,
        weekHaikusGenerated: 20,
        weekGamesPlayed: 8,
        weekGamesWon: 5,
        weekEmoticonScratches: 20,
        weekHaikuReveals: 10,
        weekRoundHints: 25,
        currentDay: getTodayString(),
        currentWeek: getWeekString(),
      };

      // User generates 3 haikus
      for (let i = 0; i < 3; i++) {
        const update = simulateIncrementHaikuCount(doc);
        doc = applyUpdate(doc, update);
      }

      // User plays 2 games: 1 win, 1 loss
      const game1Update = simulateIncrementGamePlayed(doc, true, {
        emoticonScratches: 2,
        haikuReveals: 1,
        roundHints: 3,
      });
      doc = applyUpdate(doc, game1Update);

      const game2Update = simulateIncrementGamePlayed(doc, false, {
        emoticonScratches: 4,
        haikuReveals: 2,
        roundHints: 5,
      });
      doc = applyUpdate(doc, game2Update);

      // Verify totals
      expect(doc.totalHaikusGenerated).toBe(1003);
      expect(doc.totalGamesPlayed).toBe(402);
      expect(doc.totalGamesWon).toBe(281);
      expect(doc.totalEmoticonScratches).toBe(806);
      expect(doc.totalHaikuReveals).toBe(503);
      expect(doc.totalRoundHints).toBe(1008);

      // Verify daily counters
      expect(doc.todayHaikusGenerated).toBe(3);
      expect(doc.todayGamesPlayed).toBe(2);
      expect(doc.todayGamesWon).toBe(1);
      expect(doc.todayEmoticonScratches).toBe(6);
      expect(doc.todayHaikuReveals).toBe(3);
      expect(doc.todayRoundHints).toBe(8);

      // Verify weekly counters
      expect(doc.weekHaikusGenerated).toBe(23);
      expect(doc.weekGamesPlayed).toBe(10);
      expect(doc.weekGamesWon).toBe(6);
      expect(doc.weekEmoticonScratches).toBe(26);
      expect(doc.weekHaikuReveals).toBe(13);
      expect(doc.weekRoundHints).toBe(33);

      // Verify resolver output (weekly averages)
      const stats = getGlobalStats(doc);
      const output = computeResolverOutput(stats);

      expect(output.weekAverageEmoticonScratches).toBe(2.6);
      expect(output.weekAverageHaikuReveals).toBe(1.3);
      expect(output.weekTotalHints).toBe(72);
      expect(output.weekAverageHints).toBe(7.2);
    });

    it('should handle day rollover correctly', () => {
      // Document from yesterday
      let doc: MockDocument = {
        totalHaikusGenerated: 1000,
        totalGamesPlayed: 400,
        todayHaikusGenerated: 50,
        todayGamesPlayed: 20,
        todayGamesWon: 15,
        todayEmoticonScratches: 40,
        todayHaikuReveals: 25,
        weekHaikusGenerated: 100,
        weekGamesPlayed: 40,
        currentDay: getYesterdayString(),
        currentWeek: getWeekString(),
      };

      // First action today - should reset daily counters
      const update = simulateIncrementHaikuCount(doc);
      doc = applyUpdate(doc, update);

      expect(doc.totalHaikusGenerated).toBe(1001);
      expect(doc.todayHaikusGenerated).toBe(1);
      expect(doc.weekHaikusGenerated).toBe(101);
      expect(doc.currentDay).toBe(getTodayString());

      // Get stats should also show reset daily values
      const stats = getGlobalStats(doc);

      expect(stats.todayHaikusGenerated).toBe(1);
      expect(stats.todayGamesPlayed).toBe(0);
      expect(stats.todayGamesWon).toBe(0);
      expect(stats.weekHaikusGenerated).toBe(101);
      expect(stats.weekGamesPlayed).toBe(40);
    });

    it('should handle week rollover correctly', () => {
      // Document from last week
      let doc: MockDocument = {
        totalHaikusGenerated: 1000,
        totalGamesPlayed: 400,
        todayHaikusGenerated: 5,
        todayGamesPlayed: 2,
        weekHaikusGenerated: 100,
        weekGamesPlayed: 40,
        weekGamesWon: 25,
        currentDay: getTodayString(),
        currentWeek: getLastWeekString(),
      };

      // First action this week - should reset weekly counters
      const update = simulateIncrementHaikuCount(doc);
      doc = applyUpdate(doc, update);

      expect(doc.totalHaikusGenerated).toBe(1001);
      expect(doc.todayHaikusGenerated).toBe(6);
      expect(doc.weekHaikusGenerated).toBe(1);
      expect(doc.currentWeek).toBe(getWeekString());

      // Get stats should also show reset weekly values
      const stats = getGlobalStats(doc);

      expect(stats.todayHaikusGenerated).toBe(6);
      expect(stats.weekHaikusGenerated).toBe(1);
      expect(stats.weekGamesPlayed).toBe(0);
      expect(stats.weekGamesWon).toBe(0);
    });
  });
});
