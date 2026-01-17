import type {
  GAConfig,
  VersePools,
  EvolutionResult,
  EvolutionProgress,
  DecodedHaiku,
  HaikuChromosome,
} from './types';
import {
  DEFAULT_GA_CONFIG,
  MIN_FIVE_SYLLABLE_POOL,
  MIN_SEVEN_SYLLABLE_POOL,
  MAX_EVALUATIONS,
  MAX_EVOLUTION_TIME_MS,
} from './constants';
import { SeededRandom } from './utils/SeededRandom';
import { ChromosomeFactory } from './ChromosomeFactory';
import { FitnessEvaluator } from './FitnessEvaluator';
import { PopulationManager } from './PopulationManager';
import {
  SelectionOperator,
  CrossoverOperator,
  MutationOperator,
} from './operators';
import type NaturalLanguageService from '../NaturalLanguageService';
import type { MarkovEvaluatorService } from '../MarkovEvaluatorService';
import type { EvolutionDataCollector } from '~/infrastructure/ml/EvolutionDataCollector';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('GeneticAlgorithmService');

/**
 * Genetic algorithm service for haiku verse selection
 */
export class GeneticAlgorithmService {
  private readonly config: GAConfig;
  private dataCollector: EvolutionDataCollector | null = null;

  constructor(
    private readonly naturalLanguage: NaturalLanguageService,
    private readonly markovEvaluator: MarkovEvaluatorService,
    config: Partial<GAConfig> = {},
  ) {
    this.config = { ...DEFAULT_GA_CONFIG, ...config };
  }

  /**
   * Set the evolution data collector for ML training
   */
  setDataCollector(collector: EvolutionDataCollector): void {
    this.dataCollector = collector;
  }

  /**
   * Get the current data collector
   */
  getDataCollector(): EvolutionDataCollector | null {
    return this.dataCollector;
  }

  /**
   * Run genetic algorithm evolution on verse pools
   */
  async evolve(versePools: VersePools): Promise<EvolutionResult> {
    const startTime = Date.now();

    // Validate pools
    if (!this.validatePools(versePools)) {
      log.warn(
        {
          fiveCount: versePools.fiveSyllable.length,
          sevenCount: versePools.sevenSyllable.length,
        },
        'Pools too small for GA, falling back to random sampling',
      );
      return this.fallbackRandomSampling(versePools, startTime);
    }

    // Initialize components
    const rng = new SeededRandom(this.config.seed);
    const chromosomeFactory = new ChromosomeFactory(versePools, rng);
    const fitnessEvaluator = new FitnessEvaluator(
      chromosomeFactory,
      this.naturalLanguage,
      this.markovEvaluator,
      this.config.cacheEvaluations,
    );
    const selectionOperator = new SelectionOperator(this.config, rng);
    const crossoverOperator = new CrossoverOperator(
      this.config,
      rng,
      chromosomeFactory,
    );
    const mutationOperator = new MutationOperator(this.config, rng, versePools);
    const populationManager = new PopulationManager(
      this.config,
      chromosomeFactory,
      fitnessEvaluator,
      selectionOperator,
      crossoverOperator,
      mutationOperator,
    );

    // Initialize population
    log.debug(
      {
        populationSize: this.config.populationSize,
        poolSizes: {
          fiveSyllable: versePools.fiveSyllable.length,
          sevenSyllable: versePools.sevenSyllable.length,
        },
      },
      'Initializing GA population',
    );

    let population = populationManager.initialize();
    let convergenceGeneration = this.config.maxGenerations;

    // Data collection: create decoder function for the collector
    const decodeChromosome = (c: HaikuChromosome): [string, string, string] =>
      chromosomeFactory.decode(c);

    // Start data collection run if collector is set
    if (this.dataCollector) {
      this.dataCollector.startRun();
      this.dataCollector.trackGeneration(population, decodeChromosome);
    }

    // Evolution loop
    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      // Check termination conditions
      if (populationManager.hasConverged(population)) {
        log.debug({ generation: gen }, 'Population converged');
        convergenceGeneration = gen;
        break;
      }

      const evalStats = fitnessEvaluator.getStats();
      if (evalStats.evaluationCount >= MAX_EVALUATIONS) {
        log.warn(
          { evaluations: evalStats.evaluationCount },
          'Max evaluations reached',
        );
        convergenceGeneration = gen;
        break;
      }

      // Check time limit
      if (Date.now() - startTime >= MAX_EVOLUTION_TIME_MS) {
        log.warn({ elapsedMs: Date.now() - startTime }, 'Time limit reached');
        convergenceGeneration = gen;
        break;
      }

      // Evolve to next generation
      population = populationManager.evolve(population);

      // Track evolution data if collector is set
      if (this.dataCollector) {
        this.dataCollector.trackGeneration(population, decodeChromosome);
      }

      // Log progress
      if (gen % 5 === 0 || gen === this.config.maxGenerations - 1) {
        log.debug(
          {
            generation: gen,
            bestFitness: population.statistics.bestFitness.toFixed(2),
            avgFitness: population.statistics.averageFitness.toFixed(2),
            diversity: population.statistics.diversity.toFixed(2),
          },
          'Generation complete',
        );
      }
    }

