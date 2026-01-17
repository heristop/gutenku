import type NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import {
  countRepeatedWords,
  hasWeakStart,
  calculateWordUniqueness,
  calculateVerseDistance,
  calculateLineLengthBalance,
  calculateImageryDensity,
  calculateSemanticCoherence,
  calculateVerbPresence,
  VERSE_MAX_LENGTH,
} from '~/shared/constants/validation';
import type {
  ScoreThresholds,
  QuoteCandidate,
  RejectionStats,
} from './HaikuGeneratorTypes';

export class HaikuValidatorService {
  private sentimentCache = new Map<string, number>();
  private rejectionStats: RejectionStats = this.createEmptyStats();

  constructor(
    private readonly naturalLanguage: NaturalLanguageService,
    private readonly markovEvaluator: MarkovEvaluatorService,
  ) {}

  private createEmptyStats(): RejectionStats {
    return {
      sentiment: 0,
      markov: 0,
      grammar: 0,
      trigram: 0,
      tfidf: 0,
      phonetics: 0,
      uniqueness: 0,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
      basic: 0,
      total: 0,
    };
  }

  getRejectionStats(): RejectionStats {
    return { ...this.rejectionStats };
  }

  resetRejectionStats(): void {
    this.rejectionStats = this.createEmptyStats();
  }

  clearCache(): void {
    this.sentimentCache.clear();
  }

  isQuoteValidForVerse(
    candidate: QuoteCandidate,
    isFirstVerse: boolean,
    selectedVerses: QuoteCandidate[],
    thresholds: ScoreThresholds,
  ): boolean {
    const quote = candidate.quote.replaceAll('\n', ' ');

    if (!this.passesBasicValidation(quote, isFirstVerse, thresholds)) {
      return false;
    }

    if (!this.passesScoreValidation(quote, thresholds)) {
      return false;
    }

    if (selectedVerses.length > 0) {
      return this.passesSequenceValidation(
        quote,
        candidate.index,
        selectedVerses,
        thresholds,
      );
    }
    return true;
  }

  passesBasicValidation(
    quote: string,
    isFirstVerse: boolean,
    thresholds: ScoreThresholds,
  ): boolean {
    if (isFirstVerse && this.naturalLanguage.startWithConjunction(quote)) {
      this.rejectionStats.basic++;
      this.rejectionStats.total++;
      return false;
    }

    if (this.isQuoteInvalid(quote)) {
      this.rejectionStats.basic++;
      this.rejectionStats.total++;
      return false;
    }

    if (!thresholds.allowWeakStart && hasWeakStart(quote)) {
      this.rejectionStats.basic++;
      this.rejectionStats.total++;
      return false;
    }
    return true;
  }

  private getCachedSentiment(quote: string): number {
    let score = this.sentimentCache.get(quote);

    if (score === undefined) {
      score = this.naturalLanguage.analyzeSentiment(quote);
      this.sentimentCache.set(quote, score);
    }
    return score;
  }

  passesScoreValidation(quote: string, thresholds: ScoreThresholds): boolean {
    const sentimentScore = this.getCachedSentiment(quote);

    if (sentimentScore < thresholds.sentiment) {
      this.rejectionStats.sentiment++;
      this.rejectionStats.total++;
      return false;
    }

    if (thresholds.pos > 0) {
      const grammarAnalysis = this.naturalLanguage.analyzeGrammar(quote);
      if (grammarAnalysis.score < thresholds.pos) {
        this.rejectionStats.grammar++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.tfidf > 0) {
      const tfidfScore = this.naturalLanguage.scoreDistinctiveness(quote);
      if (tfidfScore < thresholds.tfidf) {
        this.rejectionStats.tfidf++;
        this.rejectionStats.total++;
        return false;
      }
    }

    return true;
  }

  passesSequenceValidation(
    quote: string,
    index: number,
    selectedVerses: QuoteCandidate[],
    thresholds: ScoreThresholds,
  ): boolean {
    const lastVerseIndex = selectedVerses.at(-1)!.index;

    if (index <= lastVerseIndex) {
      return false;
    }

    const quotesToEvaluate = [...selectedVerses.map((v) => v.quote), quote];

    if (thresholds.maxRepeatedWords > 0) {
      const repeatedCount = countRepeatedWords(quotesToEvaluate);
      if (repeatedCount > thresholds.maxRepeatedWords) {
        return false;
      }
    }

    const markovScore = this.markovEvaluator.evaluateHaiku(quotesToEvaluate);

    if (markovScore < thresholds.markov) {
      this.rejectionStats.markov++;
      this.rejectionStats.total++;
      return false;
    }

    if (thresholds.trigram > 0) {
      const trigramScore =
        this.markovEvaluator.evaluateHaikuTrigrams(quotesToEvaluate);
      if (trigramScore < thresholds.trigram) {
        this.rejectionStats.trigram++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.phonetics > 0) {
      const phoneticsAnalysis =
        this.naturalLanguage.analyzePhonetics(quotesToEvaluate);
      if (phoneticsAnalysis.alliterationScore < thresholds.phonetics) {
        this.rejectionStats.phonetics++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (quotesToEvaluate.length === 3 && thresholds.uniqueness > 0) {
      const uniqueness = calculateWordUniqueness(quotesToEvaluate);
      if (uniqueness < thresholds.uniqueness) {
        this.rejectionStats.uniqueness++;
        this.rejectionStats.total++;
        return false;
      }
    }

    return true;
  }

  passesFullHaikuFilters(
    verses: string[],
    indices: number[],
    totalQuotes: number,
    thresholds: ScoreThresholds,
  ): boolean {
    if (thresholds.verseDistance > 0) {
      const distance = calculateVerseDistance(indices, totalQuotes);
      if (distance < thresholds.verseDistance) {
        this.rejectionStats.verseDistance++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.lineLengthBalance > 0) {
      const balance = calculateLineLengthBalance(verses);
      if (balance < thresholds.lineLengthBalance) {
        this.rejectionStats.lineLengthBalance++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.imageryDensity > 0) {
      const density = calculateImageryDensity(verses);
      if (density < thresholds.imageryDensity) {
        this.rejectionStats.imageryDensity++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.semanticCoherence > 0) {
      const coherence = calculateSemanticCoherence(verses);
      if (coherence < thresholds.semanticCoherence) {
        this.rejectionStats.semanticCoherence++;
        this.rejectionStats.total++;
        return false;
      }
    }

    if (thresholds.verbPresence > 0) {
      const posResults = verses.flatMap((v) =>
        this.naturalLanguage.getPOSTags(v),
      );
      const presence = calculateVerbPresence(posResults);
      if (presence < thresholds.verbPresence) {
        this.rejectionStats.verbPresence++;
        this.rejectionStats.total++;
        return false;
      }
    }

    return true;
  }

  isQuoteInvalid(quote: string): boolean {
    if (this.naturalLanguage.hasUpperCaseWords(quote)) {
      return true;
    }

    if (this.naturalLanguage.hasBlacklistedCharsInQuote(quote)) {
      return true;
    }

    if (quote.length >= VERSE_MAX_LENGTH) {
      return true;
    }
    return false;
  }
}
