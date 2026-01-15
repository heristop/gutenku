#!/usr/bin/env node
/* eslint-disable max-lines */
import 'reflect-metadata';
import dotenv from 'dotenv';
import pc from 'picocolors';
import fetch from 'node-fetch';
import { program } from 'commander';
import { container } from 'tsyringe';

dotenv.config();

import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import {
  GeneticAlgorithmService,
  type GAConfig,
  type VersePools,
  type VerseCandidate,
} from '~/domain/services/genetic';
import { syllable } from 'syllable';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
} from '~/shared/constants/validation';

program
  .name('ga-benchmark')
  .description('Benchmark GA vs Random sampling for haiku quality')
  .option('-n, --iterations <number>', 'number of test iterations', '10')
  .option('-p, --population <number>', 'GA population size', '50')
  .option('-g, --generations <number>', 'GA max generations', '30')
  .parse();

const options = program.opts();

const ITERATIONS = Math.max(1, Number.parseInt(options.iterations, 10) || 10);
const GA_CONFIG: Partial<GAConfig> = {
  populationSize: Math.max(10, Number.parseInt(options.population, 10) || 100),
  maxGenerations: Math.max(5, Number.parseInt(options.generations, 10) || 100),
  returnCount: 5,
  recordHistory: false, // Disable for benchmarking
};

// GraphQL query to get chapter content
const query = `
  query Query {
    haiku(useAI: false, useCache: false, appendImg: false) {
      book {
        reference
        title
        author
      }
      chapter {
        title
        content
      }
      verses
      quality {
        totalScore
        natureWords
        sentiment
        grammar
        markovFlow
        uniqueness
        alliteration
      }
    }
  }
`;

interface BenchmarkResult {
  method: 'ga' | 'random';
  iteration: number;
  book: string;
  bestScore: number;
  avgTop5Score: number;
  metrics: {
    natureWords: number;
    sentiment: number;
    grammar: number;
    markovFlow: number;
    uniqueness: number;
    alliteration: number;
  };
  timeMs: number;
  searchSpace: number;
}

interface AggregatedStats {
  method: 'ga' | 'random';
  avgBestScore: number;
  avgTop5Score: number;
  minBestScore: number;
  maxBestScore: number;
  stdDevBestScore: number;
  avgTimeMs: number;
  avgMetrics: {
    natureWords: number;
    sentiment: number;
    grammar: number;
    markovFlow: number;
    uniqueness: number;
    alliteration: number;
  };
}

// Extract verse pools from chapter content
function extractVersePoolsFromContent(
  content: string,
  bookId: string,
  chapterId: string,
  naturalLanguage: NaturalLanguageService,
): VersePools {
  const sentences = naturalLanguage.extractSentencesByPunctuation(content);

  const fiveSyllable: VerseCandidate[] = [];
  const sevenSyllable: VerseCandidate[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = naturalLanguage.extractWords(sentence);
    if (!words) {
      continue;
    }

    const syllableCount = words.reduce((c, w) => c + syllable(w), 0);

    if (syllableCount === 5) {
      fiveSyllable.push({
        text: sentence,
        syllableCount: 5,
        sourceIndex: i,
      });
    } else if (syllableCount === 7) {
      sevenSyllable.push({
        text: sentence,
        syllableCount: 7,
        sourceIndex: i,
      });
    }
  }

  return {
    fiveSyllable,
    sevenSyllable,
    bookId,
    chapterId,
  };
}

