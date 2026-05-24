import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import OpenAIGeneratorService from '../src/infrastructure/services/OpenAIGeneratorService';
import type HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IOpenAIClient } from '../src/domain/gateways/IOpenAIClient';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { HaikuValue } from '../src/shared/types';

const createMockHaiku = (index: number): HaikuValue =>
  ({
    book: {
      title: `Book ${index}`,
      author: `Author ${index}`,
      reference: `ref-${index}`,
      emoticons: '📖',
    },
    chapter: { content: `Chapter ${index} content`, title: `Chapter ${index}` },
    verses: ['First verse here', 'Second verse is longer', 'Third verse end'],
    rawVerses: [
      'First verse here',
      'Second verse is longer',
      'Third verse end',
    ],
    cacheUsed: false,
    executionTime: 100,
    context: [],
    quality: {
      totalScore: 0.8,
      natureWords: 2,
      repeatedWords: 0,
      weakStarts: 0,
      blacklistedVerses: 0,
      properNouns: 0,
      verseLengthPenalty: 0,
      sentiment: 0.6,
      grammar: 0.7,
      markovFlow: 0.5,
      trigramFlow: 0.4,
      uniqueness: 0.9,
      alliteration: 0.3,
      verseDistance: 0.5,
      lineLengthBalance: 0.6,
      imageryDensity: 0.7,
      semanticCoherence: 0.8,
      verbPresence: 0.5,
    },
  }) as unknown as HaikuValue;

const makeOkClient = (): IOpenAIClient => ({
  configure: vi.fn(),
  chatCompletionsCreate: vi
    .fn()
    .mockResolvedValueOnce({
      choices: [
        { message: { content: 'thinking... {"id": 0, "reason": "best"}' } },
      ],
    })
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title":"T","description":"D","hashtags":"#h"}',
          },
        },
      ],
    })
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"fr":"Fr","jp":"Jp","es":"Es","it":"It","de":"De"}',
          },
        },
      ],
    })
    .mockResolvedValueOnce({
      choices: [{ message: { content: '📚' } }],
    }),
});

describe('OpenAIGeneratorService - GA live generation path', () => {
  let mockHaikuGenerator: HaikuGeneratorService;
  let mockHaikuRepository: IHaikuRepository;

  beforeEach(() => {
    process.env.OPENAI_SELECTION_COUNT = '2';
    mockHaikuRepository = {
      extractTopScored: vi.fn().mockResolvedValue([]),
      createCacheWithTTL: vi.fn(),
      extractFromCache: vi.fn(),
      extractOneFromCache: vi.fn(),
      extractDeterministicFromCache: vi.fn(),
      getCacheCount: vi.fn(),
    } as unknown as IHaikuRepository;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('extracts the JSON object even when surrounded by text and selects it', async () => {
    mockHaikuGenerator = {
      buildFromDb: vi.fn().mockResolvedValue(createMockHaiku(0)),
      extractVersePoolsFromContent: vi.fn(() => ({
        fiveSyllable: [],
        sevenSyllable: [],
        bookId: 'ref-0',
        chapterId: 'Chapter 0',
      })),
      getNaturalLanguageService: vi.fn(() => ({})),
      getMarkovEvaluator: vi.fn(() => ({})),
    } as unknown as HaikuGeneratorService;

    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      makeOkClient(),
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      liveCount: 0,
      fromDb: 2,
      temperature: { description: 0.3 },
    });
    // seed candidates from DB
    mockHaikuRepository.extractTopScored = vi
      .fn()
      .mockResolvedValue([createMockHaiku(1), createMockHaiku(2)]);

    const result = await service.generate();
    expect(result).toBeDefined();
    expect(result?.selectionInfo?.reason).toBe('best');
  });

  it('returns no live candidates when GA seed haiku is missing', async () => {
    mockHaikuGenerator = {
      buildFromDb: vi.fn().mockResolvedValue(null),
      extractVersePoolsFromContent: vi.fn(),
      getNaturalLanguageService: vi.fn(() => ({})),
      getMarkovEvaluator: vi.fn(() => ({})),
    } as unknown as HaikuGeneratorService;

    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      makeOkClient(),
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      liveCount: 2,
      fromDb: 0,
      temperature: { description: 0.3 },
    });

    // No DB and no live candidates -> selection empty -> index out of bounds path
    await expect(service.generate()).rejects.toThrow(
      /Cannot set propert(?:ies|y) .*selectionInfo/,
    );
  });

  it('recovers from GA evolution failure and continues', async () => {
    mockHaikuGenerator = {
      buildFromDb: vi.fn().mockResolvedValue(createMockHaiku(0)),
      extractVersePoolsFromContent: vi.fn(() => {
        throw new Error('extract failed');
      }),
      getNaturalLanguageService: vi.fn(() => ({})),
      getMarkovEvaluator: vi.fn(() => ({})),
    } as unknown as HaikuGeneratorService;

    mockHaikuRepository.extractTopScored = vi
      .fn()
      .mockResolvedValue([createMockHaiku(1)]);

    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      makeOkClient(),
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      liveCount: 1,
      fromDb: 1,
      temperature: { description: 0.3 },
    });

    // GA throws internally but is caught; DB candidate still drives selection
    const result = await service.generate();
    expect(result).toBeDefined();
  });
});

