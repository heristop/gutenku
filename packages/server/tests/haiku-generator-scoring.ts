import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeHaikuGeneratorService } from './helpers/haiku-generator-mocks';

const makeService = makeHaikuGeneratorService;

describe('HaikuGeneratorService - scoring tests', () => {
  beforeEach(() => {
    process.env.MIN_QUOTES_COUNT = '0';
    process.env.SENTIMENT_MIN_SCORE = '0';
    process.env.MARKOV_MIN_SCORE = '0';
    process.env.POS_MIN_SCORE = '0';
    process.env.TRIGRAM_MIN_SCORE = '0';
    process.env.TFIDF_MIN_SCORE = '0';
    process.env.PHONETICS_MIN_SCORE = '0';
    process.env.VERSE_MAX_LENGTH = '100';
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toEqual([]);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toEqual([]);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBeLessThan(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBeLessThan(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
  });
});

describe('HaikuGeneratorService - soft scoring tests', () => {
  beforeEach(() => {
    process.env.MIN_QUOTES_COUNT = '0';
    process.env.SENTIMENT_MIN_SCORE = '0';
    process.env.MARKOV_MIN_SCORE = '0';
    process.env.POS_MIN_SCORE = '0';
    process.env.TRIGRAM_MIN_SCORE = '0';
    process.env.TFIDF_MIN_SCORE = '0';
    process.env.PHONETICS_MIN_SCORE = '0';
    process.env.VERSE_MAX_LENGTH = '100';
    process.env.MAX_REPEATED_WORDS = '0';
    process.env.REJECT_WEAK_START = 'false';
  });

  it('rejects verses with weak starts when REJECT_WEAK_START is true', () => {
    process.env.REJECT_WEAK_START = 'true';

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

    // "it was" starts with weak word "it"
    const quotes = [
      { index: 0, quote: 'it was a dark', syllableCount: 5 },
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // First verse rejected due to weak start, no valid 5-syllable verse
    expect(result).toEqual([]);
  });

  it('allows verses with weak starts when REJECT_WEAK_START is false', () => {
    process.env.REJECT_WEAK_START = 'false';

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

    const quotes = [
      { index: 0, quote: 'it was a dark', syllableCount: 5 },
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
  });

  it('rejects haiku with too many repeated words when MAX_REPEATED_WORDS > 0', () => {
    process.env.MAX_REPEATED_WORDS = '1';

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

    // "moon" appears in all 3 verses = 2 repeats, exceeds max of 1
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
    // Third verse rejected due to too many repeated words
    expect(result.length).toBeLessThan(3);
  });

  it('allows haiku when repeated words within MAX_REPEATED_WORDS limit', () => {
    process.env.MAX_REPEATED_WORDS = '3';

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
    expect(result.length).toBe(3);
  });

  it('ignores repeated word check when MAX_REPEATED_WORDS is 0', () => {
    process.env.MAX_REPEATED_WORDS = '0';

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

    // Many repeated words but MAX_REPEATED_WORDS=0 means disabled
    const quotes = [
      { index: 0, quote: 'moon moon moon', syllableCount: 5 },
      { index: 1, quote: 'moon moon moon moon moon', syllableCount: 7 },
      { index: 2, quote: 'moon moon moon', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
  });
});

describe('HaikuGeneratorService - phonetics on all verses', () => {
  beforeEach(() => {
    process.env.MIN_QUOTES_COUNT = '0';
    process.env.SENTIMENT_MIN_SCORE = '0';
    process.env.MARKOV_MIN_SCORE = '0';
    process.env.POS_MIN_SCORE = '0';
    process.env.TRIGRAM_MIN_SCORE = '0';
    process.env.TFIDF_MIN_SCORE = '0';
    process.env.PHONETICS_MIN_SCORE = '0';
    process.env.VERSE_MAX_LENGTH = '100';
    process.env.MAX_REPEATED_WORDS = '0';
    process.env.REJECT_WEAK_START = 'false';
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
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
    expect(result.length).toBeLessThan(3);
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
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);

    // Should be called for both verse 2 and verse 3
    expect(deps.naturalLanguage.analyzePhonetics).toHaveBeenCalledTimes(2);
    expect(result.length).toBe(3);
  });
});
