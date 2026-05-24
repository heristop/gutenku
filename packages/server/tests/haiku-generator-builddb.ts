import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';

const ZERO_SCORE = {
  sentiment: 0,
  markovChain: 0,
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
};

const FIVE = 'one two three four five';
const SEVEN = 'six seven eight nine ten more';

const makeChapterContent = () =>
  [FIVE, SEVEN, FIVE, SEVEN, FIVE, SEVEN].join('. ') + '.';

const makeService = (opts?: {
  selectRandomBooks?: () => Promise<unknown[]>;
  filteredChapters?: () => Promise<unknown[]>;
}) => {
  const chapterContent = makeChapterContent();

  class FakeHaikuRepository implements IHaikuRepository {
    extractFromCache = vi.fn(async () => []);
    extractOneFromCache = vi.fn(async () => null);
    createCacheWithTTL = vi.fn(async () => {});
  }
  class FakeChapterRepository implements IChapterRepository {
    getFilteredChapters = vi.fn(opts?.filteredChapters ?? (async () => []));
    getAllChapters = vi.fn(async () => []);
    getChapterById = vi.fn(async () => null);
  }
  const book = {
    author: 'a',
    reference: 'ref',
    title: 't',
    emoticons: '😀',
    chapters: [{ content: chapterContent }],
  };
  class FakeBookRepository implements IBookRepository {
    getAllBooks = vi.fn(async () => []);
    getBookById = vi.fn(async () => null);
    selectRandomBook = vi.fn(async () => book);
    selectRandomBooks = vi.fn(
      opts?.selectRandomBooks ?? (async () => [book, book]),
    );
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
    extractSentencesByPunctuation: (t: string) =>
      t.split(/[.?!]+\s*/g).filter(Boolean),
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

  return { svc, markovEvaluator, naturalLanguage };
};

describe('HaikuGeneratorService.buildFromDb', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MIN_QUOTES_COUNT;
  });

  it('builds a haiku from the book pool with permissive thresholds', async () => {
    const { svc } = makeService();
    svc.configure({
      score: ZERO_SCORE,
      cache: { enabled: false, minCachedDocs: 1, ttl: 0 },
    });
    process.env.MIN_QUOTES_COUNT = '1';
    // Deterministic: always pick first matching candidate / first chapter.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = await svc.buildFromDb();

    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
    expect(result?.book.reference).toBe('ref');
  });

  it('caches the result when cache is enabled', async () => {
    const { svc } = makeService();
    svc.configure({
      score: ZERO_SCORE,
      cache: { enabled: true, minCachedDocs: 1, ttl: 100 },
    });
    process.env.MIN_QUOTES_COUNT = '1';
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // generate() goes through cache miss -> buildFromDb -> createCacheWithTTL
    const result = await svc.generate();
    expect(result).not.toBeNull();
  });

  it('falls back to selectRandomBook when pool is empty', async () => {
    const { svc } = makeService({ selectRandomBooks: async () => [] });
    svc.configure({
      score: ZERO_SCORE,
      cache: { enabled: false, minCachedDocs: 1, ttl: 0 },
    });
    process.env.MIN_QUOTES_COUNT = '1';
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = await svc.buildFromDb();
    expect(result).not.toBeNull();
  });

  it('builds from filtered chapters when filter words are set', async () => {
    const filteredBook = {
      author: 'a',
      reference: 'filtered-ref',
      title: 't',
      emoticons: '😀',
    };
    const { svc } = makeService({
      filteredChapters: async () => [
        { content: makeChapterContent(), book: filteredBook },
      ],
    });
    svc.configure({
      score: ZERO_SCORE,
      cache: { enabled: false, minCachedDocs: 1, ttl: 0 },
    });
    // "five" appears in the FIVE verse, keeping 5-7-5 syllable structure intact.
    svc.filter(['five']);
    process.env.MIN_QUOTES_COUNT = '1';
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = await svc.buildFromDb();
    expect(result).not.toBeNull();
    expect(result?.book.reference).toBe('filtered-ref');
  });

  it('discards verses from filtered chapters that lack the filter word', async () => {
    const filteredBook = {
      author: 'a',
      reference: 'nofilter-ref',
      title: 't',
      emoticons: '😀',
    };
    // Chapters returned by filter query but verses do not actually contain the word.
    const { svc } = makeService({
      filteredChapters: async () => [
        { content: makeChapterContent(), book: filteredBook },
      ],
    });
    svc.configure({
      score: ZERO_SCORE,
      cache: { enabled: false, minCachedDocs: 1, ttl: 0 },
    });
    svc.filter(['zzzznotpresent']);
    process.env.MIN_QUOTES_COUNT = '1';
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // No verse contains the filter word, so generation exhausts attempts and throws.
    await expect(svc.buildFromDb()).rejects.toThrow();
  });
});
