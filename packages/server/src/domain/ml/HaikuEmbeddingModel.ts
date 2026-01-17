/**
 * Character-Level Haiku Embedding Model
 *
 * A neural network that converts haiku text into dense vector representations
 * using character-level embeddings and multi-scale convolutions.
 *
 * Architecture:
 * - Character embedding layer (vocab=128, dim=32)
 * - Parallel Conv1D layers (kernel=3 and kernel=5 for multi-scale patterns)
 * - Global max pooling
 * - Dense layers (128 -> 64)
 * - Output: 64-dimensional embedding vector
 */

import * as tf from '@tensorflow/tfjs';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  DEFAULT_EMBEDDING_CONFIG,
  type EmbeddingModelConfig,
} from '../../config/ml';

/**
 * Character-level embedding model for haiku quality prediction
 */
export class HaikuEmbeddingModel {
  private model: tf.LayersModel | null = null;
  private charToIndex: Map<string, number>;
  private config: EmbeddingModelConfig;
  private isBuilt = false;

  constructor(config: Partial<EmbeddingModelConfig> = {}) {
    this.config = { ...DEFAULT_EMBEDDING_CONFIG, ...config };
    this.charToIndex = this.buildCharacterVocabulary();
  }

  /**
   * Build the character vocabulary mapping
   */
  private buildCharacterVocabulary(): Map<string, number> {
    const vocab = new Map<string, number>();

    // Index 0 reserved for padding
    vocab.set('<PAD>', 0);

    // Index 1 for unknown characters
    vocab.set('<UNK>', 1);

    // ASCII printable characters (32-126)
    for (let i = 32; i < 127; i++) {
      vocab.set(String.fromCharCode(i), vocab.size);
    }

    return vocab;
  }

  /**
   * Build the embedding model architecture
   */
  buildModel(): void {
    if (this.isBuilt) {
      return;
    }

    const {
      vocabSize,
      charEmbeddingDim,
      outputEmbeddingDim,
      maxLength,
      convFilters,
      denseUnits,
    } = this.config;

    // Input layer: sequence of character indices
    const input = tf.input({ shape: [maxLength], name: 'char_input' });

    // Character embedding layer
    const embedding = tf.layers
      .embedding({
        inputDim: vocabSize,
        outputDim: charEmbeddingDim,
        name: 'char_embedding',
      })
      .apply(input) as tf.SymbolicTensor;

    // Multi-scale convolutions to capture different pattern lengths
    // 3-gram patterns (trigrams like "the", "ing")
    const conv3 = tf.layers
      .conv1d({
        filters: convFilters,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
        name: 'conv_3gram',
      })
      .apply(embedding) as tf.SymbolicTensor;

    // 5-gram patterns (longer sequences like "heart", "night")
    const conv5 = tf.layers
      .conv1d({
        filters: convFilters,
        kernelSize: 5,
        activation: 'relu',
        padding: 'same',
        name: 'conv_5gram',
      })
      .apply(embedding) as tf.SymbolicTensor;

    // Global max pooling to extract strongest features
    const pooled3 = tf.layers
      .globalMaxPooling1d({ name: 'pool_3gram' })
      .apply(conv3) as tf.SymbolicTensor;

    const pooled5 = tf.layers
      .globalMaxPooling1d({ name: 'pool_5gram' })
      .apply(conv5) as tf.SymbolicTensor;

    // Concatenate multi-scale features
    const merged = tf.layers
      .concatenate({ name: 'merge_scales' })
      .apply([pooled3, pooled5]) as tf.SymbolicTensor;

    // Dense layers for final representation
    const dense1 = tf.layers
      .dense({
        units: denseUnits,
        activation: 'relu',
        name: 'dense_hidden',
      })
      .apply(merged) as tf.SymbolicTensor;

    // Dropout for regularization
    const dropout = tf.layers
      .dropout({ rate: 0.3, name: 'dropout' })
      .apply(dense1) as tf.SymbolicTensor;

    // Final embedding layer (no activation for embedding space)
    const outputEmbedding = tf.layers
      .dense({
        units: outputEmbeddingDim,
        name: 'embedding_output',
      })
      .apply(dropout) as tf.SymbolicTensor;

    // L2 normalization for consistent similarity computation
    const normalized = tf.layers
      .layerNormalization({ name: 'normalize' })
      .apply(outputEmbedding) as tf.SymbolicTensor;

    this.model = tf.model({
      inputs: input,
      outputs: normalized,
      name: 'haiku_embedding',
    });

    this.isBuilt = true;
  }

