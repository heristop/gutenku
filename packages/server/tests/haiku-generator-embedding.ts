import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';

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
    selectRandomBooks = vi.fn(async () => []);
  }
  const markovEvaluator = {
    evaluateHaiku: vi.fn(() => 1),
    evaluateHaikuTrigrams: vi.fn(() => 1),
    load: vi.fn(async () => {}),
    isReady: vi.fn(() => true),
  };
  const naturalLanguage = {
    analyzeGrammar: vi.fn(() => ({ score: 1 })),
    analyzePhonetics: vi.fn(() => ({ alliterationScore: 1 })),
    analyzeSentiment: () => 1,
    countSyllables: (t: string) => t.split(/\s+/g).filter(Boolean).length,
    extractByExpandedClauses: (t: string) =>
      t.split(/[:;,\-—]+\s+/g).filter((s: string) => s.trim().length > 0),
    extractSentences: (t: string) => t.split(/[.?!]+\s+/g),
    extractSentencesByPunctuation: (t: string) => t.split(/[.?!,;]+\s+/g),
    extractWordChunks: (t: string) => t.split(/\s+/g).filter(Boolean),
    extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
    getPOSTags: vi.fn(() => [{ word: 'test', tag: 'VB' }]),
    hasBlacklistedCharsInQuote: () => false,
    hasUpperCaseWords: () => false,
    initTfIdf: vi.fn(),
    scoreDistinctiveness: vi.fn(() => 1),
    startWithConjunction: () => false,
  };
  class FakeCanvasService implements ICanvasService {
    useTheme = vi.fn();
    create = vi.fn(async () => '/tmp/fake.png');
    read = vi.fn(async () => ({
      contentType: 'image/jpeg',
      data: Buffer.from('xyz'),
    }));
  }

  const svc = new HaikuGeneratorService(
    new FakeHaikuRepository(),
    new FakeChapterRepository(),
    new FakeBookRepository(),
    // @ts-expect-error – structural typing for tests
    markovEvaluator,
    // @ts-expect-error – structural typing for tests
    naturalLanguage,
    new FakeCanvasService(),
  );

  return { svc, deps: { markovEvaluator, naturalLanguage } };
};

describe('HaikuGeneratorService - accessors', () => {
  it('getNaturalLanguageService returns the injected service', () => {
    const { svc, deps } = makeService();
    expect(svc.getNaturalLanguageService()).toBe(deps.naturalLanguage);
  });

  it('getMarkovEvaluator returns the injected evaluator', () => {
    const { svc, deps } = makeService();
    expect(svc.getMarkovEvaluator()).toBe(deps.markovEvaluator);
  });

  it('setExtractionMethod returns this for chaining', () => {
    const { svc } = makeService();
    expect(svc.setExtractionMethod('chunk')).toBe(svc);
    expect(svc.setExtractionMethod('punctuation')).toBe(svc);
    expect(svc.setExtractionMethod(null)).toBe(svc);
  });

  it('getRejectionStats and resetRejectionStats operate without error', () => {
    const { svc } = makeService();
    svc.resetRejectionStats();
    const stats = svc.getRejectionStats();
    expect(stats).toBeDefined();
  });

  it('disableMarkovValidation zeroes markov thresholds after configure', () => {
    const { svc } = makeService();
    svc.configure();
    expect(() => svc.disableMarkovValidation()).not.toThrow();
  });

  it('disableMarkovValidation is safe when no thresholds cached', () => {
    const { svc } = makeService();
    // No configure() called -> cachedThresholds is null
    expect(() => svc.disableMarkovValidation()).not.toThrow();
  });

  it('prepare disables markov validation when evaluator not ready', async () => {
    const { svc, deps } = makeService();
    svc.configure();
    deps.markovEvaluator.isReady = vi.fn(() => false);
    await svc.prepare();
    expect(deps.markovEvaluator.load).toHaveBeenCalled();
  });
});

describe('HaikuGeneratorService - verse embedding service', () => {
  it('getVerseEmbeddingService returns null before being set', () => {
    const { svc } = makeService();
    expect(svc.getVerseEmbeddingService()).toBeNull();
  });

  it('setVerseEmbeddingService then getVerseEmbeddingService round-trips', () => {
    const { svc } = makeService();
    const fakeEmbedding = {
      embedVersePools: vi.fn(),
      computeSemanticCoherenceFromText: vi.fn(),
    };
    // @ts-expect-error – structural stub for tests
    svc.setVerseEmbeddingService(fakeEmbedding);
    expect(svc.getVerseEmbeddingService()).toBe(fakeEmbedding);
  });

  it('extractVersePoolsFromContent returns verse pools structure', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = () => [
      'one two three four five',
    ];
    process.env.MIN_QUOTES_COUNT = '0';
    const pools = svc.extractVersePoolsFromContent(
      'one two three four five.',
      'book1',
      'chap1',
    );
    expect(pools).toHaveProperty('bookId', 'book1');
    expect(pools).toHaveProperty('chapterId', 'chap1');
  });

  it('extractEnhancedVersePoolsFromContent delegates to embedding service', async () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = () => [
      'one two three four five',
    ];
    const enhanced = { fiveSyllableVerses: [], sevenSyllableVerses: [] };
    const fakeEmbedding = {
      embedVersePools: vi.fn(async () => enhanced),
      computeSemanticCoherenceFromText: vi.fn(),
    };
    // @ts-expect-error – structural stub for tests
    svc.setVerseEmbeddingService(fakeEmbedding);
    process.env.MIN_QUOTES_COUNT = '0';

    const result = await svc.extractEnhancedVersePoolsFromContent(
      'one two three four five.',
      'b',
      'c',
    );
    expect(result).toBe(enhanced);
    expect(fakeEmbedding.embedVersePools).toHaveBeenCalled();
  });

  it('extractEnhancedVersePoolsFromContent throws when embedding service missing', async () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = () => ['one two'];
    process.env.MIN_QUOTES_COUNT = '0';
    await expect(
      svc.extractEnhancedVersePoolsFromContent('one two.', 'b', 'c'),
    ).rejects.toThrow('VerseEmbeddingService not set');
  });

  it('computeEmbeddingCoherence delegates to embedding service', async () => {
    const { svc } = makeService();
    const fakeEmbedding = {
      embedVersePools: vi.fn(),
      computeSemanticCoherenceFromText: vi.fn(async () => 0.42),
    };
    // @ts-expect-error – structural stub for tests
    svc.setVerseEmbeddingService(fakeEmbedding);

    const score = await svc.computeEmbeddingCoherence(['a', 'b', 'c']);
    expect(score).toBe(0.42);
    expect(fakeEmbedding.computeSemanticCoherenceFromText).toHaveBeenCalledWith(
      ['a', 'b', 'c'],
    );
  });

  it('computeEmbeddingCoherence throws when embedding service missing', async () => {
    const { svc } = makeService();
    await expect(
      svc.computeEmbeddingCoherence(['a', 'b', 'c']),
    ).rejects.toThrow('VerseEmbeddingService not set');
  });
});
