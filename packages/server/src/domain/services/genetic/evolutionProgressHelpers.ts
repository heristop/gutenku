import type {
  DecodedHaiku,
  EvolutionProgress,
  HaikuChromosome,
} from './types';
import { MAX_EVALUATIONS, MAX_EVOLUTION_TIME_MS } from './constants';
import type { PopulationManager } from './PopulationManager';
import type { FitnessEvaluator } from './FitnessEvaluator';
import type { ChromosomeFactory } from './ChromosomeFactory';

type Population = ReturnType<PopulationManager['initialize']>;

interface TerminationFlags {
  hasConverged: boolean;
  maxEvalsReached: boolean;
  timeLimitReached: boolean;
  isLastGeneration: boolean;
}

export interface TerminationState {
  isComplete: boolean;
  stopReason: EvolutionProgress['stopReason'];
  shouldUpdateConvergence: boolean;
}

export function computeTerminationState(
  populationManager: PopulationManager,
  fitnessEvaluator: FitnessEvaluator,
  population: Population,
  gen: number,
  startTime: number,
  maxGenerations: number,
): TerminationState {
  const flags: TerminationFlags = {
    hasConverged: populationManager.hasConverged(population),
    maxEvalsReached:
      fitnessEvaluator.getStats().evaluationCount >= MAX_EVALUATIONS,
    timeLimitReached: Date.now() - startTime >= MAX_EVOLUTION_TIME_MS,
    isLastGeneration: gen >= maxGenerations - 1,
  };

  const shouldUpdateConvergence =
    flags.hasConverged || flags.maxEvalsReached || flags.timeLimitReached;
  const isComplete = shouldUpdateConvergence || flags.isLastGeneration;
  const stopReason = resolveStopReason(flags);

  return { isComplete, stopReason, shouldUpdateConvergence };
}

function resolveStopReason(
  flags: TerminationFlags,
): EvolutionProgress['stopReason'] {
  if (flags.hasConverged) {
    return 'converged';
  }

  if (flags.maxEvalsReached) {
    return 'max_evaluations';
  }

  if (flags.timeLimitReached) {
    return 'time_limit';
  }

  if (flags.isLastGeneration) {
    return 'completed';
  }

  return undefined;
}

export function snapshotBestHaiku(
  populationManager: PopulationManager,
  chromosomeFactory: ChromosomeFactory,
  population: Population,
): DecodedHaiku {
  const best: HaikuChromosome = populationManager.getTopChromosomes(
    population,
    1,
  )[0];

  return {
    verses: chromosomeFactory.decode(best),
    metrics: best.metrics!,
    fitness: best.fitness,
    chromosomeId: best.id,
  };
}
