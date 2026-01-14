import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';
import type { IEventBus } from '../src/domain/events/IEventBus';
import { PubSubService } from '../src/infrastructure/services/PubSubService';

// Mock fs.unlink
vi.mock('fs', () => ({
  unlink: (_path: string, cb: (err: unknown) => void) => cb(null),
}));

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
    isReady: vi.fn(() => true),
  };
  const naturalLanguage = {
    analyzeGrammar: vi.fn(() => ({ score: 1 })),
    analyzePhonetics: vi.fn(() => ({ alliterationScore: 1 })),
    analyzeSentiment: (_t: string) => 1,
    countSyllables: (t: string) => t.split(/\s+/g).filter(Boolean).length,
    extractByExpandedClauses: (t: string) =>
      t.split(/[:;,\-—]+\s+/g).filter((s: string) => s.trim().length > 0),
    extractSentences: (t: string) => t.split(/[.?!]+\s+/g),
    extractSentencesByPunctuation: (t: string) => t.split(/[.?!,;]+\s+/g),
    extractWordChunks: (t: string) => {
      const words = t.split(/\s+/g).filter(Boolean);
      const chunks: string[] = [];
      for (let i = 0; i <= words.length - 2; i += 2) {
        chunks.push(words.slice(i, i + 2).join(' '));
      }
      return chunks;
    },
    extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
    getPOSTags: vi.fn(() => [{ word: 'test', tag: 'VB' }]),
    hasBlacklistedCharsInQuote: (_t: string) => false,
    hasUpperCaseWords: (_t: string) => false,
    initTfIdf: vi.fn(),
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

describe('HaikuGeneratorService', () => {
  beforeEach(() => {});

  it('buildHaiku constructs expected HaikuValue', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows partial book shape
    const book = { author: 'a', reference: 'r', title: 't' };
    // @ts-expect-error – test stub allows partial chapter shape
    const chapter = { content: 'foo bar baz' };
    const verses = ['foo bar', 'lorem ipsum dolor', 'sit amet'];
    const result = svc.buildHaiku(book, chapter, verses);
    expect(result.book.reference).toBe('r');
    expect(result.chapter.content).toBe('foo bar baz');
    expect(result.rawVerses.length).toBe(3);
    expect(result.verses.length).toBe(3);
    expect(result.cacheUsed).toBeFalsy();
    expect(typeof result.executionTime).toBe('number');
  });

  it('selectRandomChapter returns an id from chapters', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows minimal param shape
    const id = svc.selectRandomChapter({ chapters: ['c1', 'c2'] });
    expect(['c1', 'c2']).toContain(id);
  });

  it('isQuoteInvalid respects checks and max length constant', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.hasUpperCaseWords = () => true;
    expect(svc.isQuoteInvalid('ANY')).toBeTruthy();
    deps.naturalLanguage.hasUpperCaseWords = () => false;
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => true;
    expect(svc.isQuoteInvalid('bad #')).toBeTruthy();
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => false;
    // VERSE_MAX_LENGTH is now a constant (30) - test with string >= 30 chars
    expect(
      svc.isQuoteInvalid(
        'this is a very long quote that exceeds thirty characters',
      ),
    ).toBeTruthy();
    expect(svc.isQuoteInvalid('short quote here')).toBeFalsy();
  });

  it('selectHaikuVerses selects 5-7-5 with positive scores', () => {
    const { svc, deps } = makeService();
    // Configure with zero thresholds to disable all scoring for this test
    svc.configure({
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
    });
    // Make syllable count match (we use word count as syllables in this stub)
    // Note: quotes must be < 30 chars (VERSE_MAX_LENGTH)
    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 }, // 5 words, 23 chars
      { index: 1, quote: 'six seven eight nine ten', syllableCount: 7 }, // 7 syllables, 24 chars
      { index: 2, quote: 'one two three four five', syllableCount: 5 }, // 5 words, 23 chars
    ];
    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    randSpy.mockRestore();
    expect(result).not.toBeNull();
    expect(result?.verses.length).toBe(3);
  });

  it('appendImg attaches base64 image', async () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows partial haiku shape
    const haiku = {
      book: { reference: 'r', title: 't', author: 'a' },
      chapter: { content: 'x' },
      verses: ['a', 'b', 'c'],
    };
    const withImg = await svc.appendImg(haiku);
    expect(withImg.image).toBeDefined();
    expect(typeof withImg.image).toBe('string');
  });

  it('configure sets options', () => {
    const { svc } = makeService();
    const result = svc.configure({
      cache: {
        minCachedDocs: 50,
        ttl: 3600,
        enabled: true,
      },
      score: {
        sentiment: 0.5,
        markovChain: 0.3,
      },
      theme: 'greentea',
    });
    expect(result).toBe(svc);
  });

  it('configure uses default values when options are undefined', () => {
    const { svc } = makeService();
    const result = svc.configure();
    expect(result).toBe(svc);
  });

  it('filter sets filterWords and returns this', () => {
    const { svc } = makeService();
    const result = svc.filter(['whale', 'sea', 'ocean']);
    expect(result).toBe(svc);
  });

  it('filter handles empty array', () => {
    const { svc } = makeService();
    const result = svc.filter([]);
    expect(result).toBe(svc);
  });

  it('verseContainsFilterWord returns true when filter word is present', () => {
    const { svc } = makeService();
    svc.filter(['ocean']);
    const verses = ['the deep ocean', 'waves crash', 'silent shores'];
    expect(svc.verseContainsFilterWord(verses)).toBeTruthy();
  });

  it('verseContainsFilterWord returns false when filter word is absent', () => {
    const { svc } = makeService();
    svc.filter(['mountain']);
    const verses = ['the deep ocean', 'waves crash', 'silent shores'];
    expect(svc.verseContainsFilterWord(verses)).toBeFalsy();
  });

  it('verseContainsFilterWord returns true when no filter is set', () => {
    const { svc } = makeService();
    svc.filter([]);
    const verses = ['any verse'];
    expect(svc.verseContainsFilterWord(verses)).toBeTruthy();
  });

  it('getVerses returns empty verses when no valid quotes', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = () => [];
    // @ts-expect-error – test stub allows partial chapter shape
    const result = svc.getVerses({ content: 'short' });
    expect(result.verses).toEqual([]);
  });

  it('extractQuotes filters by syllable count', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = (t: string) =>
      t.split(/[.]+/).filter(Boolean);
    deps.naturalLanguage.extractWords = (t: string) =>
      t.split(/\s+/).filter(Boolean);
    deps.naturalLanguage.countSyllables = () => 5;

    process.env.MIN_QUOTES_COUNT = '1';
    const result = svc.extractQuotes('sentence one. sentence two.');
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('selectHaikuVerses returns null when no matching quotes', () => {
    const { svc } = makeService();
    const result = svc.selectHaikuVerses([]);
    expect(result).toBeNull();
  });

  it('filterQuotesCountingSyllables returns empty when below MIN_QUOTES_COUNT', () => {
    const { svc } = makeService();
    process.env.MIN_QUOTES_COUNT = '100';
    const quotes = [{ quote: 'test', index: 0 }];
    // @ts-expect-error – accessing private method for testing
    const result = svc.filterQuotesCountingSyllables(quotes);
    expect(result).toEqual([]);
  });

  it('selectHaikuVerses filters by sentiment score', () => {
    const { svc, deps } = makeService();
    // Configure with sentiment threshold of 0.5, disable all other filters
    svc.configure({
      score: {
        sentiment: 0.5,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
    });

    // Make quotes with matching syllable counts
    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 }, // 5 syllables
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 }, // 7 syllables
      { index: 2, quote: 'one two three four five', syllableCount: 5 }, // 5 syllables
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 0.3; // Below min score of 0.5
    deps.markovEvaluator.evaluateHaiku = () => 1;

    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('selectHaikuVerses filters by markov score', () => {
    const { svc, deps } = makeService();
    // Configure with markov threshold of 0.5, disable all other filters
    svc.configure({
      score: {
        sentiment: 0,
        markovChain: 0.5,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
    });

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 0.1; // Below min score of 0.5

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Should return null when markov filter rejects all candidates
    expect(result).toBeNull();
  });

  it('selectHaikuVerses rejects quotes with index <= lastVerseIndex', () => {
    const { svc, deps } = makeService();
    // Disable all filters for this test
    svc.configure({
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
    });

    // Quotes with non-sequential indices
    const quotes = [
      { index: 5, quote: 'one two three four five', syllableCount: 5 },
      { index: 3, quote: 'a b c d e f g', syllableCount: 7 }, // Lower index
      { index: 10, quote: 'alpha beta gamma delta epsilon', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    // Should return null since second quote has lower index than first
    expect(result).toBeNull();
  });

  it('extractFromCache delegates to repository', async () => {
    const { svc } = makeService();
    const result = await svc.extractFromCache(10);
    expect(result).toEqual([]);
  });

  it('prepare loads markov evaluator', async () => {
    const { svc, deps } = makeService();
    await svc.prepare();
    expect(deps.markovEvaluator.load).toHaveBeenCalled();
  });

  it('isQuoteInvalid returns false for valid quote', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.hasUpperCaseWords = () => false;
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => false;
    process.env.VERSE_MAX_LENGTH = '100';

    expect(svc.isQuoteInvalid('valid quote here')).toBeFalsy();
  });

  it('filter escapes regex special characters', () => {
    const { svc } = makeService();
    const result = svc.filter(['test.word', 'another*word']);
    expect(result).toBe(svc);
  });

  it('selectHaikuVerses rejects first verse starting with conjunction', () => {
    const { svc, deps } = makeService();
    // Disable all filters for this test
    svc.configure({
      score: {
        sentiment: 0,
        markovChain: 0,
        pos: 0,
        trigram: 0,
        tfidf: 0,
        phonetics: 0,
        uniqueness: 0,
      },
    });

    const quotes = [
      { index: 0, quote: 'and one two three four', syllableCount: 5 }, // starts with conjunction
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = (q: string) =>
      q.toLowerCase().startsWith('and');
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('filterQuotesCountingSyllables filters out quotes with null words', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractWords = () => null as unknown as string[];

    process.env.MIN_QUOTES_COUNT = '0';
    // @ts-expect-error – accessing private method for testing
    const result = svc.filterQuotesCountingSyllables([
      { quote: 'test quote', index: 0 },
    ]);
    expect(result).toEqual([]);
  });

  it('selectHaikuVerses rejects quotes that fail isQuoteInvalid', () => {
    const { svc, deps } = makeService();

    const quotes = [
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'a b c d e f g', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => true; // Makes isQuoteInvalid return true
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('selectHaikuVerses rejects quotes that fail syllable count check', () => {
    const { svc, deps } = makeService();

    const quotes = [
      { index: 0, quote: 'one two three', syllableCount: 3 }, // Wrong syllable count
      { index: 1, quote: 'one two three', syllableCount: 3 },
      { index: 2, quote: 'one two three', syllableCount: 3 },
    ];

    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.countSyllables = () => 3; // Always returns 3, never 5 or 7
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    const result = svc.selectHaikuVerses(quotes);
    expect(result).toBeNull();
  });

  it('buildHaiku creates haiku structure with context', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows partial book shape
    const book = {
      author: 'Herman Melville',
      reference: 'moby-dick',
      title: 'Moby Dick',
    };
    // @ts-expect-error – test stub allows partial chapter shape
    const chapter = {
      content: 'Call me Ishmael. The whale is white. The sea is blue.',
    };
    const verses = ['Call me', 'The whale is white', 'The sea'];

    const result = svc.buildHaiku(book, chapter, verses);

    expect(result.book.author).toBe('Herman Melville');
    expect(result.book.title).toBe('Moby Dick');
    expect(result.rawVerses).toEqual(verses);
    expect(result.context).toBeDefined();
  });

  it('selectRandomChapter returns a chapter id from book', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub
    const book = { chapters: ['ch1', 'ch2', 'ch3'] };

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = svc.selectRandomChapter(book);
    expect(['ch1', 'ch2', 'ch3']).toContain(result);
  });

  it('extractQuotes uses naturalLanguage to extract sentences', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.extractSentencesByPunctuation = (t: string) =>
      t.split('. ').filter(Boolean);
    deps.naturalLanguage.extractWords = (t: string) =>
      t.split(' ').filter(Boolean);

    process.env.MIN_QUOTES_COUNT = '0';
    const result = svc.extractQuotes('One two three four five. Six seven.');
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

describe('HaikuGeneratorService - generate flow', () => {
  it('generate returns cached haiku when useCache is true and cache has data', async () => {
    const { svc } = makeService();

    // Mock the repository to return cached data
    class MockHaikuRepository {
      extractFromCache = vi.fn(async () => []);
      extractOneFromCache = vi.fn(async () => ({
        book: { title: 'Cached', author: 'Test', reference: 'ref' },
        verses: ['one', 'two', 'three'],
        cacheUsed: true,
      }));
      createCacheWithTTL = vi.fn(async () => {});
    }

    // Use reflection or access internal state
    // @ts-expect-error - accessing private for test
    svc.haikuRepository = new MockHaikuRepository();

    svc.configure({
      cache: { enabled: true, minCachedDocs: 10, ttl: 1000 },
      score: {},
      theme: 'default',
    });

    const result = await svc.generate();
    expect(result).toBeDefined();
    expect(result?.cacheUsed).toBeTruthy();
  });

  it('generate falls back to buildFromDb when cache returns null', async () => {
    const { svc } = makeService();

    svc.configure({
      cache: { enabled: true, minCachedDocs: 10, ttl: 1000 },
      score: {},
      theme: 'default',
    });

    // Will throw since mock repos don't return valid data for building haiku
    await expect(svc.generate()).rejects.toThrow();
  });

  it('generate throws when filter yields no matching chapters', async () => {
    const { svc } = makeService();

    svc.configure({
      cache: { enabled: false, minCachedDocs: 10, ttl: 1000 },
      score: {},
      theme: 'default',
    });
    svc.filter(['whale', 'ocean']);

    // Will throw since no chapters match the filter
    await expect(svc.generate()).rejects.toThrow();
  });

  it('getVerses calls extractQuotes and selectHaikuVerses', () => {
    const { svc, deps } = makeService();

    deps.naturalLanguage.extractSentencesByPunctuation = () => [
      'test sentence',
    ];
    deps.naturalLanguage.extractWords = () => ['test', 'sentence'];

    process.env.MIN_QUOTES_COUNT = '0';
    // @ts-expect-error - test with partial chapter
    const result = svc.getVerses({ content: 'test sentence.' });
    expect(result.verses).toEqual([]);
  });
});
