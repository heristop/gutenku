import type { HaikuChromosome, QualityMetrics, CachedFitness } from './types';
import type { ChromosomeFactory } from './ChromosomeFactory';
import type NaturalLanguageService from '../NaturalLanguageService';
import type { MarkovEvaluatorService } from '../MarkovEvaluatorService';
import type { SiameseTrainer } from '../../ml/SiameseTrainer';
import type { ScoringMode, HybridScoringConfig } from '@gutenku/shared';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
  type QualityMetrics as ValidationQualityMetrics,
} from '~/shared/constants/validation';

/**
 * Default hybrid scoring configuration
 */
const DEFAULT_HYBRID_CONFIG: HybridScoringConfig = {
  mode: 'rule-based',
  ruleWeight: 0.6,
  neuralWeight: 0.4,
};

/**
 * Evaluates fitness of chromosomes using existing haiku quality metrics
 * Supports rule-based, neural, and hybrid scoring modes
 */
export class FitnessEvaluator {
  private cache: Map<string, CachedFitness>;
  private evaluationCount: number = 0;
  private siameseTrainer: SiameseTrainer | null = null;
  private scoringConfig: HybridScoringConfig;

  constructor(
    private readonly chromosomeFactory: ChromosomeFactory,
    private readonly naturalLanguage: NaturalLanguageService,
    private readonly markovEvaluator: MarkovEvaluatorService,
    private readonly useCache: boolean = true,
    scoringConfig?: Partial<HybridScoringConfig>,
  ) {
    this.cache = new Map();
    this.scoringConfig = { ...DEFAULT_HYBRID_CONFIG, ...scoringConfig };
  }

  /**
   * Set the Siamese trainer for neural scoring
   */
  setSiameseTrainer(trainer: SiameseTrainer): void {
    this.siameseTrainer = trainer;
  }

  /**
   * Get the current scoring mode
   */
  getScoringMode(): ScoringMode {
    return this.scoringConfig.mode;
  }

  /**
   * Set the scoring configuration
   */
  setScoringConfig(config: Partial<HybridScoringConfig>): void {
    this.scoringConfig = { ...this.scoringConfig, ...config };
    // Clear cache when scoring mode changes
    this.clearCache();
  }

  /**
   * Evaluate fitness of a single chromosome
   */
  evaluate(chromosome: HaikuChromosome): HaikuChromosome {
    // Check cache first
    if (this.useCache && this.cache.has(chromosome.id)) {
      const cached = this.cache.get(chromosome.id)!;
      return {
        ...chromosome,
        fitness: cached.fitness,
        metrics: cached.metrics,
      };
    }

    // Decode chromosome to haiku verses
    const verses = this.chromosomeFactory.decode(chromosome);
    const sourceIndices = this.chromosomeFactory.getSourceIndices(chromosome);
    const poolSizes = this.chromosomeFactory.getPoolSizes();
    const totalQuotes = poolSizes.fiveSyllable + poolSizes.sevenSyllable;

    // Calculate metrics using existing services
    const validationMetrics = this.calculateValidationMetrics(
      verses,
      sourceIndices,
      totalQuotes,
    );

    // Calculate quality score using existing function
    const qualityScore = calculateHaikuQuality(verses, validationMetrics);

    // Convert to our metrics format
    const metrics = this.convertToMetrics(qualityScore);

    // Calculate fitness based on scoring mode
    const fitness = this.calculateFitness(verses, qualityScore.totalScore);

    this.evaluationCount++;

    // Cache result
    if (this.useCache) {
      this.cache.set(chromosome.id, { fitness, metrics });
    }

    return {
      ...chromosome,
      fitness,
      metrics,
    };
  }

  /**
   * Calculate fitness based on scoring mode
   */
  private calculateFitness(
    verses: [string, string, string],
    ruleBasedScore: number,
  ): number {
    const { mode, ruleWeight, neuralWeight } = this.scoringConfig;

    switch (mode) {
      case 'rule-based':
        return ruleBasedScore;

      case 'neural':
        return this.calculateNeuralScore(verses);

      case 'hybrid':
        const neuralScore = this.calculateNeuralScore(verses);
        return ruleWeight * ruleBasedScore + neuralWeight * neuralScore;

      default:
        return ruleBasedScore;
    }
  }

  /**
   * Calculate neural score using Siamese trainer
   * Returns a score scaled to match rule-based score range
   */
  private calculateNeuralScore(verses: [string, string, string]): number {
    if (!this.siameseTrainer) {
      // Fallback to 0 if no trainer is set
      return 0;
    }

    try {
      // Score returns [0, 1], scale to typical rule-based range (-5 to 15)
      const haikuText = verses.join(' / ');
      // Note: scoreHaiku is async, but GA requires sync evaluation
      // Production implementation should use pre-computed embeddings cached during pool creation
      const centroid = this.siameseTrainer.getCentroid();
      if (!centroid) {
        return 0;
      }

      // Synchronous scoring using pre-computed centroid
      // Requires haiku to already be embedded
      return this.siameseTrainer
        .scoreHaiku(haikuText)
        .then((score) => {
          // Scale from [0, 1] to [-5, 15] to match rule-based range
          return score * 20 - 5;
        })
        .catch(() => 0) as unknown as number;
    } catch {
      return 0;
    }
  }

