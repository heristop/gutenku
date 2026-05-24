#!/usr/bin/env node
import 'reflect-metadata';
import dotenv from 'dotenv';
import pc from 'picocolors';
import fetch from 'node-fetch';
import { program } from 'commander';
import { container } from 'tsyringe';
import * as fs from 'node:fs';
import * as path from 'node:path';
import logUpdate from 'log-update';

dotenv.config();

import NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import {
  ChromosomeFactory,
  FitnessEvaluator,
  PopulationManager,
  SelectionOperator,
  CrossoverOperator,
  MutationOperator,
  SeededRandom,
  DEFAULT_GA_CONFIG,
  type GAConfig,
  type EvolutionResult,
  type DecodedHaiku,
  type VersePools,
  type VerseCandidate,
} from '~/domain/services/genetic';
import { syllable } from 'syllable';
import {
  displayHaikuCandidate,
  drawFinalChart,
  renderFrame,
} from '~/cli/ga-evolution-ui';

program
  .name('ga-evolution')
  .description('Run Genetic Algorithm evolution with live animation')
  .option('-p, --population <number>', 'population size', '150')
  .option('-g, --generations <number>', 'max generations', '500')
  .option('-c, --crossover <number>', 'crossover rate', '0.9')
  .option('-m, --mutation <number>', 'mutation rate', '0.12')
  .option('-s, --seed <string>', 'random seed for reproducibility')
  .option('--no-animation', 'disable live animation')
  .option('--no-early-stop', 'disable early convergence (run all generations)')
  .option('--delay <number>', 'animation delay in ms', '50')
  .option('--snapshot', 'save snapshots to file')
  .option('--snapshot-dir <dir>', 'snapshot output directory', './snapshots')
  .parse();

const options = program.opts();

const gaConfig: GAConfig = {
  ...DEFAULT_GA_CONFIG,
  populationSize: Math.max(10, Number.parseInt(options.population, 10) || 150),
  maxGenerations: Math.max(5, Number.parseInt(options.generations, 10) || 500),
  crossoverRate: Math.max(
    0,
    Math.min(1, Number.parseFloat(options.crossover) || 0.9),
  ),
  mutationRate: Math.max(
    0,
    Math.min(1, Number.parseFloat(options.mutation) || 0.12),
  ),
  seed: options.seed,
  recordHistory: true,
  returnCount: 5,
};

const ANIMATION_DELAY = Math.max(10, Number.parseInt(options.delay, 10) || 50);
const SHOW_ANIMATION = options.animation !== false;
const DISABLE_EARLY_STOP = options.earlyStop === false;
const SAVE_SNAPSHOTS = options.snapshot === true;
const SNAPSHOT_DIR = options.snapshotDir || './snapshots';

// GraphQL query
const query = `
  query Query {
    haiku(useAI: false, useCache: false, appendImg: false) {
      book { reference, title, author }
      chapter { title, content }
      verses
      quality { totalScore }
    }
  }
`;

// ============================================================================
// SNAPSHOT
// ============================================================================

interface Snapshot {
  generation: number;
  timestamp: number;
  stats: {
    bestFitness: number;
    averageFitness: number;
    worstFitness: number;
    diversity: number;
  };
  bestHaiku: string[] | null;
  fitnessHistory: number[];
  avgHistory: number[];
}

function saveSnapshot(snapshot: Snapshot, dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = path.join(
    dir,
    `gen_${String(snapshot.generation).padStart(4, '0')}.json`,
  );
  fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2));
}

// ============================================================================
// VERSE EXTRACTION
// ============================================================================

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

    const count = words.reduce((c, w) => c + syllable(w), 0);

    if (count === 5) {
      fiveSyllable.push({ text: sentence, syllableCount: 5, sourceIndex: i });
      continue;
    }

    if (count === 7) {
      sevenSyllable.push({ text: sentence, syllableCount: 7, sourceIndex: i });
    }
  }

  return { fiveSyllable, sevenSyllable, bookId, chapterId };
}

// ============================================================================
// EVOLUTION
// ============================================================================

const sleep = (ms: number) =>
  new Promise<void>((r) => {
    setTimeout(r, ms);
  });

