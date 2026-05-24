#!/usr/bin/env node
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
} from '~/domain/services/genetic';
import { type HaikuQualityScore } from '~/shared/constants/validation';
import {
  type BenchmarkResult,
  aggregateResults,
  drawComparisonChart,
  extractVersePoolsFromContent,
  printMetricsTable,
  randomSampling,
} from '~/cli/ga-benchmark-helpers';

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

interface SeedHaiku {
  book: { reference: string; title: string; author: string };
  chapter: { title?: string; content: string };
  verses: string[];
  quality?: HaikuQualityScore;
}

const EMPTY_METRICS = {
  natureWords: 0,
  sentiment: 0.5,
  grammar: 0,
  markovFlow: 0,
  uniqueness: 0,
  alliteration: 0,
};

async function fetchSeedHaiku(): Promise<SeedHaiku | null> {
  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify({ query }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as {
    data?: { haiku?: SeedHaiku };
  };

  return data.data?.haiku ?? null;
}

function normalizeMetrics(
  metrics: Partial<typeof EMPTY_METRICS>,
): BenchmarkResult['metrics'] {
  return {
    natureWords: metrics.natureWords ?? 0,
    sentiment: metrics.sentiment ?? 0.5,
    grammar: metrics.grammar ?? 0,
    markovFlow: metrics.markovFlow ?? 0,
    uniqueness: metrics.uniqueness ?? 0,
    alliteration: metrics.alliteration ?? 0,
  };
}

async function runGa(
  iteration: number,
  seedHaiku: SeedHaiku,
  versePools: ReturnType<typeof extractVersePoolsFromContent>,
  searchSpace: number,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
): Promise<BenchmarkResult> {
  process.stdout.write(`            Running GA...       `);

  const gaStartTime = Date.now();
  const gaService = new GeneticAlgorithmService(
    naturalLanguage,
    markovEvaluator,
    { ...GA_CONFIG, seed: `benchmark-${iteration}` },
  );
  const gaEvolution = await gaService.evolve(versePools);
  const gaTimeMs = Date.now() - gaStartTime;

  const gaBestScore = gaEvolution.topCandidates[0]?.fitness ?? 0;
  const gaAvgTop5 =
    gaEvolution.topCandidates.reduce((sum, c) => sum + c.fitness, 0) /
    gaEvolution.topCandidates.length;
  const gaBestMetrics = gaEvolution.topCandidates[0]?.metrics ?? EMPTY_METRICS;

  process.stdout.write(pc.green(`${gaBestScore.toFixed(2)} (${gaTimeMs}ms)\n`));

  return {
    method: 'ga',
    iteration: iteration + 1,
    book: seedHaiku.book.title,
    bestScore: gaBestScore,
    avgTop5Score: gaAvgTop5,
    metrics: normalizeMetrics(gaBestMetrics),
    timeMs: gaTimeMs,
    searchSpace,
  };
}

function runRandom(
  iteration: number,
  seedHaiku: SeedHaiku,
  versePools: ReturnType<typeof extractVersePoolsFromContent>,
  searchSpace: number,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
): BenchmarkResult {
  process.stdout.write(`            Running Random...   `);

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
  const randomBestMetrics = randomHaikus[0]?.metrics ?? EMPTY_METRICS;

  process.stdout.write(
    pc.yellow(`${randomBestScore.toFixed(2)} (${randomTimeMs}ms)\n`),
  );

  return {
    method: 'random',
    iteration: iteration + 1,
    book: seedHaiku.book.title,
    bestScore: randomBestScore,
    avgTop5Score: randomAvgTop5,
    metrics: normalizeMetrics(randomBestMetrics),
    timeMs: randomTimeMs,
    searchSpace,
  };
}

async function runIteration(
  iteration: number,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
): Promise<{ ga: BenchmarkResult; random: BenchmarkResult } | null> {
  process.stdout.write(
    `  ${pc.cyan(`[${iteration + 1}/${ITERATIONS}]`)} Fetching chapter... `,
  );

  const seedHaiku = await fetchSeedHaiku();

  if (!seedHaiku) {
    console.log(pc.red('Failed to fetch haiku'));
    return null;
  }

  process.stdout.write(pc.green('OK\n'));

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

  const ga = await runGa(
    iteration,
    seedHaiku,
    versePools,
    searchSpace,
    naturalLanguage,
    markovEvaluator,
  );

  const random = runRandom(
    iteration,
    seedHaiku,
    versePools,
    searchSpace,
    naturalLanguage,
    markovEvaluator,
  );

  return { ga, random };
}

function printSummaryStatistics(
  gaStats: ReturnType<typeof aggregateResults>,
  randomStats: ReturnType<typeof aggregateResults>,
): void {
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
}

function printOverallResults(
  gaResults: BenchmarkResult[],
  randomResults: BenchmarkResult[],
  gaStats: ReturnType<typeof aggregateResults>,
  randomStats: ReturnType<typeof aggregateResults>,
): void {
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

  const avgSearchSpace =
    gaResults.reduce((sum, r) => sum + r.searchSpace, 0) / gaResults.length;
  console.log(
    `  ${pc.dim('Avg search space:')}      ${pc.cyan(avgSearchSpace.toLocaleString() + ' combinations')}`,
  );
}

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

  const naturalLanguage = container.resolve(NaturalLanguageService);
  const markovEvaluator = container.resolve(MarkovEvaluatorService);

  console.log(pc.dim('\nLoading Markov model...'));
  await markovEvaluator.load();

  const gaResults: BenchmarkResult[] = [];
  const randomResults: BenchmarkResult[] = [];

  console.log(pc.dim('\nRunning benchmark iterations...\n'));

  for (let i = 0; i < ITERATIONS; i++) {
    const iterationResult = await runIteration(
      i,
      naturalLanguage,
      markovEvaluator,
    );

    if (!iterationResult) {
      continue;
    }

    gaResults.push(iterationResult.ga);
    randomResults.push(iterationResult.random);
  }

  const gaStats = aggregateResults(gaResults);
  const randomStats = aggregateResults(randomResults);

  drawComparisonChart(gaResults, randomResults, ITERATIONS);
  printSummaryStatistics(gaStats, randomStats);
  printMetricsTable(gaStats, randomStats);
  printOverallResults(gaResults, randomResults, gaStats, randomStats);

  console.log(pc.bold(pc.green('\n✨ Benchmark complete!\n')));
  process.exit(0);
}

main().catch((error) => {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
