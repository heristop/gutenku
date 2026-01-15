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
import type { HaikuValue } from '~/shared/types';

program
  .name('extract-haiku')
  .description('Generate haikus and select the best by score')
  .option('-n, --iterations <number>', 'number of haikus to generate', '1')
  .option(
    '-m, --method <method>',
    'extraction method: punctuation, chunk, or auto (default)',
    'auto',
  )
  .option('-p, --parallel <number>', 'parallel workers (default: 3)', '3')
  .parse();

const options = program.opts();
const iterations = Math.max(1, Number.parseInt(options.iterations, 10) || 1);
const parallelWorkers = Math.max(1, Math.min(10, Number.parseInt(options.parallel, 10) || 3));
const extractionMethod = ['punctuation', 'chunk'].includes(options.method)
  ? (options.method as 'punctuation' | 'chunk')
  : null;

// Quality score display functions
function colorByThreshold(value: number, threshold: number): string {
  return value >= threshold
    ? pc.green(value.toFixed(3))
    : pc.yellow(value.toFixed(3));
}

function colorByZero(value: number): string {
  return value > 0 ? pc.red(String(value)) : pc.green('0');
}

function colorSentiment(value: number): string {
  if (value > 0.6) {
    return pc.green(value.toFixed(3));
  }

  if (value < 0.4) {
    return pc.red(value.toFixed(3));
  }

  return pc.yellow(value.toFixed(3));
}

interface ScoreDisplay {
  label: string;
  getValue: (q: NonNullable<HaikuValue['quality']>) => string;
}

const scoreDisplays: ScoreDisplay[] = [
  { label: 'Nature words:', getValue: (q) => pc.green(String(q.natureWords)) },
  { label: 'Repeated words:', getValue: (q) => colorByZero(q.repeatedWords) },
  { label: 'Weak starts:', getValue: (q) => colorByZero(q.weakStarts) },
  { label: 'Blacklisted:', getValue: (q) => colorByZero(q.blacklistedVerses ?? 0) },
  { label: 'Proper nouns:', getValue: (q) => colorByZero(q.properNouns ?? 0) },
  { label: 'Sentiment:', getValue: (q) => colorSentiment(q.sentiment ?? 0.5) },
  { label: 'Grammar:', getValue: (q) => colorByThreshold(q.grammar ?? 0, 0.5) },
  { label: 'Trigram flow:', getValue: (q) => colorByThreshold(q.trigramFlow ?? 0, 2) },
  { label: 'Markov flow:', getValue: (q) => colorByThreshold(q.markovFlow ?? 0, 2) },
  { label: 'Uniqueness:', getValue: (q) => colorByThreshold(q.uniqueness ?? 0, 0.7) },
  { label: 'Alliteration:', getValue: (q) => colorByThreshold(q.alliteration ?? 0, 0.3) },
  { label: 'Verse Distance:', getValue: (q) => pc.magenta((q.verseDistance ?? 0).toFixed(3)) },
  { label: 'Line Balance:', getValue: (q) => colorByThreshold(q.lineLengthBalance ?? 0, 0.5) },
  { label: 'Imagery:', getValue: (q) => colorByThreshold(q.imageryDensity ?? 0, 0.15) },
  { label: 'Coherence:', getValue: (q) => colorByThreshold(q.semanticCoherence ?? 0, 0.1) },
  { label: 'Verb Presence:', getValue: (q) => colorByThreshold(q.verbPresence ?? 0, 0.3) },
];

function displayQualityScores(haiku: HaikuValue): void {
  if (!haiku.quality) {
    return;
  }

  const q = haiku.quality;

  console.log(pc.bold('\n═══ Quality Scores ═══\n'));

  for (const { label, getValue } of scoreDisplays) {
    console.log(`${pc.dim(label.padEnd(17))} ${getValue(q)}`);
  }

  const totalColor = q.totalScore >= 0 ? pc.green : pc.red;
  console.log(
    `\n${pc.dim('Total score:')}      ${pc.bold(totalColor(q.totalScore.toFixed(2)))}`,
  );
}

async function generateSingleHaiku(
  generator: HaikuGeneratorService,
  method: 'punctuation' | 'chunk' | null,
): Promise<{ haiku: HaikuValue | null; error?: string }> {
  try {
    generator.configure({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme: 'random',
    });

    if (method) {
      generator.setExtractionMethod(method);
    }

    const haiku = await generator.generate();

    return { haiku };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    return { haiku: null, error: errorMsg };
  }
}

try {
  console.log(pc.bold('\n🎋 Haiku Extraction\n'));
  console.log(pc.dim(`Iterations: ${iterations}`));
  console.log(pc.dim(`Method: ${extractionMethod ?? 'auto'}`));
  console.log(pc.dim(`Parallel workers: ${parallelWorkers}`));

  // Connect to MongoDB
  const dbSpinner = ora('Connecting to MongoDB...').start();
  const mongoConnection = container.resolve(MongoConnection);
  const db = await mongoConnection.connect();

  if (!db) {
    dbSpinner.fail(pc.red('Failed to connect to MongoDB'));
    process.exit(1);
  }

  dbSpinner.succeed(pc.green('Connected to MongoDB'));

  // Get generator service and prepare once (loads Markov model if available)
  const generator = container.resolve(HaikuGeneratorService);
  const markovEvaluator = container.resolve(MarkovEvaluatorService);
  const prepSpinner = ora('Preparing generator...').start();

  await generator.prepare();

  if (markovEvaluator.isReady()) {
    prepSpinner.succeed(pc.green('Generator ready (Markov model loaded)'));
  }

  if (!markovEvaluator.isReady()) {
    prepSpinner.warn(
      pc.yellow('Markov model not found - run ') +
        pc.cyan('pnpm train') +
        pc.yellow(' to generate it (validation disabled)'),
    );
  }

  const candidates: HaikuValue[] = [];
  let completed = 0;

  // Generate haikus in parallel batches
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

  // Process in parallel batches
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

  spinner.succeed(pc.green(`Generated ${candidates.length}/${iterations} haikus`));

  if (candidates.length === 0) {
    console.error(pc.red('\nNo haikus generated'));
    process.exit(1);
  }

  // Find best haiku
  let bestHaiku: HaikuValue | null = null;
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

  // Show all candidates if multiple iterations
  if (iterations > 1 && candidates.length > 1) {
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
        const verseText = isBest ? pc.cyan(`  ${verse}`) : pc.dim(`  ${verse}`);
        console.log(verseText);
      });
      console.log();
    });
  }

  // Display best haiku
  console.log(pc.bold('═══ Best Haiku ═══\n'));
  console.log(pc.cyan('  ' + bestHaiku!.verses.join('\n  ')));
  console.log(pc.dim(`\n  — ${bestHaiku!.book.title}`));
  console.log(pc.dim(`    by ${bestHaiku!.book.author}`));

  // Details
  console.log(pc.bold('\n═══ Details ═══\n'));
  console.log(
    `${pc.dim('Extraction:')}      ${pc.magenta(bestHaiku!.extractionMethod || 'unknown')}`,
  );
  console.log(
    `${pc.dim('Execution time:')} ${pc.yellow(bestHaiku!.executionTime + 's')}`,
  );

  // Quality scores for best haiku
  displayQualityScores(bestHaiku!);

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
