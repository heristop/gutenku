/**
 * Machine Learning Types for Haiku Quality Prediction
 *
 * This module defines types for the self-supervised neural network
 * that learns haiku quality from GA selection outcomes.
 */

/**
 * Sample collected during GA evolution for training
 */
export interface EvolutionSample {
  /** Unique identifier for this sample */
  id: string;
  /** Full haiku as single string */
  haikuText: string;
  /** Individual verses */
  verses: [string, string, string];
  /** Generation when this chromosome was created */
  generationBorn: number;
  /** Generation when eliminated (-1 if survivor) */
  generationDied: number;
  /** Final rank in population (1 = best) */
  finalRank: number;
  /** Whether this was in top 5% */
  wasElite: boolean;
  /** Fitness score at time of evaluation */
  fitness: number;
  /** Rule-based quality metrics */
  metrics: QualityMetricsSummary | null;
  /** Timestamp when collected */
  collectedAt: number;
}

/**
 * Complete quality metrics for storage (all 18 metrics)
 */
export interface QualityMetricsSummary {
  totalScore: number;
  natureWords: number;
  repeatedWords: number;
  weakStarts: number;
  blacklistedVerses: number;
  properNouns: number;
  verseLengthPenalty: number;
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
 * Training triplet for Siamese network
 */
export interface Triplet {
  /** Haiku from elite survivors */
  anchor: string;
  /** Another haiku from elite survivors */
  positive: string;
  /** Haiku eliminated in early generations */
  negative: string;
}

/**
 * Verse candidate with computed embedding
 */
export interface EnhancedVerseCandidate {
  /** Verse text */
  text: string;
  /** Validated syllable count */
  syllableCount: 5 | 7;
  /** Original quote index in chapter */
  sourceIndex: number;
  /** 64-dimensional embedding vector */
  embedding: number[];
  /** Pre-computed metrics */
  precomputedMetrics?: {
    sentiment: number;
    grammar: number;
    phonetics: number;
  };
}

/**
 * Scoring mode for fitness evaluation
 */
export type ScoringMode = 'rule-based' | 'neural' | 'hybrid';

/**
 * Configuration for hybrid scoring
 */
export interface HybridScoringConfig {
  /** Scoring mode to use */
  mode: ScoringMode;
  /** Weight for rule-based score (default: 0.6) */
  ruleWeight: number;
  /** Weight for neural score (default: 0.4) */
  neuralWeight: number;
}

/**
 * Training configuration for the embedding model
 */
export interface TrainingConfig {
  /** Number of training epochs */
  epochs: number;
  /** Batch size for training */
  batchSize: number;
  /** Learning rate */
  learningRate: number;
  /** Triplet loss margin */
  margin: number;
  /** Number of triplets to generate */
  tripletCount: number;
  /** Minimum epochs before early stopping can trigger (default: 3) */
  minEpochs?: number;
  /** Early stopping accuracy threshold in percent (default: 99.5) */
  earlyStoppingThreshold?: number;
}

/**
 * Model metadata saved with trained model
 */
export interface ModelMetadata {
  /** Model version */
  version: string;
  /** Training timestamp */
  trainedAt: number;
  /** Number of samples used */
  sampleCount: number;
  /** Number of triplets used */
  tripletCount: number;
  /** Training epochs completed */
  epochs: number;
  /** Final training loss */
  finalLoss: number;
  /** Vocabulary size used */
  vocabSize: number;
  /** Embedding dimension */
  embeddingDim: number;
  /** Maximum sequence length */
  maxLength: number;
}

/**
 * Evolution data export format
 */
export interface EvolutionDataset {
  /** Dataset version */
  version: string;
  /** Export timestamp */
  exportedAt: number;
  /** Total samples collected */
  totalSamples: number;
  /** Number of positive samples (elite) */
  positiveSamples: number;
  /** Number of negative samples (early eliminated) */
  negativeSamples: number;
  /** The samples */
  samples: EvolutionSample[];
}

/**
 * Survivor centroid for scoring
 */
export interface SurvivorCentroid {
  /** The centroid vector */
  vector: number[];
  /** Number of survivors used to compute */
  sampleCount: number;
  /** Average distance from centroid to survivors */
  averageDistance: number;
  /** Computed at timestamp */
  computedAt: number;
}