// Random sampling (simulate current behavior)
function randomSampling(
  versePools: VersePools,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
  count: number = 50,
): { verses: string[]; score: number; metrics: HaikuQualityScore }[] {
  const results: {
    verses: string[];
    score: number;
    metrics: HaikuQualityScore;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const verse1Idx = Math.floor(
      Math.random() * versePools.fiveSyllable.length,
    );
    const verse2Idx = Math.floor(
      Math.random() * versePools.sevenSyllable.length,
    );
    let verse3Idx = Math.floor(Math.random() * versePools.fiveSyllable.length);

    // Avoid same verse for 1 and 3
    while (verse3Idx === verse1Idx && versePools.fiveSyllable.length > 1) {
      verse3Idx = Math.floor(Math.random() * versePools.fiveSyllable.length);
    }

    const verses = [
      versePools.fiveSyllable[verse1Idx].text,
      versePools.sevenSyllable[verse2Idx].text,
      versePools.fiveSyllable[verse3Idx].text,
    ];

    // Calculate metrics
    const sentiment = naturalLanguage.analyzeSentiment(verses.join(' '));
    const grammar = naturalLanguage.analyzeGrammar(verses.join(' '));
    const phonetics = naturalLanguage.analyzePhonetics(verses);
    const markovFlow = markovEvaluator.evaluateHaiku(verses);
    const trigramFlow = markovEvaluator.evaluateHaikuTrigrams(verses);

    const quality = calculateHaikuQuality(verses, {
      sentiment,
      grammar: grammar.score,
      trigramFlow,
      markovFlow,
      alliteration: phonetics.alliterationScore,
      verseIndices: [verse1Idx, verse2Idx, verse3Idx],
      totalQuotes:
        versePools.fiveSyllable.length + versePools.sevenSyllable.length,
    });

    results.push({
      verses,
      score: quality.totalScore,
      metrics: quality,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function aggregateResults(results: BenchmarkResult[]): AggregatedStats {
  const bestScores = results.map((r) => r.bestScore);
  const avgTop5Scores = results.map((r) => r.avgTop5Score);
  const times = results.map((r) => r.timeMs);

  return {
    method: results[0].method,
    avgBestScore: bestScores.reduce((a, b) => a + b, 0) / bestScores.length,
    avgTop5Score:
      avgTop5Scores.reduce((a, b) => a + b, 0) / avgTop5Scores.length,
    minBestScore: Math.min(...bestScores),
    maxBestScore: Math.max(...bestScores),
    stdDevBestScore: calculateStdDev(bestScores),
    avgTimeMs: times.reduce((a, b) => a + b, 0) / times.length,
    avgMetrics: {
      natureWords:
        results.reduce((sum, r) => sum + r.metrics.natureWords, 0) /
        results.length,
      sentiment:
        results.reduce((sum, r) => sum + r.metrics.sentiment, 0) /
        results.length,
      grammar:
        results.reduce((sum, r) => sum + r.metrics.grammar, 0) / results.length,
      markovFlow:
        results.reduce((sum, r) => sum + r.metrics.markovFlow, 0) /
        results.length,
      uniqueness:
        results.reduce((sum, r) => sum + r.metrics.uniqueness, 0) /
        results.length,
      alliteration:
        results.reduce((sum, r) => sum + r.metrics.alliteration, 0) /
        results.length,
    },
  };
}

function drawComparisonChart(
  gaResults: BenchmarkResult[],
  randomResults: BenchmarkResult[],
): void {
  const chartHeight = 15;
  const chartWidth = Math.min(40, ITERATIONS);

  const gaBest = gaResults.map((r) => r.bestScore);
  const randomBest = randomResults.map((r) => r.bestScore);

  const allValues = [...gaBest, ...randomBest];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  console.log(pc.bold('\n═══ Score Distribution Chart ═══\n'));
  console.log(pc.dim(`  ${maxVal.toFixed(1).padStart(6)} ┤`));

  for (let row = chartHeight - 1; row >= 0; row--) {
    let line = '';

    for (let col = 0; col < Math.min(chartWidth, ITERATIONS); col++) {
      const gaVal = gaBest[col] ?? 0;
      const randomVal = randomBest[col] ?? 0;

      const gaNorm = Math.floor(((gaVal - minVal) / range) * chartHeight);
      const randomNorm = Math.floor(
        ((randomVal - minVal) / range) * chartHeight,
      );

      if (gaNorm === row && randomNorm === row) {
        line += pc.cyan('◆');
      } else if (gaNorm === row) {
        line += pc.green('●');
      } else if (randomNorm === row) {
        line += pc.yellow('○');
      } else {
        line += ' ';
      }
    }

    if (row === chartHeight - 1) {
      console.log(pc.dim('         │') + line);
    } else if (row === Math.floor(chartHeight / 2)) {
      const midVal = minVal + range / 2;
      console.log(pc.dim(`  ${midVal.toFixed(1).padStart(6)} ┤`) + line);
    } else if (row === 0) {
      console.log(pc.dim(`  ${minVal.toFixed(1).padStart(6)} ┤`) + line);
    } else {
      console.log(pc.dim('         │') + line);
    }
  }

  const xAxis = '─'.repeat(chartWidth);
  console.log(pc.dim('         └') + pc.dim(xAxis));
  console.log(
    pc.dim(`         1`) +
      ' '.repeat(Math.max(0, chartWidth - 10)) +
      pc.dim(`Iter ${ITERATIONS}`),
  );

  console.log();
  console.log(
    `  ${pc.green('●')} GA best score  ${pc.yellow('○')} Random best score`,
  );
}

function printMetricsTable(
  gaStats: AggregatedStats,
  randomStats: AggregatedStats,
): void {
  console.log(pc.bold('\n═══ Detailed Metrics Comparison ═══\n'));

  const metrics = [
    {
      name: 'Nature Words',
      ga: gaStats.avgMetrics.natureWords,
      random: randomStats.avgMetrics.natureWords,
    },
    {
      name: 'Sentiment',
      ga: gaStats.avgMetrics.sentiment,
      random: randomStats.avgMetrics.sentiment,
    },
    {
      name: 'Grammar',
      ga: gaStats.avgMetrics.grammar,
      random: randomStats.avgMetrics.grammar,
    },
    {
      name: 'Markov Flow',
      ga: gaStats.avgMetrics.markovFlow,
      random: randomStats.avgMetrics.markovFlow,
    },
    {
      name: 'Uniqueness',
      ga: gaStats.avgMetrics.uniqueness,
      random: randomStats.avgMetrics.uniqueness,
    },
    {
      name: 'Alliteration',
      ga: gaStats.avgMetrics.alliteration,
      random: randomStats.avgMetrics.alliteration,
    },
  ];

  console.log(
    pc.dim('  ┌──────────────────┬──────────┬──────────┬────────────┐'),
  );
  console.log(
    pc.dim('  │ ') +
      pc.bold('Metric'.padEnd(16)) +
      pc.dim(' │ ') +
      pc.bold('GA'.padStart(8)) +
      pc.dim(' │ ') +
      pc.bold('Random'.padStart(8)) +
      pc.dim(' │ ') +
      pc.bold('Improve'.padStart(10)) +
      pc.dim(' │'),
  );
  console.log(
    pc.dim('  ├──────────────────┼──────────┼──────────┼────────────┤'),
  );

  for (const metric of metrics) {
    const improvement =
      metric.random !== 0
        ? ((metric.ga - metric.random) / Math.abs(metric.random)) * 100
        : 0;
    const improvementStr =
      improvement >= 0
        ? pc.green('+' + improvement.toFixed(1) + '%')
        : pc.red(improvement.toFixed(1) + '%');

    console.log(
      pc.dim('  │ ') +
        metric.name.padEnd(16) +
        pc.dim(' │ ') +
        pc.cyan(metric.ga.toFixed(3).padStart(8)) +
        pc.dim(' │ ') +
        pc.yellow(metric.random.toFixed(3).padStart(8)) +
        pc.dim(' │ ') +
        improvementStr.padStart(19) +
        pc.dim(' │'),
    );
  }

  console.log(
    pc.dim('  └──────────────────┴──────────┴──────────┴────────────┘'),
  );
}

// oxlint-disable-next-line eslint/complexity -- benchmark scripts are inherently complex
async function main(): Promise<void> {
  console.log(pc.bold('\n🧬 Genetic Algorithm vs Random Sampling Benchmark\n'));
  console.log(pc.dim('Configuration:'));
  console.log(`  ${pc.dim('Iterations:')}      ${pc.cyan(String(ITERATIONS))}`);
  console.log(
    `  ${pc.dim('GA Population:')}   ${pc.cyan(String(GA_CONFIG.populationSize))}`,
  );
  console.log(
    `  ${pc.dim('GA Generations:')}  ${pc.cyan(String(GA_CONFIG.maxGenerations))}`,
  );

  // Initialize services
  const naturalLanguage = container.resolve(NaturalLanguageService);
  const markovEvaluator = container.resolve(MarkovEvaluatorService);

  console.log(pc.dim('\nLoading Markov model...'));
  await markovEvaluator.load();

  const gaResults: BenchmarkResult[] = [];
  const randomResults: BenchmarkResult[] = [];

  console.log(pc.dim('\nRunning benchmark iterations...\n'));

  for (let i = 0; i < ITERATIONS; i++) {
    process.stdout.write(
      `  ${pc.cyan(`[${i + 1}/${ITERATIONS}]`)} Fetching chapter... `,
    );

    // Fetch a random chapter
    const response = await fetch(
      process.env.SERVER_URI || 'http://localhost:4000/graphql',
      {
        body: JSON.stringify({ query }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );

    const data = (await response.json()) as {
      data?: {
        haiku?: {
          book: { reference: string; title: string; author: string };
          chapter: { title?: string; content: string };
          verses: string[];
          quality?: HaikuQualityScore;
        };
      };
    };

    if (!data.data?.haiku) {
      console.log(pc.red('Failed to fetch haiku'));
      continue;
    }

    const seedHaiku = data.data.haiku;
    process.stdout.write(pc.green('OK\n'));

    // Extract verse pools
    const versePools = extractVersePoolsFromContent(
      seedHaiku.chapter.content,
      seedHaiku.book.reference,
      seedHaiku.chapter.title || 'unknown',
      naturalLanguage,
    );

    const searchSpace =
      versePools.fiveSyllable.length *
      versePools.sevenSyllable.length *
      Math.max(1, versePools.fiveSyllable.length - 1);

    process.stdout.write(`            Running GA...       `);

    // Run GA
    const gaStartTime = Date.now();
    const gaService = new GeneticAlgorithmService(
      naturalLanguage,
      markovEvaluator,
      { ...GA_CONFIG, seed: `benchmark-${i}` },
    );
    const gaEvolution = await gaService.evolve(versePools);
    const gaTimeMs = Date.now() - gaStartTime;

    const gaBestScore = gaEvolution.topCandidates[0]?.fitness ?? 0;
    const gaAvgTop5 =
      gaEvolution.topCandidates.reduce((sum, c) => sum + c.fitness, 0) /
      gaEvolution.topCandidates.length;

    const gaBestMetrics = gaEvolution.topCandidates[0]?.metrics ?? {
      natureWords: 0,
      sentiment: 0.5,
      grammar: 0,
      markovFlow: 0,
      uniqueness: 0,
      alliteration: 0,
    };

    gaResults.push({
      method: 'ga',
      iteration: i + 1,
      book: seedHaiku.book.title,
      bestScore: gaBestScore,
      avgTop5Score: gaAvgTop5,
      metrics: {
        natureWords: gaBestMetrics.natureWords ?? 0,
        sentiment: gaBestMetrics.sentiment ?? 0.5,
        grammar: gaBestMetrics.grammar ?? 0,
        markovFlow: gaBestMetrics.markovFlow ?? 0,
        uniqueness: gaBestMetrics.uniqueness ?? 0,
        alliteration: gaBestMetrics.alliteration ?? 0,
      },
      timeMs: gaTimeMs,
      searchSpace,
    });

    process.stdout.write(
      pc.green(`${gaBestScore.toFixed(2)} (${gaTimeMs}ms)\n`),
    );

    process.stdout.write(`            Running Random...   `);

    // Run random sampling
    const randomStartTime = Date.now();
    // Random sampling with same number of evaluations as typical GA run (~500)
    const randomSampleCount = 500;
    const randomHaikus = randomSampling(
      versePools,
      naturalLanguage,
      markovEvaluator,
      randomSampleCount,
    );
    const randomTimeMs = Date.now() - randomStartTime;

    const randomBestScore = randomHaikus[0]?.score ?? 0;
    const randomAvgTop5 =
      randomHaikus.slice(0, 5).reduce((sum, h) => sum + h.score, 0) / 5;

    const randomBestMetrics = randomHaikus[0]?.metrics ?? {
      natureWords: 0,
      sentiment: 0.5,
      grammar: 0,
      markovFlow: 0,
      uniqueness: 0,
      alliteration: 0,
    };

    randomResults.push({
      method: 'random',
      iteration: i + 1,
      book: seedHaiku.book.title,
      bestScore: randomBestScore,
      avgTop5Score: randomAvgTop5,
      metrics: {
        natureWords: randomBestMetrics.natureWords ?? 0,
        sentiment: randomBestMetrics.sentiment ?? 0.5,
        grammar: randomBestMetrics.grammar ?? 0,
        markovFlow: randomBestMetrics.markovFlow ?? 0,
        uniqueness: randomBestMetrics.uniqueness ?? 0,
        alliteration: randomBestMetrics.alliteration ?? 0,
      },
      timeMs: randomTimeMs,
      searchSpace,
    });

    process.stdout.write(
      pc.yellow(`${randomBestScore.toFixed(2)} (${randomTimeMs}ms)\n`),
    );
  }

  // Aggregate results
  const gaStats = aggregateResults(gaResults);
  const randomStats = aggregateResults(randomResults);

  // Draw comparison chart
  drawComparisonChart(gaResults, randomResults);

  // Print summary statistics
  console.log(pc.bold('\n═══ Summary Statistics ═══\n'));

  console.log(
    pc.dim('  ┌─────────────────────┬────────────────┬────────────────┐'),
  );
  console.log(
    pc.dim('  │ ') +
      pc.bold('Metric'.padEnd(19)) +
      pc.dim(' │ ') +
      pc.bold('GA'.padStart(14)) +
      pc.dim(' │ ') +
      pc.bold('Random'.padStart(14)) +
      pc.dim(' │'),
  );
  console.log(
    pc.dim('  ├─────────────────────┼────────────────┼────────────────┤'),
  );

  const rows = [
    [
      'Avg Best Score',
      gaStats.avgBestScore.toFixed(3),
      randomStats.avgBestScore.toFixed(3),
    ],
    [
      'Avg Top-5 Score',
      gaStats.avgTop5Score.toFixed(3),
      randomStats.avgTop5Score.toFixed(3),
    ],
    [
      'Min Best Score',
      gaStats.minBestScore.toFixed(3),
      randomStats.minBestScore.toFixed(3),
    ],
    [
      'Max Best Score',
      gaStats.maxBestScore.toFixed(3),
      randomStats.maxBestScore.toFixed(3),
    ],
    [
      'Std Dev',
      gaStats.stdDevBestScore.toFixed(3),
      randomStats.stdDevBestScore.toFixed(3),
    ],
    [
      'Avg Time (ms)',
      gaStats.avgTimeMs.toFixed(0),
      randomStats.avgTimeMs.toFixed(0),
    ],
  ];

  for (const [label, gaVal, randomVal] of rows) {
    console.log(
      pc.dim('  │ ') +
        label.padEnd(19) +
        pc.dim(' │ ') +
        pc.cyan(gaVal.padStart(14)) +
        pc.dim(' │ ') +
        pc.yellow(randomVal.padStart(14)) +
        pc.dim(' │'),
    );
  }

  console.log(
    pc.dim('  └─────────────────────┴────────────────┴────────────────┘'),
  );

  // Print detailed metrics comparison
  printMetricsTable(gaStats, randomStats);

  // Overall improvement
  const overallImprovement =
    ((gaStats.avgBestScore - randomStats.avgBestScore) /
      Math.abs(randomStats.avgBestScore)) *
    100;

  console.log(pc.bold('\n═══ Overall Results ═══\n'));
  console.log(
    `  ${pc.dim('GA avg best score:')}     ${pc.green(gaStats.avgBestScore.toFixed(3))}`,
  );
  console.log(
    `  ${pc.dim('Random avg best score:')} ${pc.yellow(randomStats.avgBestScore.toFixed(3))}`,
  );
  console.log(
    `  ${pc.dim('Overall improvement:')}   ${
      overallImprovement >= 0
        ? pc.green(pc.bold('+' + overallImprovement.toFixed(1) + '%'))
        : pc.red(pc.bold(overallImprovement.toFixed(1) + '%'))
    }`,
  );

  // Win rate
  const gaWins = gaResults.filter(
    (ga, i) => ga.bestScore > randomResults[i].bestScore,
  ).length;
  const winRate = (gaWins / ITERATIONS) * 100;
  console.log(
    `  ${pc.dim('GA win rate:')}           ${
      winRate >= 50
        ? pc.green(pc.bold(winRate.toFixed(0) + '%'))
        : pc.yellow(winRate.toFixed(0) + '%')
    } (${gaWins}/${ITERATIONS} iterations)`,
  );

  // Average search space explored
  const avgSearchSpace =
    gaResults.reduce((sum, r) => sum + r.searchSpace, 0) / gaResults.length;
  console.log(
    `  ${pc.dim('Avg search space:')}      ${pc.cyan(avgSearchSpace.toLocaleString() + ' combinations')}`,
  );

  console.log(pc.bold(pc.green('\n✨ Benchmark complete!\n')));
  process.exit(0);
}

main().catch((error) => {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
