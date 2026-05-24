/**
 * Reporting helpers for filter-analytics CLI: detailed result printing,
 * optimal configuration discovery, and formatting utilities.
 */
import pc from 'picocolors';
import type { AnalyticsResult } from './filter-analytics-helpers';

export function formatPercent(value: number): string {
  if (value >= 80) {
    return pc.green(value.toFixed(1) + '%');
  }

  if (value >= 50) {
    return pc.yellow(value.toFixed(1) + '%');
  }

  return pc.red(value.toFixed(1) + '%');
}

export function formatRejectPercent(count: number, total: number): string {
  if (total === 0) {
    return '0%';
  }

  return ((count / total) * 100).toFixed(1) + '%';
}

export function calculateStdDev(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));

  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function printSuccessMetrics(result: AnalyticsResult): void {
  console.log(pc.dim('Success Metrics:'));
  console.log(`  Success Rate:     ${formatPercent(result.successRate)}`);
  console.log(`  Successes:        ${result.successes}/${result.iterations}`);
  console.log(`  Avg Exec Time:    ${result.avgExecutionTime.toFixed(3)}s`);
}

function printQualityMetrics(result: AnalyticsResult): void {
  console.log(pc.dim('\nQuality Metrics (averages):'));
  console.log(
    `  Total Score:      ${pc.cyan(result.avgQuality.totalScore.toFixed(2))}`,
  );
  console.log(`  Nature Words:     ${result.avgQuality.natureWords.toFixed(2)}`);
  console.log(
    `  Repeated Words:   ${result.avgQuality.repeatedWords.toFixed(2)}`,
  );
  console.log(`  Weak Starts:      ${result.avgQuality.weakStarts.toFixed(2)}`);
  console.log(`  Sentiment:        ${result.avgQuality.sentiment.toFixed(3)}`);
  console.log(`  Grammar:          ${result.avgQuality.grammar.toFixed(3)}`);
  console.log(
    `  Trigram Flow:     ${result.avgQuality.trigramFlow.toFixed(3)}`,
  );
  console.log(`  Uniqueness:       ${result.avgQuality.uniqueness.toFixed(3)}`);
  console.log(
    `  Alliteration:     ${result.avgQuality.alliteration.toFixed(3)}`,
  );
}

function printRejectionBreakdown(result: AnalyticsResult): void {
  const r = result.rejectionStats;
  console.log(pc.dim('\nRejection Breakdown:'));
  console.log(`  Total:            ${r.total}`);
  console.log(
    `  Basic:            ${r.basic} (${formatRejectPercent(r.basic, r.total)})`,
  );
  console.log(
    `  Sentiment:        ${r.sentiment} (${formatRejectPercent(r.sentiment, r.total)})`,
  );
  console.log(
    `  Grammar:          ${r.grammar} (${formatRejectPercent(r.grammar, r.total)})`,
  );
  console.log(
    `  Markov:           ${r.markov} (${formatRejectPercent(r.markov, r.total)})`,
  );
  console.log(
    `  Trigram:          ${r.trigram} (${formatRejectPercent(r.trigram, r.total)})`,
  );
  console.log(
    `  Phonetics:        ${r.phonetics} (${formatRejectPercent(r.phonetics, r.total)})`,
  );
  console.log(
    `  Uniqueness:       ${r.uniqueness} (${formatRejectPercent(r.uniqueness, r.total)})`,
  );
  console.log(
    `  TF-IDF:           ${r.tfidf} (${formatRejectPercent(r.tfidf, r.total)})`,
  );
}

function printQualityDistribution(result: AnalyticsResult): void {
  if (result.qualityScores.length === 0) {
    return;
  }

  const sorted = [...result.qualityScores].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted.at(-1)!;
  const median = sorted[Math.floor(sorted.length / 2)];
  const stdDev = calculateStdDev(result.qualityScores);

  console.log(pc.dim('\nQuality Score Distribution:'));
  console.log(`  Min:              ${min.toFixed(2)}`);
  console.log(`  Max:              ${max.toFixed(2)}`);
  console.log(`  Median:           ${median.toFixed(2)}`);
  console.log(`  Std Dev:          ${stdDev.toFixed(2)}`);
}

function printFilterSettings(result: AnalyticsResult): void {
  console.log(pc.dim('\nFilter Settings:'));
  const s = result.config.score;
  console.log(
    `  sentiment=${s.sentiment}, markov=${s.markovChain}, pos=${s.pos}`,
  );
  console.log(
    `  trigram=${s.trigram}, phonetics=${s.phonetics}, uniqueness=${s.uniqueness}`,
  );
}

