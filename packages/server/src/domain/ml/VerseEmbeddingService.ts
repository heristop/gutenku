/**
 * Verse Embedding Service
 *
 * Computes embeddings for verse candidates during extraction.
 * Used for semantic similarity-based coherence scoring.
 */

import { injectable, singleton } from 'tsyringe';
import type { EnhancedVerseCandidate } from '@gutenku/shared';
import type { VerseCandidate, VersePools } from '../services/genetic/types';
import { HaikuEmbeddingModel } from './HaikuEmbeddingModel';
import {
  DEFAULT_EMBEDDING_CONFIG,
  type EmbeddingModelConfig,
} from '../../config/ml';

/**
 * Verse pools with computed embeddings
 */
export interface EnhancedVersePools {
  fiveSyllable: EnhancedVerseCandidate[];
  sevenSyllable: EnhancedVerseCandidate[];
  bookId: string;
  chapterId: string;
}

/**
 * Service for computing and managing verse embeddings
 */
@singleton()
@injectable()
export class VerseEmbeddingService {
  private model: HaikuEmbeddingModel;
  private isInitialized = false;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(config?: Partial<EmbeddingModelConfig>) {
    this.model = new HaikuEmbeddingModel(config ?? DEFAULT_EMBEDDING_CONFIG);
  }

  /**
   * Initialize the model (must be called before use)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.model.buildModel();
    this.isInitialized = true;
  }

  /**
   * Load a pre-trained model from disk
   */
  async loadModel(path: string): Promise<void> {
    await this.model.loadModel(path);
    this.isInitialized = true;
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Embed a single verse text
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check cache first
    const cached = this.embeddingCache.get(text);
    if (cached) {
      return cached;
    }

    const embedding = await this.model.encodeToArray(text);
    this.embeddingCache.set(text, embedding);
    return embedding;
  }

  /**
   * Batch embed multiple verses
   */
  async embedMany(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Separate cached and uncached
    const results: number[][] = Array.from({ length: texts.length });
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const cached = this.embeddingCache.get(texts[i]);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(texts[i]);
      }
    }

    // Batch encode uncached
    if (uncachedTexts.length > 0) {
      const embeddings = await this.model.encodeManyToArrays(uncachedTexts);
      for (let j = 0; j < uncachedIndices.length; j++) {
        const idx = uncachedIndices[j];
        results[idx] = embeddings[j];
        this.embeddingCache.set(texts[idx], embeddings[j]);
      }
    }

    return results;
  }

  /**
   * Enhance verse pool with embeddings
   */
  async embedVersePool(
    candidates: VerseCandidate[],
  ): Promise<EnhancedVerseCandidate[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const texts = candidates.map((c) => c.text);
    const embeddings = await this.embedMany(texts);

    return candidates.map((candidate, i) => ({
      ...candidate,
      embedding: embeddings[i],
    }));
  }

  /**
   * Enhance full verse pools (both 5-syllable and 7-syllable)
   */
  async embedVersePools(pools: VersePools): Promise<EnhancedVersePools> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const [fiveSyllable, sevenSyllable] = await Promise.all([
      this.embedVersePool(pools.fiveSyllable),
      this.embedVersePool(pools.sevenSyllable),
    ]);

    return {
      fiveSyllable,
      sevenSyllable,
      bookId: pools.bookId,
      chapterId: pools.chapterId,
    };
  }

  /**
   * Compute cosine similarity between two embeddings
   */
  similarity(embedding1: number[], embedding2: number[]): number {
    return this.model.cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Compute euclidean distance between two embeddings
   */
  distance(embedding1: number[], embedding2: number[]): number {
    return this.model.euclideanDistance(embedding1, embedding2);
  }

  /**
   * Compute semantic coherence for three verses using embeddings
   *
   * Returns average pairwise similarity, normalized to [0, 1]
   * This replaces the Jaccard-based coherence with true semantic similarity
   */
  computeSemanticCoherence(
    verse1Embedding: number[],
    verse2Embedding: number[],
    verse3Embedding: number[],
  ): number {
    const sim12 = this.similarity(verse1Embedding, verse2Embedding);
    const sim13 = this.similarity(verse1Embedding, verse3Embedding);
    const sim23 = this.similarity(verse2Embedding, verse3Embedding);

    // Average pairwise similarity
    const avgSimilarity = (sim12 + sim13 + sim23) / 3;

    // Similarity can be negative for orthogonal embeddings
    // Normalize to [0, 1] range: (sim + 1) / 2
    return Math.max(0, Math.min(1, (avgSimilarity + 1) / 2));
  }

  /**
   * Compute semantic coherence from verse texts
   */
  async computeSemanticCoherenceFromText(
    verses: [string, string, string],
  ): Promise<number> {
    const embeddings = await this.embedMany(verses);
    return this.computeSemanticCoherence(
      embeddings[0],
      embeddings[1],
      embeddings[2],
    );
  }

  /**
   * Compute centroid of multiple embeddings
   */
  computeCentroid(embeddings: number[][]): number[] {
    if (embeddings.length === 0) {
      throw new Error('Cannot compute centroid of empty embedding set');
    }

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

    return centroid;
  }

  /**
   * Score a haiku against a survivor centroid
   *
   * Returns a score in [0, 1] where 1 means very similar to survivors
   */
  scoreAgainstCentroid(haikuEmbedding: number[], centroid: number[]): number {
    const similarity = this.similarity(haikuEmbedding, centroid);
    // Convert similarity from [-1, 1] to [0, 1]
    return (similarity + 1) / 2;
  }

  /**
   * Score a haiku text against a survivor centroid
   */
  async scoreHaikuAgainstCentroid(
    haikuText: string,
    centroid: number[],
  ): Promise<number> {
    const embedding = await this.embed(haikuText);
    return this.scoreAgainstCentroid(embedding, centroid);
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; memoryEstimateBytes: number } {
    const size = this.embeddingCache.size;
    // Each embedding is 64 floats = 256 bytes, plus string key overhead (~100 bytes avg)
    const memoryEstimateBytes = size * (256 + 100);
    return { size, memoryEstimateBytes };
  }

  /**
   * Get the underlying model for training purposes
   */
  getModel(): HaikuEmbeddingModel {
    return this.model;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.model.dispose();
    this.embeddingCache.clear();
    this.isInitialized = false;
  }
}
