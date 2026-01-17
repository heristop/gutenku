/**
 * Siamese Network Trainer
 *
 * Trains the embedding model using triplet loss to learn haiku quality
 * from GA selection outcomes. Elite survivors cluster together,
 * early eliminations are pushed away.
 */

import * as tf from '@tensorflow/tfjs';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type {
  Triplet,
  SurvivorCentroid,
  ModelMetadata,
  TrainingConfig,
} from '@gutenku/shared';
import type { HaikuEmbeddingModel } from './HaikuEmbeddingModel';
import {
  DEFAULT_MODEL_PATHS_CONFIG,
  DEFAULT_TRAINING_CONFIG,
  type ModelPathsConfig,
} from '../../config/ml';

/**
 * Training progress callback
 */
export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  batchLoss: number;
  tripletAccuracy: number;
}

/**
 * Training result
 */
export interface TrainingResult {
  epochs: number;
  finalLoss: number;
  tripletAccuracy: number;
  trainingTimeMs: number;
}

/**
 * Siamese network trainer for haiku embeddings
 */
export class SiameseTrainer {
  private embeddingModel: HaikuEmbeddingModel;
  private survivorCentroid: SurvivorCentroid | null = null;
  private paths: ModelPathsConfig;
  private trainingConfig: TrainingConfig;

  constructor(
    embeddingModel: HaikuEmbeddingModel,
    paths: Partial<ModelPathsConfig> = {},
    trainingConfig: Partial<TrainingConfig> = {},
  ) {
    this.embeddingModel = embeddingModel;
    this.paths = { ...DEFAULT_MODEL_PATHS_CONFIG, ...paths };
    this.trainingConfig = { ...DEFAULT_TRAINING_CONFIG, ...trainingConfig };
  }

  /**
   * Compute triplet loss
   *
   * Loss = max(0, d(anchor, positive) - d(anchor, negative) + margin)
   *
   * Goal: d(anchor, positive) < d(anchor, negative) - margin
   */
  private tripletLoss(
    anchorEmb: tf.Tensor2D,
    positiveEmb: tf.Tensor2D,
    negativeEmb: tf.Tensor2D,
    margin: number,
  ): tf.Scalar {
    return tf.tidy(() => {
      // Compute euclidean distances
      const dPositive = tf.norm(tf.sub(anchorEmb, positiveEmb), 2, 1);
      const dNegative = tf.norm(tf.sub(anchorEmb, negativeEmb), 2, 1);

      // Triplet loss: max(0, d_pos - d_neg + margin)
      const loss = tf.maximum(
        tf.scalar(0),
        tf.add(tf.sub(dPositive, dNegative), tf.scalar(margin)),
      );

      // Mean over batch
      return tf.mean(loss) as tf.Scalar;
    });
  }

  /**
   * Compute triplet accuracy (percentage of triplets correctly ordered)
   */
  private computeTripletAccuracy(
    anchorEmb: tf.Tensor2D,
    positiveEmb: tf.Tensor2D,
    negativeEmb: tf.Tensor2D,
  ): number {
    return tf.tidy(() => {
      const dPositive = tf.norm(tf.sub(anchorEmb, positiveEmb), 2, 1);
      const dNegative = tf.norm(tf.sub(anchorEmb, negativeEmb), 2, 1);

      // Count where d_positive < d_negative (correct ordering)
      const correct = tf.sum(tf.cast(tf.less(dPositive, dNegative), 'float32'));
      const total = tf.scalar(dPositive.shape[0]);

      return (correct.dataSync()[0] / total.dataSync()[0]) * 100;
    });
  }

  /**
   * Prepare triplet batch for training
   */
  private prepareTripletBatch(triplets: Triplet[]): {
    anchors: string[];
    positives: string[];
    negatives: string[];
  } {
    return {
      anchors: triplets.map((t) => t.anchor),
      positives: triplets.map((t) => t.positive),
      negatives: triplets.map((t) => t.negative),
    };
  }

