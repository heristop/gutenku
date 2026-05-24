import { syllable } from 'syllable';
import { createLogger } from '~/infrastructure/services/Logger';
import type NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import type { HaikuValidatorService } from '~/domain/services/HaikuValidatorService';
import {
  MIN_QUOTES_THRESHOLD,
  type QualityMetrics,
} from '~/shared/constants/validation';
import type { ExtractionMethod } from '~/shared/types';
import type { QuoteCandidate, ScoreThresholds } from './HaikuGeneratorTypes';
import type { VersePools, VerseCandidate } from './genetic/types';

const log = createLogger('haiku');

/**
 * Keep only quotes whose syllable count is exactly 5 or 7.
 */
export function filterQuotesCountingSyllables(
  naturalLanguage: NaturalLanguageService,
  quotes: { quote: string; index: number }[],
): QuoteCandidate[] {
  const filtered: QuoteCandidate[] = [];

  for (const { quote, index } of quotes) {
    const words = naturalLanguage.extractWords(quote);

    if (!words) {
      continue;
    }
    const syllableCount = words.reduce((c, w) => c + syllable(w), 0);

    if (syllableCount === 5 || syllableCount === 7) {
      filtered.push({ quote, index, syllableCount });
    }
  }

  return filtered;
}

/**
 * Validate a quote produced by the "chunk" extractor: it must read like a
 * grammatical sentence and must not contain mid-sentence capitalised words
 * (a heuristic for proper nouns / sentence boundaries).
 */
export function isValidChunkQuote(
  naturalLanguage: NaturalLanguageService,
  quote: string,
): boolean {
  const grammar = naturalLanguage.analyzeGrammar(quote);

  if (grammar.score < 0.5) {
    return false;
  }

  const words = quote.split(/\s+/);

  for (let i = 1; i < words.length; i++) {
    if (words[i] && /^[A-Z]/.test(words[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Split syllable-classified quotes into 5- and 7-syllable verse pools.
 */
export function quotesToVersePools(
  quotes: QuoteCandidate[],
  bookId: string,
  chapterId: string,
): VersePools {
  const fiveSyllable: VerseCandidate[] = [];
  const sevenSyllable: VerseCandidate[] = [];

  for (const candidate of quotes) {
    const verseCandidate: VerseCandidate = {
      text: candidate.quote,
      syllableCount: candidate.syllableCount as 5 | 7,
      sourceIndex: candidate.index,
    };

    if (candidate.syllableCount === 5) {
      fiveSyllable.push(verseCandidate);
      continue;
    }

    if (candidate.syllableCount === 7) {
      sevenSyllable.push(verseCandidate);
    }
  }

  return {
    fiveSyllable,
    sevenSyllable,
    bookId,
    chapterId,
  };
}

/**
 * Extract candidate quotes from chapter content, trying each extraction
 * method until one yields enough syllable-valid quotes. Returns the matching
 * quotes along with the method that produced them (or null if none matched).
 */
export function extractQuotes(
  naturalLanguage: NaturalLanguageService,
  chapter: string,
  options: {
    forcedExtractionMethod: 'punctuation' | 'chunk' | null;
    thresholds: ScoreThresholds | null;
  },
): { quotes: QuoteCandidate[]; method: ExtractionMethod | null } {
  const nl = naturalLanguage;
  const allExtractors: [ExtractionMethod, () => string[]][] = [
    ['punctuation', () => nl.extractSentencesByPunctuation(chapter)],
    ['chunk', () => nl.extractWordChunks(chapter)],
  ];

  const extractors = options.forcedExtractionMethod
    ? allExtractors.filter(([name]) => name === options.forcedExtractionMethod)
    : allExtractors;

  for (const [name, fn] of extractors) {
    const sentences = fn();

    if ((options.thresholds?.tfidf ?? 0) > 0) {
      nl.initTfIdf(sentences);
    }
    let quotes = filterQuotesCountingSyllables(
      nl,
      sentences.map((quote, index) => ({ index, quote })),
    );

    if (name === 'chunk') {
      quotes = quotes.filter((q) => isValidChunkQuote(nl, q.quote));
    }

    const minRequired = MIN_QUOTES_THRESHOLD[name];

    if (quotes.length >= minRequired) {
      log.debug(
        { method: name, count: quotes.length, threshold: minRequired },
        'Extraction succeeded',
      );

      return { quotes, method: name };
    }
  }

  return { quotes: [], method: null };
}

/**
 * Select a 5-7-5 set of verses from the candidate quotes, validating each
 * candidate against the supplied thresholds. Returns null when no valid
 * combination can be assembled.
 */
export function selectHaikuVerses(
  validator: HaikuValidatorService,
  quotes: QuoteCandidate[],
  thresholds: ScoreThresholds,
  totalQuotes?: number,
): { verses: string[]; indices: number[] } | null {
  const syllableCounts = [5, 7, 5];
  const selectedVerses: QuoteCandidate[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < syllableCounts.length; i++) {
    const targetSyllables = syllableCounts[i];

    const syllableMatches = quotes.filter(
      (q) => q.syllableCount === targetSyllables && !usedIndices.has(q.index),
    );

    const matchingQuotes = syllableMatches.filter((candidate) =>
      validator.isQuoteValidForVerse(
        candidate,
        i === 0,
        selectedVerses,
        thresholds,
      ),
    );

    if (matchingQuotes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
    const selectedQuote = matchingQuotes[randomIndex];

    selectedVerses.push(selectedQuote);
    usedIndices.add(selectedQuote.index);
  }

  const verses = selectedVerses.map(({ quote }) => quote);
  const indices = selectedVerses.map(({ index }) => index);
  const total = totalQuotes ?? quotes.length;

  if (!validator.passesFullHaikuFilters(verses, indices, total, thresholds)) {
    return null;
  }

  return { verses, indices };
}

/**
 * Compute the quality metrics for a set of verses using the language and
 * Markov services.
 */
export function computeQualityMetrics(
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
  verses: string[],
  verseIndices: number[] = [],
  totalQuotes = 0,
): QualityMetrics {
  if (verses.length === 0) {
    return {
      sentiment: 0.5,
      grammar: 0,
      trigramFlow: 0,
      markovFlow: 0,
      alliteration: 0,
    };
  }

  const sentimentSum = verses.reduce(
    (acc, verse) => acc + naturalLanguage.analyzeSentiment(verse),
    0,
  );
  const sentiment = sentimentSum / verses.length;

  const grammarSum = verses.reduce(
    (acc, verse) => acc + naturalLanguage.analyzeGrammar(verse).score,
    0,
  );
  const grammar = grammarSum / verses.length;

  const trigramFlow = markovEvaluator.evaluateHaikuTrigrams(verses);
  const markovFlow = markovEvaluator.evaluateHaiku(verses);

  const phonetics = naturalLanguage.analyzePhonetics(verses);
  const alliteration = phonetics.alliterationScore;

  const posResults = verses.flatMap((v) => naturalLanguage.getPOSTags(v));

  return {
    sentiment,
    grammar,
    trigramFlow,
    markovFlow,
    alliteration,
    verseIndices,
    totalQuotes,
    posResults,
  };
}
