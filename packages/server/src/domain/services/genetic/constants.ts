import type { GAConfig } from './types';

/**
 * Default GA configuration
 */
export const DEFAULT_GA_CONFIG: GAConfig = {
  // Population
  populationSize: 150,
  elitismCount: 6,

  // Evolution - 500 generations for training runs
  maxGenerations: 500,
  convergenceThreshold: 0.005, // 0.5% improvement threshold (very strict)
  convergenceWindow: 30, // Check convergence over 30 generations

  // Operators
  selectionMethod: 'tournament',
  tournamentSize: 7,
  crossoverRate: 0.9,
  crossoverMethod: 'single_point',
  mutationRate: 0.12, // Balanced mutation rate
  mutationMethod: 'random_reset',

  // Performance
  cacheEvaluations: true,

  // Output
  returnCount: 5,
  recordHistory: true,
};

// Minimum viable pool sizes for GA to be effective
export const MIN_FIVE_SYLLABLE_POOL = 5;
export const MIN_SEVEN_SYLLABLE_POOL = 4;

// Fallback to random sampling if pools are too small
export const GA_POOL_THRESHOLD = 10;

// Maximum fitness evaluations before forced termination
export const MAX_EVALUATIONS = 50000;

// Diversity threshold for population restart
export const MIN_DIVERSITY_THRESHOLD = 0.08;

// Maximum time for evolution (ms)
export const MAX_EVOLUTION_TIME_MS = 30000; // 30 seconds
