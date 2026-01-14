import type { GAConfig, HaikuChromosome, Population } from '../types';
import type { SeededRandom } from '../utils/SeededRandom';

/**
 * Selection operator for choosing parents
 */
export class SelectionOperator {
  constructor(
    private readonly config: GAConfig,
    private readonly rng: SeededRandom,
  ) {}

  /**
   * Tournament selection: Pick k random individuals, return best
   */
  tournamentSelect(population: Population): HaikuChromosome {
    const { tournamentSize } = this.config;
    const { chromosomes } = population;

    let best: HaikuChromosome | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = this.rng.nextInt(0, chromosomes.length);
      const candidate = chromosomes[idx];

      if (!best || candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best!;
  }

  /**
   * Roulette wheel selection: Probability proportional to fitness
   */
  rouletteSelect(population: Population): HaikuChromosome {
    const { chromosomes } = population;

    // Handle negative fitness values by shifting
    const minFitness = Math.min(...chromosomes.map((c) => c.fitness));
    const shift = minFitness < 0 ? Math.abs(minFitness) + 1 : 0;

    const totalFitness = chromosomes.reduce(
      (sum, c) => sum + c.fitness + shift,
      0,
    );

    const threshold = this.rng.next() * totalFitness;
    let cumulative = 0;

    for (const chromosome of chromosomes) {
      cumulative += chromosome.fitness + shift;
      if (cumulative >= threshold) {
        return chromosome;
      }
    }

    return chromosomes.at(-1);
  }

  /**
   * Rank selection: Probability based on rank, not raw fitness
   */
  rankSelect(population: Population): HaikuChromosome {
    const { chromosomes } = population;

    // Sort by fitness (worst to best)
    const sorted = [...chromosomes].sort((a, b) => a.fitness - b.fitness);

    // Assign ranks (1 = worst, n = best)
    const n = sorted.length;
    const totalRank = (n * (n + 1)) / 2;

    const threshold = this.rng.next() * totalRank;
    let cumulative = 0;

    for (let i = 0; i < n; i++) {
      cumulative += i + 1;
      if (cumulative >= threshold) {
        return sorted[i];
      }
    }

    return sorted[n - 1];
  }

  /**
   * Main selection method dispatcher
   */
  select(population: Population): HaikuChromosome {
    switch (this.config.selectionMethod) {
      case 'tournament':
        return this.tournamentSelect(population);
      case 'roulette':
        return this.rouletteSelect(population);
      case 'rank':
        return this.rankSelect(population);
      default:
        return this.tournamentSelect(population);
    }
  }
}
