import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';
import type { IEventBus } from '../src/domain/events/IEventBus';
import { PubSubService } from '../src/infrastructure/services/PubSubService';

// Factory to create service instance with mocked dependencies
const makeService = () => {
  class FakeHaikuRepository implements IHaikuRepository {
    extractFromCache = vi.fn(async () => []);
    extractOneFromCache = vi.fn(async () => null);
    createCacheWithTTL = vi.fn(async () => {});
  }
  class FakeChapterRepository implements IChapterRepository {
    getFilteredChapters = vi.fn(async () => []);
    getAllChapters = vi.fn(async () => []);
    getChapterById = vi.fn(async () => null);
  }
  class FakeBookRepository implements IBookRepository {
    getAllBooks = vi.fn(async () => []);
    getBookById = vi.fn(async () => null);
    selectRandomBook = vi.fn(async () => ({
      author: 'a',
      chapters: ['c1', 'c2'],
      reference: 'ref',
      title: 't',
    }));
  }
  const markovEvaluator = {
    evaluateHaiku: vi.fn((_verses: string[]) => 1),
    evaluateHaikuTrigrams: vi.fn((_verses: string[]) => 1),
    load: vi.fn(async () => {}),
  };
  const naturalLanguage = {
    analyzeGrammar: vi.fn(() => ({ score: 1 })),
    analyzePhonetics: vi.fn(() => ({ alliterationScore: 1 })),
    analyzeSentiment: (_t: string) => 1,
    countSyllables: (t: string) => t.split(/\s+/g).filter(Boolean).length,
    extractSentencesByPunctuation: (t: string) => t.split(/[.?!,;]+\s+/g),
    extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
    hasBlacklistedCharsInQuote: (_t: string) => false,
    hasUpperCaseWords: (_t: string) => false,
    scoreDistinctiveness: vi.fn(() => 1),
    startWithConjunction: (_t: string) => false,
  };
  class FakeCanvasService implements ICanvasService {
    useTheme = vi.fn();
    create = vi.fn(async () => '/tmp/fake.png');
    read = vi.fn(async () => ({
      contentType: 'image/jpeg',
      data: Buffer.from('xyz'),
    }));
  }
  const pubSubService = new PubSubService();
  const eventBus: IEventBus = { publish: vi.fn(async () => {}) };

  const svc = new HaikuGeneratorService(
    new FakeHaikuRepository(),
    new FakeChapterRepository(),
    new FakeBookRepository(),
    // @ts-expect-error – structural typing for tests
    markovEvaluator,
    // @ts-expect-error – structural typing for tests
    naturalLanguage,
    new FakeCanvasService(),
    pubSubService,
    eventBus,
  );

  return {
    deps: {
      markovEvaluator,
      naturalLanguage,
    },
    svc,
  };
};

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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
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
      { index: 0, quote: 'one two three four five' },
      { index: 1, quote: 'one two three four five six seven' },
      { index: 2, quote: 'one two three four five' },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result.length).toBe(3);
  });
});