  /**
   * Get the underlying model (for training)
   */
  getModel(): tf.LayersModel {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }
    return this.model;
  }

  /**
   * Convert text to character indices
   */
  private textToIndices(text: string): number[] {
    const indices: number[] = [];
    const { maxLength } = this.config;

    for (let i = 0; i < maxLength; i++) {
      if (i < text.length) {
        const char = text[i];
        indices.push(
          this.charToIndex.get(char) ?? this.charToIndex.get('<UNK>')!,
        );
      } else {
        // Padding
        indices.push(this.charToIndex.get('<PAD>')!);
      }
    }

    return indices;
  }

  /**
   * Encode a single haiku to embedding vector
   */
  encode(haiku: string): tf.Tensor1D {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }

    const indices = this.textToIndices(haiku.toLowerCase());
    const inputTensor = tf.tensor2d([indices], [1, this.config.maxLength]);

    const embedding = this.model.predict(inputTensor) as tf.Tensor2D;
    const result = embedding.squeeze([0]) as tf.Tensor1D;

    inputTensor.dispose();
    embedding.dispose();

    return result;
  }

  /**
   * Encode multiple haikus to embedding vectors (batch processing)
   */
  encodeMany(haikus: string[]): tf.Tensor2D {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }

    const batchIndices = haikus.map((h) => this.textToIndices(h.toLowerCase()));
    const inputTensor = tf.tensor2d(batchIndices, [
      haikus.length,
      this.config.maxLength,
    ]);

    const embeddings = this.model.predict(inputTensor) as tf.Tensor2D;

    inputTensor.dispose();

    return embeddings;
  }

  /**
   * Encode and return as JavaScript array (for storage/comparison)
   */
  async encodeToArray(haiku: string): Promise<number[]> {
    const tensor = this.encode(haiku);
    const array = await tensor.array();
    tensor.dispose();
    return array;
  }

  /**
   * Batch encode and return as JavaScript arrays
   */
  async encodeManyToArrays(haikus: string[]): Promise<number[][]> {
    const tensor = this.encodeMany(haikus);
    const arrays = await tensor.array();
    tensor.dispose();
    return arrays;
  }

  /**
   * Compute cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  /**
   * Compute euclidean distance between two embeddings
   */
  euclideanDistance(embedding1: number[], embedding2: number[]): number {
    let sum = 0;
    for (let i = 0; i < embedding1.length; i++) {
      const diff = embedding1[i] - embedding2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Save the model to disk
   * Uses manual JSON serialization for compatibility with pure JS TensorFlow
   */
  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }

    // Ensure directory exists
    if (!existsSync(path)) {
      await mkdir(path, { recursive: true });
    }

    // Get model topology
    const modelTopology = this.model.toJSON();

    // Get weights as arrays
    const weights = this.model.getWeights();
    const weightData: { name: string; shape: number[]; data: number[] }[] = [];

    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      const data = await weight.data();
      weightData.push({
        name: `weight_${i}`,
        shape: weight.shape as number[],
        data: [...data],
      });
    }

    // Save model topology
    await writeFile(
      `${path}/model.json`,
      JSON.stringify(modelTopology, null, 2),
    );

    // Save weights
    await writeFile(`${path}/weights.json`, JSON.stringify(weightData));
  }

  /**
   * Load a pre-trained model from disk
   * Uses manual JSON deserialization for compatibility with pure JS TensorFlow
   */
  async loadModel(path: string): Promise<void> {
    // Load model topology
    const topologyContent = await readFile(`${path}/model.json`, 'utf-8');
    const modelTopology = JSON.parse(topologyContent);

    // Rebuild model from topology
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.model = await tf.models.modelFromJSON(modelTopology as any);

    // Load weights
    const weightsContent = await readFile(`${path}/weights.json`, 'utf-8');
    const weightData = JSON.parse(weightsContent) as {
      name: string;
      shape: number[];
      data: number[];
    }[];

    const weights = weightData.map((w) => tf.tensor(w.data, w.shape));
    this.model.setWeights(weights);

    this.isBuilt = true;
  }

  /**
   * Get model summary
   */
  summary(): void {
    if (!this.model) {
      throw new Error('Model not built. Call buildModel() first.');
    }
    this.model.summary();
  }

  /**
   * Get model parameter count
   */
  getParameterCount(): number {
    if (!this.model) {
      return 0;
    }
    return this.model.countParams();
  }

  /**
   * Get configuration
   */
  getConfig(): EmbeddingModelConfig {
    return { ...this.config };
  }

  /**
   * Dispose the model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isBuilt = false;
    }
  }
}
