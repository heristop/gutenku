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
  todayHaikusGenerated?: number;
  todayEmoticonScratches?: number;
  todayHaikuReveals?: number;
  todayGamesPlayed?: number;
  todayGamesWon?: number;
  currentDay?: string;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function num(doc: MockDocument | null, key: keyof MockDocument): number {
  return (doc?.[key] as number) ?? 0;
}

function dailyNum(doc: MockDocument | null, key: keyof MockDocument, isDayStale: boolean): number {
  return isDayStale ? 0 : num(doc, key);
}

function createDefaultStats(): GlobalStatsValue {
  return getGlobalStats(null);
}

function getGlobalStats(doc: MockDocument | null): GlobalStatsValue {
  const today = getTodayString();
  const docDay = doc?.currentDay ?? '';
  const isDayStale = docDay !== today;

  return {
    totalHaikusGenerated: num(doc, 'totalHaikusGenerated'),
    totalGamesPlayed: num(doc, 'totalGamesPlayed'),
    totalGamesWon: num(doc, 'totalGamesWon'),
    totalEmoticonScratches: num(doc, 'totalEmoticonScratches'),
    totalHaikuReveals: num(doc, 'totalHaikuReveals'),
    todayHaikusGenerated: dailyNum(doc, 'todayHaikusGenerated', isDayStale),
    todayEmoticonScratches: dailyNum(doc, 'todayEmoticonScratches', isDayStale),
    todayHaikuReveals: dailyNum(doc, 'todayHaikuReveals', isDayStale),
    todayGamesPlayed: dailyNum(doc, 'todayGamesPlayed', isDayStale),
    todayGamesWon: dailyNum(doc, 'todayGamesWon', isDayStale),
    currentDay: today,
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
  const currentDay = doc.currentDay ?? '';

  const inc: Record<string, number> = { totalHaikusGenerated: 1 };
  const set: Record<string, unknown> = { lastUpdated: new Date() };

  if (currentDay !== today) {
    set.currentDay = today;
    set.todayHaikusGenerated = 1;
    set.todayGamesPlayed = 0;
    set.todayGamesWon = 0;
    set.todayEmoticonScratches = 0;
    set.todayHaikuReveals = 0;
  } else {
    inc.todayHaikusGenerated = 1;
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
  const currentDay = doc.currentDay ?? '';

  const inc: Record<string, number> = { totalGamesPlayed: 1 };
  const set: Record<string, unknown> = { lastUpdated: new Date() };

  if (won) {
    inc.totalGamesWon = 1;
  }

  if (hints) {
    inc.totalEmoticonScratches = hints.emoticonScratches;
    inc.totalHaikuReveals = hints.haikuReveals;
  }

  if (currentDay !== today) {
    set.currentDay = today;
    set.todayHaikusGenerated = 0;
    set.todayGamesPlayed = 1;
    set.todayGamesWon = won ? 1 : 0;
    set.todayEmoticonScratches = hints?.emoticonScratches ?? 0;
    set.todayHaikuReveals = hints?.haikuReveals ?? 0;
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
 * Compute resolver output from stats
 */
function computeResolverOutput(stats: GlobalStatsValue): {
  todayAverageEmoticonScratches: number;
  todayAverageHaikuReveals: number;
  todayTotalHints: number;
} {
  const todayGames = stats.todayGamesPlayed || 0;
  const todayAverageEmoticonScratches =
    todayGames > 0 ? stats.todayEmoticonScratches / todayGames : 0;
  const todayAverageHaikuReveals =
    todayGames > 0 ? stats.todayHaikuReveals / todayGames : 0;
  const todayTotalHints =
    stats.todayEmoticonScratches + stats.todayHaikuReveals;

  return {
    todayAverageEmoticonScratches,
    todayAverageHaikuReveals,
    todayTotalHints,
  };
}

describe('GlobalStatsRepository', () => {
  describe('getGlobalStats', () => {
    it('should return default stats when document is null', () => {
      const stats = getGlobalStats(null);

      expect(stats.totalHaikusGenerated).toBe(0);
      expect(stats.totalGamesPlayed).toBe(0);
      expect(stats.todayGamesPlayed).toBe(0);
      expect(stats.currentDay).toBe(getTodayString());
    });

    it('should return stored values when day is current', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayHaikusGenerated: 10,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        currentDay: getTodayString(),
      };

      const stats = getGlobalStats(doc);

      expect(stats.totalHaikusGenerated).toBe(100);
      expect(stats.totalGamesPlayed).toBe(50);
      expect(stats.todayHaikusGenerated).toBe(10);
      expect(stats.todayGamesPlayed).toBe(5);
      expect(stats.todayGamesWon).toBe(3);
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
        currentDay: getYesterdayString(),
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
    });
  });

  describe('incrementHaikuCount', () => {
    it('should increment total and daily haiku count on same day', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        todayHaikusGenerated: 10,
        currentDay: getTodayString(),
      };

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(101);
      expect(result.todayHaikusGenerated).toBe(11);
    });

    it('should reset daily count on day rollover', () => {
      const doc: MockDocument = {
        totalHaikusGenerated: 100,
        todayHaikusGenerated: 10,
        currentDay: getYesterdayString(),
      };

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(101);
      expect(result.todayHaikusGenerated).toBe(1);
      expect(result.currentDay).toBe(getTodayString());
    });

    it('should initialize counters from zero', () => {
      const doc: MockDocument = {};

      const update = simulateIncrementHaikuCount(doc);
      const result = applyUpdate(doc, update);

      expect(result.totalHaikusGenerated).toBe(1);
      expect(result.todayHaikusGenerated).toBe(1);
      expect(result.currentDay).toBe(getTodayString());
    });
  });

  describe('incrementGamePlayed', () => {
    it('should increment game counters for a win', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        currentDay: getTodayString(),
      };

      const update = simulateIncrementGamePlayed(doc, true);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(31);
      expect(result.todayGamesPlayed).toBe(6);
      expect(result.todayGamesWon).toBe(4);
    });

    it('should increment game counters for a loss', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        currentDay: getTodayString(),
      };

      const update = simulateIncrementGamePlayed(doc, false);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(30);
      expect(result.todayGamesPlayed).toBe(6);
      expect(result.todayGamesWon).toBe(3);
    });

    it('should track hint usage', () => {
      const doc: MockDocument = {
        totalEmoticonScratches: 100,
        totalHaikuReveals: 50,
        todayEmoticonScratches: 10,
        todayHaikuReveals: 5,
        currentDay: getTodayString(),
      };

      const hints: HintStats = { emoticonScratches: 3, haikuReveals: 2 };
      const update = simulateIncrementGamePlayed(doc, true, hints);
      const result = applyUpdate(doc, update);

      expect(result.totalEmoticonScratches).toBe(103);
      expect(result.totalHaikuReveals).toBe(52);
      expect(result.todayEmoticonScratches).toBe(13);
      expect(result.todayHaikuReveals).toBe(7);
    });

    it('should reset daily counters on day rollover for win', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        todayEmoticonScratches: 15,
        todayHaikuReveals: 8,
        currentDay: getYesterdayString(),
      };

      const hints: HintStats = { emoticonScratches: 2, haikuReveals: 1 };
      const update = simulateIncrementGamePlayed(doc, true, hints);
      const result = applyUpdate(doc, update);

      expect(result.totalGamesPlayed).toBe(51);
      expect(result.totalGamesWon).toBe(31);
      expect(result.todayGamesPlayed).toBe(1);
      expect(result.todayGamesWon).toBe(1);
      expect(result.todayEmoticonScratches).toBe(2);
      expect(result.todayHaikuReveals).toBe(1);
      expect(result.currentDay).toBe(getTodayString());
    });

    it('should reset daily counters on day rollover for loss', () => {
      const doc: MockDocument = {
        totalGamesPlayed: 50,
        totalGamesWon: 30,
        todayGamesPlayed: 5,
        todayGamesWon: 3,
        currentDay: getYesterdayString(),
      };

      const update = simulateIncrementGamePlayed(doc, false);
      const result = applyUpdate(doc, update);

      expect(result.todayGamesPlayed).toBe(1);
      expect(result.todayGamesWon).toBe(0);
    });
  });

  describe('Resolver computations', () => {
    it('should compute correct averages', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        todayGamesPlayed: 10,
        todayEmoticonScratches: 25,
        todayHaikuReveals: 15,
      };

      const output = computeResolverOutput(stats);

      expect(output.todayAverageEmoticonScratches).toBe(2.5);
      expect(output.todayAverageHaikuReveals).toBe(1.5);
      expect(output.todayTotalHints).toBe(40);
    });

    it('should return zero averages when no games played', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        todayGamesPlayed: 0,
        todayEmoticonScratches: 0,
        todayHaikuReveals: 0,
      };

      const output = computeResolverOutput(stats);

      expect(output.todayAverageEmoticonScratches).toBe(0);
      expect(output.todayAverageHaikuReveals).toBe(0);
      expect(output.todayTotalHints).toBe(0);
    });

    it('should compute win rate correctly', () => {
      const stats: GlobalStatsValue = {
        ...createDefaultStats(),
        todayGamesPlayed: 12,
        todayGamesWon: 9,
      };

      const winRate =
        stats.todayGamesPlayed > 0
          ? Math.round(
              (stats.todayGamesWon / stats.todayGamesPlayed) * 100,
            )
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
        todayHaikusGenerated: 0,
        todayGamesPlayed: 0,
        todayGamesWon: 0,
        todayEmoticonScratches: 0,
        todayHaikuReveals: 0,
        currentDay: getTodayString(),
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
      });
      doc = applyUpdate(doc, game1Update);

      const game2Update = simulateIncrementGamePlayed(doc, false, {
        emoticonScratches: 4,
        haikuReveals: 2,
      });
      doc = applyUpdate(doc, game2Update);

      // Verify totals
      expect(doc.totalHaikusGenerated).toBe(1003);
      expect(doc.totalGamesPlayed).toBe(402);
      expect(doc.totalGamesWon).toBe(281);
      expect(doc.totalEmoticonScratches).toBe(806);
      expect(doc.totalHaikuReveals).toBe(503);

      // Verify daily counters
      expect(doc.todayHaikusGenerated).toBe(3);
      expect(doc.todayGamesPlayed).toBe(2);
      expect(doc.todayGamesWon).toBe(1);
      expect(doc.todayEmoticonScratches).toBe(6);
      expect(doc.todayHaikuReveals).toBe(3);

      // Verify resolver output
      const stats = getGlobalStats(doc);
      const output = computeResolverOutput(stats);

      expect(output.todayAverageEmoticonScratches).toBe(3);
      expect(output.todayAverageHaikuReveals).toBe(1.5);
      expect(output.todayTotalHints).toBe(9);
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
        currentDay: getYesterdayString(),
      };

      // First action today - should reset daily counters
      const update = simulateIncrementHaikuCount(doc);
      doc = applyUpdate(doc, update);

      expect(doc.totalHaikusGenerated).toBe(1001);
      expect(doc.todayHaikusGenerated).toBe(1);
      expect(doc.currentDay).toBe(getTodayString());

      // Get stats should also show reset daily values
      const stats = getGlobalStats(doc);

      expect(stats.todayHaikusGenerated).toBe(1);
      expect(stats.todayGamesPlayed).toBe(0);
      expect(stats.todayGamesWon).toBe(0);
    });
  });
});
