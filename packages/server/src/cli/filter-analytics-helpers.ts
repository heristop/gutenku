/**
 * Helpers for filter-analytics CLI: quality aggregation, iteration loop,
 * and per-config evaluation extracted to keep the entry point lean.
 */
import pc from 'picocolors';
import type HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import type { RejectionStats } from '~/domain/services/HaikuGeneratorTypes';
import type { HaikuQualityScore } from '@gutenku/shared';
import type { FilterConfig } from './filter-analytics-configs';

export interface AnalyticsResult {
  config: FilterConfig;
  iterations: number;
  successes: number;
  failures: number;
  successRate: number;
  avgExecutionTime: number;
  avgQuality: HaikuQualityScore;
  qualityScores: number[];
  rejectionStats: RejectionStats;
}

export interface QualityAggregates {
  natureWords: number;
  repeatedWords: number;
  weakStarts: number;
  blacklistedVerses: number;
  properNouns: number;
  sentiment: number;
  grammar: number;
  trigramFlow: number;
  markovFlow: number;
  uniqueness: number;
  alliteration: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
  totalScore: number;
}

export interface IterationStats {
  successes: number;
  failures: number;
  totalExecutionTime: number;
  qualityScores: number[];
  qualityAggregates: QualityAggregates;
}

export function createEmptyAggregates(): QualityAggregates {
  return {
    natureWords: 0,
    repeatedWords: 0,
    weakStarts: 0,
    blacklistedVerses: 0,
    properNouns: 0,
    sentiment: 0,
    grammar: 0,
    trigramFlow: 0,
    markovFlow: 0,
    uniqueness: 0,
    alliteration: 0,
    verseDistance: 0,
    lineLengthBalance: 0,
    imageryDensity: 0,
    semanticCoherence: 0,
    verbPresence: 0,
    totalScore: 0,
  };
}

function emptyAverageQuality(): HaikuQualityScore {
  return { ...createEmptyAggregates(), verseLengthPenalty: 0 };
}

export function accumulateQuality(
  aggregates: QualityAggregates,
  quality: HaikuQualityScore,
): void {
  aggregates.natureWords += quality.natureWords;
  aggregates.repeatedWords += quality.repeatedWords;
  aggregates.weakStarts += quality.weakStarts;
  aggregates.blacklistedVerses += quality.blacklistedVerses ?? 0;
  aggregates.properNouns += quality.properNouns ?? 0;
  aggregates.sentiment += quality.sentiment;
  aggregates.grammar += quality.grammar;
  aggregates.trigramFlow += quality.trigramFlow;
  aggregates.markovFlow += quality.markovFlow;
  aggregates.uniqueness += quality.uniqueness;
  aggregates.alliteration += quality.alliteration;
  aggregates.verseDistance += quality.verseDistance;
  aggregates.lineLengthBalance += quality.lineLengthBalance;
  aggregates.imageryDensity += quality.imageryDensity;
  aggregates.semanticCoherence += quality.semanticCoherence;
  aggregates.verbPresence += quality.verbPresence;
  aggregates.totalScore += quality.totalScore;
}

export function computeAverageQuality(
  aggregates: QualityAggregates,
  successes: number,
): HaikuQualityScore {
  if (successes === 0) {
    return emptyAverageQuality();
  }

  return {
    natureWords: aggregates.natureWords / successes,
    repeatedWords: aggregates.repeatedWords / successes,
    weakStarts: aggregates.weakStarts / successes,
    blacklistedVerses: aggregates.blacklistedVerses / successes,
    properNouns: aggregates.properNouns / successes,
    verseLengthPenalty: 0,
    sentiment: aggregates.sentiment / successes,
    grammar: aggregates.grammar / successes,
    trigramFlow: aggregates.trigramFlow / successes,
    markovFlow: aggregates.markovFlow / successes,
    uniqueness: aggregates.uniqueness / successes,
    alliteration: aggregates.alliteration / successes,
    verseDistance: aggregates.verseDistance / successes,
    lineLengthBalance: aggregates.lineLengthBalance / successes,
    imageryDensity: aggregates.imageryDensity / successes,
    semanticCoherence: aggregates.semanticCoherence / successes,
    verbPresence: aggregates.verbPresence / successes,
    totalScore: aggregates.totalScore / successes,
  };
}

export async function collectIterationStats(
  generator: HaikuGeneratorService,
  iterations: number,
): Promise<IterationStats> {
  const stats: IterationStats = {
    successes: 0,
    failures: 0,
    totalExecutionTime: 0,
    qualityScores: [],
    qualityAggregates: createEmptyAggregates(),
  };

  for (let i = 0; i < iterations; i++) {
    process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);

    try {
      const startTime = Date.now();
      const haiku = await generator.buildFromDb();
      const execTime = (Date.now() - startTime) / 1000;

      if (!haiku || !haiku.quality) {
        stats.failures++;
        continue;
      }

      stats.successes++;
      stats.totalExecutionTime += execTime;
      stats.qualityScores.push(haiku.quality.totalScore);
      accumulateQuality(stats.qualityAggregates, haiku.quality);
    } catch (error) {
      stats.failures++;

      if (i === 0) {
        console.log(`\n  First error: ${(error as Error).message}`);
      }
    }
  }

  return stats;
}

function pickRateColor(successRate: number): typeof pc.green {
  if (successRate >= 80) {
    return pc.green;
  }

  if (successRate >= 50) {
    return pc.yellow;
  }

  return pc.red;
}

function logConfigSummary(
  successRate: number,
  avgQuality: HaikuQualityScore,
  rejectionTotal: number,
): void {
  console.log(
    `\r  Success Rate: ${pickRateColor(successRate)(successRate.toFixed(1) + '%')}`,
  );
  console.log(
    `  Avg Quality Score: ${pc.cyan(avgQuality.totalScore.toFixed(2))}`,
  );
  console.log(`  Total Rejections: ${pc.dim(String(rejectionTotal))}`);
}

export async function evaluateConfig(
  generator: HaikuGeneratorService,
  config: FilterConfig,
  iterations: number,
): Promise<AnalyticsResult> {
  console.log(pc.bold(`\nTesting: ${pc.yellow(config.name)}`));
  console.log('-'.repeat(50));

  generator.configure({
    cache: { enabled: false, minCachedDocs: 100, ttl: 0 },
    score: config.score,
    theme: 'random',
  });

  const stats = await collectIterationStats(generator, iterations);
  const rejectionStats = generator.getRejectionStats();
  const successRate = (stats.successes / iterations) * 100;
  const avgQuality = computeAverageQuality(
    stats.qualityAggregates,
    stats.successes,
  );

  const result: AnalyticsResult = {
    config,
    iterations,
    successes: stats.successes,
    failures: stats.failures,
    successRate,
    avgExecutionTime:
      stats.successes > 0 ? stats.totalExecutionTime / stats.successes : 0,
    avgQuality,
    qualityScores: stats.qualityScores,
    rejectionStats,
  };

  logConfigSummary(successRate, avgQuality, rejectionStats.total);

  return result;
}
