import { describe, it, expect, beforeEach } from 'vitest';
import {
  SeededRandom,
  ChromosomeFactory,
  SelectionOperator,
  CrossoverOperator,
  MutationOperator,
  GeneticAlgorithmService,
  DEFAULT_GA_CONFIG,
  type VersePools,
  type GAConfig,
  type Population,
  type HaikuChromosome,
  type QualityMetrics,
} from '~/domain/services/genetic';
import type NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';

// Mock NaturalLanguageService
const mockNaturalLanguage: Partial<NaturalLanguageService> = {
  analyzeSentiment: () => 0.6,
  analyzeGrammar: () => ({ score: 0.7 }),
  analyzePhonetics: () => ({ alliterationScore: 0.3 }),
  getPOSTags: () => [{ tag: 'NN', token: 'test' }],
};

// Mock MarkovEvaluator
const mockMarkovEvaluator: Partial<MarkovEvaluatorService> = {
  evaluateHaiku: () => 3.5,
  evaluateHaikuTrigrams: () => 2.5,
};

// Helper to create test verse pools
function createTestVersePools(
  fiveCount: number,
  sevenCount: number,
): VersePools {
  return {
    fiveSyllable: Array.from({ length: fiveCount }, (_, i) => ({
      text: `five verse ${i}`,
      syllableCount: 5 as const,
      sourceIndex: i,
    })),
    sevenSyllable: Array.from({ length: sevenCount }, (_, i) => ({
      text: `seven verse ${i}`,
      syllableCount: 7 as const,
      sourceIndex: i + fiveCount,
    })),
    bookId: 'test-book',
    chapterId: 'test-chapter',
  };
}