  /**
   * Train the embedding model with triplet loss
   */
  async train(
    triplets: Triplet[],
    onProgress?: (progress: TrainingProgress) => void,
  ): Promise<TrainingResult> {
    const { epochs, batchSize, learningRate, margin } = this.trainingConfig;
    const startTime = Date.now();

    // Ensure model is built
    this.embeddingModel.buildModel();

    // Create optimizer
    const optimizer = tf.train.adam(learningRate);

    let finalLoss = 0;
    let tripletAccuracy = 0;

    // Shuffle triplets
    const shuffled = [...triplets].sort(() => Math.random() - 0.5);
    const numBatches = Math.ceil(shuffled.length / batchSize);

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      let batchCount = 0;

      // Re-shuffle each epoch
      shuffled.sort(() => Math.random() - 0.5);

      for (let b = 0; b < numBatches; b++) {
        const batchStart = b * batchSize;
        const batchEnd = Math.min((b + 1) * batchSize, shuffled.length);
        const batchTriplets = shuffled.slice(batchStart, batchEnd);

        const { anchors, positives, negatives } =
          this.prepareTripletBatch(batchTriplets);

        // Compute loss and gradients
        const batchLoss = await tf.tidy(() => {
          const loss = optimizer.minimize(() => {
            // Encode all texts
            const anchorEmb = this.embeddingModel.encodeMany(anchors);
            const positiveEmb = this.embeddingModel.encodeMany(positives);
            const negativeEmb = this.embeddingModel.encodeMany(negatives);

            return this.tripletLoss(
              anchorEmb,
              positiveEmb,
              negativeEmb,
              margin,
            );
          }, true);

          return loss ? loss.dataSync()[0] : 0;
        });

        epochLoss += batchLoss;
        batchCount++;

        // Clean up tensors periodically
        if (b % 10 === 0) {
          await tf.nextFrame();
        }
      }

      const avgEpochLoss = epochLoss / batchCount;

      // Compute accuracy on a sample of triplets
      const sampleSize = Math.min(100, shuffled.length);
      const sampleTriplets = shuffled.slice(0, sampleSize);
      const { anchors, positives, negatives } =
        this.prepareTripletBatch(sampleTriplets);

      tripletAccuracy = tf.tidy(() => {
        const anchorEmb = this.embeddingModel.encodeMany(anchors);
        const positiveEmb = this.embeddingModel.encodeMany(positives);
        const negativeEmb = this.embeddingModel.encodeMany(negatives);

        return this.computeTripletAccuracy(anchorEmb, positiveEmb, negativeEmb);
      });

      finalLoss = avgEpochLoss;

      // Report progress
      if (onProgress) {
        onProgress({
          epoch: epoch + 1,
          totalEpochs: epochs,
          loss: avgEpochLoss,
          batchLoss: avgEpochLoss,
          tripletAccuracy,
        });
      }

      // Early stopping if accuracy exceeds threshold and minimum epochs reached
      const minEpochs = this.trainingConfig.minEpochs ?? 3;
      const threshold = this.trainingConfig.earlyStoppingThreshold ?? 99.5;
      if (epoch + 1 >= minEpochs && tripletAccuracy > threshold) {
        break;
      }
    }

    const trainingTimeMs = Date.now() - startTime;