async function runAnimatedEvolution(
  versePools: VersePools,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
  bookTitle: string,
): Promise<EvolutionResult> {
  const startTime = Date.now();

  // Initialize GA components
  const rng = new SeededRandom(gaConfig.seed);
  const chromosomeFactory = new ChromosomeFactory(versePools, rng);
  const fitnessEvaluator = new FitnessEvaluator(
    chromosomeFactory,
    naturalLanguage,
    markovEvaluator,
    gaConfig.cacheEvaluations,
  );
  const selectionOperator = new SelectionOperator(gaConfig, rng);
  const crossoverOperator = new CrossoverOperator(
    gaConfig,
    rng,
    chromosomeFactory,
  );
  const mutationOperator = new MutationOperator(gaConfig, rng, versePools);
  const populationManager = new PopulationManager(
    gaConfig,
    chromosomeFactory,
    fitnessEvaluator,
    selectionOperator,
    crossoverOperator,
    mutationOperator,
  );

  let population = populationManager.initialize();
  let convergenceGeneration = gaConfig.maxGenerations;

  const fitnessHistory: number[] = [population.statistics.bestFitness];
  const avgHistory: number[] = [population.statistics.averageFitness];

  // Evolution loop
  for (let gen = 0; gen <= gaConfig.maxGenerations; gen++) {
    const topChromosomes = populationManager.getTopChromosomes(population, 1);
    const bestVerses =
      topChromosomes.length > 0
        ? chromosomeFactory.decode(topChromosomes[0])
        : null;

    // Save snapshot
    if (SAVE_SNAPSHOTS) {
      saveSnapshot(
        {
          generation: gen,
          timestamp: Date.now(),
          stats: { ...population.statistics },
          bestHaiku: bestVerses,
          fitnessHistory: [...fitnessHistory],
          avgHistory: [...avgHistory],
        },
        SNAPSHOT_DIR,
      );
    }

    // Render frame
    if (SHOW_ANIMATION) {
      const frame = renderFrame({
        generation: gen,
        maxGenerations: gaConfig.maxGenerations,
        stats: population.statistics,
        bestHaiku: bestVerses,
        fitnessHistory,
        avgHistory,
        bookTitle,
        elapsedMs: Date.now() - startTime,
      });
      logUpdate(frame);
      await sleep(ANIMATION_DELAY);
    }

    // Check termination (skip convergence check if --no-early-stop)
    const hasConverged =
      !DISABLE_EARLY_STOP && populationManager.hasConverged(population);

    if (gen >= gaConfig.maxGenerations || hasConverged) {
      convergenceGeneration = gen;
      break;
    }

    // Evolve
    population = populationManager.evolve(population);
    fitnessHistory.push(population.statistics.bestFitness);
    avgHistory.push(population.statistics.averageFitness);
  }

  // Persist final frame
  if (SHOW_ANIMATION) {
    logUpdate.done();
  }

  // Extract results
  const topChromosomes = populationManager.getTopChromosomes(
    population,
    gaConfig.returnCount,
  );
  const topCandidates: DecodedHaiku[] = topChromosomes.map((c) => ({
    verses: chromosomeFactory.decode(c),
    metrics: c.metrics!,
    fitness: c.fitness,
    chromosomeId: c.id,
  }));

  return {
    topCandidates,
    finalPopulation: population,
    convergenceGeneration,
    totalEvaluations: fitnessEvaluator.getStats().evaluationCount,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// MAIN
// ============================================================================

function printConfiguration(): void {
  console.log(pc.bold('\n🧬 Genetic Algorithm Evolution Visualizer\n'));
  console.log(pc.dim('Configuration:'));
  console.log(
    `  ${pc.dim('Population:')}    ${pc.cyan(String(gaConfig.populationSize))}`,
  );
  console.log(
    `  ${pc.dim('Generations:')}   ${pc.cyan(String(gaConfig.maxGenerations))}`,
  );
  console.log(
    `  ${pc.dim('Crossover:')}     ${pc.cyan(String(gaConfig.crossoverRate))}`,
  );
  console.log(
    `  ${pc.dim('Mutation:')}      ${pc.cyan(String(gaConfig.mutationRate))}`,
  );
  console.log(
    `  ${pc.dim('Animation:')}     ${pc.cyan(SHOW_ANIMATION ? 'enabled' : 'disabled')}`,
  );
  console.log(
    `  ${pc.dim('Early stop:')}    ${pc.cyan(DISABLE_EARLY_STOP ? 'disabled' : 'enabled')}`,
  );
  console.log(
    `  ${pc.dim('Snapshots:')}     ${pc.cyan(SAVE_SNAPSHOTS ? SNAPSHOT_DIR : 'disabled')}`,
  );

  if (gaConfig.seed) {
    console.log(`  ${pc.dim('Seed:')}          ${pc.cyan(gaConfig.seed)}`);
  }
}

function printResults(result: EvolutionResult, seedScore: number): void {
  console.log(
    pc.green(
      `\n✓ Evolution completed in ${(result.executionTimeMs / 1000).toFixed(2)}s`,
    ),
  );

  if (SAVE_SNAPSHOTS) {
    console.log(pc.dim(`  Snapshots saved to: ${SNAPSHOT_DIR}/`));
  }

  const stats = result.finalPopulation.statistics;
  console.log(pc.bold('\n═══ Final Statistics ═══\n'));
  console.log(
    `  ${pc.dim('Total generations:')}    ${pc.cyan(String(result.finalPopulation.generation))}`,
  );
  console.log(
    `  ${pc.dim('Convergence at:')}       ${pc.cyan(String(result.convergenceGeneration))}`,
  );
  console.log(
    `  ${pc.dim('Total evaluations:')}    ${pc.cyan(String(result.totalEvaluations))}`,
  );
  console.log(
    `  ${pc.dim('Best fitness:')}         ${pc.green(stats.bestFitness.toFixed(3))}`,
  );
  console.log(
    `  ${pc.dim('Average fitness:')}      ${pc.yellow(stats.averageFitness.toFixed(3))}`,
  );
  console.log(
    `  ${pc.dim('Diversity:')}            ${pc.cyan((stats.diversity * 100).toFixed(1) + '%')}`,
  );

  if (result.finalPopulation.history.length > 0) {
    console.log(pc.bold('\n═══ Fitness Evolution Chart ═══'));
    drawFinalChart(result.finalPopulation.history);
  }

  console.log(pc.bold('\n═══ Top Evolved Haikus ═══'));
  result.topCandidates.forEach((c, i) => displayHaikuCandidate(c, i, i === 0));

  console.log(pc.bold('\n═══ Comparison with Random ═══\n'));
  const gaBest = result.topCandidates[0]?.fitness ?? 0;
  const improvement =
    seedScore !== 0 ? ((gaBest - seedScore) / Math.abs(seedScore)) * 100 : 0;
  console.log(
    `  ${pc.dim('Random score:')}  ${pc.yellow(seedScore.toFixed(2))}`,
  );
  console.log(`  ${pc.dim('GA best:')}       ${pc.green(gaBest.toFixed(2))}`);
  console.log(
    `  ${pc.dim('Improvement:')}   ${improvement >= 0 ? pc.green('+' + improvement.toFixed(1) + '%') : pc.red(improvement.toFixed(1) + '%')}`,
  );
  console.log(pc.bold(pc.green('\n✨ Done!\n')));
}

async function main(): Promise<void> {
  printConfiguration();

  console.log(pc.dim('\nFetching chapter content...'));

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
        quality?: { totalScore: number };
      };
    };
  };

  if (!data.data?.haiku) {
    console.error(pc.red('\nFailed to fetch haiku'));
    process.exit(1);
  }

  const seedHaiku = data.data.haiku;
  console.log(pc.green(`\nBook: ${seedHaiku.book.title}`));
  console.log(pc.dim(`by ${seedHaiku.book.author}`));

  const naturalLanguage = container.resolve(NaturalLanguageService);
  const markovEvaluator = container.resolve(MarkovEvaluatorService);

  console.log(pc.dim('\nLoading Markov model...'));
  await markovEvaluator.load();

  console.log(pc.dim('Extracting verse pools...'));
  const versePools = extractVersePoolsFromContent(
    seedHaiku.chapter.content,
    seedHaiku.book.reference,
    seedHaiku.chapter.title || 'unknown',
    naturalLanguage,
  );

  console.log(
    `  ${pc.dim('5-syllable:')} ${pc.cyan(String(versePools.fiveSyllable.length))}`,
  );
  console.log(
    `  ${pc.dim('7-syllable:')} ${pc.cyan(String(versePools.sevenSyllable.length))}`,
  );

  const space =
    versePools.fiveSyllable.length *
    versePools.sevenSyllable.length *
    Math.max(1, versePools.fiveSyllable.length - 1);
  console.log(
    `  ${pc.dim('Search space:')} ${pc.magenta(space.toLocaleString())}`,
  );

  console.log(pc.bold('\n═══ Running Evolution ═══\n'));

  const result = await runAnimatedEvolution(
    versePools,
    naturalLanguage,
    markovEvaluator,
    seedHaiku.book.title,
  );

  printResults(result, seedHaiku.quality?.totalScore ?? 0);
  process.exit(0);
}

main().catch((error) => {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