describe('Genetic Algorithm Components', () => {
  describe('SeededRandom', () => {
    it('should return deterministic values for the same seed', () => {
      const rng1 = new SeededRandom('test-seed');
      const rng2 = new SeededRandom('test-seed');

      const values1 = [rng1.next(), rng1.next(), rng1.next()];
      const values2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(values1).toEqual(values2);
    });

    it('should return different values for different seeds', () => {
      const rng1 = new SeededRandom('seed1');
      const rng2 = new SeededRandom('seed2');

      expect(rng1.next()).not.toEqual(rng2.next());
    });

    it('should return values between 0 and 1', () => {
      const rng = new SeededRandom('test');

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should return integers within the specified range', () => {
      const rng = new SeededRandom('test');

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(5, 10);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(10);
        expect(Number.isInteger(value)).toBeTruthy();
      }
    });

    it('should shuffle arrays deterministically', () => {
      const rng1 = new SeededRandom('shuffle-test');
      const rng2 = new SeededRandom('shuffle-test');

      const array = [1, 2, 3, 4, 5];
      const shuffled1 = rng1.shuffle([...array]);
      const shuffled2 = rng2.shuffle([...array]);

      expect(shuffled1).toEqual(shuffled2);
    });

    it('should sample without replacement', () => {
      const rng = new SeededRandom('sample-test');
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sampled = rng.sample(array, 5);

      expect(sampled).toHaveLength(5);
      expect(new Set(sampled).size).toBe(5); // All unique
      sampled.forEach((v) => expect(array).toContain(v));
    });

    it('should track call count', () => {
      const rng = new SeededRandom('count-test');
      expect(rng.getCallCount()).toBe(0);

      rng.next();
      rng.next();
      rng.nextInt(0, 10);

      expect(rng.getCallCount()).toBe(3);
    });
  });

  describe('ChromosomeFactory', () => {
    let versePools: VersePools;
    let rng: SeededRandom;
    let factory: ChromosomeFactory;

    beforeEach(() => {
      versePools = createTestVersePools(30, 25);
      rng = new SeededRandom('factory-test');
      factory = new ChromosomeFactory(versePools, rng);
    });

    it('should create chromosome with specific genes', () => {
      const chromosome = factory.create([5, 10, 15], 1);

      expect(chromosome.genes).toEqual([5, 10, 15]);
      expect(chromosome.generation).toBe(1);
      expect(chromosome.fitness).toBe(0);
      expect(chromosome.metrics).toBeNull();
    });

    it('should generate unique IDs from genes', () => {
      const c1 = factory.create([1, 2, 3], 0);
      const c2 = factory.create([1, 2, 4], 0);
      const c3 = factory.create([1, 2, 3], 0);

      expect(c1.id).not.toEqual(c2.id);
      expect(c1.id).toEqual(c3.id);
    });

    it('should create random chromosomes', () => {
      const chromosome = factory.createRandom(0);

      expect(chromosome.genes[0]).toBeGreaterThanOrEqual(0);
      expect(chromosome.genes[0]).toBeLessThan(versePools.fiveSyllable.length);
      expect(chromosome.genes[1]).toBeGreaterThanOrEqual(0);
      expect(chromosome.genes[1]).toBeLessThan(versePools.sevenSyllable.length);
      expect(chromosome.genes[2]).toBeGreaterThanOrEqual(0);
      expect(chromosome.genes[2]).toBeLessThan(versePools.fiveSyllable.length);
    });

    it('should clone chromosomes correctly', () => {
      const original = factory.create([1, 2, 3], 0);
      original.fitness = 5.5;
      original.metrics = { totalScore: 5.5 } as QualityMetrics;

      const clone = factory.clone(original, 1);

      expect(clone.genes).toEqual(original.genes);
      expect(clone.generation).toBe(1);
      expect(clone.fitness).toBe(original.fitness);
      expect(clone.metrics).toBe(original.metrics);
    });

    it('should decode chromosomes to verses', () => {
      const chromosome = factory.create([0, 0, 1], 0);
      const verses = factory.decode(chromosome);

      expect(verses).toEqual([
        versePools.fiveSyllable[0].text,
        versePools.sevenSyllable[0].text,
        versePools.fiveSyllable[1].text,
      ]);
    });

    it('should validate chromosome bounds', () => {
      const valid = factory.create([5, 10, 15], 0);
      const invalid = factory.create([100, 10, 15], 0); // 100 > 30 five-syllables

      expect(factory.isValid(valid)).toBeTruthy();
      expect(factory.isValid(invalid)).toBeFalsy();
    });
  });

  describe('SelectionOperator', () => {
    let config: GAConfig;
    let rng: SeededRandom;
    let operator: SelectionOperator;

    beforeEach(() => {
      config = { ...DEFAULT_GA_CONFIG, tournamentSize: 3 };
      rng = new SeededRandom('selection-test');
      operator = new SelectionOperator(config, rng);
    });

    function createTestPopulation(fitnesses: number[]): Population {
      return {
        chromosomes: fitnesses.map((fitness, i) => ({
          id: `chrom-${i}`,
          genes: [i, i, i] as [number, number, number],
          fitness,
          metrics: null,
          generation: 0,
          parentIds: null,
        })),
        generation: 0,
        statistics: {
          bestFitness: Math.max(...fitnesses),
          worstFitness: Math.min(...fitnesses),
          averageFitness:
            fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
          medianFitness: fitnesses.sort()[Math.floor(fitnesses.length / 2)],
          standardDeviation: 0,
          diversity: 1,
          improvementRate: 0,
        },
        history: [],
      };
    }

    it('should select from population using tournament', () => {
      const population = createTestPopulation([1, 5, 3, 8, 2]);

      const selected = operator.tournamentSelect(population);

      expect(population.chromosomes).toContainEqual(selected);
    });

    it('should favor higher fitness in tournament selection', () => {
      const population = createTestPopulation([1, 1, 1, 1, 100]);
      const selections: number[] = [];

      for (let i = 0; i < 100; i++) {
        const selected = operator.tournamentSelect(population);
        selections.push(selected.fitness);
      }

      const avgSelected =
        selections.reduce((a, b) => a + b, 0) / selections.length;
      expect(avgSelected).toBeGreaterThan(20); // Should be heavily biased toward 100
    });

    it('should select using roulette wheel', () => {
      config.selectionMethod = 'roulette';
      operator = new SelectionOperator(config, rng);

      const population = createTestPopulation([1, 5, 3, 8, 2]);
      const selected = operator.rouletteSelect(population);

      expect(population.chromosomes).toContainEqual(selected);
    });

    it('should select using rank selection', () => {
      config.selectionMethod = 'rank';
      operator = new SelectionOperator(config, rng);

      const population = createTestPopulation([1, 5, 3, 8, 2]);
      const selected = operator.rankSelect(population);

      expect(population.chromosomes).toContainEqual(selected);
    });
  });

  describe('CrossoverOperator', () => {
    let config: GAConfig;
    let rng: SeededRandom;
    let versePools: VersePools;
    let factory: ChromosomeFactory;
    let operator: CrossoverOperator;

    beforeEach(() => {
      config = { ...DEFAULT_GA_CONFIG, crossoverRate: 1 }; // Always crossover
      rng = new SeededRandom('crossover-test');
      versePools = createTestVersePools(30, 25);
      factory = new ChromosomeFactory(versePools, rng);
      operator = new CrossoverOperator(config, rng, factory);
    });

    it('should produce two children from two parents', () => {
      const parent1 = factory.create([1, 2, 3], 0);
      const parent2 = factory.create([4, 5, 6], 0);

      const [child1, child2] = operator.crossover(parent1, parent2, 1);

      expect(child1.generation).toBe(1);
      expect(child2.generation).toBe(1);
    });

    it('should combine genes from both parents in single-point crossover', () => {
      config.crossoverMethod = 'single_point';
      operator = new CrossoverOperator(config, rng, factory);

      const parent1 = factory.create([1, 1, 1], 0);
      const parent2 = factory.create([9, 9, 9], 0);

      const [child1, child2] = operator.singlePointCrossover(
        parent1,
        parent2,
        1,
      );

      // Children should have genes from both parents
      const allGenes = [...child1.genes, ...child2.genes];
      expect(allGenes).toContain(1);
      expect(allGenes).toContain(9);
    });

    it('should skip crossover when rate is 0', () => {
      config.crossoverRate = 0;
      operator = new CrossoverOperator(config, rng, factory);

      const parent1 = factory.create([1, 2, 3], 0);
      const parent2 = factory.create([4, 5, 6], 0);

      const [child1, child2] = operator.crossover(parent1, parent2, 1);

      // Should return clones when no crossover
      expect(child1.genes).toEqual(parent1.genes);
      expect(child2.genes).toEqual(parent2.genes);
    });
  });

  describe('MutationOperator', () => {
    let config: GAConfig;
    let rng: SeededRandom;
    let versePools: VersePools;
    let operator: MutationOperator;

    beforeEach(() => {
      config = { ...DEFAULT_GA_CONFIG, mutationRate: 1 }; // Always mutate
      rng = new SeededRandom('mutation-test');
      versePools = createTestVersePools(30, 25);
      operator = new MutationOperator(config, rng, versePools);
    });

    it('should mutate genes when rate is 1.0', () => {
      const chromosome: HaikuChromosome = {
        id: '1-2-3',
        genes: [1, 2, 3],
        fitness: 5,
        metrics: null,
        generation: 0,
        parentIds: null,
      };

      const mutated = operator.randomResetMutate(chromosome);

      // At least one gene should be different with 100% mutation rate
      const genesChanged = mutated.genes.some(
        (g, i) => g !== chromosome.genes[i],
      );
      expect(genesChanged).toBeTruthy();
    });

    it('should not mutate when rate is 0', () => {
      config.mutationRate = 0;
      operator = new MutationOperator(config, rng, versePools);

      const chromosome: HaikuChromosome = {
        id: '1-2-3',
        genes: [1, 2, 3],
        fitness: 5,
        metrics: null,
        generation: 0,
        parentIds: null,
      };

      const mutated = operator.mutate(chromosome);

      expect(mutated.genes).toEqual(chromosome.genes);
    });

    it('should swap genes in swap mutation', () => {
      const chromosome: HaikuChromosome = {
        id: '1-2-3',
        genes: [1, 2, 3],
        fitness: 5,
        metrics: null,
        generation: 0,
        parentIds: null,
      };

      const mutated = operator.swapMutate(chromosome);

      // Swap mutation swaps gene[0] and gene[2]
      expect(mutated.genes[0]).toBe(3);
      expect(mutated.genes[1]).toBe(2);
      expect(mutated.genes[2]).toBe(1);
    });

    it('should reset fitness and metrics after mutation', () => {
      const chromosome: HaikuChromosome = {
        id: '1-2-3',
        genes: [1, 2, 3],
        fitness: 5,
        metrics: { totalScore: 5 } as QualityMetrics,
        generation: 0,
        parentIds: null,
      };

      const mutated = operator.mutate(chromosome);

      expect(mutated.fitness).toBe(0);
      expect(mutated.metrics).toBeNull();
    });
  });

  describe('GeneticAlgorithmService', () => {
    it('should fall back to random sampling when pools are too small', async () => {
      const smallPools = createTestVersePools(3, 3); // Below minimum threshold (5 five-syllable, 4 seven-syllable)

      const service = new GeneticAlgorithmService(
        mockNaturalLanguage as unknown as NaturalLanguageService,
        mockMarkovEvaluator as unknown as MarkovEvaluatorService,
        { returnCount: 3 },
      );

      const result = await service.evolve(smallPools);

      // Should still return results via fallback
      expect(result.topCandidates.length).toBe(3);
      expect(result.convergenceGeneration).toBe(0); // Fallback indicator
    });

    it('should evolve population over generations', async () => {
      const versePools = createTestVersePools(50, 40);

      const service = new GeneticAlgorithmService(
        mockNaturalLanguage as unknown as NaturalLanguageService,
        mockMarkovEvaluator as unknown as MarkovEvaluatorService,
        {
          populationSize: 20,
          maxGenerations: 10,
          returnCount: 3,
          seed: 'evolution-test',
        },
      );

      const result = await service.evolve(versePools);

      expect(result.topCandidates.length).toBe(3);
      expect(result.finalPopulation.generation).toBeGreaterThan(0);
      expect(result.totalEvaluations).toBeGreaterThan(0);
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });

    it('should be deterministic with the same seed', async () => {
      const versePools = createTestVersePools(50, 40);
      const config = {
        populationSize: 15,
        maxGenerations: 5,
        returnCount: 3,
        seed: 'deterministic-test',
      };

      const service1 = new GeneticAlgorithmService(
        mockNaturalLanguage as unknown as NaturalLanguageService,
        mockMarkovEvaluator as unknown as MarkovEvaluatorService,
        config,
      );

      const service2 = new GeneticAlgorithmService(
        mockNaturalLanguage as unknown as NaturalLanguageService,
        mockMarkovEvaluator as unknown as MarkovEvaluatorService,
        config,
      );

      const result1 = await service1.evolve(versePools);
      const result2 = await service2.evolve(versePools);

      expect(result1.topCandidates[0].chromosomeId).toBe(
        result2.topCandidates[0].chromosomeId,
      );
    });

    it('should return decoded haikus with verses', async () => {
      const versePools = createTestVersePools(30, 25);

      const service = new GeneticAlgorithmService(
        mockNaturalLanguage as unknown as NaturalLanguageService,
        mockMarkovEvaluator as unknown as MarkovEvaluatorService,
        {
          populationSize: 10,
          maxGenerations: 3,
          returnCount: 2,
        },
      );

      const result = await service.evolve(versePools);

      result.topCandidates.forEach((candidate) => {
        expect(candidate.verses).toHaveLength(3);
        expect(typeof candidate.verses[0]).toBe('string');
        expect(typeof candidate.verses[1]).toBe('string');
        expect(typeof candidate.verses[2]).toBe('string');
        expect(typeof candidate.fitness).toBe('number');
      });
    });
  });
});
