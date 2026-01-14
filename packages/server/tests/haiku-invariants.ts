import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import dotenv from 'dotenv';
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

dotenv.config();

// Lightweight fakes for domain-level tests
class FakeHaikuRepository implements IHaikuRepository {
  async createCacheWithTTL(): Promise<void> {}
  async extractFromCache(): Promise<HaikuValue[]> {
    return [];
  }
  async extractOneFromCache(): Promise<HaikuValue | null> {
    return null;
  }
}
class FakeChapterRepository implements IChapterRepository {
  async getAllChapters(): Promise<ChapterValue[]> {
    return [];
  }
  async getChapterById(): Promise<ChapterValue | null> {
    return null;
  }
  async getFilteredChapters(): Promise<ChapterValue[]> {
    return [];
  }
}
class FakeBookRepository implements IBookRepository {
  async getAllBooks(): Promise<BookValue[]> {
    return [];
  }
  async getBookById(): Promise<BookValue | null> {
    return null;
  }
  async selectRandomBook(): Promise<BookValue> {
    return {
      author: 'a',
      chapters: ['c1'],
      reference: 'r',
      title: 't',
    } as unknown as BookValue;
  }
}
class FakeMarkovEvaluatorService {
  evaluateHaiku(_v: string[]): number {
    return 1;
  }
  evaluateHaikuTrigrams(_v: string[]): number {
    return 1;
  }
  async load(): Promise<void> {}
}
class FakeCanvasService implements ICanvasService {
  useTheme(_t: string): void {}
  async create(): Promise<string> {
    return '/tmp/x.png';
  }
  async read(_p: string): Promise<{ data: Buffer; contentType: string }> {
    return { contentType: 'image/jpeg', data: Buffer.from('x') };
  }
}
class FakeEventBus implements IEventBus {
  publish = vi.fn(async () => {});
}

describe('HaikuGeneratorService invariants (domain-level)', () => {
  beforeEach(() => {
    // Deterministic selection (always pick first matching)
    // Note: Score thresholds are now constants - configure generator for tests
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('rejects invalid quotes (uppercase, blacklisted, too long)', () => {
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

    expect(gen.isQuoteInvalid('AND I WANT TO BE')).toBeTruthy();
    expect(gen.isQuoteInvalid('I #want to be')).toBeTruthy();
    // VERSE_MAX_LENGTH is now a constant (30), so test with a string >= 30 chars
    expect(
      gen.isQuoteInvalid(
        'this is a very long quote that exceeds thirty characters',
      ),
    ).toBeTruthy();
  });

  it('selects 5-7-5 verses in increasing order', () => {
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
    // Configure with negative thresholds to disable all scoring for this test
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

    const quotes = [
      { index: 0, quote: 'an old silent pond', syllableCount: 5 },
      { index: 1, quote: 'a frog jumps into the pond', syllableCount: 7 },
      { index: 2, quote: 'silence returns now', syllableCount: 5 },
    ];

    const result = gen.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses).toHaveLength(3);
    expect(result?.verses[0]).toBe('an old silent pond');
    expect(result?.verses[1]).toBe('a frog jumps into the pond');
    expect(result?.verses[2]).toBe('silence returns now');
  });

  it('does not allow the first verse to start with a conjunction', () => {
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
    // Configure with negative thresholds to disable all scoring for this test
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

    const quotes = [
      { index: 0, quote: 'And old silent pond', syllableCount: 5 }, // starts with conjunction (invalid for first)
      { index: 1, quote: 'an old silent pond', syllableCount: 5 }, // Valid 5 (first) - lowercase to avoid uppercase check
      { index: 2, quote: 'a frog jumps into the pond', syllableCount: 7 }, // Valid 7 (second)
      { index: 3, quote: 'under autumn sky', syllableCount: 5 }, // Valid 5 (third)
    ];

    const result = gen.selectHaikuVerses(quotes);
    expect(result).not.toBeNull();
    expect(result?.verses).toHaveLength(3);
    // Should pick the later valid 5-syllable verse
    expect(result?.verses[0]).toBe('an old silent pond');
    expect(result?.verses[1]).toBe('a frog jumps into the pond');
    expect(result?.verses[2]).toBe('under autumn sky');
  });

  it('filters quotes by syllable count (5 or 7 only)', () => {
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

    const quotes = [
      { index: 0, quote: 'one two three four five' }, // 5 syllables
      { index: 1, quote: 'dancing in the gentle breeze' }, // 7 syllables (valid words)
      { index: 2, quote: 'one two three four five' }, // 5 syllables (duplicate)
      { index: 3, quote: 'alpha beta gamma delta epsilon zeta eta theta' }, // 17 syllables (rejected)
    ];

    const filtered = gen.filterQuotesCountingSyllables(quotes);

    // Should only include 5 and 7 syllable quotes
    expect(filtered.length).toBe(3);
    expect(
      filtered.every((q) => q.syllableCount === 5 || q.syllableCount === 7),
    ).toBeTruthy();
  });
});
