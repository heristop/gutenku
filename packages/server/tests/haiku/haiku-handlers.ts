import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GenerateHaikuHandler } from '../../src/application/queries/haiku/GenerateHaikuHandler';
import { GenerateHaikuQuery } from '../../src/application/queries/haiku/GenerateHaikuQuery';
import { CacheHaikuHandler } from '../../src/application/commands/haiku/CacheHaikuHandler';
import { CacheHaikuCommand } from '../../src/application/commands/haiku/CacheHaikuCommand';
import type HaikuGeneratorService from '../../src/domain/services/HaikuGeneratorService';
import type OpenAIGeneratorService from '../../src/infrastructure/services/OpenAIGeneratorService';
import type { IGlobalStatsRepository } from '../../src/domain/repositories/IGlobalStatsRepository';
import type { IHaikuRepository } from '../../src/domain/repositories/IHaikuRepository';
import type { IDailyHaikuRepository } from '../../src/domain/repositories/IDailyHaikuRepository';
import type { IChapterRepository } from '../../src/domain/repositories/IChapterRepository';
import { getCurrentPublicationDate } from '../../src/domain/services/DailyHaikuSchedule';
import type { HaikuValue, HaikuVariables } from '../../src/shared/types';

const createMockHaiku = (overrides: Partial<HaikuValue> = {}): HaikuValue => ({
  title: 'Test Haiku',
  verses: ['first verse here', 'second verse longer', 'third verse end'],
  book: {
    reference: '12345',
    title: 'Test Book',
    author: 'Test Author',
    emoticons: '📚✨',
  },
  chapter: { reference: '1', title: 'Chapter 1' },
  translations: {},
  description: 'A test haiku',
  cacheUsed: false,
  ...overrides,
});

const createDefaultVariables = (
  overrides: Partial<HaikuVariables> = {},
): HaikuVariables => ({
  useAI: false,
  useCache: true,
  useDaily: false,
  appendImg: true,
  useImageAI: false,
  selectionCount: 5,
  theme: 'sumie',
  filter: '',
  sentimentMinScore: 0.5,
  markovMinScore: 0.5,
  posMinScore: 0.5,
  trigramMinScore: 0.5,
  tfidfMinScore: 0.5,
  phoneticsMinScore: 0.5,
  descriptionTemperature: 0.7,
  ...overrides,
});

