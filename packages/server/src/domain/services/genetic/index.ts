// Main exports for genetic algorithm module
export { GeneticAlgorithmService } from './GeneticAlgorithmService';
export { ChromosomeFactory } from './ChromosomeFactory';
export { FitnessEvaluator } from './FitnessEvaluator';
export { PopulationManager } from './PopulationManager';

// Operators
export {
  SelectionOperator,
  CrossoverOperator,
  MutationOperator,
} from './operators';

// Utils
export { SeededRandom } from './utils';

// Types
export type {
  VersePools,
  VerseCandidate,
  HaikuChromosome,
  Population,
  PopulationStatistics,
  GenerationSnapshot,
  GAConfig,
  EvolutionResult,
  DecodedHaiku,
  QualityMetrics,
  CachedFitness,
} from './types';

// Constants
export {
  DEFAULT_GA_CONFIG,
  MIN_FIVE_SYLLABLE_POOL,
  MIN_SEVEN_SYLLABLE_POOL,
  GA_POOL_THRESHOLD,
  MAX_EVALUATIONS,
  MIN_DIVERSITY_THRESHOLD,
  MAX_EVOLUTION_TIME_MS,
} from './constants';
