import type { GAConfig, HaikuChromosome } from '../types';
import type { SeededRandom } from '../utils/SeededRandom';
import type { ChromosomeFactory } from '../ChromosomeFactory';

/**
 * Crossover operator for combining parent chromosomes
 */
export class CrossoverOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
    private readonly chromosomeFactory: ChromosomeFactory,
  ) {}

  /**
   * Single-point crossover: Split at random point, swap tails
   *
   * Parent1: [A1, B1, C1]  →  Child1: [A1, B2, C2]
   * Parent2: [A2, B2, C2]  →  Child2: [A2, B1, C1]
   *                ^crossover point
   */
  singlePointCrossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    const crossPoint = this.rng.nextInt(0, 3); // 0, 1, or 2

    const child1Genes: [number, number, number] = [...parent1.genes];
    const child2Genes: [number, number, number] = [...parent2.genes];

    for (let i = crossPoint; i < 3; i++) {
      [child1Genes[i], child2Genes[i]] = [child2Genes[i], child1Genes[i]];
    }

    return [
      this.chromosomeFactory.create(child1Genes, generation, [
        parent1.id,
        parent2.id,
      ]),
      this.chromosomeFactory.create(child2Genes, generation, [
        parent2.id,
        parent1.id,
      ]),
    ];
  }

  /**
   * Uniform crossover: Each gene independently from either parent
   *
   * Parent1: [A1, B1, C1]  →  Child: [A1, B2, C1] (each gene 50/50)
   */
  uniformCrossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    const child1Genes: [number, number, number] = [0, 0, 0];
    const child2Genes: [number, number, number] = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      const useParent1 = this.rng.next() < 0.5;

      if (useParent1) {
        child1Genes[i] = parent1.genes[i];
        child2Genes[i] = parent2.genes[i];
      }

      if (!useParent1) {
        child1Genes[i] = parent2.genes[i];
        child2Genes[i] = parent1.genes[i];
      }
    }

    return [
      this.chromosomeFactory.create(child1Genes, generation, [
        parent1.id,
        parent2.id,
      ]),
      this.chromosomeFactory.create(child2Genes, generation, [
        parent2.id,
        parent1.id,
      ]),
    ];
  }

  /**
   * Main crossover dispatcher
   */
  crossover(
    parent1: HaikuChromosome,
    parent2: HaikuChromosome,
    generation: number,
  ): [HaikuChromosome, HaikuChromosome] {
    // Check if crossover should occur
    if (this.rng.next() > this.config.crossoverRate) {
      // No crossover - return clones
      return [
        this.chromosomeFactory.clone(parent1, generation),
        this.chromosomeFactory.clone(parent2, generation),
      ];
    }

    switch (this.config.crossoverMethod) {
      case 'single_point':
        return this.singlePointCrossover(parent1, parent2, generation);
      case 'uniform':
        return this.uniformCrossover(parent1, parent2, generation);
      default:
        return this.singlePointCrossover(parent1, parent2, generation);
    }
  }
}
