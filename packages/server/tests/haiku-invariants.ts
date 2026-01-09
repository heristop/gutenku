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

    expect(gen.isQuoteInvalid('AND I WANT TO BE')).toBeTruthy();
    expect(gen.isQuoteInvalid('I #want to be')).toBeTruthy();
    process.env.VERSE_MAX_LENGTH = '5';
    expect(gen.isQuoteInvalid('too long here')).toBeTruthy();
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
      { index: 0, quote: 'An old silent pond', syllableCount: 5 },
      { index: 1, quote: 'A frog jumps into the pond', syllableCount: 7 },
      { index: 2, quote: 'Splash! Silence again', syllableCount: 5 },
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
      { index: 0, quote: 'And old silent pond', syllableCount: 5 }, // starts with conjunction (invalid for first)
      { index: 1, quote: 'An old silent pond', syllableCount: 5 }, // Valid 5 (first)
      { index: 2, quote: 'A frog jumps into the pond', syllableCount: 7 }, // Valid 7 (second)
      { index: 3, quote: 'Under autumn sky', syllableCount: 5 }, // Valid 5 (third)
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
      { index: 0, quote: 'one two three four five', syllableCount: 5 },
      { index: 1, quote: 'one two three four five six seven', syllableCount: 7 },
      { index: 2, quote: 'one two three four five', syllableCount: 5 },
      { index: 3, quote: 'alpha beta gamma delta epsilon zeta eta theta', syllableCount: 17 },
    ];

    process.env.MIN_QUOTES_COUNT = '1';
    const filtered = gen.filterQuotesCountingSyllables(quotes);
    expect(filtered.length).toBeGreaterThan(0);

    process.env.MIN_QUOTES_COUNT = '100';
    const gated = gen.filterQuotesCountingSyllables(quotes);
    expect(gated).toEqual([]);
  });
});
