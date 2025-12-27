import 'reflect-metadata';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import HaikuBridgeService from '~/application/services/HaikuBridgeService';
import type { IQueryBus } from '~/application/cqrs';
import { GenerateHaikuQuery } from '~/application/queries/haiku';
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to QueryBus with GenerateHaikuQuery', async () => {
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(createMockHaiku()),
    };
    const service = new HaikuBridgeService(mockQueryBus);

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

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.any(GenerateHaikuQuery),
    );
  });

  it('returns haiku from QueryBus', async () => {
    const expectedHaiku = createMockHaiku();
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(expectedHaiku),
    };
    const service = new HaikuBridgeService(mockQueryBus);

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

    const result = await service.generate(args);

    expect(result).toEqual(expectedHaiku);
  });

  it('passes all arguments to GenerateHaikuQuery', async () => {
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(createMockHaiku()),
    };
    const service = new HaikuBridgeService(mockQueryBus);

    const args: HaikuVariables = {
      appendImg: true,
      descriptionTemperature: 0.8,
      filter: 'whale ocean sea',
      markovMinScore: 0.5,
      selectionCount: 3,
      sentimentMinScore: 0.3,
      theme: 'greentea',
      useAI: true,
      useCache: true,
      posMinScore: 0.4,
      trigramMinScore: 0.2,
      tfidfMinScore: 0.1,
      phoneticsMinScore: 0.15,
    };

    await service.generate(args);

    const executedQuery = (mockQueryBus.execute as ReturnType<typeof vi.fn>)
      .mock.calls[0][0] as GenerateHaikuQuery;

    expect(executedQuery.useAI).toBeTruthy();
    expect(executedQuery.useCache).toBeTruthy();
    expect(executedQuery.appendImg).toBeTruthy();
    expect(executedQuery.theme).toBe('greentea');
    expect(executedQuery.filter).toBe('whale ocean sea');
    expect(executedQuery.selectionCount).toBe(3);
    expect(executedQuery.markovMinScore).toBe(0.5);
    expect(executedQuery.sentimentMinScore).toBe(0.3);
    expect(executedQuery.descriptionTemperature).toBe(0.8);
  });

  it('handles different variable configurations', async () => {
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(createMockHaiku()),
    };
    const service = new HaikuBridgeService(mockQueryBus);

    // Test with minimal args
    const minimalArgs: HaikuVariables = {
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

    await service.generate(minimalArgs);

    expect(mockQueryBus.execute).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from QueryBus', async () => {
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockRejectedValue(new Error('Generation failed')),
    };
    const service = new HaikuBridgeService(mockQueryBus);

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

    await expect(service.generate(args)).rejects.toThrow('Generation failed');
  });

  it('handles haiku with image result', async () => {
    const haikuWithImage = {
      ...createMockHaiku(),
      image: 'base64data',
      imagePath: '/tmp/test.jpg',
    };
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(haikuWithImage),
    };
    const service = new HaikuBridgeService(mockQueryBus);

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

    expect(result.image).toBe('base64data');
    expect(result.imagePath).toBe('/tmp/test.jpg');
  });

  it('handles cached haiku result', async () => {
    const cachedHaiku = {
      ...createMockHaiku(),
      cacheUsed: true,
    };
    const mockQueryBus: IQueryBus = {
      execute: vi.fn().mockResolvedValue(cachedHaiku),
    };
    const service = new HaikuBridgeService(mockQueryBus);

    const args: HaikuVariables = {
      appendImg: false,
      descriptionTemperature: 0.5,
      filter: '',
      markovMinScore: 0,
      selectionCount: 1,
      sentimentMinScore: 0,
      theme: 'default',
      useAI: false,
      useCache: true,
    };

    const result = await service.generate(args);

    expect(result.cacheUsed).toBeTruthy();
  });
});
