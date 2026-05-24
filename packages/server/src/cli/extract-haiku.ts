#!/usr/bin/env node
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import pc from 'picocolors';
import ora from 'ora';
import { program } from 'commander';
import { container } from 'tsyringe';
import '~/infrastructure/di/container';
import MongoConnection from '~/infrastructure/services/MongoConnection';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import HaikuRepository from '~/infrastructure/repositories/HaikuRepository';
import { EvolutionDataCollector } from '~/infrastructure/ml/EvolutionDataCollector';
import { capitalizeVerse } from '~/shared/helpers/HaikuHelper';
import type { HaikuValue } from '~/shared/types';
import { getMLConfig } from '~/config/ml';
import { displayQualityScores } from './extract-haiku-display';
import {
  type GAConfig,
  generateHaikuWithGA,
  generateSingleHaiku,
  prepareGenerator,
} from './extract-haiku-runners';

// Filter out standalone '--' from argv (pnpm passes it through)
const argv = process.argv.filter((arg) => arg !== '--');

program
  .name('extract-haiku')
  .description('Generate haikus and select the best by score')
  .option('-n, --iterations <number>', 'number of haikus to generate', '1')
  .option(
    '-m, --method <method>',
    'extraction method: punctuation, chunk, ga (genetic algorithm), or auto (default)',
    'auto',
  )
  .option('-p, --parallel <number>', 'parallel workers (default: 3)', '3')
  .option('--generations <number>', 'GA max generations (default: 50)', '50')
  .option('--population <number>', 'GA population size (default: 100)', '100')
  .option('--skip-markov', 'skip loading Markov model (saves memory)')
  .option('-r, --record', 'save best haiku to database for haiku of the day')
  .option(
    '--ttl <hours>',
    'TTL in hours for recorded haiku (default: 48 = 2 days)',
    '48',
  )
  .option(
    '--collect-training-data',
    'collect evolution data for ML training (GA mode only)',
  )
  .option(
    '--data-output <path>',
    'output path for training data',
    'data/evolution-samples.json',
  )
  .parse(argv);

const options = program.opts();
const iterations = Math.max(1, Number.parseInt(options.iterations, 10) || 1);
const parallelWorkers = Math.max(
  1,
  Math.min(10, Number.parseInt(options.parallel, 10) || 3),
);
const isGAMethod = ['ga', 'genetic_algorithm'].includes(options.method);
const extractionMethod = ['punctuation', 'chunk'].includes(options.method)
  ? (options.method as 'punctuation' | 'chunk')
  : null;
const gaConfig: GAConfig = {
  maxGenerations: Math.max(1, Number.parseInt(options.generations, 10) || 50),
  populationSize: Math.max(10, Number.parseInt(options.population, 10) || 100),
};
const collectTrainingData = options.collectTrainingData === true;
const dataOutputPath = options.dataOutput || 'data/evolution-samples.json';

function printHeader(): void {
  console.log(pc.bold('\n🎋 Haiku Extraction\n'));
  console.log(pc.dim(`Iterations: ${iterations}`));
  console.log(
    pc.dim(
      `Method: ${isGAMethod ? 'genetic_algorithm' : (extractionMethod ?? 'auto')}`,
    ),
  );

  if (isGAMethod) {
    console.log(pc.dim(`GA Generations: ${gaConfig.maxGenerations}`));
    console.log(pc.dim(`GA Population: ${gaConfig.populationSize}`));

    // Display ML settings
    const mlConfig = getMLConfig();
    console.log(pc.dim(`\nML Settings:`));
    console.log(pc.dim(`  Scoring mode:  ${pc.cyan(mlConfig.scoring.mode)}`));
    console.log(pc.dim(`  Rule weight:   ${mlConfig.scoring.ruleWeight}`));
    console.log(pc.dim(`  Neural weight: ${mlConfig.scoring.neuralWeight}`));
    console.log(pc.dim(`  GPU enabled:   ${mlConfig.tensorflow.useGPU}`));
  }

  if (!isGAMethod) {
    console.log(pc.dim(`Parallel workers: ${parallelWorkers}`));
  }
}

async function runGAMode(
  generator: HaikuGeneratorService,
  candidates: HaikuValue[],
  dataCollector: EvolutionDataCollector | undefined,
): Promise<void> {
  const spinner = ora('Starting GA evolution...').start();

  for (let i = 0; i < iterations; i++) {
    const result = await generateHaikuWithGA(
      generator,
      gaConfig,
      i,
      spinner,
      dataCollector,
    );

    if (result.haiku) {
      candidates.push(result.haiku);
    }
  }

  spinner.succeed(
    pc.green(`Generated ${candidates.length}/${iterations} haikus via GA`),
  );

  if (dataCollector && collectTrainingData) {
    const saveDataSpinner = ora('Saving training data...').start();
    await dataCollector.exportDataset(dataOutputPath);
    const stats = dataCollector.getStatistics();
    saveDataSpinner.succeed(
      pc.green(
        `Training data saved: ${pc.cyan(String(stats.total))} samples ` +
          `(${pc.green(String(stats.positives))} positive, ` +
          `${pc.red(String(stats.negatives))} negative)`,
      ),
    );
  }
}

