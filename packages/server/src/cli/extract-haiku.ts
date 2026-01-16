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
import { GeneticAlgorithmService } from '~/domain/services/genetic/GeneticAlgorithmService';
import type { DecodedHaiku } from '~/domain/services/genetic/types';
import {
  cleanVerses,
  extractContextVerses,
  capitalizeVerse,
} from '~/shared/helpers/HaikuHelper';
import type { HaikuValue } from '~/shared/types';

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
const gaConfig = {
  maxGenerations: Math.max(1, Number.parseInt(options.generations, 10) || 50),
  populationSize: Math.max(10, Number.parseInt(options.population, 10) || 100),
};

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
  {
    label: 'Blacklisted:',
    getValue: (q) => colorByZero(q.blacklistedVerses ?? 0),
  },
  { label: 'Proper nouns:', getValue: (q) => colorByZero(q.properNouns ?? 0) },
  { label: 'Sentiment:', getValue: (q) => colorSentiment(q.sentiment ?? 0.5) },
  { label: 'Grammar:', getValue: (q) => colorByThreshold(q.grammar ?? 0, 0.5) },
  {
    label: 'Trigram flow:',
    getValue: (q) => colorByThreshold(q.trigramFlow ?? 0, 2),
  },
  {
    label: 'Markov flow:',
    getValue: (q) => colorByThreshold(q.markovFlow ?? 0, 2),
  },
  {
    label: 'Uniqueness:',
    getValue: (q) => colorByThreshold(q.uniqueness ?? 0, 0.7),
  },
  {
    label: 'Alliteration:',
    getValue: (q) => colorByThreshold(q.alliteration ?? 0, 0.3),
  },
  {
    label: 'Verse Distance:',
    getValue: (q) => pc.magenta((q.verseDistance ?? 0).toFixed(3)),
  },
  {
    label: 'Line Balance:',
    getValue: (q) => colorByThreshold(q.lineLengthBalance ?? 0, 0.5),
  },
  {
    label: 'Imagery:',
    getValue: (q) => colorByThreshold(q.imageryDensity ?? 0, 0.15),
  },
  {
    label: 'Coherence:',
    getValue: (q) => colorByThreshold(q.semanticCoherence ?? 0, 0.1),
  },
  {
    label: 'Verb Presence:',
    getValue: (q) => colorByThreshold(q.verbPresence ?? 0, 0.3),
  },
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

function convertGAResultToHaikuValue(
  decoded: DecodedHaiku,
  seedHaiku: HaikuValue,
  executionTime: number,
): HaikuValue {
  const cleaned = cleanVerses([...decoded.verses]) as [string, string, string];

  return {
    book: seedHaiku.book,
    chapter: seedHaiku.chapter,
    verses: cleaned,
    rawVerses: decoded.verses,
    quality: {
      totalScore: decoded.metrics.totalScore,
      natureWords: decoded.metrics.natureWords,
      repeatedWords: decoded.metrics.repeatedWords,
      weakStarts: decoded.metrics.weakStarts,
      blacklistedVerses: decoded.metrics.blacklistedVerses ?? 0,
      properNouns: decoded.metrics.properNouns ?? 0,
      verseLengthPenalty: decoded.metrics.verseLengthPenalty ?? 0,
      sentiment: decoded.metrics.sentiment,
      grammar: decoded.metrics.grammar,
      markovFlow: decoded.metrics.markovFlow,
      trigramFlow: decoded.metrics.trigramFlow,
      uniqueness: decoded.metrics.uniqueness,
      alliteration: decoded.metrics.alliteration,
      verseDistance: decoded.metrics.verseDistance,
      lineLengthBalance: decoded.metrics.lineLengthBalance,
      imageryDensity: decoded.metrics.imageryDensity,
      semanticCoherence: decoded.metrics.semanticCoherence,
      verbPresence: decoded.metrics.verbPresence,
    },
    cacheUsed: false,
    extractionMethod: 'genetic_algorithm',
    executionTime,
    context: extractContextVerses(
      [...decoded.verses],
      seedHaiku.chapter?.content ?? '',
    ),
  };
}

