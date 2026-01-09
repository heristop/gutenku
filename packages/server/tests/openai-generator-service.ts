import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import OpenAIGeneratorService from '../src/infrastructure/services/OpenAIGeneratorService';
import type HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IOpenAIClient } from '../src/domain/gateways/IOpenAIClient';
import type { HaikuValue } from '../src/shared/types';

describe('OpenAIGeneratorService', () => {
  let service: OpenAIGeneratorService;
  let mockHaikuGenerator: HaikuGeneratorService;
  let mockOpenAIClient: IOpenAIClient;
  const originalEnv = process.env;

  const createMockHaiku = (index: number): HaikuValue => ({
    book: {
      title: `Book ${index}`,
      author: `Author ${index}`,
      reference: `ref-${index}`,
    },
    chapter: { content: `Chapter ${index} content` },
    verses: ['First verse here', 'Second verse is longer', 'Third verse end'],
    rawVerses: [
      'First verse here',
      'Second verse is longer',
      'Third verse end',
    ],
    cacheUsed: false,
    executionTime: 100,
    context: [],
  });

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPENAI_SELECTION_COUNT: '5',
      OPENAI_DESCRIPTION_TEMPERATURE: '0.3',
      OPENAI_GPT_MODEL: 'gpt-5.2',
    };

    mockHaikuGenerator = {
      extractFromCache: vi.fn().mockResolvedValue([]),
      buildFromDb: vi.fn().mockResolvedValue(createMockHaiku(0)),
      generate: vi.fn().mockResolvedValue(createMockHaiku(0)),
    } as unknown as HaikuGeneratorService;

    mockOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn(),
    };

    service = new OpenAIGeneratorService(mockHaikuGenerator, mockOpenAIClient);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('can be instantiated', () => {
    expect(service).toBeDefined();
  });

  it('configure sets options correctly', () => {
    const result = service.configure({
      apiKey: 'test-api-key',
      selectionCount: 10,
      temperature: { description: 0.5 },
    });

    expect(result).toBe(service);
    expect(mockOpenAIClient.configure).toHaveBeenCalledWith('test-api-key');
  });

  it('configure uses env defaults when options undefined', () => {
    const result = service.configure({
      apiKey: 'test-key',
      selectionCount: undefined,
      temperature: {},
    });

    expect(result).toBe(service);
  });

  it('configure caps selectionCount at MAX_SELECTION_COUNT', () => {
    service.configure({
      apiKey: 'test-key',
      selectionCount: 200,
      temperature: { description: 0.3 },
    });

    // @ts-expect-error - accessing private property
    expect(service.selectionCount).toBe(20);
  });

  it('configure ignores selectionCount <= 0 and uses env default', () => {
    // Configure with 0 - it should fall back to env default (5)
    service.configure({
      apiKey: 'test-key',
      selectionCount: 0,
      temperature: { description: 0.3 },
    });

    // Selection count should be env default (5) since 0 was ignored
    // @ts-expect-error - accessing private property
    expect(service.selectionCount).toBe(5);
  });
});

describe('OpenAIGeneratorService - generate', () => {
  let service: OpenAIGeneratorService;
  let mockHaikuGenerator: HaikuGeneratorService;
  let mockOpenAIClient: IOpenAIClient;

  const createMockHaiku = (index: number): HaikuValue => ({
    book: {
      title: `Book ${index}`,
      author: `Author ${index}`,
      reference: `ref-${index}`,
    },
    chapter: { content: `Chapter ${index} content` },
    verses: ['First verse here', 'Second verse is longer', 'Third verse end'],
    rawVerses: [
      'First verse here',
      'Second verse is longer',
      'Third verse end',
    ],
    cacheUsed: false,
    executionTime: 100,
    context: [],
  });

  beforeEach(() => {
    process.env.OPENAI_SELECTION_COUNT = '3';
    process.env.OPENAI_GPT_MODEL = 'gpt-4o-mini';

    mockHaikuGenerator = {
      extractFromCache: vi.fn().mockResolvedValue([]),
      buildFromDb: vi
        .fn()
        .mockImplementation(() => Promise.resolve(createMockHaiku(0))),
      generate: vi.fn().mockResolvedValue(createMockHaiku(0)),
    } as unknown as HaikuGeneratorService;

    mockOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn(),
    };

    service = new OpenAIGeneratorService(mockHaikuGenerator, mockOpenAIClient);
    service.configure({
      apiKey: 'test-key',
      selectionCount: 3,
      temperature: { description: 0.3 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('generate returns haiku with all enrichments on success', async () => {
    // Mock selection response
    vi.mocked(mockOpenAIClient.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 0}' } }],
      })
      // Description response
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                '{"title":"Test Title","description":"Test desc","hashtags":"#test"}',
            },
          },
        ],
      })
      // Translations response
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content:
                '{"fr":"Fr text","jp":"Jp text","es":"Es text","it":"It text","de":"De text"}',
            },
          },
        ],
      })
      // Bookmojis response
      .mockResolvedValueOnce({
        choices: [{ message: { content: '📚✨🌸' } }],
      });

    const result = await service.generate();

    expect(result).toBeDefined();
    expect(result?.title).toBe('Test Title');
    expect(result?.description).toBe('Test desc');
    expect(result?.hashtags).toBe('#test');
    expect(result?.translations).toEqual({
      fr: 'Fr text',
      jp: 'Jp text',
      es: 'Es text',
      it: 'It text',
      de: 'De text',
    });
    expect(result?.book.emoticons).toBe('📚✨🌸');
  });

  it('generate uses fallback values when description fails', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 0}' } }],
      })
      .mockRejectedValueOnce(new Error('Description API error'))
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
      });

    const result = await service.generate();

    expect(result).toBeDefined();
    expect(result?.title).toBe('Untitled Haiku');
    expect(result?.description).toBe('A beautiful haiku');
  });

  it('generate uses fallback values when translations fail', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 0}' } }],
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
      .mockRejectedValueOnce(new Error('Translation API error'))
      .mockResolvedValueOnce({
        choices: [{ message: { content: '📚' } }],
      });

    const result = await service.generate();

    expect(result).toBeDefined();
    expect(result?.translations.fr).toContain('/');
  });

  it('generate uses fallback values when bookmojis fail', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 0}' } }],
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
      .mockRejectedValueOnce(new Error('Bookmoji API error'));

    const result = await service.generate();

    expect(result).toBeDefined();
    expect(result?.book.emoticons).toBe('');
  });

  it('generate throws when OpenAI fails', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate).mockRejectedValueOnce(
      new Error('OpenAI API error'),
    );

    await expect(service.generate()).rejects.toThrow('OpenAI API error');
  });

  it('generate builds haikus from DB', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate)
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"id": 0}' } }],
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
      });

    const result = await service.generate();

    expect(result).toBeDefined();
    expect(mockHaikuGenerator.buildFromDb).toHaveBeenCalled();
  });
});

