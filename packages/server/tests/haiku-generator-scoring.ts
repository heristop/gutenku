import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHaikuGeneratorService } from './helpers/haiku-generator-mocks';

const makeService = makeHaikuGeneratorService;

describe('HaikuGeneratorService - scoring tests', () => {
  beforeEach(() => {
    // Score thresholds are now constants in validation.ts
    // Tests use svc.configure() to set explicit thresholds for each test
  });

  it('selectHaikuVerses applies POS score filter when configured', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzeGrammar = vi.fn(() => ({ score: 0.2 }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0.5,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('selectHaikuVerses passes POS score filter when score is high enough', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzeGrammar = vi.fn(() => ({ score: 0.8 }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0.5,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });

  it('selectHaikuVerses applies TF-IDF score filter when configured', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.scoreDistinctiveness = vi.fn(() => 0.1);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0.5,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('selectHaikuVerses passes TF-IDF score filter when score is high enough', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.scoreDistinctiveness = vi.fn(() => 0.8);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0.5,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });

  it('selectHaikuVerses applies trigram score filter when configured', () => {
    const { svc, deps } = makeService();

    deps.markovEvaluator.evaluateHaikuTrigrams = vi.fn(() => 0.1);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0.5,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Should return null when filter rejects candidates
    expect(result).toBeNull();
  });

  it('selectHaikuVerses passes trigram score filter when score is high enough', () => {
    const { svc, deps } = makeService();

    deps.markovEvaluator.evaluateHaikuTrigrams = vi.fn(() => 0.8);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0.5,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });

  it('selectHaikuVerses applies phonetics score filter on third verse', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzePhonetics = vi.fn(() => ({
      alliterationScore: 0.1,
    }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0.5,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Should return null when filter rejects candidates
    expect(result).toBeNull();
  });

  it('selectHaikuVerses passes phonetics score filter when score is high enough', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzePhonetics = vi.fn(() => ({
      alliterationScore: 0.8,
    }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0.5,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });
});

describe('HaikuGeneratorService - soft scoring tests', () => {
  beforeEach(() => {
    // Note: REJECT_WEAK_START and MAX_REPEATED_WORDS are no longer env vars
    // Weak starts are always allowed, repeated word check is disabled by default
  });

  it('always allows verses with weak starts (feature disabled)', () => {
    const { svc, deps } = makeService();

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    // "it was" starts with weak word "it" - but now allowed by default
    const quotes = [
      { index: 0, quote: 'it was a dark', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Weak starts are allowed by default now
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });

  it('allows haiku with repeated words (feature disabled by default)', () => {
    const { svc, deps } = makeService();

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
      },
      theme: 'default',
    });

    // "moon" appears in all verses - allowed now since maxRepeatedWords is disabled
    const quotes = [
      { index: 0, quote: 'moon shines bright', syllableCount: 5 },
      { index: 1, quote: 'under the moon light soft', syllableCount: 7 },
      { index: 2, quote: 'moon fades at dawn', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Repeated words are now allowed (feature disabled by default)
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });
});

describe('HaikuGeneratorService - uniqueness filter', () => {
  it('applies uniqueness filter when configured', () => {
    const { svc, deps } = makeService();

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0.9, // Very high threshold
      },
      theme: 'default',
    });

    // Multiple repeated words = low uniqueness (~0.67)
    // 9 words total: "the" x3 = 7 unique / 9 total = 0.78
    const quotes = [
      { index: 0, quote: 'the moon shines', syllableCount: 5 },
      { index: 1, quote: 'the moon glows at night', syllableCount: 7 },
      { index: 2, quote: 'the moon fades', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Should return null when filter rejects candidates
    expect(result).toBeNull();
  });

  it('passes uniqueness filter when words are varied', () => {
    const { svc, deps } = makeService();

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0.6,
      },
      theme: 'default',
    });

    // All different words = high uniqueness
    const quotes = [
      { index: 0, quote: 'cherry blossom falls', syllableCount: 5 },
      { index: 1, quote: 'gentle wind through branches', syllableCount: 7 },
      { index: 2, quote: 'spring arrives today', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });
});

describe('HaikuGeneratorService - rejection stats', () => {
  it('tracks rejection stats for sentiment', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzeSentiment = vi.fn(() => 0.2);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0.5, // Will reject low sentiment
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    svc.selectHaikuVerses(quotes);

    const stats = svc.getRejectionStats();
    expect(stats.sentiment).toBeGreaterThan(0);
    expect(stats.total).toBeGreaterThan(0);
  });

  it('resets rejection stats on configure', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzeSentiment = vi.fn(() => 0.2);

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0.5,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    svc.selectHaikuVerses(quotes);

    // Reconfigure should reset stats
    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
      theme: 'default',
    });

    const stats = svc.getRejectionStats();
    expect(stats.sentiment).toBe(0);
    expect(stats.total).toBe(0);
  });
});

describe('HaikuGeneratorService - phonetics on all verses', () => {
  beforeEach(() => {
    // Score thresholds are now constants - use svc.configure() for test-specific values
  });

  it('applies phonetics filter on second verse (not just third)', () => {
    const { svc, deps } = makeService();

    // Return low score - should fail phonetics check
    deps.naturalLanguage.analyzePhonetics = vi.fn(() => ({
      alliterationScore: 0.1,
    }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0.5,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);

    // Phonetics is now checked on all verses, not just third
    // analyzePhonetics should be called when adding second verse
    expect(deps.naturalLanguage.analyzePhonetics).toHaveBeenCalled();
    // Should return null when phonetics filter rejects candidates
    expect(result).toBeNull();
  });

  it('analyzePhonetics is called for verse 2 and verse 3', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.analyzePhonetics = vi.fn(() => ({
      alliterationScore: 0.8,
    }));

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0.5,
      },
      theme: 'default',
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);

    // Should be called for both verse 2 and verse 3
    expect(deps.naturalLanguage.analyzePhonetics).toHaveBeenCalledTimes(2);
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });
});