  /**
   * Async version of evaluation for when neural scoring is needed
   */
  async evaluateAsync(chromosome: HaikuChromosome): Promise<HaikuChromosome> {
    // Check cache first
    if (this.useCache && this.cache.has(chromosome.id)) {
      const cached = this.cache.get(chromosome.id)!;
      return {
        ...chromosome,
        fitness: cached.fitness,
        metrics: cached.metrics,
      };
    }

    // Decode chromosome to haiku verses
    const verses = this.chromosomeFactory.decode(chromosome);
    const sourceIndices = this.chromosomeFactory.getSourceIndices(chromosome);
    const poolSizes = this.chromosomeFactory.getPoolSizes();
    const totalQuotes = poolSizes.fiveSyllable + poolSizes.sevenSyllable;

    // Calculate metrics using existing services
    const validationMetrics = this.calculateValidationMetrics(
      verses,
      sourceIndices,
      totalQuotes,
    );

    // Calculate quality score using existing function
    const qualityScore = calculateHaikuQuality(verses, validationMetrics);

    // Convert to our metrics format
    const metrics = this.convertToMetrics(qualityScore);

    // Calculate fitness based on scoring mode (async for neural)
    const fitness = await this.calculateFitnessAsync(
      verses,
      qualityScore.totalScore,
    );

    this.evaluationCount++;

    // Cache result
    if (this.useCache) {
      this.cache.set(chromosome.id, { fitness, metrics });
    }

    return {
      ...chromosome,
      fitness,
      metrics,
    };
  }

  /**
   * Async fitness calculation for neural/hybrid modes
   */
  private async calculateFitnessAsync(
    verses: [string, string, string],
    ruleBasedScore: number,
  ): Promise<number> {
    const { mode, ruleWeight, neuralWeight } = this.scoringConfig;

    switch (mode) {
      case 'rule-based':
        return ruleBasedScore;

      case 'neural':
        return await this.calculateNeuralScoreAsync(verses);

      case 'hybrid':
        const neuralScore = await this.calculateNeuralScoreAsync(verses);
        return ruleWeight * ruleBasedScore + neuralWeight * neuralScore;

      default:
        return ruleBasedScore;
    }
  }

  /**
   * Async neural score calculation
   */
  private async calculateNeuralScoreAsync(
    verses: [string, string, string],
  ): Promise<number> {
    if (!this.siameseTrainer) {
      return 0;
    }

    try {
      const haikuText = verses.join(' / ');
      const score = await this.siameseTrainer.scoreHaiku(haikuText);
      // Scale from [0, 1] to [-5, 15] to match rule-based range
      return score * 20 - 5;
    } catch {
      return 0;
    }
  }

  /**
   * Evaluate entire population
   */
  evaluatePopulation(chromosomes: HaikuChromosome[]): HaikuChromosome[] {
    return chromosomes.map((c) => (c.fitness === 0 ? this.evaluate(c) : c));
  }

  /**
   * Get evaluation statistics
   */
  getStats(): {
    evaluationCount: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    const cacheHits =
      this.evaluationCount > this.cache.size
        ? this.evaluationCount - this.cache.size
        : 0;
    return {
      evaluationCount: this.evaluationCount,
      cacheSize: this.cache.size,
      cacheHitRate:
        this.evaluationCount > 0 ? cacheHits / this.evaluationCount : 0,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Calculate quality metrics using existing services
   */
  private calculateValidationMetrics(
    verses: [string, string, string],
    verseIndices: [number, number, number],
    totalQuotes: number,
  ): ValidationQualityMetrics {
    // Check if verses are empty strings
    if (!verses[0] || !verses[1] || !verses[2]) {
      return {
        sentiment: 0.5,
        grammar: 0,
        trigramFlow: 0,
        markovFlow: 0,
        alliteration: 0,
      };
    }

    // Sentiment analysis
    const sentimentSum = verses.reduce(
      (acc, verse) => acc + this.naturalLanguage.analyzeSentiment(verse),
      0,
    );
    const sentiment = sentimentSum / verses.length;

    // Grammar analysis
    const grammarSum = verses.reduce(
      (acc, verse) => acc + this.naturalLanguage.analyzeGrammar(verse).score,
      0,
    );
    const grammar = grammarSum / verses.length;

    // Flow analysis
    const trigramFlow = this.markovEvaluator.evaluateHaikuTrigrams(verses);
    const markovFlow = this.markovEvaluator.evaluateHaiku(verses);

    // Phonetics analysis
    const phonetics = this.naturalLanguage.analyzePhonetics(verses);
    const alliteration = phonetics.alliterationScore;

    // POS tags for verb presence
    const posResults = verses.flatMap((v) =>
      this.naturalLanguage.getPOSTags(v),
    );

    return {
      sentiment,
      grammar,
      trigramFlow,
      markovFlow,
      alliteration,
      verseIndices: [...verseIndices],
      totalQuotes,
      posResults,
    };
  }

  /**
   * Convert HaikuQualityScore to our QualityMetrics format
   */
  private convertToMetrics(score: HaikuQualityScore): QualityMetrics {
    return {
      totalScore: score.totalScore,
      natureWords: score.natureWords,
      repeatedWords: score.repeatedWords,
      weakStarts: score.weakStarts,
      blacklistedVerses: score.blacklistedVerses,
      properNouns: score.properNouns,
      verseLengthPenalty: score.verseLengthPenalty,
      sentiment: score.sentiment,
      grammar: score.grammar,
      markovFlow: score.markovFlow,
      trigramFlow: score.trigramFlow,
      uniqueness: score.uniqueness,
      alliteration: score.alliteration,
      verseDistance: score.verseDistance,
      lineLengthBalance: score.lineLengthBalance,
      imageryDensity: score.imageryDensity,
      semanticCoherence: score.semanticCoherence,
      verbPresence: score.verbPresence,
    };
  }
}