describe('OpenAIGeneratorService - private methods', () => {
  let service: OpenAIGeneratorService;
  let mockHaikuGenerator: HaikuGeneratorService;
  let mockOpenAIClient: IOpenAIClient;

  beforeEach(() => {
    process.env.OPENAI_SELECTION_COUNT = '2';

    mockHaikuGenerator = {
      extractFromCache: vi.fn().mockResolvedValue([]),
      buildFromDb: vi.fn().mockResolvedValue({
        book: { title: 'Test', author: 'A', reference: 'r' },
        chapter: { content: 'c' },
        verses: ['a', 'b', 'c'],
        rawVerses: ['a', 'b', 'c'],
        cacheUsed: false,
        executionTime: 0,
        context: [],
      }),
      generate: vi.fn(),
    } as unknown as HaikuGeneratorService;

    mockOpenAIClient = {
      configure: vi.fn(),
      chatCompletionsCreate: vi.fn(),
    };

    service = new OpenAIGeneratorService(mockHaikuGenerator, mockOpenAIClient);
    service.configure({
      apiKey: 'test-key',
      selectionCount: 2,
      temperature: { description: 0.3 },
    });
  });

  it('generateDescription calls OpenAI with correct prompt', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title":"T","description":"D","hashtags":"#h"}',
          },
        },
      ],
    });

    // @ts-expect-error - accessing private method
    const result = await service.generateDescription([
      'verse1',
      'verse2',
      'verse3',
    ]);

    expect(mockOpenAIClient.chatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining(
              'Act as an English Literature Teacher',
            ),
          }),
        ]),
      }),
    );
    expect(result.title).toBe('T');
  });

  it('generateTranslations calls OpenAI with correct prompt', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"fr":"Fr","jp":"Jp","es":"Es","it":"It","de":"De"}',
          },
        },
      ],
    });

    // @ts-expect-error - accessing private method
    const result = await service.generateTranslations(['verse1', 'verse2']);

    expect(mockOpenAIClient.chatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('Act as a Poem Translator'),
          }),
        ]),
      }),
    );
    expect(result.fr).toBe('Fr');
  });

  it('generateBookmojis calls OpenAI with correct prompt', async () => {
    vi.mocked(mockOpenAIClient.chatCompletionsCreate).mockResolvedValueOnce({
      choices: [{ message: { content: '📚 ✨ 🌸' } }],
    });

    // @ts-expect-error - accessing private method
    const result = await service.generateBookmojis({
      title: 'Moby Dick',
      author: 'Herman Melville',
    });

    expect(mockOpenAIClient.chatCompletionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_completion_tokens: 20,
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('emoji generator'),
          }),
        ]),
      }),
    );
    expect(result).toBe('📚✨🌸');
  });

  it('fetchHaikus formats haikus for selection', async () => {
    // @ts-expect-error - accessing private method
    const result = await service.fetchHaikus();

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(2);
    expect(result[0]).toContain('[Id]: 0');
    expect(result[0]).toContain('[Verses]:');
  });

  it('generateSelectionPrompt creates correct prompt format', async () => {
    // @ts-expect-error - accessing private method
    const result = await service.generateSelectionPrompt();

    expect(result).toContain('Please select the best haiku');
    expect(result).toContain('Use the following format: {"id":[Id],"reason":');
    expect(result).toContain('[Quality]:');
    expect(result).toContain('nature_words=');
    expect(result).toContain('STOP');
  });
});
