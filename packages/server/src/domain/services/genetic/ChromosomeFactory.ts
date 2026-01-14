import type { HaikuChromosome, VersePools } from './types';
import type { SeededRandom } from './utils/SeededRandom';

/**
 * Factory for creating and manipulating chromosomes
 */
export class ChromosomeFactory {
  constructor(
    private readonly versePools: VersePools,
    private readonly rng: SeededRandom,
  ) {}

  /**
   * Create chromosome with specific genes
   */
  create(
    genes: [number, number, number],
    generation: number,
    parentIds?: [string, string],
  ): HaikuChromosome {
    return {
      id: this.generateId(genes),
      genes,
      fitness: 0,
      metrics: null,
      generation,
      parentIds: parentIds ?? null,
    };
  }

  /**
   * Create random chromosome
   */
  createRandom(generation: number): HaikuChromosome {
    const genes: [number, number, number] = [
      this.rng.nextInt(0, this.versePools.fiveSyllable.length),
      this.rng.nextInt(0, this.versePools.sevenSyllable.length),
      this.rng.nextInt(0, this.versePools.fiveSyllable.length),
    ];

    return this.create(genes, generation);
  }

  /**
   * Clone chromosome for next generation
   */
  clone(chromosome: HaikuChromosome, generation: number): HaikuChromosome {
    return {
      ...chromosome,
      generation,
      parentIds: [chromosome.id, chromosome.id],
    };
  }

  /**
   * Decode chromosome to haiku verses
   */
  decode(chromosome: HaikuChromosome): [string, string, string] {
    return [
      this.versePools.fiveSyllable[chromosome.genes[0]].text,
      this.versePools.sevenSyllable[chromosome.genes[1]].text,
      this.versePools.fiveSyllable[chromosome.genes[2]].text,
    ];
  }

  /**
   * Get verse indices for distance calculation
   */
  getSourceIndices(chromosome: HaikuChromosome): [number, number, number] {
    return [
      this.versePools.fiveSyllable[chromosome.genes[0]].sourceIndex,
      this.versePools.sevenSyllable[chromosome.genes[1]].sourceIndex,
      this.versePools.fiveSyllable[chromosome.genes[2]].sourceIndex,
    ];
  }

  /**
   * Check if chromosome is valid (genes within bounds)
   */
  isValid(chromosome: HaikuChromosome): boolean {
    const [g0, g1, g2] = chromosome.genes;
    return (
      g0 >= 0 &&
      g0 < this.versePools.fiveSyllable.length &&
      g1 >= 0 &&
      g1 < this.versePools.sevenSyllable.length &&
      g2 >= 0 &&
      g2 < this.versePools.fiveSyllable.length
    );
  }

  /**
   * Get pool sizes
   */
  getPoolSizes(): { fiveSyllable: number; sevenSyllable: number } {
    return {
      fiveSyllable: this.versePools.fiveSyllable.length,
      sevenSyllable: this.versePools.sevenSyllable.length,
    };
  }

  /**
   * Generate unique ID from genes
   */
  private generateId(genes: [number, number, number]): string {
    return `${genes[0]}-${genes[1]}-${genes[2]}`;
  }
}