describe('OpenAIGeneratorService - selection fallbacks', () => {
  let mockHaikuGenerator: HaikuGeneratorService;
  let mockHaikuRepository: IHaikuRepository;

  beforeEach(() => {
    process.env.OPENAI_SELECTION_COUNT = '2';
    mockHaikuGenerator = {
      buildFromDb: vi.fn().mockResolvedValue(createMockHaiku(0)),
      extractVersePoolsFromContent: vi.fn(),
      getNaturalLanguageService: vi.fn(() => ({})),
      getMarkovEvaluator: vi.fn(() => ({})),
    } as unknown as HaikuGeneratorService;
    mockHaikuRepository = {
      extractTopScored: vi
        .fn()
        .mockResolvedValue([createMockHaiku(1), createMockHaiku(2)]),
      createCacheWithTTL: vi.fn(),
      extractFromCache: vi.fn(),
      extractOneFromCache: vi.fn(),
      extractDeterministicFromCache: vi.fn(),
      getCacheCount: vi.fn(),
    } as unknown as IHaikuRepository;
  });

  afterEach(() => vi.clearAllMocks());

  const metadataResponses = (client: IOpenAIClient) => {
    vi.mocked(client.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"title":"T","description":"D","hashtags":"#h"}',
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '{"fr":"Fr","jp":"Jp","es":"Es","it":"It","de":"De"}',
            },
          },
        ],
      })
      .mockResolvedValueOnce({ choices: [{ message: { content: '📚' } }] });
  };

  it('falls back to first haiku when JSON parsing fails', async () => {
    const client: IOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn().mockResolvedValueOnce({
        choices: [{ message: { content: 'not json at all' } }],
      }),
    };
    metadataResponses(client);

    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      client,
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      fromDb: 2,
      temperature: { description: 0.3 },
    });

    const result = await service.generate();
    expect(result).toBeDefined();
    expect(result?.selectionInfo?.selectedIndex).toBe(0);
  });

  it('falls back to first haiku when index is out of bounds', async () => {
    const client: IOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn().mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 99, "reason": "x"}' } }],
      }),
    };
    metadataResponses(client);

    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      client,
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      fromDb: 2,
      temperature: { description: 0.3 },
    });

    const result = await service.generate();
    expect(result).toBeDefined();
    expect(result?.selectionInfo?.selectedIndex).toBe(0);
  });

  it('formatQualityDetails includes quality metrics in the prompt', async () => {
    const client: IOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn(),
    };
    const service = new OpenAIGeneratorService(
      mockHaikuGenerator,
      client,
      mockHaikuRepository,
    );
    service.configure({
      apiKey: 'k',
      selectionCount: 2,
      fromDb: 2,
      temperature: { description: 0.3 },
    });

    // @ts-expect-error - private method
    const prompt = await service.generateSelectionPrompt();
    expect(prompt).toContain('total_score=0.80');
    expect(prompt).toContain('nature_words=2');
  });
});