export function printDetailedResults(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  DETAILED RESULTS')));
  console.log(pc.bold('='.repeat(70)));

  for (const result of results) {
    console.log(pc.bold(`\n${result.config.name}`));
    console.log('-'.repeat(50));

    printSuccessMetrics(result);
    printQualityMetrics(result);
    printRejectionBreakdown(result);
    printQualityDistribution(result);
    printFilterSettings(result);
  }
}

function printConfigSummary(result: AnalyticsResult): void {
  const s = result.config.score;
  console.log(
    `   Success: ${formatPercent(result.successRate)} | Quality: ${result.avgQuality.totalScore.toFixed(2)}`,
  );
  console.log(
    `   Settings: sentiment=${s.sentiment}, markov=${s.markovChain}, pos=${s.pos}, trigram=${s.trigram}, phonetics=${s.phonetics}, uniqueness=${s.uniqueness}`,
  );
}

interface ScoredResult {
  result: AnalyticsResult;
  compositeScore: number;
  qualityWeight: number;
  successWeight: number;
}

function rankResults(results: AnalyticsResult[]): ScoredResult[] {
  const scoredResults: ScoredResult[] = results.map((r) => {
    const successNorm = r.successRate / 100;
    const qualityNorm = Math.max(0, Math.min(1, r.avgQuality.totalScore / 15));
    const compositeScore = successNorm * 0.4 + qualityNorm * 0.6;

    return {
      result: r,
      compositeScore,
      qualityWeight: qualityNorm,
      successWeight: successNorm,
    };
  });

  scoredResults.sort((a, b) => b.compositeScore - a.compositeScore);

  return scoredResults;
}

function printRanking(scoredResults: ScoredResult[]): void {
  console.log('\nRanking (by composite score = 40% success + 60% quality):');
  console.log('-'.repeat(50));

  scoredResults.forEach((sr, i) => {
    const rank = i + 1;
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[rank - 1] ?? '  ';
    console.log(`${medal} #${rank}: ${pc.bold(sr.result.config.name)}`);
    console.log(
      `      Composite: ${pc.cyan(sr.compositeScore.toFixed(3))} | Success: ${formatPercent(sr.result.successRate)} | Quality: ${sr.result.avgQuality.totalScore.toFixed(2)}`,
    );
  });
}

function printRecommendations(
  results: AnalyticsResult[],
  bestOverall: ScoredResult,
): void {
  console.log(pc.bold('\n' + '-'.repeat(50)));
  console.log(pc.bold('RECOMMENDATIONS BY USE CASE:'));
  console.log('-'.repeat(50));

  console.log(
    `\n${pc.green('Best Overall:')} ${pc.bold(bestOverall.result.config.name)}`,
  );
  printConfigSummary(bestOverall.result);

  const reliabilityFocused = [...results]
    .filter((r) => r.avgQuality.totalScore >= 5)
    .sort((a, b) => b.successRate - a.successRate)[0];

  if (reliabilityFocused) {
    console.log(
      `\n${pc.green('Best for Reliability:')} ${pc.bold(reliabilityFocused.config.name)}`,
    );
    printConfigSummary(reliabilityFocused);
  }

  const qualityFocused = [...results]
    .filter((r) => r.successRate >= 50)
    .sort((a, b) => b.avgQuality.totalScore - a.avgQuality.totalScore)[0];

  if (qualityFocused) {
    console.log(
      `\n${pc.green('Best for Quality:')} ${pc.bold(qualityFocused.config.name)}`,
    );
    printConfigSummary(qualityFocused);
  }
}

function printSuggestedDefaults(bestOverall: ScoredResult): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.green('  SUGGESTED OPTIMAL DEFAULTS')));
  console.log(pc.bold('='.repeat(70)));

  const optimal = bestOverall.result.config.score;
  console.log('\nBased on analysis, recommended default filter settings:');
  console.log(
    pc.cyan(`
  DEFAULT_SENTIMENT_MIN_SCORE = ${optimal.sentiment};
  DEFAULT_MARKOV_MIN_SCORE = ${optimal.markovChain};
  DEFAULT_GRAMMAR_MIN_SCORE = ${optimal.pos};
  DEFAULT_TRIGRAM_MIN_SCORE = ${optimal.trigram};
  DEFAULT_UNIQUENESS_MIN_SCORE = ${optimal.uniqueness};
  DEFAULT_ALLITERATION_MIN_SCORE = ${optimal.phonetics};
`),
  );
}

export function findOptimalConfig(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  OPTIMAL CONFIGURATION ANALYSIS')));
  console.log(pc.bold('='.repeat(70)));

  const scoredResults = rankResults(results);
  printRanking(scoredResults);

  const bestOverall = scoredResults[0];
  printRecommendations(results, bestOverall);
  printSuggestedDefaults(bestOverall);
}
