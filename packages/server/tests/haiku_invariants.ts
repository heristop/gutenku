import 'reflect-metadata';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import dotenv from 'dotenv';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import { IBookRepository } from '../src/domain/repositories/IBookRepository';
import { ICanvasService } from '../src/domain/services/ICanvasService';
import { IEventBus } from '../src/domain/events/IEventBus';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import { BookValue, ChapterValue, HaikuValue } from '../src/shared/types';
import { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';

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
      title: 't',
      author: 'a',
      reference: 'r',
      chapters: ['c1'],
    } as unknown as BookValue;
  }
}
class FakeMarkovEvaluatorService {
  evaluateHaiku(_v: string[]): number {
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
    return { data: Buffer.from('x'), contentType: 'image/jpeg' };
  }
}
class FakeEventBus implements IEventBus {
  publish = vi.fn(async () => {});
}

describe('HaikuGeneratorService invariants (domain-level)', () => {
  beforeEach(() => {
    // Make selection permissive so we focus on invariants only
    process.env.MIN_QUOTES_COUNT = '1';
    process.env.SENTIMENT_MIN_SCORE = '-1000';
    process.env.MARKOV_MIN_SCORE = '-1000';
    process.env.VERSE_MAX_LENGTH = '1000';

    // Deterministic selection (always pick first matching)
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

    expect(gen.isQuoteInvalid('AND I WANT TO BE')).toBe(true);
    expect(gen.isQuoteInvalid('I #want to be')).toBe(true);
    process.env.VERSE_MAX_LENGTH = '5';
    expect(gen.isQuoteInvalid('too long here')).toBe(true);
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

    const quotes = [
      { quote: 'An old silent pond', index: 0 }, // ~5 syllables
      { quote: 'A frog jumps into the pond', index: 1 }, // ~7 syllables
      { quote: 'Splash! Silence again', index: 2 }, // ~5 syllables
    ];

    const selected = gen.selectHaikuVerses(quotes);
    expect(selected).toHaveLength(3);
    expect(selected[0]).toBe('An old silent pond');
    expect(selected[1]).toBe('A frog jumps into the pond');
    expect(selected[2]).toBe('Splash! Silence again');
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

    const quotes = [
      { quote: 'And old silent pond', index: 0 }, // 5 but starts with conjunction (invalid for first)
      { quote: 'An old silent pond', index: 1 }, // valid 5 (first)
      { quote: 'A frog jumps into the pond', index: 2 }, // valid 7 (second)
      { quote: 'Under autumn sky', index: 3 }, // valid 5 (third)
    ];

    const selected = gen.selectHaikuVerses(quotes);
    expect(selected).toHaveLength(3);
    // Should pick the later valid 5-syllable verse
    expect(selected[0]).toBe('An old silent pond');
    expect(selected[1]).toBe('A frog jumps into the pond');
    expect(selected[2]).toBe('Under autumn sky');
  });

  it('filters quotes by syllable count and respects MIN_QUOTES_COUNT', () => {
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
      { quote: 'one two three four five', index: 0 }, // 5 syllables (words)
      { quote: 'one two three four five six seven', index: 1 }, // 7
      { quote: 'one two three four five', index: 2 }, // 5
      { quote: 'alpha beta gamma delta epsilon zeta eta theta', index: 3 }, // 8+ not 5/7
    ];

    process.env.MIN_QUOTES_COUNT = '1';
    const filtered = gen.filterQuotesCountingSyllables(quotes);
    expect(filtered.length).toBeGreaterThan(0);

    process.env.MIN_QUOTES_COUNT = '100';
    const gated = gen.filterQuotesCountingSyllables(quotes);
    expect(gated).toEqual([]);
  });
});