    // Finalize data collection if collector is set
    if (this.dataCollector) {
      this.dataCollector.finalizeRun(population, decodeChromosome);
      log.debug(
        { stats: this.dataCollector.getStatistics() },
        'Evolution data collected',
      );
    }

    // Extract top candidates
    const topChromosomes = populationManager.getTopChromosomes(
      population,
      this.config.returnCount,
    );

    const topCandidates: DecodedHaiku[] = topChromosomes.map((c) => ({
      verses: chromosomeFactory.decode(c),
      metrics: c.metrics!,
      fitness: c.fitness,
      chromosomeId: c.id,
    }));

    const evalStats = fitnessEvaluator.getStats();
    const executionTimeMs = Date.now() - startTime;

    log.info(
      {
        generations: population.generation,
        convergenceGeneration,
        bestFitness: population.statistics.bestFitness.toFixed(2),
        totalEvaluations: evalStats.evaluationCount,
        cacheHitRate: evalStats.cacheHitRate.toFixed(2),
        executionTimeMs,
      },
      'GA evolution complete',
    );

    return {
      topCandidates,
      finalPopulation: population,
      convergenceGeneration,
      totalEvaluations: evalStats.evaluationCount,
      executionTimeMs,
    };
  }

  /**
   * Evolution with progress generator - yields after each generation
   * Provides real-time progress updates during evolution
   */
  *evolveWithProgress(
    versePools: VersePools,
  ): Generator<EvolutionProgress, EvolutionResult> {
    const startTime = Date.now();

    // Validate pools - if too small, yield single fallback result
    if (!this.validatePools(versePools)) {
      log.warn(
        {
          fiveCount: versePools.fiveSyllable.length,
          sevenCount: versePools.sevenSyllable.length,
        },
        'Pools too small for GA, falling back to random sampling',
      );
      const fallbackResult = this.fallbackRandomSampling(versePools, startTime);
      yield {
        generation: 1,
        maxGenerations: 1,
        bestHaiku: fallbackResult.topCandidates[0],
        bestFitness: fallbackResult.topCandidates[0].fitness,
        averageFitness: fallbackResult.topCandidates[0].fitness,
        diversity: 1,
        isComplete: true,
      };
      return fallbackResult;
    }

    // Initialize components
    const rng = new SeededRandom(this.config.seed);
    const chromosomeFactory = new ChromosomeFactory(versePools, rng);
    const fitnessEvaluator = new FitnessEvaluator(
      chromosomeFactory,
      this.naturalLanguage,
      this.markovEvaluator,
      this.config.cacheEvaluations,
    );
    const selectionOperator = new SelectionOperator(this.config, rng);
    const crossoverOperator = new CrossoverOperator(
      this.config,
      rng,
      chromosomeFactory,
    );
    const mutationOperator = new MutationOperator(this.config, rng, versePools);
    const populationManager = new PopulationManager(
      this.config,
      chromosomeFactory,
      fitnessEvaluator,
      selectionOperator,
      crossoverOperator,
      mutationOperator,
    );

    // Initialize population
    log.debug(
      {
        populationSize: this.config.populationSize,
        poolSizes: {
          fiveSyllable: versePools.fiveSyllable.length,
          sevenSyllable: versePools.sevenSyllable.length,
        },
      },
      'Initializing GA population for progressive evolution',
    );

    let population = populationManager.initialize();
    let convergenceGeneration = this.config.maxGenerations;

    // Data collection: create decoder function for the collector
    const decodeChromosome = (c: HaikuChromosome): [string, string, string] =>
      chromosomeFactory.decode(c);

    // Start data collection run if collector is set
    if (this.dataCollector) {
      this.dataCollector.startRun();
      this.dataCollector.trackGeneration(population, decodeChromosome);
    }

    // Evolution loop with progress yields
    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      // Check termination conditions
      const hasConverged = populationManager.hasConverged(population);
      const evalStats = fitnessEvaluator.getStats();
      const maxEvalsReached = evalStats.evaluationCount >= MAX_EVALUATIONS;
      const timeLimitReached = Date.now() - startTime >= MAX_EVOLUTION_TIME_MS;
      const isLastGeneration = gen >= this.config.maxGenerations - 1;

      const isComplete =
        hasConverged || maxEvalsReached || timeLimitReached || isLastGeneration;

      if (hasConverged || maxEvalsReached || timeLimitReached) {
        convergenceGeneration = gen;
      }

      // Get best chromosome for progress update
      const bestChromosome = populationManager.getTopChromosomes(
        population,
        1,
      )[0];
      const bestHaiku: DecodedHaiku = {
        verses: chromosomeFactory.decode(bestChromosome),
        metrics: bestChromosome.metrics!,
        fitness: bestChromosome.fitness,
        chromosomeId: bestChromosome.id,
      };

      // Determine stop reason
      const getStopReason = (): EvolutionProgress['stopReason'] => {
        if (hasConverged) {
          return 'converged';
        }
        if (maxEvalsReached) {
          return 'max_evaluations';
        }
        if (timeLimitReached) {
          return 'time_limit';
        }
        if (isLastGeneration) {
          return 'completed';
        }
        return undefined;
      };
      const stopReason = getStopReason();

      // Yield progress
      yield {
        generation: gen + 1,
        maxGenerations: this.config.maxGenerations,
        bestHaiku,
        bestFitness: population.statistics.bestFitness,
        averageFitness: population.statistics.averageFitness,
        diversity: population.statistics.diversity,
        isComplete,
        stopReason,
      };

      if (isComplete) {
        break;
      }

      // Evolve to next generation
      population = populationManager.evolve(population);

      // Track evolution data if collector is set
      if (this.dataCollector) {
        this.dataCollector.trackGeneration(population, decodeChromosome);
      }
    }

    // Finalize data collection if collector is set
    if (this.dataCollector) {
      this.dataCollector.finalizeRun(population, decodeChromosome);
      log.debug(
        { stats: this.dataCollector.getStatistics() },
        'Evolution data collected (progressive)',
      );
    }

    // Extract top candidates for final result
    const topChromosomes = populationManager.getTopChromosomes(
      population,
      this.config.returnCount,
    );

    const topCandidates: DecodedHaiku[] = topChromosomes.map((c) => ({
      verses: chromosomeFactory.decode(c),
      metrics: c.metrics!,
      fitness: c.fitness,
      chromosomeId: c.id,
    }));

    const evalStats = fitnessEvaluator.getStats();
    const executionTimeMs = Date.now() - startTime;

    log.info(
      {
        generations: population.generation,
        convergenceGeneration,
        bestFitness: population.statistics.bestFitness.toFixed(2),
        totalEvaluations: evalStats.evaluationCount,
        executionTimeMs,
      },
      'Progressive GA evolution complete',
    );

    return {
      topCandidates,
      finalPopulation: population,
      convergenceGeneration,
      totalEvaluations: evalStats.evaluationCount,
      executionTimeMs,
    };
  }

  /**
   * Validate verse pools have minimum required sizes
   */
  private validatePools(versePools: VersePools): boolean {
    return (
      versePools.fiveSyllable.length >= MIN_FIVE_SYLLABLE_POOL &&
      versePools.sevenSyllable.length >= MIN_SEVEN_SYLLABLE_POOL
    );
  }

  /**
   * Fallback when GA cannot run (pools too small)
   */
  private fallbackRandomSampling(
    versePools: VersePools,
    startTime: number,
  ): EvolutionResult {
    const rng = new SeededRandom(this.config.seed);
    const chromosomeFactory = new ChromosomeFactory(versePools, rng);
    const fitnessEvaluator = new FitnessEvaluator(
      chromosomeFactory,
      this.naturalLanguage,
      this.markovEvaluator,
      false,
    );

    const candidates: DecodedHaiku[] = [];

    for (let i = 0; i < this.config.returnCount; i++) {
      const chromosome = chromosomeFactory.createRandom(0);
      const evaluated = fitnessEvaluator.evaluate(chromosome);

      candidates.push({
        verses: chromosomeFactory.decode(evaluated),
        metrics: evaluated.metrics!,
        fitness: evaluated.fitness,
        chromosomeId: `fallback-${i}`,
      });
    }

    // Sort by fitness descending
    candidates.sort((a, b) => b.fitness - a.fitness);

    return {
      topCandidates: candidates,
      finalPopulation: {
        chromosomes: [],
        generation: 0,
        statistics: {
          bestFitness: candidates[0]?.fitness ?? 0,
          worstFitness: candidates.at(-1)?.fitness ?? 0,
          averageFitness:
            candidates.reduce((a, c) => a + c.fitness, 0) / candidates.length,
          medianFitness:
            candidates[Math.floor(candidates.length / 2)]?.fitness ?? 0,
          standardDeviation: 0,
          diversity: 1,
          improvementRate: 0,
        },
        history: [],
      },
      convergenceGeneration: 0,
      totalEvaluations: this.config.returnCount,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
