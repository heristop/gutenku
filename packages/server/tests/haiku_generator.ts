import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';

// Mock fs.unlink used via promisify in appendImg
vi.mock('fs', () => ({
  unlink: (_path: string, cb: (err: unknown) => void) => cb(null),
}));

describe('HaikuGeneratorService', () => {
  const makeService = () => {
    const haikuRepository = {
      extractFromCache: vi.fn(async (_size: number, _min: number) => []),
      extractOneFromCache: vi.fn(async (_min: number) => null),
      createCacheWithTTL: vi.fn(async () => undefined),
    };

    const chapterRepository = {
      getFilteredChapters: vi.fn(async (_words: string[]) => []),
    };

    const bookService = {
      selectRandomBook: vi.fn(async () => ({
        reference: 'ref',
        title: 't',
        author: 'a',
        chapters: ['c1', 'c2'],
      })),
    };

    const markovEvaluator = {
      load: vi.fn(async () => undefined),
      evaluateHaiku: vi.fn((_verses: string[]) => 1),
    };

    const naturalLanguage = {
      extractSentencesByPunctuation: (t: string) => t.split(/[.?!,;]+\s+/g),
      extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
      analyzeSentiment: (_t: string) => 1,
      countSyllables: (t: string) => t.split(/\s+/g).filter(Boolean).length,
      hasUpperCaseWords: (_t: string) => false,
      hasBlacklistedCharsInQuote: (_t: string) => false,
      startWithConjunction: (_t: string) => false,
    };

    const canvasService = {
      useTheme: vi.fn(),
      create: vi.fn(async () => '/tmp/fake.png'),
      read: vi.fn(async (_p: string) => ({ data: Buffer.from('xyz') })),
    };

    const pubSubService = {
      instance: { publish: vi.fn() },
    };

    const svc = new HaikuGeneratorService(
      // @ts-expect-error - minimal test doubles
      haikuRepository,
      // @ts-expect-error - minimal test doubles
      chapterRepository,
      // @ts-expect-error - minimal test doubles
      bookService,
      // @ts-expect-error - minimal test doubles
      markovEvaluator,
      // @ts-expect-error - minimal test doubles
      naturalLanguage,
      // @ts-expect-error - minimal test doubles
      canvasService,
      // @ts-expect-error - minimal test doubles
      pubSubService,
    );

    return {
      svc,
      deps: {
        haikuRepository,
        chapterRepository,
        bookService,
        markovEvaluator,
        naturalLanguage,
        canvasService,
        pubSubService,
      },
    };
  };

  beforeEach(() => {
    process.env.MIN_QUOTES_COUNT = '0';
    process.env.SENTIMENT_MIN_SCORE = '0';
    process.env.MARKOV_MIN_SCORE = '0';
    process.env.VERSE_MAX_LENGTH = '100';
  });

  it('buildHaiku constructs expected HaikuValue', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows partial book shape
    const book = { reference: 'r', title: 't', author: 'a' };
    // @ts-expect-error – test stub allows partial chapter shape
    const chapter = { content: 'foo bar baz' };
    const verses = ['foo bar', 'lorem ipsum dolor', 'sit amet'];
    const result = svc.buildHaiku(book, chapter, verses);
    expect(result.book.reference).toBe('r');
    expect(result.chapter.content).toBe('foo bar baz');
    expect(result.rawVerses.length).toBe(3);
    expect(result.verses.length).toBe(3);
    expect(result.cacheUsed).toBe(false);
    expect(typeof result.executionTime).toBe('number');
  });

  it('selectRandomChapter returns an id from chapters', () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows minimal param shape
    const id = svc.selectRandomChapter({ chapters: ['c1', 'c2'] });
    expect(['c1', 'c2']).toContain(id);
  });

  it('isQuoteInvalid respects checks and env vars', () => {
    const { svc, deps } = makeService();
    deps.naturalLanguage.hasUpperCaseWords = () => true;
    expect(svc.isQuoteInvalid('ANY')).toBe(true);
    deps.naturalLanguage.hasUpperCaseWords = () => false;
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => true;
    expect(svc.isQuoteInvalid('bad #')).toBe(true);
    deps.naturalLanguage.hasBlacklistedCharsInQuote = () => false;
    process.env.VERSE_MAX_LENGTH = '3';
    expect(svc.isQuoteInvalid('longer')).toBe(true);
    process.env.VERSE_MAX_LENGTH = '100';
    expect(svc.isQuoteInvalid('ok')).toBe(false);
  });

  it('selectHaikuVerses selects 5-7-5 with positive scores', () => {
    const { svc, deps } = makeService();
    // Make syllable count match (we use word count as syllables in this stub)
    const quotes = [
      { quote: 'one two three four five', index: 0 }, // 5
      { quote: 'one two three four five six seven', index: 1 }, // 7
      { quote: 'one two three four five', index: 2 }, // 5
    ];
    deps.naturalLanguage.startWithConjunction = () => false;
    deps.naturalLanguage.analyzeSentiment = () => 1;
    deps.markovEvaluator.evaluateHaiku = () => 1;

    const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = svc.selectHaikuVerses(quotes);
    randSpy.mockRestore();
    expect(result.length).toBe(3);
  });

  it('appendImg attaches base64 image', async () => {
    const { svc } = makeService();
    // @ts-expect-error – test stub allows partial haiku shape
    const haiku = {
      verses: ['a', 'b', 'c'],
      book: { reference: 'r', title: 't', author: 'a' },
      chapter: { content: 'x' },
    };
    const withImg = await svc.appendImg(haiku);
    expect(withImg.image).toBeDefined();
    expect(typeof withImg.image).toBe('string');
  });
});
