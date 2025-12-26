import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import HaikuBridgeService from '~/application/services/HaikuBridgeService';
import type HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import type OpenAIGeneratorService from '~/infrastructure/services/OpenAIGeneratorService';
import type { HaikuValue, HaikuVariables } from '~/shared/types';

describe('HaikuBridgeService', () => {
  const createMockHaiku = (): HaikuValue => ({
    book: {
      author: 'Test Author',
      emoticons: '📚',
      reference: 'test-book',
      title: 'Test Book',
    },
    cacheUsed: false,
    chapter: {
      content: 'Test content.',
    },
    description: 'A test haiku',
    executionTime: 50,
    hashtags: '#test',
    image: null,
    imagePath: null,
    rawVerses: ['verse one', 'verse two', 'verse three'],
    title: 'Test Haiku',
    translations: null,
    verses: ['Verse one', 'Verse two', 'Verse three'],
  });

  const createMockGeneratorService = (): HaikuGeneratorService =>
    ({
      configure: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      generate: vi.fn().mockResolvedValue(createMockHaiku()),
      appendImg: vi.fn().mockImplementation((haiku) => ({
        ...haiku,
        image: 'base64data',
        imagePath: '/tmp/test.jpg',
      })),
    }) as unknown as HaikuGeneratorService;

  const createMockOpenAIService = (): OpenAIGeneratorService =>
    ({
      configure: vi.fn().mockReturnThis(),
      generate: vi.fn().mockResolvedValue(createMockHaiku()),
    }) as unknown as OpenAIGeneratorService;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    process.env.MIN_CACHED_DOCS = '10';
  });

  it('configures HaikuGeneratorService with provided options', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.7,
      filter: '',
      markovMinScore: 0.5,
      selectionCount: 5,
      sentimentMinScore: 0.3,
      theme: 'greentea',
      useAI: false,
      useCache: true,
    };

    await service.generate(args);

    expect(generator.configure).toHaveBeenCalledWith({
      cache: {
        minCachedDocs: 10,
        ttl: 24 * 60 * 60 * 1000,
        enabled: true,
      },
      score: {
        markovChain: 0.5,
        sentiment: 0.3,
      },
      theme: 'greentea',
    });
  });

  it('uses HaikuGeneratorService when useAI is false', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: false,
    };

    await service.generate(args);

    expect(generator.filter).toHaveBeenCalledWith([]);
    expect(generator.generate).toHaveBeenCalled();
    expect(openai.generate).not.toHaveBeenCalled();
  });

  it('uses OpenAIGeneratorService when useAI is true and API key is set', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    process.env.OPENAI_API_KEY = 'test-api-key';

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.8,
      filter: '',
      markovMinScore: 0,
      selectionCount: 3,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: true,
      useCache: false,
    };

    await service.generate(args);

    expect(openai.configure).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      selectionCount: 3,
      temperature: {
        description: 0.8,
      },
    });
    expect(openai.generate).toHaveBeenCalled();
  });

  it('falls back to HaikuGeneratorService when OpenAI returns null', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    (openai.generate as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const service = new HaikuBridgeService(generator, openai);

    process.env.OPENAI_API_KEY = 'test-api-key';

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: true,
      useCache: false,
    };

    await service.generate(args);

    expect(openai.generate).toHaveBeenCalled();
    expect(generator.generate).toHaveBeenCalled();
  });

  it('appends image when appendImg is true', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    const args: HaikuVariables = {
      appendImg: true,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: false,
    };

    const result = await service.generate(args);

    expect(generator.appendImg).toHaveBeenCalled();
    expect(result.image).toBe('base64data');
  });

  it('skips image append when appendImg is false', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: false,
    };

    await service.generate(args);

    expect(generator.appendImg).not.toHaveBeenCalled();
  });

  it('passes filter words to HaikuGeneratorService', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: 'whale ocean sea',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: false,
    };

    await service.generate(args);

    expect(generator.filter).toHaveBeenCalledWith(['whale', 'ocean', 'sea']);
  });

  it('does not use OpenAI when API key is undefined', async () => {
    const generator = createMockGeneratorService();
    const openai = createMockOpenAIService();
    const service = new HaikuBridgeService(generator, openai);

    delete process.env.OPENAI_API_KEY;

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: true,
      useCache: false,
    };

    await service.generate(args);

    expect(openai.generate).not.toHaveBeenCalled();
    expect(generator.generate).toHaveBeenCalled();
  });
});