async function generateHaikuWithGA(
  generator: HaikuGeneratorService,
  config: { maxGenerations: number; populationSize: number },
  iterationIndex: number,
  spinner: ReturnType<typeof ora>,
): Promise<{ haiku: HaikuValue | null; error?: string }> {
  const startTime = Date.now();

  try {
    generator.configure({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme: 'random',
    });

    const seedHaiku = await generator.buildFromDb();

    if (!seedHaiku) {
      spinner.text = `Iteration ${iterationIndex + 1}: No seed haiku available`;

      return { haiku: null, error: 'No seed haiku available' };
    }

    if (!seedHaiku.chapter?.content) {
      spinner.text = `Iteration ${iterationIndex + 1}: No chapter content in seed`;

      return { haiku: null, error: 'No chapter content available' };
    }

    const versePools = generator.extractVersePoolsFromContent(
      seedHaiku.chapter.content,
      seedHaiku.book.reference,
      seedHaiku.chapter.title || 'unknown',
    );

    const poolInfo = `[5s: ${versePools.fiveSyllable.length}, 7s: ${versePools.sevenSyllable.length}]`;

    if (
      versePools.fiveSyllable.length < 10 ||
      versePools.sevenSyllable.length < 8
    ) {
      spinner.text = `Iteration ${iterationIndex + 1}: Pool too small ${poolInfo}, using fallback`;
    }

    const gaService = new GeneticAlgorithmService(
      generator.getNaturalLanguageService(),
      generator.getMarkovEvaluator(),
      {
        ...config,
        seed: `extract-${iterationIndex}-${Date.now()}`,
      },
    );

    let bestHaiku: HaikuValue | null = null;
    let bestFitness = -Infinity;

    for (const progress of gaService.evolveWithProgress(versePools)) {
      const genInfo = `Gen ${progress.generation}/${progress.maxGenerations}`;
      const fitnessInfo = `Best: ${progress.bestFitness.toFixed(2)}`;
      const avgInfo = `Avg: ${progress.averageFitness.toFixed(2)}`;

      spinner.text = `Iteration ${iterationIndex + 1}: ${genInfo} | ${fitnessInfo} | ${avgInfo}`;

      if (progress.bestFitness > bestFitness) {
        bestFitness = progress.bestFitness;
        const elapsed = (Date.now() - startTime) / 1000;
        bestHaiku = convertGAResultToHaikuValue(
          progress.bestHaiku,
          seedHaiku,
          elapsed,
        );
      }

      if (progress.stopReason) {
        spinner.text = `Iteration ${iterationIndex + 1}: ${progress.stopReason} at gen ${progress.generation}`;
      }
    }

    return { haiku: bestHaiku };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    spinner.text = `Iteration ${iterationIndex + 1}: Error - ${errorMsg}`;

    return { haiku: null, error: errorMsg };
  }
}

try {
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
  }

  if (!isGAMethod) {
    console.log(pc.dim(`Parallel workers: ${parallelWorkers}`));
  }

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

  if (options.skipMarkov) {
    generator.disableMarkovValidation();
    prepSpinner.succeed(
      pc.green('Generator ready (Markov validation skipped)'),
    );
  } else {
    await generator.prepare();

    if (markovEvaluator.isReady()) {
      prepSpinner.succeed(pc.green('Generator ready (Markov model loaded)'));
    } else {
      prepSpinner.warn(
        pc.yellow('Markov model not found - run ') +
          pc.cyan('pnpm train') +
          pc.yellow(' to generate it (validation disabled)'),
      );
    }
  }

  const candidates: HaikuValue[] = [];

  // GA mode: Sequential iterations, each on different chapter
  if (isGAMethod) {
    const spinner = ora('Starting GA evolution...').start();

    for (let i = 0; i < iterations; i++) {
      const result = await generateHaikuWithGA(generator, gaConfig, i, spinner);

      if (result.haiku) {
        candidates.push(result.haiku);
      }
    }

    spinner.succeed(
      pc.green(`Generated ${candidates.length}/${iterations} haikus via GA`),
    );
  }

  // Standard mode: Parallel batches with random sampling
  if (!isGAMethod) {
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
        const displayVerse = capitalizeVerse(verse);
        const verseText = isBest
          ? pc.cyan(`  ${displayVerse}`)
          : pc.dim(`  ${displayVerse}`);
        console.log(verseText);
      });
      console.log();
    });
  }

  // Display best haiku
  console.log(pc.bold('═══ Best Haiku ═══\n'));
  console.log(
    pc.cyan('  ' + bestHaiku!.verses.map(capitalizeVerse).join('\n  ')),
  );
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

  // Save to database if --record flag is set
  if (options.record) {
    const saveSpinner = ora('Saving haiku to database...').start();
    const repository = container.resolve(HaikuRepository);
    const ttlHours = Math.max(1, Number.parseInt(options.ttl, 10) || 48);
    const ttlMs = ttlHours * 60 * 60 * 1000;
    await repository.createCacheWithTTL(bestHaiku!, ttlMs);
    saveSpinner.succeed(
      pc.green(`Haiku saved to database (TTL: ${ttlHours}h)`),
    );
  }

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