    return {
      epochs,
      finalLoss,
      tripletAccuracy,
      trainingTimeMs,
    };
  }

  /**
   * Compute survivor centroid from elite haikus
   */
  async computeSurvivorCentroid(
    survivors: string[],
  ): Promise<SurvivorCentroid> {
    const embeddings = await this.embeddingModel.encodeManyToArrays(survivors);

    // Compute centroid
    const dim = embeddings[0].length;
    const centroid = Array.from({ length: dim }, () => 0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += embedding[i];
      }
    }

    for (let i = 0; i < dim; i++) {
      centroid[i] /= embeddings.length;
    }

    // Compute average distance to centroid
    let totalDistance = 0;
    for (const embedding of embeddings) {
      let dist = 0;
      for (let i = 0; i < dim; i++) {
        dist += Math.pow(embedding[i] - centroid[i], 2);
      }
      totalDistance += Math.sqrt(dist);
    }
    const averageDistance = totalDistance / embeddings.length;

    this.survivorCentroid = {
      vector: centroid,
      sampleCount: survivors.length,
      averageDistance,
      computedAt: Date.now(),
    };

    return this.survivorCentroid;
  }

  /**
   * Score a haiku by distance to survivor centroid
   *
   * Returns score in [0, 1] where higher = more similar to survivors
   */
  async scoreHaiku(haiku: string): Promise<number> {
    if (!this.survivorCentroid) {
      throw new Error(
        'Survivor centroid not computed. Call computeSurvivorCentroid first.',
      );
    }

    const embedding = await this.embeddingModel.encodeToArray(haiku);

    // Compute cosine similarity to centroid
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding.length; i++) {
      dotProduct += embedding[i] * this.survivorCentroid.vector[i];
      norm1 += embedding[i] * embedding[i];
      norm2 +=
        this.survivorCentroid.vector[i] * this.survivorCentroid.vector[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) || 1);

    // Convert from [-1, 1] to [0, 1]
    return (similarity + 1) / 2;
  }

  /**
   * Batch score multiple haikus
   */
  async scoreHaikus(haikus: string[]): Promise<number[]> {
    if (!this.survivorCentroid) {
      throw new Error(
        'Survivor centroid not computed. Call computeSurvivorCentroid first.',
      );
    }

    const embeddings = await this.embeddingModel.encodeManyToArrays(haikus);
    const scores: number[] = [];

    for (const embedding of embeddings) {
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;

      for (let i = 0; i < embedding.length; i++) {
        dotProduct += embedding[i] * this.survivorCentroid.vector[i];
        norm1 += embedding[i] * embedding[i];
        norm2 +=
          this.survivorCentroid.vector[i] * this.survivorCentroid.vector[i];
      }

      const similarity =
        dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) || 1);
      scores.push((similarity + 1) / 2);
    }

    return scores;
  }

  /**
   * Get the survivor centroid
   */
  getCentroid(): SurvivorCentroid | null {
    return this.survivorCentroid;
  }

  /**
   * Save model and centroid to disk
   */
  async save(): Promise<void> {
    const { modelDir, metadataPath, centroidPath } = this.paths;

    // Ensure directory exists
    if (!existsSync(modelDir)) {
      await mkdir(modelDir, { recursive: true });
    }

    // Save model
    await this.embeddingModel.saveModel(modelDir);

    // Save metadata
    const metadata: ModelMetadata = {
      version: '1.0.0',
      trainedAt: Date.now(),
      sampleCount: this.survivorCentroid?.sampleCount ?? 0,
      tripletCount: 0, // Set during training
      epochs: this.trainingConfig.epochs,
      finalLoss: 0, // Set during training
      vocabSize: this.embeddingModel.getConfig().vocabSize,
      embeddingDim: this.embeddingModel.getConfig().outputEmbeddingDim,
      maxLength: this.embeddingModel.getConfig().maxLength,
    };
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Save centroid if computed
    if (this.survivorCentroid) {
      await writeFile(
        centroidPath,
        JSON.stringify(this.survivorCentroid, null, 2),
      );
    }
  }

  /**
   * Load model and centroid from disk
   */
  async load(): Promise<void> {
    const { modelDir, centroidPath } = this.paths;

    // Load model
    await this.embeddingModel.loadModel(modelDir);

    // Load centroid if exists
    if (existsSync(centroidPath)) {
      const content = await readFile(centroidPath, 'utf-8');
      this.survivorCentroid = JSON.parse(content) as SurvivorCentroid;
    }
  }

  /**
   * Check if a trained model exists
   */
  hasTrainedModel(): boolean {
    const { weightsPath } = this.paths;
    return existsSync(weightsPath);
  }

  /**
   * Get the embedding model
   */
  getEmbeddingModel(): HaikuEmbeddingModel {
    return this.embeddingModel;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.embeddingModel.dispose();
    this.survivorCentroid = null;
  }
}
