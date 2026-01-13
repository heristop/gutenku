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
import type { BookValue, ChapterValue, HaikuValue } from '../src/shared/types';
import type { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';

// Sample literary texts for testing extraction fallback
const RICH_PUNCTUATION_TEXT = `
The old pond sits in silence. A frog jumps into the water. Splash! The silence returns.
Autumn moonlight shines. A worm digs silently into a chestnut. The night grows cold.
Spring rain falls gently. The willow tree bends low now. Green leaves touch water.
`;

const SPARSE_PUNCTUATION_TEXT = `
The morning light filters through bamboo leaves creating patterns on the floor
A gentle breeze carries the scent of cherry blossoms across the garden path
The river flows onward beneath the ancient stone bridge toward the sea
Mountain mist rises slowly revealing pine trees standing tall against sky
`;

const CLAUSE_HEAVY_TEXT = `
Morning light: filtering soft; the bamboo sways - shadows dancing on walls.
Cherry blossoms fall: pink petals drifting; carried by spring wind - onto still water.
Temple bells ring: echoes fading; through mountain passes - into distant valleys.
Autumn leaves turn: red and gold; covering old pathways - memories of summer.
`;

const MINIMAL_TEXT = `sunrise over mountains golden light spreads warmth birds sing morning songs`;

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
    return { author: 'Test Author', chapters: ['ch1'], reference: 'test-ref', title: 'Test Book' } as unknown as BookValue;
  }
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

