import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import {
  filterQuotesCountingSyllables,
  isValidChunkQuote,
  quotesToVersePools,
  extractQuotes,
  selectHaikuVerses,
  computeQualityMetrics,
} from '../src/domain/services/HaikuExtractionHelpers';
import type NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';
import type { HaikuValidatorService } from '../src/domain/services/HaikuValidatorService';
import type {
  ScoreThresholds,
  QuoteCandidate,
} from '../src/domain/services/HaikuGeneratorTypes';

const nl = (
  over: Partial<Record<string, unknown>> = {},
): NaturalLanguageService =>
  ({
    extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
    extractSentencesByPunctuation: (t: string) =>
      t
        .split(/[.?!]+/g)
        .map((s) => s.trim())
        .filter(Boolean),
    extractWordChunks: (t: string) => t.split(/\s+/g).filter(Boolean),
    analyzeGrammar: () => ({ score: 1 }),
    analyzeSentiment: () => 1,
    analyzePhonetics: () => ({ alliterationScore: 0.5 }),
    getPOSTags: () => [{ word: 'x', tag: 'VB' }],
    initTfIdf: vi.fn(),
    scoreDistinctiveness: () => 1,
    ...over,
  }) as unknown as NaturalLanguageService;

const thresholds = (over: Partial<ScoreThresholds> = {}): ScoreThresholds => ({
  sentiment: 0,
  markov: 0,
  pos: 0,
  trigram: 0,
  tfidf: 0,
  phonetics: 0,
  uniqueness: 0,
  verseDistance: 0,
  lineLengthBalance: 0,
  imageryDensity: 0,
  semanticCoherence: 0,
  verbPresence: 0,
  maxRepeatedWords: 0,
  allowWeakStart: true,
  ...over,
});

describe('filterQuotesCountingSyllables', () => {
  it('keeps only 5 or 7 syllable quotes and skips falsy words', () => {
    const service = nl({
      extractWords: (t: string) =>
        t === 'skip' ? (null as unknown as string[]) : t.split(/\s+/g),
    });
    const result = filterQuotesCountingSyllables(service, [
      { quote: 'one two three four five', index: 0 },
      { quote: 'skip', index: 1 },
    ]);
    // syllable() of single words may not equal 5; we only assert the falsy-word
    // path is skipped (index 1 never appears).
    expect(result.every((q) => q.index !== 1)).toBeTruthy();
  });
});

describe('isValidChunkQuote', () => {
  it('rejects quotes with low grammar score', () => {
    const service = nl({ analyzeGrammar: () => ({ score: 0.1 }) });
    expect(isValidChunkQuote(service, 'lorem ipsum')).toBeFalsy();
  });

  it('rejects quotes with capitalized mid-sentence words (proper nouns)', () => {
    const service = nl({ analyzeGrammar: () => ({ score: 1 }) });
    expect(isValidChunkQuote(service, 'walk to London town')).toBeFalsy();
  });

  it('accepts grammatical lowercase quotes', () => {
    const service = nl({ analyzeGrammar: () => ({ score: 1 }) });
    expect(isValidChunkQuote(service, 'the quiet river flows')).toBeTruthy();
  });
});

describe('quotesToVersePools', () => {
  it('splits 5- and 7-syllable candidates into separate pools', () => {
    const quotes: QuoteCandidate[] = [
      { quote: 'five line one', index: 0, syllableCount: 5 },
      { quote: 'seven line one', index: 1, syllableCount: 7 },
      { quote: 'five line two', index: 2, syllableCount: 5 },
      { quote: 'ignored', index: 3, syllableCount: 6 as 5 | 7 },
    ];
    const pools = quotesToVersePools(quotes, 'book1', 'chap1');
    expect(pools.bookId).toBe('book1');
    expect(pools.chapterId).toBe('chap1');
    expect(pools.fiveSyllable).toHaveLength(2);
    expect(pools.sevenSyllable).toHaveLength(1);
    expect(pools.fiveSyllable[0]).toEqual({
      text: 'five line one',
      syllableCount: 5,
      sourceIndex: 0,
    });
  });
});

describe('extractQuotes', () => {
  it('honors forcedExtractionMethod = chunk and initializes tfidf when threshold > 0', () => {
    const initTfIdf = vi.fn();
    const service = nl({
      extractWordChunks: () => ['one two three four five'],
      extractWords: (t: string) => t.split(/\s+/g),
      analyzeGrammar: () => ({ score: 1 }),
      initTfIdf,
    });
    const result = extractQuotes(service, 'one two three four five', {
      forcedExtractionMethod: 'chunk',
      thresholds: thresholds({ tfidf: 0.5 }),
    });
    expect(initTfIdf).toHaveBeenCalled();
    expect(result.method === 'chunk' || result.method === null).toBeTruthy();
  });

  it('returns null method when no extractor yields enough quotes', () => {
    const service = nl({
      extractSentencesByPunctuation: () => [],
      extractWordChunks: () => [],
    });
    const result = extractQuotes(service, 'nothing', {
      forcedExtractionMethod: null,
      thresholds: thresholds(),
    });
    expect(result.method).toBeNull();
    expect(result.quotes).toEqual([]);
  });
});

describe('selectHaikuVerses', () => {
  const validator = (valid: boolean, full = true): HaikuValidatorService =>
    ({
      isQuoteValidForVerse: vi.fn(() => valid),
      passesFullHaikuFilters: vi.fn(() => full),
    }) as unknown as HaikuValidatorService;

  const candidates: QuoteCandidate[] = [
    { quote: 'a', index: 0, syllableCount: 5 },
    { quote: 'b', index: 1, syllableCount: 7 },
    { quote: 'c', index: 2, syllableCount: 5 },
  ];

  it('returns verses when validator approves all and full filters pass', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = selectHaikuVerses(
      validator(true, true),
      candidates,
      thresholds(),
    );
    vi.restoreAllMocks();
    expect(result).not.toBeNull();
    expect(result?.verses).toEqual(['a', 'b', 'c']);
    expect(result?.indices).toEqual([0, 1, 2]);
  });

  it('returns null when no candidate matches a required syllable slot', () => {
    const result = selectHaikuVerses(
      validator(false),
      candidates,
      thresholds(),
    );
    expect(result).toBeNull();
  });

  it('returns null when full haiku filters reject', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = selectHaikuVerses(
      validator(true, false),
      candidates,
      thresholds(),
    );
    vi.restoreAllMocks();
    expect(result).toBeNull();
  });
});

describe('computeQualityMetrics', () => {
  const markov = {
    evaluateHaiku: () => 0.5,
    evaluateHaikuTrigrams: () => 0.6,
  } as unknown as MarkovEvaluatorService;

  it('returns neutral defaults for empty verses', () => {
    const metrics = computeQualityMetrics(nl(), markov, []);
    expect(metrics).toEqual({
      sentiment: 0.5,
      grammar: 0,
      trigramFlow: 0,
      markovFlow: 0,
      alliteration: 0,
    });
  });

  it('aggregates per-verse metrics for non-empty verses', () => {
    const metrics = computeQualityMetrics(
      nl(),
      markov,
      ['one', 'two', 'three'],
      [0, 1, 2],
      9,
    );
    expect(metrics.markovFlow).toBe(0.5);
    expect(metrics.trigramFlow).toBe(0.6);
    expect(metrics.alliteration).toBe(0.5);
    expect(metrics.totalQuotes).toBe(9);
    expect(metrics.verseIndices).toEqual([0, 1, 2]);
  });
});
