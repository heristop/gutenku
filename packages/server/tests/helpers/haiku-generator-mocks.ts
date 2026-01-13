import 'reflect-metadata';
import { vi } from 'vitest';
import HaikuGeneratorService from '../../src/domain/services/HaikuGeneratorService';
import type { IHaikuRepository } from '../../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../../src/domain/services/ICanvasService';
import type { IEventBus } from '../../src/domain/events/IEventBus';
import { PubSubService } from '../../src/infrastructure/services/PubSubService';

export class FakeHaikuRepository implements IHaikuRepository {
  extractFromCache = vi.fn(async () => []);
  extractOneFromCache = vi.fn(async () => null);
  createCacheWithTTL = vi.fn(async () => {});
}

export class FakeChapterRepository implements IChapterRepository {
  getFilteredChapters = vi.fn(async () => []);
  getAllChapters = vi.fn(async () => []);
  getChapterById = vi.fn(async () => null);
}

export class FakeBookRepository implements IBookRepository {
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

export class FakeCanvasService implements ICanvasService {
  useTheme = vi.fn();
  create = vi.fn(async () => '/tmp/fake.png');
  read = vi.fn(async () => ({
    contentType: 'image/jpeg',
    data: Buffer.from('xyz'),
  }));
}

export const createMarkovEvaluator = () => ({
  evaluateHaiku: vi.fn((_verses: string[]) => 1),
  evaluateHaikuTrigrams: vi.fn((_verses: string[]) => 1),
  load: vi.fn(async () => {}),
});

export const createNaturalLanguage = () => ({
  analyzeGrammar: vi.fn(() => ({ score: 1 })),
  analyzePhonetics: vi.fn(() => ({ alliterationScore: 1 })),
  analyzeSentiment: (_t: string) => 1,
  countSyllables: (t: string) => t.split(/\s+/g).filter(Boolean).length,
  extractByExpandedClauses: (t: string) => t.split(/[:;,\-—]+\s+/g).filter((s: string) => s.trim().length > 0),
  extractSentences: (t: string) => t.split(/[.?!]+\s+/g),
  extractSentencesByPunctuation: (t: string) => t.split(/[.?!,;]+\s+/g),
  extractWordChunks: (t: string) => {
    const words = t.split(/\s+/g).filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i <= words.length - 2; i += 2) {chunks.push(words.slice(i, i + 2).join(' '));}
    return chunks;
  },
  extractWords: (t: string) => t.split(/\s+/g).filter(Boolean),
  getPOSTags: vi.fn(() => [{ word: 'test', tag: 'VB' }]),
  hasBlacklistedCharsInQuote: (_t: string) => false,
  hasUpperCaseWords: (_t: string) => false,
  initTfIdf: vi.fn(),
  scoreDistinctiveness: vi.fn(() => 1),
  startWithConjunction: (_t: string) => false,
});

export const makeHaikuGeneratorService = () => {
  const markovEvaluator = createMarkovEvaluator();
  const naturalLanguage = createNaturalLanguage();
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

  return { deps: { markovEvaluator, naturalLanguage }, svc };
};
