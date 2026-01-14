import type { GAConfig, HaikuChromosome, VersePools } from '../types';
import type { SeededRandom } from '../utils/SeededRandom';

/**
 * Mutation operator for introducing variation
 */
export class MutationOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
    private readonly versePools: VersePools,
  ) {}

  /**
   * Random reset mutation: Replace gene with random valid value
   */
  randomResetMutate(chromosome: HaikuChromosome): HaikuChromosome {
    const mutatedGenes: [number, number, number] = [...chromosome.genes];
    let mutated = false;

    for (let i = 0; i < 3; i++) {
      if (this.rng.next() < this.config.mutationRate) {
        const pool =
          i === 1
            ? this.versePools.sevenSyllable
            : this.versePools.fiveSyllable;

        mutatedGenes[i] = this.rng.nextInt(0, pool.length);
        mutated = true;
      }
    }

    if (mutated) {
      return {
        ...chromosome,
        id: this.generateId(mutatedGenes),
        genes: mutatedGenes,
        fitness: 0, // Needs re-evaluation
        metrics: null,
      };
    }

    return chromosome;
  }

  /**
   * Swap mutation: Swap verse 1 and verse 3 (both 5-syllable)
   */
  swapMutate(chromosome: HaikuChromosome): HaikuChromosome {
    if (this.rng.next() >= this.config.mutationRate) {
      return chromosome;
    }

    const mutatedGenes: [number, number, number] = [
      chromosome.genes[2], // Swap
      chromosome.genes[1], // Keep middle
      chromosome.genes[0], // Swap
    ];

    return {
      ...chromosome,
      id: this.generateId(mutatedGenes),
      genes: mutatedGenes,
      fitness: 0,
      metrics: null,
    };
  }

  /**
   * Main mutation dispatcher
   */
  mutate(chromosome: HaikuChromosome): HaikuChromosome {
    switch (this.config.mutationMethod) {
      case 'random_reset':
        return this.randomResetMutate(chromosome);
      case 'swap':
        return this.swapMutate(chromosome);
      default:
        return this.randomResetMutate(chromosome);
    }
  }

  /**
   * Generate unique ID from genes
   */
  private generateId(genes: [number, number, number]): string {
    return `${genes[0]}-${genes[1]}-${genes[2]}`;
  }
}