async function runStandardMode(
  generator: HaikuGeneratorService,
  candidates: HaikuValue[],
): Promise<void> {
  let completed = 0;
  const spinner = ora(`Generating haikus (0/${iterations})...`).start();

  const generateBatch = async (batchIndices: number[]): Promise<void> => {
    const promises = batchIndices.map(() =>
      generateSingleHaiku(generator, extractionMethod),
    );
    const results = await Promise.all(promises);

    for (const result of results) {
      completed++;
      spinner.text = `Generating haikus (${completed}/${iterations})...`;

      if (result.haiku) {
        candidates.push(result.haiku);
      }
    }
  };

  const batches: number[][] = [];

  for (let i = 0; i < iterations; i += parallelWorkers) {
    const batch = [];

    for (let j = 0; j < parallelWorkers && i + j < iterations; j++) {
      batch.push(i + j);
    }
    batches.push(batch);
  }

  for (const batch of batches) {
    await generateBatch(batch);
  }

  spinner.succeed(
    pc.green(`Generated ${candidates.length}/${iterations} haikus`),
  );
}

function findBestHaiku(candidates: HaikuValue[]): {
  bestHaiku: HaikuValue;
  bestIndex: number;
} {
  let bestHaiku: HaikuValue = candidates[0];
  let bestScore = -Infinity;
  let bestIndex = 0;

  candidates.forEach((haiku, i) => {
    const score = haiku.quality?.totalScore ?? 0;

    if (score > bestScore) {
      bestScore = score;
      bestHaiku = haiku;
      bestIndex = i;
    }
  });

  return { bestHaiku, bestIndex };
}

function displayAllCandidates(
  candidates: HaikuValue[],
  bestIndex: number,
): void {
  if (iterations <= 1 || candidates.length <= 1) {
    return;
  }

  console.log(pc.bold(`\n═══ All Candidates (${candidates.length}) ═══\n`));

  candidates.forEach((haiku, i) => {
    const score = haiku.quality?.totalScore ?? 0;
    const isBest = i === bestIndex;
    const marker = isBest ? pc.green('★ BEST') : '';
    const indexStr = isBest
      ? pc.green(pc.bold(`#${i + 1}`))
      : pc.dim(`#${i + 1}`);
    const scoreStr = pc.magenta(`[score: ${score.toFixed(2)}]`);
    const bookInfo = pc.dim(`(${haiku.book.title})`);

    console.log(`${indexStr} ${marker} ${bookInfo} ${scoreStr}`);
    haiku.verses.forEach((verse) => {
      const displayVerse = capitalizeVerse(verse);
      const verseText = isBest
        ? pc.cyan(`  ${displayVerse}`)
        : pc.dim(`  ${displayVerse}`);
      console.log(verseText);
    });
    console.log();
  });
}

function displayBest(bestHaiku: HaikuValue): void {
  console.log(pc.bold('═══ Best Haiku ═══\n'));
  console.log(
    pc.cyan('  ' + bestHaiku.verses.map(capitalizeVerse).join('\n  ')),
  );
  console.log(pc.dim(`\n  — ${bestHaiku.book.title}`));
  console.log(pc.dim(`    by ${bestHaiku.book.author}`));

  console.log(pc.bold('\n═══ Details ═══\n'));
  console.log(
    `${pc.dim('Extraction:')}      ${pc.magenta(bestHaiku.extractionMethod || 'unknown')}`,
  );
  console.log(
    `${pc.dim('Execution time:')} ${pc.yellow(bestHaiku.executionTime + 's')}`,
  );

  displayQualityScores(bestHaiku);
}

async function recordHaikuIfRequested(bestHaiku: HaikuValue): Promise<void> {
  if (!options.record) {
    return;
  }

  const saveSpinner = ora('Saving haiku to database...').start();
  const repository = container.resolve(HaikuRepository);
  const ttlHours = Math.max(1, Number.parseInt(options.ttl, 10) || 48);
  const ttlMs = ttlHours * 60 * 60 * 1000;
  await repository.createCacheWithTTL(bestHaiku, ttlMs);
  saveSpinner.succeed(pc.green(`Haiku saved to database (TTL: ${ttlHours}h)`));
}

try {
  printHeader();

  // Connect to MongoDB
  const dbSpinner = ora('Connecting to MongoDB...').start();
  const mongoConnection = container.resolve(MongoConnection);
  const db = await mongoConnection.connect();

  if (!db) {
    dbSpinner.fail(pc.red('Failed to connect to MongoDB'));
    process.exit(1);
  }

  dbSpinner.succeed(pc.green('Connected to MongoDB'));

  const generator = container.resolve(HaikuGeneratorService);
  const markovEvaluator = container.resolve(MarkovEvaluatorService);
  const prepSpinner = ora('Preparing generator...').start();

  await prepareGenerator(
    generator,
    markovEvaluator,
    prepSpinner,
    options.skipMarkov,
  );

  const candidates: HaikuValue[] = [];

  // Create data collector if enabled
  const dataCollector = collectTrainingData
    ? new EvolutionDataCollector()
    : undefined;

  if (collectTrainingData) {
    console.log(pc.dim(`Training data collection: ${pc.cyan('enabled')}`));
    console.log(pc.dim(`Data output: ${pc.cyan(dataOutputPath)}`));
  }

  await (isGAMethod
    ? runGAMode(generator, candidates, dataCollector)
    : runStandardMode(generator, candidates));

  if (candidates.length === 0) {
    console.error(pc.red('\nNo haikus generated'));
    process.exit(1);
  }

  const { bestHaiku, bestIndex } = findBestHaiku(candidates);
  displayAllCandidates(candidates, bestIndex);
  displayBest(bestHaiku);
  await recordHaikuIfRequested(bestHaiku);

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
