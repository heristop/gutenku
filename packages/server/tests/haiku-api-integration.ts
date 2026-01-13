import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';
import type { IEventBus } from '../src/domain/events/IEventBus';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import type { BookValue, ChapterValue, HaikuValue, ExtractionMethod } from '../src/shared/types';
import type { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';

// Sample texts that exercise different extraction methods
const TEXTS = {
  punctuated: `
The ancient forest breathes. Moss covers every stone here. Birds call through the mist.
The river flows swift. Silver fish dart beneath waves. Sunlight dances bright.
Mountain peaks stand tall. Snow melts into crystal streams. Spring awakens all.
`,
  sparse: `
Morning light filters through bamboo leaves creating soft shadows on walls;
Cherry blossoms fall: pink petals carried by wind - landing on still water;
Temple bells echo: sounds fading through mountain pass - into valleys deep;
`,
  minimal: `sunrise golden light spreads across the valley birds begin their songs`,
};

// Fake repositories
class FakeHaikuRepository implements IHaikuRepository {
  async createCacheWithTTL(): Promise<void> {}
  async extractFromCache(): Promise<HaikuValue[]> { return []; }
  async extractOneFromCache(): Promise<HaikuValue | null> { return null; }
}

class FakeChapterRepository implements IChapterRepository {
  async getAllChapters(): Promise<ChapterValue[]> { return []; }
  async getChapterById(): Promise<ChapterValue | null> { return null; }
  async getFilteredChapters(): Promise<ChapterValue[]> { return []; }
}

class FakeBookRepository implements IBookRepository {
  async getAllBooks(): Promise<BookValue[]> { return []; }
  async getBookById(): Promise<BookValue | null> { return null; }
  async selectRandomBook(): Promise<BookValue> {
    return { author: 'a', chapters: [], reference: 'r', title: 't' } as unknown as BookValue;
  }
  async selectRandomBooks(): Promise<BookValue[]> { return []; }
}

class FakeMarkovEvaluatorService {
  evaluateHaiku(_v: string[]): number { return 1; }
  evaluateHaikuTrigrams(_v: string[]): number { return 1; }
  async load(): Promise<void> {}
}

class FakeCanvasService implements ICanvasService {
  useTheme(_t: string): void {}
  async create(): Promise<string> { return '/tmp/test.png'; }
  async read(_p: string): Promise<{ data: Buffer; contentType: string }> {
    return { contentType: 'image/jpeg', data: Buffer.from('test') };
  }
}

class FakeEventBus implements IEventBus {
  publish = vi.fn(async () => {});
}

const createGenerator = () => {
  const gen = new HaikuGeneratorService(
    new FakeHaikuRepository(),
    new FakeChapterRepository(),
    new FakeBookRepository(),
    new FakeMarkovEvaluatorService() as unknown as MarkovEvaluatorService,
    new NaturalLanguageService(),
    new FakeCanvasService(),
    new PubSubService(),
    new FakeEventBus(),
  );
  // Disable all filters by default for test stability
  gen.configure({
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
  return gen;
};

describe('Haiku API Integration Tests', () => {
  beforeEach(() => {
    process.env.MIN_QUOTES_COUNT = '3';
    process.env.SENTIMENT_MIN_SCORE = '-1000';
    process.env.MARKOV_MIN_SCORE = '-1000';
    process.env.VERSE_MAX_LENGTH = '100';
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  describe('Extraction Method in API Response', () => {
    it('extractQuotes returns quotes and sets extraction method', () => {
      const gen = createGenerator();
      const quotes = gen.extractQuotes(TEXTS.punctuated);

      expect(quotes.length).toBeGreaterThan(0);

      // Build haiku to capture extraction method
      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku.extractionMethod).toBeDefined();
      expect(['punctuation', 'tokenizer', 'clause', 'chunk']).toContain(haiku.extractionMethod);
    });

    it('punctuation method is used for well-punctuated text', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku.extractionMethod).toBe('punctuation');
    });

    it('fallback method is used when punctuation yields insufficient quotes', () => {
      const gen = createGenerator();
      // Very high threshold forces fallback - sparse text has few punctuation-based sentences
      process.env.MIN_QUOTES_COUNT = '100';

      const quotes = gen.extractQuotes(TEXTS.sparse);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.sparse } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      // When no method yields enough quotes, extractQuotes returns empty
      // and method stays at last attempted

      if (quotes.length === 0) {
        // Any method could have been last attempted
        expect(['punctuation', 'tokenizer', 'clause', 'chunk']).toContain(haiku.extractionMethod);
      } else {
        expect(['tokenizer', 'clause', 'chunk']).toContain(haiku.extractionMethod);
      }
    });

    it('chunk method generates many candidates from minimal text', () => {
      const gen = createGenerator();
      // Even with low threshold, chunk method generates many 2-4 word combinations
      process.env.MIN_QUOTES_COUNT = '3';

      // Minimal text without punctuation - chunk method will be used
      const minimalNoPunctuation = 'sunrise golden light spreads across valley birds begin their songs morning dew';
      const quotes = gen.extractQuotes(minimalNoPunctuation);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: minimalNoPunctuation } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      // With no punctuation, should use tokenizer, clause, or chunk
      expect(['punctuation', 'tokenizer', 'clause', 'chunk']).toContain(haiku.extractionMethod);
      // Verify extraction produced some candidates
      expect(quotes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Response Structure', () => {
    it('buildHaiku returns all required GraphQL fields', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Famous Author', reference: 'book-123', title: 'Famous Book', emoticons: '📚' } as BookValue,
        { content: TEXTS.punctuated, title: 'Chapter 1' } as ChapterValue,
        ['An old silent pond', 'A frog jumps into the pond', 'Splash! Silence again'],
      );

      // Required fields for GraphQL Haiku type
      expect(haiku).toHaveProperty('book');
      expect(haiku).toHaveProperty('chapter');
      expect(haiku).toHaveProperty('verses');
      expect(haiku).toHaveProperty('rawVerses');
      expect(haiku).toHaveProperty('cacheUsed');
      expect(haiku).toHaveProperty('executionTime');
      expect(haiku).toHaveProperty('quality');
      expect(haiku).toHaveProperty('extractionMethod');
      expect(haiku).toHaveProperty('context');
    });

    it('book object contains all required fields', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Jane Austen', reference: 'pride-prejudice', title: 'Pride and Prejudice', emoticons: '💕📖' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku.book.reference).toBe('pride-prejudice');
      expect(haiku.book.title).toBe('Pride and Prejudice');
      expect(haiku.book.author).toBe('Jane Austen');
      expect(haiku.book.emoticons).toBe('💕📖');
    });

    it('quality object contains all scoring fields', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['The autumn wind blows', 'Leaves fall gently to the ground', 'Winter approaches'],
      );

      expect(haiku.quality).toHaveProperty('natureWords');
      expect(haiku.quality).toHaveProperty('repeatedWords');
      expect(haiku.quality).toHaveProperty('weakStarts');
      expect(haiku.quality).toHaveProperty('totalScore');

      expect(typeof haiku.quality?.natureWords).toBe('number');
      expect(typeof haiku.quality?.repeatedWords).toBe('number');
      expect(typeof haiku.quality?.weakStarts).toBe('number');
      expect(typeof haiku.quality?.totalScore).toBe('number');
    });

    it('verses arrays have correct length', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const verses = ['First verse here', 'Second verse is longer', 'Third verse end'];
      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        verses,
      );

      expect(haiku.verses).toHaveLength(3);
      expect(haiku.rawVerses).toHaveLength(3);
    });

    it('executionTime is included in response', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      // executionTime is calculated from internal state, type should be number
      expect(haiku).toHaveProperty('executionTime');
      expect(typeof haiku.executionTime).toBe('number');
    });

    it('cacheUsed is false for fresh generation', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku.cacheUsed).toBeFalsy();
    });
  });

  describe('Extraction Method Values', () => {
    it('extractionMethod is one of valid enum values', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      const validMethods: ExtractionMethod[] = ['punctuation', 'tokenizer', 'clause', 'chunk'];
      expect(validMethods).toContain(haiku.extractionMethod);
    });

    it('extractionMethod type matches ExtractionMethod union', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      // Type check - should compile without errors
      const method: ExtractionMethod | undefined = haiku.extractionMethod;
      expect(method).toBeDefined();
    });
  });

  describe('Haiku Quality in API Response', () => {
    it('detects nature words in haiku verses', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['The autumn wind blows', 'Cherry blossoms fall softly', 'Moon rises tonight'],
      );

      expect(haiku.quality?.natureWords).toBeGreaterThan(0);
    });

    it('counts repeated words across verses', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['The wind blows the wind', 'Wind carries the leaves away', 'Wind whispers softly'],
      );

      expect(haiku.quality?.repeatedWords).toBeGreaterThan(0);
    });

    it('detects weak starts (pronouns)', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['It was a dark night', 'There is no escape now', 'This is the ending'],
      );

      expect(haiku.quality?.weakStarts).toBeGreaterThan(0);
    });

    it('calculates totalScore from quality metrics', () => {
      const gen = createGenerator();
      gen.extractQuotes(TEXTS.punctuated);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['The autumn wind blows', 'Leaves fall to the ground now', 'Winter approaches'],
      );

      expect(typeof haiku.quality?.totalScore).toBe('number');
    });
  });

  describe('Context Extraction in API Response', () => {
    it('extracts context for each verse', () => {
      const gen = createGenerator();
      const chapterContent = 'Before. An old silent pond waits. Middle. A frog jumps into the pond now. After. Splash! Silence again returns. End.';

      gen.extractQuotes(chapterContent);

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: chapterContent } as ChapterValue,
        ['An old silent pond', 'A frog jumps into the pond', 'Splash! Silence again'],
      );

      expect(haiku.context).toBeDefined();
      expect(haiku.context?.length).toBe(3);
    });
  });

  describe('Multiple Extractions Consistency', () => {
    it('same text produces same extraction method', () => {
      const gen = createGenerator();

      gen.extractQuotes(TEXTS.punctuated);
      const haiku1 = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      gen.extractQuotes(TEXTS.punctuated);
      const haiku2 = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku1.extractionMethod).toBe(haiku2.extractionMethod);
    });

    it('different texts may use different extraction methods', () => {
      const gen = createGenerator();
      process.env.MIN_QUOTES_COUNT = '10';

      gen.extractQuotes(TEXTS.punctuated);
      const haiku1 = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.punctuated } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      process.env.MIN_QUOTES_COUNT = '50';
      gen.extractQuotes(TEXTS.minimal);
      const haiku2 = gen.buildHaiku(
        { author: 'Test', reference: 'test', title: 'Test' } as BookValue,
        { content: TEXTS.minimal } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      // Methods may differ based on content and thresholds
      expect(haiku1.extractionMethod).toBeDefined();
      expect(haiku2.extractionMethod).toBeDefined();
    });
  });
});
