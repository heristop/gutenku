#!/usr/bin/env node
/**
 * Filter Analytics Script
 * Analyzes different filter threshold configurations to find optimal balance
 * between haiku quality and generation success rate.
 */
// Load environment FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import pc from 'picocolors';
import { container } from 'tsyringe';
import mongoose from 'mongoose';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { RejectionStats, ScoreConfig } from '../src/domain/services/HaikuGeneratorTypes';
import type { HaikuQualityScore } from '@gutenku/shared';

// Import container registrations (after dotenv)
import '../src/infrastructure/di/container';

// Test configurations to analyze
interface FilterConfig {
  name: string;
  score: ScoreConfig;
}

const FILTER_CONFIGS: FilterConfig[] = [
  {
    name: 'No Filters (Baseline)',
    score: {
      sentiment: 0,
      markovChain: 0,
      pos: 0,
      trigram: 0,
      tfidf: 0,
      phonetics: 0,
      uniqueness: 0,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
    },
  },
  {
    name: 'Current Defaults',
    score: {
      sentiment: 0.5,
      markovChain: 0.1,
      pos: 0.3,
      trigram: 0.5,
      tfidf: 0,
      phonetics: 0.2,
      uniqueness: 0.6,
      verseDistance: 0.3,
      lineLengthBalance: 0.5,
      imageryDensity: 0.1,
      semanticCoherence: 0,
      verbPresence: 0.2,
    },
  },
  {
    name: 'Loose Filters',
    score: {
      sentiment: 0.3,
      markovChain: 0.05,
      pos: 0.2,
      trigram: 0.3,
      tfidf: 0,
      phonetics: 0.1,
      uniqueness: 0.5,
      verseDistance: 0.2,
      lineLengthBalance: 0.3,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0.1,
    },
  },
  {
    name: 'Strict Filters',
    score: {
      sentiment: 0.6,
      markovChain: 0.2,
      pos: 0.5,
      trigram: 1,
      tfidf: 0,
      phonetics: 0.3,
      uniqueness: 0.7,
      verseDistance: 0.5,
      lineLengthBalance: 0.6,
      imageryDensity: 0.2,
      semanticCoherence: 0.1,
      verbPresence: 0.3,
    },
  },
  {
    name: 'Quality Focus (High Grammar/Uniqueness)',
    score: {
      sentiment: 0.4,
      markovChain: 0.1,
      pos: 0.6,
      trigram: 0.5,
      tfidf: 0,
      phonetics: 0.2,
      uniqueness: 0.8,
      verseDistance: 0.3,
      lineLengthBalance: 0.5,
      imageryDensity: 0.15,
      semanticCoherence: 0.05,
      verbPresence: 0.25,
    },
  },
  {
    name: 'Flow Focus (High Markov/Trigram)',
    score: {
      sentiment: 0.4,
      markovChain: 0.3,
      pos: 0.2,
      trigram: 1.5,
      tfidf: 0,
      phonetics: 0.3,
      uniqueness: 0.5,
      verseDistance: 0.4,
      lineLengthBalance: 0.4,
      imageryDensity: 0.1,
      semanticCoherence: 0,
      verbPresence: 0.2,
    },
  },
  {
    name: 'Balanced Medium',
    score: {
      sentiment: 0.45,
      markovChain: 0.15,
      pos: 0.35,
      trigram: 0.7,
      tfidf: 0,
      phonetics: 0.25,
      uniqueness: 0.65,
      verseDistance: 0.35,
      lineLengthBalance: 0.55,
      imageryDensity: 0.12,
      semanticCoherence: 0.05,
      verbPresence: 0.22,
    },
  },
  {
    name: 'Minimal Quality Gate',
    score: {
      sentiment: 0.4,
      markovChain: 0.05,
      pos: 0.25,
      trigram: 0.4,
      tfidf: 0,
      phonetics: 0.15,
      uniqueness: 0.55,
      verseDistance: 0.25,
      lineLengthBalance: 0.4,
      imageryDensity: 0.05,
      semanticCoherence: 0,
      verbPresence: 0.15,
    },
  },
];

