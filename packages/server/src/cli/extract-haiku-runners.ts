/**
 * Generator runners for extract-haiku CLI:
 * - prepareGenerator
 * - generateSingleHaiku (punctuation/chunk extraction)
 * - generateHaikuWithGA (genetic algorithm)
 * - GA -> HaikuValue conversion
 */
import pc from 'picocolors';
import type ora from 'ora';
import type HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import type { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import { GeneticAlgorithmService } from '~/domain/services/genetic/GeneticAlgorithmService';
import type {
  DecodedHaiku,
  EvolutionProgress,
} from '~/domain/services/genetic/types';
import type { EvolutionDataCollector } from '~/infrastructure/ml/EvolutionDataCollector';
import {
  cleanVerses,
  extractContextVerses,
} from '~/shared/helpers/HaikuHelper';
import type { HaikuValue } from '~/shared/types';

export interface GAConfig {
  maxGenerations: number;
  populationSize: number;
}

export interface RunResult {
  haiku: HaikuValue | null;
  error?: string;
}

export async function prepareGenerator(
  generator: HaikuGeneratorService,
  markovEvaluator: MarkovEvaluatorService,
  spinner: ReturnType<typeof ora>,
  skipMarkov: boolean,
): Promise<void> {
  if (skipMarkov) {
    generator.disableMarkovValidation();
    spinner.succeed(pc.green('Generator ready (Markov validation skipped)'));

    return;
  }

  await generator.prepare();

  if (markovEvaluator.isReady()) {
    spinner.succeed(pc.green('Generator ready (Markov model loaded)'));

    return;
  }

  spinner.warn(
    pc.yellow('Markov model not found - run ') +
      pc.cyan('pnpm mc:train') +
      pc.yellow(' to generate it (validation disabled)'),
  );
}

export async function generateSingleHaiku(
  generator: HaikuGeneratorService,
  method: 'punctuation' | 'chunk' | null,
): Promise<RunResult> {
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

export function convertGAResultToHaikuValue(
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

interface SeedContext {
  seedHaiku: HaikuValue;
  versePools: ReturnType<HaikuGeneratorService['extractVersePoolsFromContent']>;
}

async function loadSeedContext(
  generator: HaikuGeneratorService,
  iterationIndex: number,
  spinner: ReturnType<typeof ora>,
): Promise<SeedContext | RunResult> {
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

  return { seedHaiku, versePools };
}

function updateSpinnerForProgress(
  spinner: ReturnType<typeof ora>,
  iterationIndex: number,
  progress: EvolutionProgress,
): void {
  const genInfo = `Gen ${progress.generation}/${progress.maxGenerations}`;
  const fitnessInfo = `Best: ${progress.bestFitness.toFixed(2)}`;
  const avgInfo = `Avg: ${progress.averageFitness.toFixed(2)}`;

  spinner.text = `Iteration ${iterationIndex + 1}: ${genInfo} | ${fitnessInfo} | ${avgInfo}`;

  if (progress.stopReason) {
    spinner.text = `Iteration ${iterationIndex + 1}: ${progress.stopReason} at gen ${progress.generation}`;
  }
}

async function runGAEvolution(
  generator: HaikuGeneratorService,
  ctx: SeedContext,
  config: GAConfig,
  iterationIndex: number,
  spinner: ReturnType<typeof ora>,
  startTime: number,
  dataCollector?: EvolutionDataCollector,
): Promise<HaikuValue | null> {
  const gaService = new GeneticAlgorithmService(
    generator.getNaturalLanguageService(),
    generator.getMarkovEvaluator(),
    {
      ...config,
      seed: `extract-${iterationIndex}-${Date.now()}`,
    },
  );

  if (dataCollector) {
    gaService.setDataCollector(dataCollector);
  }

  let bestHaiku: HaikuValue | null = null;
  let bestFitness = -Infinity;

  for (const progress of gaService.evolveWithProgress(ctx.versePools)) {
    updateSpinnerForProgress(spinner, iterationIndex, progress);

    if (progress.bestFitness > bestFitness) {
      bestFitness = progress.bestFitness;
      const elapsed = (Date.now() - startTime) / 1000;
      bestHaiku = convertGAResultToHaikuValue(
        progress.bestHaiku,
        ctx.seedHaiku,
        elapsed,
      );
    }
  }

  return bestHaiku;
}

export async function generateHaikuWithGA(
  generator: HaikuGeneratorService,
  config: GAConfig,
  iterationIndex: number,
  spinner: ReturnType<typeof ora>,
  dataCollector?: EvolutionDataCollector,
): Promise<RunResult> {
  const startTime = Date.now();

  try {
    const ctxOrError = await loadSeedContext(
      generator,
      iterationIndex,
      spinner,
    );

    if (!('seedHaiku' in ctxOrError)) {
      return ctxOrError;
    }

    const bestHaiku = await runGAEvolution(
      generator,
      ctxOrError,
      config,
      iterationIndex,
      spinner,
      startTime,
      dataCollector,
    );

    return { haiku: bestHaiku };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    spinner.text = `Iteration ${iterationIndex + 1}: Error - ${errorMsg}`;

    return { haiku: null, error: errorMsg };
  }
}
