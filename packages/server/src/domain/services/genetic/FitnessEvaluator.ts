import type { HaikuChromosome, QualityMetrics, CachedFitness } from './types';
import type { ChromosomeFactory } from './ChromosomeFactory';
import type NaturalLanguageService from '../NaturalLanguageService';
import type { MarkovEvaluatorService } from '../MarkovEvaluatorService';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
  type QualityMetrics as ValidationQualityMetrics,
} from '~/shared/constants/validation';

/**
 * Evaluates fitness of chromosomes using existing haiku quality metrics
 */
export class FitnessEvaluator {
  private cache: Map<string, CachedFitness>;
  private evaluationCount: number = 0;

  constructor(
    private readonly chromosomeFactory: ChromosomeFactory,
    private readonly naturalLanguage: NaturalLanguageService,
    private readonly markovEvaluator: MarkovEvaluatorService,
    private readonly useCache: boolean = true,
  ) {
    this.cache = new Map();
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
    const fitness = qualityScore.totalScore;

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