interface AnalyticsResult {
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

async function runAnalytics(iterations: number = 50): Promise<void> {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  HAIKU FILTER ANALYTICS')));
  console.log(pc.bold('='.repeat(70)));
  console.log(`\nRunning ${iterations} iterations per configuration...\n`);

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(pc.red('MONGODB_URI not set'));
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log(pc.green('Connected to MongoDB\n'));

  // Resolve generator from container (singleton with all dependencies)
  const generator = container.resolve(HaikuGeneratorService);
  await generator.prepare();
  console.log(pc.green('Generator prepared\n'));

  const results: AnalyticsResult[] = [];

  for (const config of FILTER_CONFIGS) {
    console.log(pc.bold(`\nTesting: ${pc.yellow(config.name)}`));
    console.log('-'.repeat(50));

    generator.configure({
      cache: { enabled: false, minCachedDocs: 100, ttl: 0 },
      score: config.score,
      theme: 'random',
    });

    let successes = 0;
    let failures = 0;
    let totalExecutionTime = 0;
    const qualityScores: number[] = [];
    const qualityAggregates = {
      natureWords: 0,
      repeatedWords: 0,
      weakStarts: 0,
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

    for (let i = 0; i < iterations; i++) {
      process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);

      try {
        const startTime = Date.now();
        const haiku = await generator.buildFromDb();
        const execTime = (Date.now() - startTime) / 1000;

        if (haiku && haiku.quality) {
          successes++;
          totalExecutionTime += execTime;
          qualityScores.push(haiku.quality.totalScore);

          qualityAggregates.natureWords += haiku.quality.natureWords;
          qualityAggregates.repeatedWords += haiku.quality.repeatedWords;
          qualityAggregates.weakStarts += haiku.quality.weakStarts;
          qualityAggregates.sentiment += haiku.quality.sentiment;
          qualityAggregates.grammar += haiku.quality.grammar;
          qualityAggregates.trigramFlow += haiku.quality.trigramFlow;
          qualityAggregates.markovFlow += haiku.quality.markovFlow;
          qualityAggregates.uniqueness += haiku.quality.uniqueness;
          qualityAggregates.alliteration += haiku.quality.alliteration;
          qualityAggregates.verseDistance += haiku.quality.verseDistance;
          qualityAggregates.lineLengthBalance += haiku.quality.lineLengthBalance;
          qualityAggregates.imageryDensity += haiku.quality.imageryDensity;
          qualityAggregates.semanticCoherence += haiku.quality.semanticCoherence;
          qualityAggregates.verbPresence += haiku.quality.verbPresence;
          qualityAggregates.totalScore += haiku.quality.totalScore;
        } else {
          failures++;
        }
      } catch (error) {
        failures++;
        if (i === 0) {
          // Log first error to understand what's failing
          console.log(`\n  First error: ${(error as Error).message}`);
        }
      }
    }

    const rejectionStats = generator.getRejectionStats();
    const successRate = (successes / iterations) * 100;
    const avgQuality: HaikuQualityScore = successes > 0 ? {
      natureWords: qualityAggregates.natureWords / successes,
      repeatedWords: qualityAggregates.repeatedWords / successes,
      weakStarts: qualityAggregates.weakStarts / successes,
      sentiment: qualityAggregates.sentiment / successes,
      grammar: qualityAggregates.grammar / successes,
      trigramFlow: qualityAggregates.trigramFlow / successes,
      markovFlow: qualityAggregates.markovFlow / successes,
      uniqueness: qualityAggregates.uniqueness / successes,
      alliteration: qualityAggregates.alliteration / successes,
      verseDistance: qualityAggregates.verseDistance / successes,
      lineLengthBalance: qualityAggregates.lineLengthBalance / successes,
      imageryDensity: qualityAggregates.imageryDensity / successes,
      semanticCoherence: qualityAggregates.semanticCoherence / successes,
      verbPresence: qualityAggregates.verbPresence / successes,
      totalScore: qualityAggregates.totalScore / successes,
    } : {
      natureWords: 0, repeatedWords: 0, weakStarts: 0, sentiment: 0,
      grammar: 0, trigramFlow: 0, markovFlow: 0, uniqueness: 0, alliteration: 0,
      verseDistance: 0, lineLengthBalance: 0, imageryDensity: 0,
      semanticCoherence: 0, verbPresence: 0, totalScore: 0,
    };

    results.push({
      config,
      iterations,
      successes,
      failures,
      successRate,
      avgExecutionTime: successes > 0 ? totalExecutionTime / successes : 0,
      avgQuality,
      qualityScores,
      rejectionStats,
    });

    const getSuccessRateColor = (): typeof pc.green => {
      if (successRate >= 80) {
        return pc.green;
      }

      if (successRate >= 50) {
        return pc.yellow;
      }
      return pc.red;
    };
    console.log(`\r  Success Rate: ${getSuccessRateColor()(successRate.toFixed(1) + '%')}`);
    console.log(`  Avg Quality Score: ${pc.cyan(avgQuality.totalScore.toFixed(2))}`);
    console.log(`  Total Rejections: ${pc.dim(String(rejectionStats.total))}`);
  }

  // Print detailed results
  printDetailedResults(results);

  // Find optimal configuration
  findOptimalConfig(results);

  await mongoose.disconnect();
  console.log(pc.green('\nDisconnected from MongoDB'));
}

function printDetailedResults(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  DETAILED RESULTS')));
  console.log(pc.bold('='.repeat(70)));

  for (const result of results) {
    console.log(pc.bold(`\n${result.config.name}`));
    console.log('-'.repeat(50));

    // Success metrics
    console.log(pc.dim('Success Metrics:'));
    console.log(`  Success Rate:     ${formatPercent(result.successRate)}`);
    console.log(`  Successes:        ${result.successes}/${result.iterations}`);
    console.log(`  Avg Exec Time:    ${result.avgExecutionTime.toFixed(3)}s`);

    // Quality metrics
    console.log(pc.dim('\nQuality Metrics (averages):'));
    console.log(`  Total Score:      ${pc.cyan(result.avgQuality.totalScore.toFixed(2))}`);
    console.log(`  Nature Words:     ${result.avgQuality.natureWords.toFixed(2)}`);
    console.log(`  Repeated Words:   ${result.avgQuality.repeatedWords.toFixed(2)}`);
    console.log(`  Weak Starts:      ${result.avgQuality.weakStarts.toFixed(2)}`);
    console.log(`  Sentiment:        ${result.avgQuality.sentiment.toFixed(3)}`);
    console.log(`  Grammar:          ${result.avgQuality.grammar.toFixed(3)}`);
    console.log(`  Trigram Flow:     ${result.avgQuality.trigramFlow.toFixed(3)}`);
    console.log(`  Uniqueness:       ${result.avgQuality.uniqueness.toFixed(3)}`);
    console.log(`  Alliteration:     ${result.avgQuality.alliteration.toFixed(3)}`);

    // Rejection breakdown
    console.log(pc.dim('\nRejection Breakdown:'));
    console.log(`  Total:            ${result.rejectionStats.total}`);
    console.log(`  Basic:            ${result.rejectionStats.basic} (${formatRejectPercent(result.rejectionStats.basic, result.rejectionStats.total)})`);
    console.log(`  Sentiment:        ${result.rejectionStats.sentiment} (${formatRejectPercent(result.rejectionStats.sentiment, result.rejectionStats.total)})`);
    console.log(`  Grammar:          ${result.rejectionStats.grammar} (${formatRejectPercent(result.rejectionStats.grammar, result.rejectionStats.total)})`);
    console.log(`  Markov:           ${result.rejectionStats.markov} (${formatRejectPercent(result.rejectionStats.markov, result.rejectionStats.total)})`);
    console.log(`  Trigram:          ${result.rejectionStats.trigram} (${formatRejectPercent(result.rejectionStats.trigram, result.rejectionStats.total)})`);
    console.log(`  Phonetics:        ${result.rejectionStats.phonetics} (${formatRejectPercent(result.rejectionStats.phonetics, result.rejectionStats.total)})`);
    console.log(`  Uniqueness:       ${result.rejectionStats.uniqueness} (${formatRejectPercent(result.rejectionStats.uniqueness, result.rejectionStats.total)})`);
    console.log(`  TF-IDF:           ${result.rejectionStats.tfidf} (${formatRejectPercent(result.rejectionStats.tfidf, result.rejectionStats.total)})`);

    // Quality score distribution
    if (result.qualityScores.length > 0) {
      const sorted = [...result.qualityScores].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted.at(-1);
      const median = sorted[Math.floor(sorted.length / 2)];
      const stdDev = calculateStdDev(result.qualityScores);

      console.log(pc.dim('\nQuality Score Distribution:'));
      console.log(`  Min:              ${min.toFixed(2)}`);
      console.log(`  Max:              ${max.toFixed(2)}`);
      console.log(`  Median:           ${median.toFixed(2)}`);
      console.log(`  Std Dev:          ${stdDev.toFixed(2)}`);
    }

    // Filter settings used
    console.log(pc.dim('\nFilter Settings:'));
    const s = result.config.score;
    console.log(`  sentiment=${s.sentiment}, markov=${s.markovChain}, pos=${s.pos}`);
    console.log(`  trigram=${s.trigram}, phonetics=${s.phonetics}, uniqueness=${s.uniqueness}`);
  }
}

function findOptimalConfig(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  OPTIMAL CONFIGURATION ANALYSIS')));
  console.log(pc.bold('='.repeat(70)));

  // Calculate composite scores for each config
  // Balance between success rate and quality
  interface ScoredResult {
    result: AnalyticsResult;
    compositeScore: number;
    qualityWeight: number;
    successWeight: number;
  }

  const scoredResults: ScoredResult[] = results.map(r => {
    // Normalize metrics to [0, 1]
    const successNorm = r.successRate / 100;
    const qualityNorm = Math.max(0, Math.min(1, r.avgQuality.totalScore / 15)); // Assume max ~15

    // Composite score: 40% success rate, 60% quality
    const compositeScore = (successNorm * 0.4) + (qualityNorm * 0.6);

    return {
      result: r,
      compositeScore,
      qualityWeight: qualityNorm,
      successWeight: successNorm,
    };
  });

  // Sort by composite score
  scoredResults.sort((a, b) => b.compositeScore - a.compositeScore);

  console.log('\nRanking (by composite score = 40% success + 60% quality):');
  console.log('-'.repeat(50));

  scoredResults.forEach((sr, i) => {
    const rank = i + 1;
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[rank - 1] ?? '  ';
    console.log(`${medal} #${rank}: ${pc.bold(sr.result.config.name)}`);
    console.log(`      Composite: ${pc.cyan(sr.compositeScore.toFixed(3))} | Success: ${formatPercent(sr.result.successRate)} | Quality: ${sr.result.avgQuality.totalScore.toFixed(2)}`);
  });

  // Best for different use cases
  console.log(pc.bold('\n' + '-'.repeat(50)));
  console.log(pc.bold('RECOMMENDATIONS BY USE CASE:'));
  console.log('-'.repeat(50));

  // Best overall (highest composite)
  const bestOverall = scoredResults[0];
  console.log(`\n${pc.green('Best Overall:')} ${pc.bold(bestOverall.result.config.name)}`);
  printConfigSummary(bestOverall.result);

  // Best for reliability (highest success rate with decent quality)
  const reliabilityFocused = [...results]
    .filter(r => r.avgQuality.totalScore >= 5)
    .sort((a, b) => b.successRate - a.successRate)[0];

  if (reliabilityFocused) {
    console.log(`\n${pc.green('Best for Reliability:')} ${pc.bold(reliabilityFocused.config.name)}`);
    printConfigSummary(reliabilityFocused);
  }

  // Best for quality (highest quality with decent success)
  const qualityFocused = [...results]
    .filter(r => r.successRate >= 50)
    .sort((a, b) => b.avgQuality.totalScore - a.avgQuality.totalScore)[0];

  if (qualityFocused) {
    console.log(`\n${pc.green('Best for Quality:')} ${pc.bold(qualityFocused.config.name)}`);
    printConfigSummary(qualityFocused);
  }

  // Suggest optimal settings
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.green('  SUGGESTED OPTIMAL DEFAULTS')));
  console.log(pc.bold('='.repeat(70)));

  const optimal = bestOverall.result.config.score;
  console.log('\nBased on analysis, recommended default filter settings:');
  console.log(pc.cyan(`
  DEFAULT_SENTIMENT_MIN_SCORE = ${optimal.sentiment};
  DEFAULT_MARKOV_MIN_SCORE = ${optimal.markovChain};
  DEFAULT_GRAMMAR_MIN_SCORE = ${optimal.pos};
  DEFAULT_TRIGRAM_MIN_SCORE = ${optimal.trigram};
  DEFAULT_UNIQUENESS_MIN_SCORE = ${optimal.uniqueness};
  DEFAULT_ALLITERATION_MIN_SCORE = ${optimal.phonetics};
`));
}

function printConfigSummary(result: AnalyticsResult): void {
  const s = result.config.score;
  console.log(`   Success: ${formatPercent(result.successRate)} | Quality: ${result.avgQuality.totalScore.toFixed(2)}`);
  console.log(`   Settings: sentiment=${s.sentiment}, markov=${s.markovChain}, pos=${s.pos}, trigram=${s.trigram}, phonetics=${s.phonetics}, uniqueness=${s.uniqueness}`);
}

function formatPercent(value: number): string {
  if (value >= 80) {
    return pc.green(value.toFixed(1) + '%');
  }

  if (value >= 50) {
    return pc.yellow(value.toFixed(1) + '%');
  }
  return pc.red(value.toFixed(1) + '%');
}

function formatRejectPercent(count: number, total: number): string {
  if (total === 0) {
    return '0%';
  }
  return ((count / total) * 100).toFixed(1) + '%';
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// Parse arguments
const args = process.argv.slice(2);
const iterations = args.includes('--iterations')
  ? Number.parseInt(args[args.indexOf('--iterations') + 1], 10)
  : 50;

runAnalytics(iterations).catch(error => {
  console.error(pc.red('Fatal error:'), error);
  process.exit(1);
});