describe('Haiku Handlers', () => {
  describe('GenerateHaikuHandler', () => {
    let handler: GenerateHaikuHandler;
    let mockHaikuGenerator: HaikuGeneratorService;
    let mockOpenAIGenerator: OpenAIGeneratorService;
    let mockGlobalStatsRepo: IGlobalStatsRepository;
    let mockHaikuRepo: IHaikuRepository;
    let mockDailyRepo: Pick<IDailyHaikuRepository, 'findByDate'>;
    let mockChapterRepo: Pick<IChapterRepository, 'getChapterById'>;
    let mockRecorder: { ensureWithin: ReturnType<typeof vi.fn> };
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };

      mockHaikuGenerator = {
        configure: vi.fn(),
        filter: vi.fn().mockReturnThis(),
        setExtractionMethod: vi.fn().mockReturnThis(),
        generate: vi.fn(),
        appendImg: vi.fn(),
      } as unknown as HaikuGeneratorService;

      mockOpenAIGenerator = {
        configure: vi.fn(),
        generate: vi.fn(),
      } as unknown as OpenAIGeneratorService;

      mockGlobalStatsRepo = {
        getGlobalStats: vi.fn(),
        incrementHaikuCount: vi.fn().mockResolvedValue(),
        incrementGamePlayed: vi.fn(),
      };

      mockHaikuRepo = {
        createCacheWithTTL: vi.fn(),
        extractDeterministicFromCache: vi.fn(),
        getFromCache: vi.fn(),
      } as unknown as IHaikuRepository;

      mockDailyRepo = { findByDate: vi.fn().mockResolvedValue(null) };
      mockChapterRepo = { getChapterById: vi.fn().mockResolvedValue(null) };
      mockRecorder = { ensureWithin: vi.fn().mockResolvedValue(null) };

      handler = new GenerateHaikuHandler(
        mockHaikuGenerator,
        mockOpenAIGenerator,
        mockGlobalStatsRepo,
        mockHaikuRepo,
        mockDailyRepo as IDailyHaikuRepository,
        mockChapterRepo as IChapterRepository,
        mockRecorder,
      );
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('configures generator with query parameters', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          markovMinScore: 0.7,
          sentimentMinScore: 0.8,
          theme: 'zen',
        }),
      );
      await handler.execute(query);

      expect(mockHaikuGenerator.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'zen',
          score: expect.objectContaining({
            markovChain: 0.7,
            sentiment: 0.8,
          }),
        }),
      );
    });

    it('uses standard generation when no special modes enabled', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useAI: false,
          useDaily: false,
        }),
      );
      const result = await handler.execute(query);

      expect(result).toBe(mockHaiku);
      expect(mockHaikuGenerator.filter).toHaveBeenCalledWith([]);
      expect(mockHaikuGenerator.generate).toHaveBeenCalled();
    });

    it('applies filter words when provided', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          filter: 'nature spring',
        }),
      );
      await handler.execute(query);

      expect(mockHaikuGenerator.filter).toHaveBeenCalledWith([
        'nature',
        'spring',
      ]);
    });

    it('uses daily mode when useDaily is true', async () => {
      const mockHaiku = createMockHaiku({ cacheUsed: true });
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        mockHaiku,
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useDaily: true,
          date: '2026-01-15',
        }),
      );
      const result = await handler.execute(query);

      expect(mockHaikuRepo.extractDeterministicFromCache).toHaveBeenCalledWith(
        expect.any(Number),
        0,
        '2026-01-15',
      );
      expect(result).toBe(mockHaiku);
    });

    it('serves the archived daily haiku with its chapter when recorded', async () => {
      const chapter = { title: 'Solitude', content: 'old pond text' };
      vi.mocked(mockDailyRepo.findByDate).mockResolvedValue({
        date: '2026-01-15',
        publishedAt: new Date('2026-01-15T10:00:00.000Z'),
        verses: ['old pond', 'a frog jumps in', 'sound of water'],
        rawVerses: ['Old pond,', 'a frog jumps in', 'sound of water.'],
        title: 'Pond',
        book: { title: 'Walden', author: 'Thoreau', reference: '205' },
        source: 'auto',
        chapterId: '68c701011a684efaf0205a60',
        hasCard: false,
      });
      vi.mocked(mockChapterRepo.getChapterById).mockResolvedValue(chapter);
      vi.mocked(mockHaikuGenerator.appendImg).mockImplementation(
        async (haiku) => haiku,
      );

      const result = await handler.execute(
        new GenerateHaikuQuery(
          createDefaultVariables({ useDaily: true, date: '2026-01-15' }),
        ),
      );

      expect(mockChapterRepo.getChapterById).toHaveBeenCalledWith(
        '68c701011a684efaf0205a60',
      );
      expect(
        mockHaikuRepo.extractDeterministicFromCache,
      ).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        verses: ['old pond', 'a frog jumps in', 'sound of water'],
        rawVerses: ['Old pond,', 'a frog jumps in', 'sound of water.'],
        chapter,
        book: { title: 'Walden', author: 'Thoreau', reference: '205' },
        title: 'Pond',
        cacheUsed: true,
      });
    });

    it('keeps the cache pick when the archived day has no chapter', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockDailyRepo.findByDate).mockResolvedValue({
        date: '2026-01-15',
        publishedAt: new Date('2026-01-15T10:00:00.000Z'),
        verses: ['a', 'b', 'c'],
        book: { title: 'W', author: 'T' },
        source: 'cli',
        hasCard: true,
      });
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        mockHaiku,
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const result = await handler.execute(
        new GenerateHaikuQuery(
          createDefaultVariables({ useDaily: true, date: '2026-01-15' }),
        ),
      );

      expect(result).toBe(mockHaiku);
      expect(mockChapterRepo.getChapterById).not.toHaveBeenCalled();
    });

    it('defaults to the publication date and records it when missing', async () => {
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        createMockHaiku(),
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(
        createMockHaiku(),
      );

      await handler.execute(
        new GenerateHaikuQuery(createDefaultVariables({ useDaily: true })),
      );

      const current = getCurrentPublicationDate();
      expect(mockRecorder.ensureWithin).toHaveBeenCalledWith(current);
      expect(mockHaikuRepo.extractDeterministicFromCache).toHaveBeenCalledWith(
        expect.any(Number),
        0,
        current,
      );
    });

    it('falls back to standard generation when daily cache misses', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        null,
      );
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useDaily: true,
        }),
      );
      await handler.execute(query);

      expect(mockHaikuGenerator.generate).toHaveBeenCalled();
    });

    it('uses OpenAI generation when useAI is true and API key exists', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const mockHaiku = createMockHaiku();
      vi.mocked(mockOpenAIGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useAI: true,
        }),
      );
      const result = await handler.execute(query);

      expect(mockOpenAIGenerator.configure).toHaveBeenCalled();
      expect(mockOpenAIGenerator.generate).toHaveBeenCalled();
      expect(result).toBe(mockHaiku);
    });

    it('does not use OpenAI when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useAI: true,
        }),
      );
      await handler.execute(query);

      expect(mockOpenAIGenerator.generate).not.toHaveBeenCalled();
      expect(mockHaikuGenerator.generate).toHaveBeenCalled();
    });

    it('appends image when appendImg is true', async () => {
      const mockHaiku = createMockHaiku();
      const mockHaikuWithImg = { ...mockHaiku, img: 'base64-image' };
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(
        mockHaikuWithImg,
      );

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          appendImg: true,
          useImageAI: false,
        }),
      );
      const result = await handler.execute(query);

      expect(mockHaikuGenerator.appendImg).toHaveBeenCalledWith(
        mockHaiku,
        false,
      );
      expect(result).toBe(mockHaikuWithImg);
    });

    it('skips image when appendImg is false', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          appendImg: false,
        }),
      );
      const result = await handler.execute(query);

      expect(mockHaikuGenerator.appendImg).not.toHaveBeenCalled();
      expect(result).toBe(mockHaiku);
    });

    it('increments stats for non-cached haiku', async () => {
      const mockHaiku = createMockHaiku({ cacheUsed: false });
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(createDefaultVariables());
      await handler.execute(query);

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockGlobalStatsRepo.incrementHaikuCount).toHaveBeenCalled();
    });

    it('does not increment stats for cached haiku', async () => {
      const mockHaiku = createMockHaiku({ cacheUsed: true });
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        mockHaiku,
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useDaily: true,
        }),
      );
      await handler.execute(query);

      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      expect(mockGlobalStatsRepo.incrementHaikuCount).not.toHaveBeenCalled();
    });

    it('disables cache when useDaily is true', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        mockHaiku,
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useDaily: true,
          useCache: true,
        }),
      );
      await handler.execute(query);

      expect(mockHaikuGenerator.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: expect.objectContaining({
            enabled: false,
          }),
        }),
      );
    });

    it('configures OpenAI with parameters', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const mockHaiku = createMockHaiku();
      vi.mocked(mockOpenAIGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useAI: true,
          selectionCount: 10,
          descriptionTemperature: 0.9,
        }),
      );
      await handler.execute(query);

      expect(mockOpenAIGenerator.configure).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        selectionCount: 10,
        temperature: { description: 0.9 },
      });
    });

    it('falls back to standard generation when OpenAI returns null', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const mockHaiku = createMockHaiku();
      vi.mocked(mockOpenAIGenerator.generate).mockResolvedValue(null);
      vi.mocked(mockHaikuGenerator.generate).mockResolvedValue(mockHaiku);
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useAI: true,
        }),
      );
      const result = await handler.execute(query);

      expect(mockHaikuGenerator.generate).toHaveBeenCalled();
      expect(result).toBe(mockHaiku);
    });

    it('uses current date for daily mode when no date provided', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuRepo.extractDeterministicFromCache).mockResolvedValue(
        mockHaiku,
      );
      vi.mocked(mockHaikuGenerator.appendImg).mockResolvedValue(mockHaiku);

      const query = new GenerateHaikuQuery(
        createDefaultVariables({
          useDaily: true,
          date: undefined,
        }),
      );
      await handler.execute(query);

      expect(mockHaikuRepo.extractDeterministicFromCache).toHaveBeenCalledWith(
        expect.any(Number),
        0,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      );
    });
  });

  describe('CacheHaikuHandler', () => {
    let handler: CacheHaikuHandler;
    let mockHaikuRepo: IHaikuRepository;

    beforeEach(() => {
      mockHaikuRepo = {
        createCacheWithTTL: vi.fn().mockResolvedValue(),
        extractDeterministicFromCache: vi.fn(),
        getFromCache: vi.fn(),
      } as unknown as IHaikuRepository;

      handler = new CacheHaikuHandler(mockHaikuRepo);
    });

    it('creates cache entry with TTL', async () => {
      const mockHaiku = createMockHaiku();
      const ttl = 3600000;

      const command = new CacheHaikuCommand(mockHaiku, ttl);
      await handler.execute(command);

      expect(mockHaikuRepo.createCacheWithTTL).toHaveBeenCalledWith(
        mockHaiku,
        ttl,
      );
    });

    it('handles different TTL values', async () => {
      const mockHaiku = createMockHaiku();
      const ttl = 7200000;

      const command = new CacheHaikuCommand(mockHaiku, ttl);
      await handler.execute(command);

      expect(mockHaikuRepo.createCacheWithTTL).toHaveBeenCalledWith(
        mockHaiku,
        7200000,
      );
    });

    it('throws on repository errors', async () => {
      const mockHaiku = createMockHaiku();
      vi.mocked(mockHaikuRepo.createCacheWithTTL).mockRejectedValue(
        new Error('DB error'),
      );

      const command = new CacheHaikuCommand(mockHaiku, 3600000);

      await expect(handler.execute(command)).rejects.toThrow('DB error');
    });
  });
});

