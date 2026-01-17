/**
 * Evolution Data Collector
 *
 * Captures survival data during GA evolution for training the neural network.
 * Positive examples: Haikus surviving to final generations (top performers)
 * Negative examples: Haikus eliminated in early generations
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  EvolutionSample,
  EvolutionDataset,
  QualityMetricsSummary,
  Triplet,
} from '@gutenku/shared';
import type {
  HaikuChromosome,
  QualityMetrics,
  Population,
} from '../../domain/services/genetic/types';
import {
  DEFAULT_DATA_COLLECTION_CONFIG,
  type DataCollectionConfig,
} from '../../config/ml';

/**
 * Internal tracking for chromosome lifecycle
 */
interface ChromosomeTracking {
  chromosome: HaikuChromosome;
  verses: [string, string, string];
  generationBorn: number;
  generationDied: number;
  wasElite: boolean;
  finalRank: number;
}

/**
 * Collects evolution data for self-supervised learning
 */
export class EvolutionDataCollector {
  private config: DataCollectionConfig;
  private samples: EvolutionSample[] = [];
  private currentRunTracking: Map<string, ChromosomeTracking> = new Map();
  private runId = 0;

  constructor(config: Partial<DataCollectionConfig> = {}) {
    this.config = { ...DEFAULT_DATA_COLLECTION_CONFIG, ...config };
  }

  /**
   * Start a new evolution run
   */
  startRun(): void {
    this.runId++;
    this.currentRunTracking.clear();
  }

  /**
   * Track chromosomes from a generation
   *
   * @param population Current population
   * @param decodeChromosome Function to decode chromosome to verses
   */
  trackGeneration(
    population: Population,
    decodeChromosome: (chromosome: HaikuChromosome) => [string, string, string],
  ): void {
    const { generation, chromosomes } = population;

    // Track new chromosomes
    for (const chromosome of chromosomes) {
      if (!this.currentRunTracking.has(chromosome.id)) {
        this.currentRunTracking.set(chromosome.id, {
          chromosome,
          verses: decodeChromosome(chromosome),
          generationBorn: generation,
          generationDied: -1, // Still alive
          wasElite: false,
          finalRank: -1,
        });
      }
    }

    // Mark eliminated chromosomes
    const aliveIds = new Set(chromosomes.map((c) => c.id));
    for (const [id, tracking] of this.currentRunTracking) {
      if (!aliveIds.has(id) && tracking.generationDied === -1) {
        tracking.generationDied = generation;
      }
    }
  }

  /**
   * Finalize a run and collect samples
   *
   * @param finalPopulation Final population after evolution
   * @param decodeChromosome Function to decode chromosome to verses
   */
  finalizeRun(
    finalPopulation: Population,
    _decodeChromosome: (
      chromosome: HaikuChromosome,
    ) => [string, string, string],
  ): void {
    const { chromosomes, generation } = finalPopulation;
    const { elitePercentile } = this.config;

    // Sort by fitness to determine ranks
    const sorted = [...chromosomes].sort((a, b) => b.fitness - a.fitness);

    // Deduplicate chromosomes - keep first (best fitness) occurrence of each ID
    const uniqueChromosomes: typeof sorted = [];
    const seenIds = new Set<string>();
    for (const chromosome of sorted) {
      if (!seenIds.has(chromosome.id)) {
        seenIds.add(chromosome.id);
        uniqueChromosomes.push(chromosome);
      }
    }

    // Recalculate elite threshold based on unique chromosomes
    const uniqueEliteThreshold = Math.ceil(
      uniqueChromosomes.length * (elitePercentile / 100),
    );

    // Update final rankings and elite status
    uniqueChromosomes.forEach((chromosome, uniqueIndex) => {
      const tracking = this.currentRunTracking.get(chromosome.id);
      if (tracking) {
        tracking.finalRank = uniqueIndex + 1;
        tracking.wasElite = uniqueIndex < uniqueEliteThreshold;
        tracking.generationDied = -1; // Survivors have -1
        // Update chromosome with final fitness
        tracking.chromosome = chromosome;
      }
    });

    // Convert tracking to samples
    for (const [id, tracking] of this.currentRunTracking) {
      const sample = this.trackingToSample(id, tracking, generation);
      this.samples.push(sample);
    }

    // Clear tracking for next run
    this.currentRunTracking.clear();
  }

  /**
   * Convert tracking data to evolution sample
   */
  private trackingToSample(
    id: string,
    tracking: ChromosomeTracking,
    finalGeneration: number,
  ): EvolutionSample {
    const {
      chromosome,
      verses,
      generationBorn,
      generationDied,
      wasElite,
      finalRank,
    } = tracking;

    return {
      id: `${this.runId}-${id}`,
      haikuText: verses.join(' / '),
      verses,
      generationBorn,
      generationDied,
      finalRank: finalRank === -1 ? finalGeneration + 1 : finalRank,
      wasElite,
      fitness: chromosome.fitness,
      metrics: chromosome.metrics
        ? this.summarizeMetrics(chromosome.metrics)
        : null,
      collectedAt: Date.now(),
    };
  }

  /**
   * Summarize metrics for storage (all 18 metrics)
   */
  private summarizeMetrics(metrics: QualityMetrics): QualityMetricsSummary {
    return {
      totalScore: metrics.totalScore,
      natureWords: metrics.natureWords,
      repeatedWords: metrics.repeatedWords,
      weakStarts: metrics.weakStarts,
      blacklistedVerses: metrics.blacklistedVerses,
      properNouns: metrics.properNouns,
      verseLengthPenalty: metrics.verseLengthPenalty,
      sentiment: metrics.sentiment,
      grammar: metrics.grammar,
      markovFlow: metrics.markovFlow,
      trigramFlow: metrics.trigramFlow,
      uniqueness: metrics.uniqueness,
      alliteration: metrics.alliteration,
      verseDistance: metrics.verseDistance,
      lineLengthBalance: metrics.lineLengthBalance,
      imageryDensity: metrics.imageryDensity,
      semanticCoherence: metrics.semanticCoherence,
      verbPresence: metrics.verbPresence,
    };
  }

