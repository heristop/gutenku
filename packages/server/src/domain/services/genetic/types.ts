/**
 * Genetic Algorithm Types for Haiku Selection
 */

/**
 * Verse pools extracted from a book chapter
 */
export interface VersePools {
  fiveSyllable: VerseCandidate[];
  sevenSyllable: VerseCandidate[];
  bookId: string;
  chapterId: string;
}

/**
 * A single verse candidate with metadata
 */
export interface VerseCandidate {
  text: string;
  syllableCount: 5 | 7;
  sourceIndex: number;
  precomputedMetrics?: {
    sentiment: number;
    grammar: number;
    phonetics: number;
  };
}

/**
 * Chromosome representing a haiku
 * Genes are indices into verse pools
 */
export interface HaikuChromosome {
  id: string;
  genes: [number, number, number]; // [5-syl idx, 7-syl idx, 5-syl idx]
  fitness: number;
  metrics: QualityMetrics | null;
  generation: number;
  parentIds: [string, string] | null;
}

/**
 * Quality metrics for a haiku (matches existing validator output)
 */
export interface QualityMetrics {
  totalScore: number;
  natureWords: number;
  repeatedWords: number;
  weakStarts: number;
  blacklistedVerses: number;
  properNouns: number;
  sentiment: number;
  grammar: number;
  markovFlow: number;
  trigramFlow: number;
  uniqueness: number;
  alliteration: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
}

/**
 * Population state at a given generation
 */
export interface Population {
  chromosomes: HaikuChromosome[];
  generation: number;
  statistics: PopulationStatistics;
  history: GenerationSnapshot[];
}

/**
 * Statistics for a population
 */
export interface PopulationStatistics {
  bestFitness: number;
  worstFitness: number;
  averageFitness: number;
  medianFitness: number;
  standardDeviation: number;
  diversity: number;
  improvementRate: number;
}

/**
 * Snapshot for history tracking
 */
export interface GenerationSnapshot {
  generation: number;
  bestFitness: number;
  averageFitness: number;
  diversity: number;
  timestamp: number;
}

/**
 * GA configuration
 */
export interface GAConfig {
  // Population parameters
  populationSize: number;
  elitismCount: number;

  // Evolution parameters
  maxGenerations: number;
  convergenceThreshold: number;
  convergenceWindow: number;

  // Operator parameters
  selectionMethod: 'tournament' | 'roulette' | 'rank';
  tournamentSize: number;
  crossoverRate: number;
  crossoverMethod: 'single_point' | 'uniform';
  mutationRate: number;
  mutationMethod: 'random_reset' | 'swap';

  // Determinism
  seed?: string;

  // Performance
  cacheEvaluations: boolean;

  // Output
  returnCount: number;
  recordHistory: boolean;
}

/**
 * Result of GA evolution
 */
export interface EvolutionResult {
  topCandidates: DecodedHaiku[];
  finalPopulation: Population;
  convergenceGeneration: number;
  totalEvaluations: number;
  executionTimeMs: number;
}

/**
 * Progress update during evolution (for generators)
 */
export interface EvolutionProgress {
  generation: number;
  maxGenerations: number;
  bestHaiku: DecodedHaiku;
  bestFitness: number;
  averageFitness: number;
  diversity: number;
  isComplete: boolean;
  stopReason?: 'converged' | 'max_evaluations' | 'time_limit' | 'completed';
}

/**
 * Decoded haiku ready for GPT selection
 */
export interface DecodedHaiku {
  verses: [string, string, string];
  metrics: QualityMetrics;
  fitness: number;
  chromosomeId: string;
}

/**
 * Termination reason
 */
export interface TerminationReason {
  reason:
    | 'converged'
    | 'max_generations'
    | 'max_evaluations'
    | 'time_limit'
    | 'target_reached';
  details: Record<string, unknown>;
}

/**
 * Cached fitness result
 */
export interface CachedFitness {
  fitness: number;
  metrics: QualityMetrics;
}