describe('Haiku Query Classes', () => {
  it('GenerateHaikuQuery stores all variables', () => {
    const variables = createDefaultVariables({
      useAI: true,
      theme: 'zen',
      filter: 'nature',
    });

    const query = new GenerateHaikuQuery(variables);

    expect(query.useAI).toBeTruthy();
    expect(query.theme).toBe('zen');
    expect(query.filter).toBe('nature');
  });

  it('GenerateHaikuQuery.toVariables returns original values', () => {
    const variables = createDefaultVariables({
      markovMinScore: 0.8,
      selectionCount: 15,
    });

    const query = new GenerateHaikuQuery(variables);
    const result = query.toVariables();

    expect(result.markovMinScore).toBe(0.8);
    expect(result.selectionCount).toBe(15);
  });
});

describe('CacheHaikuCommand', () => {
  it('stores haiku and ttl', () => {
    const mockHaiku = createMockHaiku();
    const ttl = 3600000;

    const command = new CacheHaikuCommand(mockHaiku, ttl);

    expect(command.haiku).toBe(mockHaiku);
    expect(command.ttl).toBe(ttl);
  });
});

describe('GetHaikuVersionHandler', () => {
  let handler: InstanceType<
    typeof import('../../src/application/queries/haiku/GetHaikuVersionHandler').GetHaikuVersionHandler
  >;
  let mockHaikuRepo: IHaikuRepository;

  beforeEach(async () => {
    const { GetHaikuVersionHandler } =
      await import('../../src/application/queries/haiku/GetHaikuVersionHandler');

    mockHaikuRepo = {
      getCacheCount: vi.fn(),
      createCacheWithTTL: vi.fn(),
      extractDeterministicFromCache: vi.fn(),
      extractFromCache: vi.fn(),
      extractOneFromCache: vi.fn(),
    } as unknown as IHaikuRepository;

    handler = new GetHaikuVersionHandler(mockHaikuRepo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns version with date and cache count', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');
    vi.mocked(mockHaikuRepo.getCacheCount).mockResolvedValue(1500);

    const query = new GetHaikuVersionQuery('2026-01-09');
    const result = await handler.execute(query);

    expect(result.date).toBe('2026-01-09');
    expect(result.version).toBe('2026-01-09-1500');
    expect(mockHaikuRepo.getCacheCount).toHaveBeenCalledTimes(1);
  });

  it('returns version with zero cache count', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');
    vi.mocked(mockHaikuRepo.getCacheCount).mockResolvedValue(0);

    const query = new GetHaikuVersionQuery('2026-01-01');
    const result = await handler.execute(query);

    expect(result.date).toBe('2026-01-01');
    expect(result.version).toBe('2026-01-01-0');
  });

  it('returns different versions for different cache counts', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');
    vi.mocked(mockHaikuRepo.getCacheCount).mockResolvedValueOnce(100);
    const query1 = new GetHaikuVersionQuery('2026-01-09');
    const result1 = await handler.execute(query1);

    vi.mocked(mockHaikuRepo.getCacheCount).mockResolvedValueOnce(200);
    const query2 = new GetHaikuVersionQuery('2026-01-09');
    const result2 = await handler.execute(query2);

    expect(result1.version).toBe('2026-01-09-100');
    expect(result2.version).toBe('2026-01-09-200');
    expect(result1.version).not.toBe(result2.version);
  });

  it('returns same version for same date and cache count', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');
    vi.mocked(mockHaikuRepo.getCacheCount).mockResolvedValue(500);

    const query1 = new GetHaikuVersionQuery('2026-01-15');
    const query2 = new GetHaikuVersionQuery('2026-01-15');

    const result1 = await handler.execute(query1);
    const result2 = await handler.execute(query2);

    expect(result1.version).toBe(result2.version);
    expect(result1.date).toBe(result2.date);
  });
});

describe('GetHaikuVersionQuery', () => {
  it('stores date parameter', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');

    const query = new GetHaikuVersionQuery('2026-01-09');
    expect(query.date).toBe('2026-01-09');
  });

  it('handles different date formats', async () => {
    const { GetHaikuVersionQuery } =
      await import('../../src/application/queries/haiku/GetHaikuVersionQuery');

    const query1 = new GetHaikuVersionQuery('2026-01-01');
    const query2 = new GetHaikuVersionQuery('2026-12-31');

    expect(query1.date).toBe('2026-01-01');
    expect(query2.date).toBe('2026-12-31');
  });
});