  /**
   * Get positive samples (elite survivors)
   */
  getPositiveSamples(): EvolutionSample[] {
    return this.samples.filter((s) => s.wasElite);
  }

  /**
   * Get negative samples (early eliminated)
   */
  getNegativeSamples(): EvolutionSample[] {
    const { earlyEliminationThreshold } = this.config;
    return this.samples.filter(
      (s) =>
        s.generationDied > 0 && s.generationDied <= earlyEliminationThreshold,
    );
  }

  /**
   * Get neutral samples (survived some generations but not elite)
   */
  getNeutralSamples(): EvolutionSample[] {
    const { earlyEliminationThreshold } = this.config;
    return this.samples.filter(
      (s) =>
        !s.wasElite &&
        (s.generationDied === -1 ||
          s.generationDied > earlyEliminationThreshold),
    );
  }

  /**
   * Generate training triplets
   *
   * Triplet: (anchor=elite, positive=another elite, negative=early eliminated)
   */
  generateTriplets(count: number): Triplet[] {
    const positives = this.getPositiveSamples();
    const negatives = this.getNegativeSamples();

    if (positives.length < 2) {
      throw new Error(
        `Need at least 2 positive samples, have ${positives.length}`,
      );
    }
    if (negatives.length < 1) {
      throw new Error(
        `Need at least 1 negative sample, have ${negatives.length}`,
      );
    }

    const triplets: Triplet[] = [];

    for (let i = 0; i < count; i++) {
      // Select random anchor from positives
      const anchorIdx = Math.floor(Math.random() * positives.length);
      const anchor = positives[anchorIdx];

      // Select different positive for positive example
      let positiveIdx = Math.floor(Math.random() * positives.length);
      while (positiveIdx === anchorIdx && positives.length > 1) {
        positiveIdx = Math.floor(Math.random() * positives.length);
      }
      const positive = positives[positiveIdx];

      // Select random negative
      const negativeIdx = Math.floor(Math.random() * negatives.length);
      const negative = negatives[negativeIdx];

      triplets.push({
        anchor: anchor.haikuText,
        positive: positive.haikuText,
        negative: negative.haikuText,
      });
    }

    return triplets;
  }

  /**
   * Generate positive-negative pairs for contrastive learning
   */
  getPositiveNegativePairs(): [EvolutionSample, EvolutionSample][] {
    const positives = this.getPositiveSamples();
    const negatives = this.getNegativeSamples();

    const pairs: [EvolutionSample, EvolutionSample][] = [];
    const minLength = Math.min(positives.length, negatives.length);

    for (let i = 0; i < minLength; i++) {
      pairs.push([positives[i], negatives[i]]);
    }

    return pairs;
  }

  /**
   * Export dataset to file
   */
  async exportDataset(path?: string): Promise<string> {
    const filePath = path ?? this.config.dataPath;

    const dataset: EvolutionDataset = {
      version: '1.0.0',
      exportedAt: Date.now(),
      totalSamples: this.samples.length,
      positiveSamples: this.getPositiveSamples().length,
      negativeSamples: this.getNegativeSamples().length,
      samples: this.samples,
    };

    // Ensure directory exists
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(filePath, JSON.stringify(dataset, null, 2));
    return filePath;
  }

  /**
   * Import dataset from file
   */
  async importDataset(path?: string): Promise<void> {
    const filePath = path ?? this.config.dataPath;

    if (!existsSync(filePath)) {
      throw new Error(`Dataset file not found: ${filePath}`);
    }

    const content = await readFile(filePath, 'utf-8');
    const dataset = JSON.parse(content) as EvolutionDataset;

    // Merge with existing samples (deduplicate by ID)
    const existingIds = new Set(this.samples.map((s) => s.id));
    for (const sample of dataset.samples) {
      if (!existingIds.has(sample.id)) {
        this.samples.push(sample);
        existingIds.add(sample.id);
      }
    }
  }

  /**
   * Get all collected samples
   */
  getSamples(): EvolutionSample[] {
    return [...this.samples];
  }

  /**
   * Get sample count
   */
  getSampleCount(): number {
    return this.samples.length;
  }

  /**
   * Check if we have enough samples for training
   */
  hasEnoughSamplesForTraining(): boolean {
    const positives = this.getPositiveSamples().length;
    const negatives = this.getNegativeSamples().length;
    const { minSamplesForTraining } = this.config;

    return (
      positives >= minSamplesForTraining / 2 &&
      negatives >= minSamplesForTraining / 2
    );
  }

  /**
   * Get statistics about collected data
   */
  getStatistics(): {
    total: number;
    positives: number;
    negatives: number;
    neutrals: number;
    readyForTraining: boolean;
  } {
    return {
      total: this.samples.length,
      positives: this.getPositiveSamples().length,
      negatives: this.getNegativeSamples().length,
      neutrals: this.getNeutralSamples().length,
      readyForTraining: this.hasEnoughSamplesForTraining(),
    };
  }

  /**
   * Clear all collected samples
   */
  clear(): void {
    this.samples = [];
    this.currentRunTracking.clear();
    this.runId = 0;
  }
}