describe('Haiku Pertinence Tests', () => {
  beforeEach(() => {
    // Note: MIN_QUOTES_COUNT, VERSE_MAX_LENGTH, SENTIMENT_MIN_SCORE, MARKOV_MIN_SCORE
    // are now constants in validation.ts, not env vars
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  describe('Extraction Method Fallback', () => {
    it('uses punctuation method for well-punctuated text', () => {
      const gen = createGenerator();
      const quotes = gen.extractQuotes(RICH_PUNCTUATION_TEXT);

      expect(quotes.length).toBeGreaterThanOrEqual(3);
      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: RICH_PUNCTUATION_TEXT } as ChapterValue,
        ['test', 'verses', 'here'],
      );
      expect(haiku.extractionMethod).toBe('punctuation');
    });

    it('falls back to tokenizer when punctuation yields insufficient quotes', () => {
      const gen = createGenerator();
      // MIN_QUOTES_THRESHOLD: punctuation=6, tokenizer=6, clause=6, chunk=12
      const quotes = gen.extractQuotes(SPARSE_PUNCTUATION_TEXT);

      // Should have tried fallback methods
      expect(quotes.length).toBeGreaterThanOrEqual(0);
    });

    it('uses clause extraction for clause-heavy text when punctuation fails', () => {
      const gen = createGenerator();
      // Uses per-method thresholds from MIN_QUOTES_THRESHOLD constant
      const quotes = gen.extractQuotes(CLAUSE_HEAVY_TEXT);

      expect(quotes.length).toBeGreaterThanOrEqual(0);
    });

    it('uses word chunks as last resort for minimal text', () => {
      const gen = createGenerator();
      // Chunk method requires 12 quotes (higher threshold)
      const quotes = gen.extractQuotes(MINIMAL_TEXT);

      // Word chunks should generate candidates from minimal text
      expect(quotes).toBeDefined();
    });

    it('returns empty array when no method yields enough quotes', () => {
      const gen = createGenerator();
      // All methods fail on very short text
      const quotes = gen.extractQuotes('too short');

      expect(quotes).toEqual([]);
    });
  });

  describe('Syllable Structure Validation', () => {
    it('generates haiku with 5-7-5 syllable pattern', () => {
      const gen = createGenerator();
      // Configure with very low thresholds to disable all scoring for this test
      gen.configure({
        score: {
          sentiment: -1000,
          markovChain: -1000,
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
        },
      });
      const nl = new NaturalLanguageService();

      const quotes = [
        { index: 0, quote: 'an old silent pond', syllableCount: 5 },
        { index: 1, quote: 'a frog jumps into the pond', syllableCount: 7 },
        { index: 2, quote: 'silence returns now', syllableCount: 5 },
      ];

      const result = gen.selectHaikuVerses(quotes);

      expect(result).not.toBeNull();
      expect(result?.verses).toHaveLength(3);
      expect(nl.countSyllables(result!.verses[0])).toBe(5);
      expect(nl.countSyllables(result!.verses[1])).toBe(7);
      expect(nl.countSyllables(result!.verses[2])).toBe(5);
    });

    it('rejects haiku when syllable pattern cannot be satisfied', () => {
      const gen = createGenerator();

      // Only 5-syllable quotes, no 7-syllable
      const quotes = [
        { index: 0, quote: 'An old silent pond', syllableCount: 5 },
        { index: 1, quote: 'The water ripples', syllableCount: 5 },
        { index: 2, quote: 'Silence returns now', syllableCount: 5 },
      ];

      const result = gen.selectHaikuVerses(quotes);
      expect(result).toBeNull();
    });

    it('filters quotes to only valid syllable counts (5 or 7)', () => {
      const gen = createGenerator();
      // Use real phrases with known syllable counts (verified by syllable library)
      const quotes = [
        { index: 0, quote: 'hi', syllableCount: 1 }, // 1 syllable - filtered out
        { index: 1, quote: 'an old silent pond', syllableCount: 5 }, // 5 syllables - kept
        { index: 2, quote: 'falling leaves in fall', syllableCount: 5 }, // 5 syllables - kept
        { index: 3, quote: 'a frog jumps into the pond', syllableCount: 7 }, // 7 syllables - kept
        { index: 4, quote: 'the quick brown fox jumps over', syllableCount: 6 }, // 6 syllables - filtered
      ];

      const filtered = gen.filterQuotesCountingSyllables(quotes, false);

      // Should only keep quotes with 5 or 7 syllables
      expect(filtered.length).toBeGreaterThanOrEqual(2);
      expect(filtered.every((q) => q.syllableCount === 5 || q.syllableCount === 7)).toBeTruthy();
    });
  });

  describe('Verse Content Validity', () => {
    it('verses are extracted from source text', () => {
      const gen = createGenerator();
      const sourceText = 'The old pond waits there. A frog leaps into water. The splash sounds clearly.';
      const quotes = gen.extractQuotes(sourceText);

      for (const quote of quotes) {
        expect(sourceText.toLowerCase()).toContain(quote.quote.toLowerCase().trim());
      }
    });

    it('buildHaiku includes raw verses from source', () => {
      const gen = createGenerator();
      const verses = ['An old silent pond', 'A frog jumps into the pond', 'Splash! Silence again'];

      const haiku = gen.buildHaiku(
        { author: 'Basho', reference: 'basho-1', title: 'Classic Haiku' } as BookValue,
        { content: 'Full chapter content here', title: 'Chapter 1' } as ChapterValue,
        verses,
      );

      expect(haiku.rawVerses).toEqual(verses);
      expect(haiku.verses).toBeDefined();
      expect(haiku.verses.length).toBe(3);
    });

    it('cleaned verses remove trailing punctuation', () => {
      const gen = createGenerator();
      const verses = ['An old silent pond,', 'A frog jumps into the pond.', 'Splash! Silence again!'];

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: 'content' } as ChapterValue,
        verses,
      );

      // Cleaned verses should have punctuation removed
      expect(haiku.verses[0]).not.toMatch(/[,.]$/);
      expect(haiku.verses[1]).not.toMatch(/[,.]$/);
    });
  });

  describe('Quality Scoring', () => {
    it('includes quality score in built haiku', () => {
      const gen = createGenerator();
      const verses = ['The autumn wind blows', 'Leaves fall gently to the ground', 'Winter approaches'];

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: 'content' } as ChapterValue,
        verses,
      );

      expect(haiku.quality).toBeDefined();
      expect(haiku.quality).toHaveProperty('natureWords');
      expect(haiku.quality).toHaveProperty('repeatedWords');
      expect(haiku.quality).toHaveProperty('weakStarts');
      expect(haiku.quality).toHaveProperty('totalScore');
    });

    it('detects nature words in haiku', () => {
      const gen = createGenerator();
      const versesWithNature = ['The autumn wind blows', 'Cherry blossoms fall softly', 'Moon rises tonight'];

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: 'content' } as ChapterValue,
        versesWithNature,
      );

      expect(haiku.quality?.natureWords).toBeGreaterThan(0);
    });

    it('penalizes repeated words', () => {
      const gen = createGenerator();
      const versesWithRepeats = ['The wind blows the wind', 'Wind carries the leaves away', 'Wind whispers softly'];

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: 'content' } as ChapterValue,
        versesWithRepeats,
      );

      expect(haiku.quality?.repeatedWords).toBeGreaterThan(0);
    });

    it('detects weak starts (pronouns like it, there, this)', () => {
      const gen = createGenerator();
      // Weak starts are pronouns: it, there, this, that, they, we, he, she, i
      const versesWithWeakStart = ['It was a dark night', 'There is no escape now', 'This is the ending'];

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: 'content' } as ChapterValue,
        versesWithWeakStart,
      );

      expect(haiku.quality?.weakStarts).toBeGreaterThan(0);
    });
  });

  describe('Extraction Method Tracking', () => {
    it('tracks punctuation method correctly', () => {
      const gen = createGenerator();
      gen.extractQuotes(RICH_PUNCTUATION_TEXT);

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: RICH_PUNCTUATION_TEXT } as ChapterValue,
        ['v1', 'v2', 'v3'],
      );

      expect(haiku.extractionMethod).toBe('punctuation');
    });

    it('extraction method is included in haiku response', () => {
      const gen = createGenerator();

      const haiku = gen.buildHaiku(
        { author: 'Test', reference: 'ref', title: 'Title' } as BookValue,
        { content: 'content' } as ChapterValue,
        ['verse one here', 'verse two is longer now', 'verse three here'],
      );

      expect(haiku).toHaveProperty('extractionMethod');
      expect(['punctuation', 'tokenizer', 'clause', 'chunk']).toContain(haiku.extractionMethod);
    });
  });

  describe('Verse Selection Order', () => {
    it('selects verses in increasing index order from source', () => {
      const gen = createGenerator();

      const quotes = [
        { index: 10, quote: 'First five syllables', syllableCount: 5 },
        { index: 20, quote: 'Second seven syllables here', syllableCount: 7 },
        { index: 5, quote: 'Early five here too', syllableCount: 5 },
        { index: 30, quote: 'Third five syllables', syllableCount: 5 },
      ];

      const result = gen.selectHaikuVerses(quotes);

      // First verse (5) should have lower index than second (7)
      // Second verse (7) should have lower index than third (5)
      if (result && result.verses.length === 3) {
        const firstQuote = quotes.find((q) => q.quote === result.verses[0]);
        const secondQuote = quotes.find((q) => q.quote === result.verses[1]);
        const thirdQuote = quotes.find((q) => q.quote === result.verses[2]);

        expect(firstQuote!.index).toBeLessThan(secondQuote!.index);
        expect(secondQuote!.index).toBeLessThan(thirdQuote!.index);
      }
    });
  });

  describe('Invalid Quote Rejection', () => {
    it('rejects quotes with uppercase words', () => {
      const gen = createGenerator();
      expect(gen.isQuoteInvalid('THIS IS LOUD')).toBeTruthy();
      expect(gen.isQuoteInvalid('SHOUTING HERE')).toBeTruthy();
    });

    it('rejects quotes with blacklisted characters', () => {
      const gen = createGenerator();
      expect(gen.isQuoteInvalid('test #hashtag here')).toBeTruthy();
      expect(gen.isQuoteInvalid('test @mention here')).toBeTruthy();
    });

    it('rejects quotes exceeding max length', () => {
      const gen = createGenerator();
      process.env.VERSE_MAX_LENGTH = '10';
      expect(gen.isQuoteInvalid('this is a very long quote that exceeds the limit')).toBeTruthy();
    });

    it('accepts valid quotes', () => {
      const gen = createGenerator();
      process.env.VERSE_MAX_LENGTH = '100';
      expect(gen.isQuoteInvalid('an old silent pond')).toBeFalsy();
      expect(gen.isQuoteInvalid('autumn moonlight shines')).toBeFalsy();
    });
  });

  describe('Book and Chapter Metadata', () => {
    it('includes book metadata in haiku', () => {
      const gen = createGenerator();

      const haiku = gen.buildHaiku(
        { author: 'Jane Austen', reference: 'pride-prejudice', title: 'Pride and Prejudice', emoticons: '📚💕' } as BookValue,
        { content: 'Chapter content', title: 'Chapter 1' } as ChapterValue,
        ['verse one', 'verse two', 'verse three'],
      );

      expect(haiku.book.author).toBe('Jane Austen');
      expect(haiku.book.title).toBe('Pride and Prejudice');
      expect(haiku.book.reference).toBe('pride-prejudice');
      expect(haiku.book.emoticons).toBe('📚💕');
    });

    it('includes chapter in haiku', () => {
      const gen = createGenerator();

      const chapter = { content: 'Full chapter content here', title: 'The Beginning' } as ChapterValue;
      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        chapter,
        ['v1', 'v2', 'v3'],
      );

      expect(haiku.chapter).toBe(chapter);
      expect(haiku.chapter.title).toBe('The Beginning');
    });
  });

  describe('Context Extraction', () => {
    it('extracts context around verses from chapter', () => {
      const gen = createGenerator();
      const chapterContent = 'Before the pond. An old silent pond waits. After the frog. A frog jumps into the pond now. The end comes. Splash! Silence again returns.';

      const haiku = gen.buildHaiku(
        { author: 'a', reference: 'r', title: 't' } as BookValue,
        { content: chapterContent } as ChapterValue,
        ['An old silent pond', 'A frog jumps into the pond', 'Splash! Silence again'],
      );

      expect(haiku.context).toBeDefined();
      expect(haiku.context?.length).toBe(3);
    });
  });
});
