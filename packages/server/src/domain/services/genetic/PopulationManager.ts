import type {
  Population,
  HaikuChromosome,
  PopulationStatistics,
  GenerationSnapshot,
  GAConfig,
} from './types';
import type { ChromosomeFactory } from './ChromosomeFactory';
import type { FitnessEvaluator } from './FitnessEvaluator';
import type { SelectionOperator } from './operators/SelectionOperator';
import type { CrossoverOperator } from './operators/CrossoverOperator';
import type { MutationOperator } from './operators/MutationOperator';

/**
 * Population lifecycle and evolution manager
 */
export class PopulationManager {
  constructor(
    private readonly config: GAConfig,
    private readonly chromosomeFactory: ChromosomeFactory,
    private readonly fitnessEvaluator: FitnessEvaluator,
    private readonly selectionOperator: SelectionOperator,
    private readonly crossoverOperator: CrossoverOperator,
    private readonly mutationOperator: MutationOperator,
  ) {}

  /**
   * Initialize random population
   */
  initialize(): Population {
    const chromosomes: HaikuChromosome[] = [];

    for (let i = 0; i < this.config.populationSize; i++) {
      chromosomes.push(this.chromosomeFactory.createRandom(0));
    }

    // Evaluate initial fitness
    const evaluated = this.fitnessEvaluator.evaluatePopulation(chromosomes);
    const statistics = this.calculateStatistics(evaluated);

    return {
      chromosomes: evaluated,
      generation: 0,
      statistics,
      history: this.config.recordHistory
        ? [this.createSnapshot(0, statistics)]
        : [],
    };
  }

  /**
   * Evolve population to next generation
   */
  evolve(population: Population): Population {
    const nextGeneration = population.generation + 1;
    const nextChromosomes: HaikuChromosome[] = [];

    // Elitism: preserve top performers
    const sorted = [...population.chromosomes].sort(
      (a, b) => b.fitness - a.fitness,
    );

    for (let i = 0; i < this.config.elitismCount; i++) {
      nextChromosomes.push(
        this.chromosomeFactory.clone(sorted[i], nextGeneration),
      );
    }

    // Fill rest with offspring
    while (nextChromosomes.length < this.config.populationSize) {
      // Selection
      const parent1 = this.selectionOperator.select(population);
      const parent2 = this.selectionOperator.select(population);

      // Crossover
      let [child1, child2] = this.crossoverOperator.crossover(
        parent1,
        parent2,
        nextGeneration,
      );

      // Mutation
      child1 = this.mutationOperator.mutate(child1);
      child2 = this.mutationOperator.mutate(child2);

      nextChromosomes.push(child1);
      if (nextChromosomes.length < this.config.populationSize) {
        nextChromosomes.push(child2);
      }
    }

    // Evaluate new chromosomes
    const evaluated = this.fitnessEvaluator.evaluatePopulation(nextChromosomes);
    const statistics = this.calculateStatistics(evaluated);

    return {
      chromosomes: evaluated,
      generation: nextGeneration,
      statistics,
      history: this.config.recordHistory
        ? [
            ...population.history,
            this.createSnapshot(nextGeneration, statistics),
          ]
        : [],
    };
  }

  /**
   * Check if population has converged
   */
  hasConverged(population: Population): boolean {
    if (!this.config.recordHistory) {
      return false;
    }

    if (population.history.length < this.config.convergenceWindow) {
      return false;
    }

    const recent = population.history.slice(-this.config.convergenceWindow);
    const improvements = recent.map((s, i) =>
      i === 0 ? 0 : s.bestFitness - recent[i - 1].bestFitness,
    );

    const avgImprovement =
      improvements.reduce((a, b) => a + b, 0) / improvements.length;
    return Math.abs(avgImprovement) < this.config.convergenceThreshold;
  }

  /**
   * Get top N chromosomes
   */
  getTopChromosomes(population: Population, n: number): HaikuChromosome[] {
    return [...population.chromosomes]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, n);
  }

  /**
   * Calculate population statistics
   */
  private calculateStatistics(
    chromosomes: HaikuChromosome[],
  ): PopulationStatistics {
    const fitnesses = chromosomes.map((c) => c.fitness);
    const sorted = [...fitnesses].sort((a, b) => a - b);

    const sum = fitnesses.reduce((a, b) => a + b, 0);
    const avg = sum / fitnesses.length;

    const variance =
      fitnesses.reduce((acc, f) => acc + Math.pow(f - avg, 2), 0) /
      fitnesses.length;

    // Diversity: unique chromosomes / total
    const uniqueIds = new Set(chromosomes.map((c) => c.id));

    return {
      bestFitness: sorted.at(-1),
      worstFitness: sorted[0],
      averageFitness: avg,
      medianFitness: sorted[Math.floor(sorted.length / 2)],
      standardDeviation: Math.sqrt(variance),
      diversity: uniqueIds.size / chromosomes.length,
      improvementRate: 0,
    };
  }

  /**
   * Create generation snapshot for history
   */
  private createSnapshot(
    generation: number,
    stats: PopulationStatistics,
  ): GenerationSnapshot {
    return {
      generation,
      bestFitness: stats.bestFitness,
      averageFitness: stats.averageFitness,
      diversity: stats.diversity,
      timestamp: Date.now(),
    };
  }
}
