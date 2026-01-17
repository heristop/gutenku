/**
 * Machine Learning Configuration
 *
 * Configuration for the self-supervised neural network
 * that learns haiku quality from GA selection outcomes.
 */

import type { HybridScoringConfig, TrainingConfig } from '@gutenku/shared';

// Re-export shared types for convenience
export type { HybridScoringConfig, TrainingConfig } from '@gutenku/shared';

/**
 * TensorFlow.js backend configuration
 */
export interface TensorFlowConfig {
  /** Use GPU acceleration if available */
  useGPU: boolean;
  /** Backend to use ('tensorflow' for CPU, 'tensorflow-gpu' for GPU) */
  backend: 'tensorflow' | 'tensorflow-gpu';
  /** Fallback to CPU if GPU unavailable */
  fallbackToCPU: boolean;
  /** Enable memory management optimizations */
  enableMemoryOptimization: boolean;
}

/**
 * Character embedding model architecture configuration
 */
export interface EmbeddingModelConfig {
  /** Character vocabulary size (ASCII + special) */
  vocabSize: number;
  /** Character embedding dimension */
  charEmbeddingDim: number;
  /** Final output embedding dimension */
  outputEmbeddingDim: number;
  /** Maximum characters per haiku */
  maxLength: number;
  /** Conv1D filter count */
  convFilters: number;
  /** Dense layer units before final embedding */
  denseUnits: number;
}

/**
 * Data collection configuration
 */
export interface DataCollectionConfig {
  /** Minimum samples before training can begin */
  minSamplesForTraining: number;
  /** Target samples per training batch */
  targetSamples: number;
  /** Generation threshold for "early elimination" */
  earlyEliminationThreshold: number;
  /** Elite percentile (top X% considered elite) */
  elitePercentile: number;
  /** Path to save collected data */
  dataPath: string;
}

/**
 * Model paths configuration
 */
export interface ModelPathsConfig {
  /** Directory for trained models */
  modelDir: string;
  /** Path to saved model weights */
  weightsPath: string;
  /** Path to model metadata */
  metadataPath: string;
  /** Path to survivor centroid */
  centroidPath: string;
}

/**
 * Complete ML configuration
 */
export interface MLConfig {
  tensorflow: TensorFlowConfig;
  embedding: EmbeddingModelConfig;
  training: TrainingConfig;
  scoring: HybridScoringConfig;
  dataCollection: DataCollectionConfig;
  paths: ModelPathsConfig;
}

/**
 * Default TensorFlow configuration
 */
export const DEFAULT_TENSORFLOW_CONFIG: TensorFlowConfig = {
  useGPU: process.env.ML_USE_GPU === 'true',
  backend: process.env.ML_USE_GPU === 'true' ? 'tensorflow-gpu' : 'tensorflow',
  fallbackToCPU: true,
  enableMemoryOptimization: true,
};

/**
 * Default embedding model configuration
 */
export const DEFAULT_EMBEDDING_CONFIG: EmbeddingModelConfig = {
  vocabSize: 128,
  charEmbeddingDim: 32,
  outputEmbeddingDim: 64,
  maxLength: 100,
  convFilters: 64,
  denseUnits: 128,
};

/**
 * Default training configuration
 */
export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  epochs: 50,
  batchSize: 32,
  learningRate: 0.001,
  margin: 0.5,
  tripletCount: 10000,
  minEpochs: 3,
  earlyStoppingThreshold: 99.5,
};

/**
 * Default hybrid scoring configuration
 */
export const DEFAULT_SCORING_CONFIG: HybridScoringConfig = {
  mode: 'rule-based',
  ruleWeight: 0.6,
  neuralWeight: 0.4,
};

/**
 * Default data collection configuration
 */
export const DEFAULT_DATA_COLLECTION_CONFIG: DataCollectionConfig = {
  minSamplesForTraining: 50,
  targetSamples: 5000,
  earlyEliminationThreshold: 10,
  elitePercentile: 20, // Top 20% marked as elite for more training data
  dataPath: 'data/evolution-samples.json',
};

/**
 * Default model paths configuration
 */
export const DEFAULT_MODEL_PATHS_CONFIG: ModelPathsConfig = {
  modelDir: 'models/haiku-embedding',
  weightsPath: 'models/haiku-embedding/model.json',
  metadataPath: 'models/haiku-embedding/metadata.json',
  centroidPath: 'models/haiku-embedding/centroid.json',
};

/**
 * Complete default ML configuration
 */
export const DEFAULT_ML_CONFIG: MLConfig = {
  tensorflow: DEFAULT_TENSORFLOW_CONFIG,
  embedding: DEFAULT_EMBEDDING_CONFIG,
  training: DEFAULT_TRAINING_CONFIG,
  scoring: DEFAULT_SCORING_CONFIG,
  dataCollection: DEFAULT_DATA_COLLECTION_CONFIG,
  paths: DEFAULT_MODEL_PATHS_CONFIG,
};

/**
 * Get ML configuration with environment overrides
 */
export function getMLConfig(): MLConfig {
  return {
    ...DEFAULT_ML_CONFIG,
    tensorflow: {
      ...DEFAULT_TENSORFLOW_CONFIG,
      useGPU: process.env.ML_USE_GPU === 'true',
      backend:
        process.env.ML_USE_GPU === 'true' ? 'tensorflow-gpu' : 'tensorflow',
    },
    scoring: {
      ...DEFAULT_SCORING_CONFIG,
      mode:
        (process.env.ML_SCORING_MODE as
          | 'rule-based'
          | 'neural'
          | 'hybrid'
          | undefined) || 'rule-based',
      ruleWeight: Number.parseFloat(process.env.ML_RULE_WEIGHT || '0.6'),
      neuralWeight: Number.parseFloat(process.env.ML_NEURAL_WEIGHT || '0.4'),
    },
  };
}
