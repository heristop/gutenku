import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GenerateHaikuIterativeHandler,
  type HaikuProgress,
} from '../src/application/queries/haiku/GenerateHaikuIterativeHandler';
import type HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IGlobalStatsRepository } from '../src/domain/repositories/IGlobalStatsRepository';
import type { HaikuValue } from '../src/shared/types';

describe('GenerateHaikuIterativeHandler', () => {
  let handler: GenerateHaikuIterativeHandler;
  let mockHaikuGenerator: {
    configure: ReturnType<typeof vi.fn>;
    filter: ReturnType<typeof vi.fn>;
    generate: ReturnType<typeof vi.fn>;
    appendImg: ReturnType<typeof vi.fn>;
  };
  let mockGlobalStatsRepository: {
    incrementHaikuCount: ReturnType<typeof vi.fn>;
    incrementGamePlayed: ReturnType<typeof vi.fn>;
    getGlobalStats: ReturnType<typeof vi.fn>;
  };

  const createMockHaiku = (score: number): HaikuValue =>
    ({
      verses: ['line one here', 'line two is longer here', 'line three end'],
      book: { title: 'Test Book', author: 'Test Author' },
      quality: { totalScore: score },
    }) as HaikuValue;

  beforeEach(() => {
    mockHaikuGenerator = {
      configure: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      generate: vi.fn(),
      appendImg: vi.fn((haiku: HaikuValue) =>
        Promise.resolve({ ...haiku, imgPath: '/tmp/test.png' }),
      ),
    };

    mockGlobalStatsRepository = {
      incrementHaikuCount: vi.fn().mockResolvedValue(),
      incrementGamePlayed: vi.fn().mockResolvedValue(),
      getGlobalStats: vi.fn().mockResolvedValue({
        totalHaikusGenerated: 0,
        totalGamesPlayed: 0,
        totalGamesWon: 0,
      }),
    };

    handler = new GenerateHaikuIterativeHandler(
      mockHaikuGenerator as unknown as HaikuGeneratorService,
      mockGlobalStatsRepository as IGlobalStatsRepository,
    );
  });

  async function collectAllProgress(
    generator: AsyncGenerator<HaikuProgress>,
  ): Promise<HaikuProgress[]> {
    const results: HaikuProgress[] = [];
    for await (const progress of generator) {
      results.push(progress);
    }
    return results;
  }

  it('yields progress for each iteration', async () => {
    const haiku = createMockHaiku(0.5);
    mockHaikuGenerator.generate.mockResolvedValue(haiku);

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    expect(results).toHaveLength(4); // 3 iterations + 1 final
    expect(results[0].currentIteration).toBe(1);
    expect(results[1].currentIteration).toBe(2);
    expect(results[2].currentIteration).toBe(3);
    expect(results[3].currentIteration).toBe(3);
  });

  it('tracks the best haiku across iterations', async () => {
    mockHaikuGenerator.generate
      .mockResolvedValueOnce(createMockHaiku(0.3))
      .mockResolvedValueOnce(createMockHaiku(0.8))
      .mockResolvedValueOnce(createMockHaiku(0.5));

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult.bestScore).toBe(0.8);
    expect(finalResult.bestHaiku?.quality?.totalScore).toBe(0.8);
  });

  it('marks only the final yield as complete', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(createMockHaiku(0.5));

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    expect(results[0].isComplete).toBeFalsy();
    expect(results[1].isComplete).toBeFalsy();
    expect(results[2].isComplete).toBeTruthy();
  });

  it('appends image only to final best haiku', async () => {
    const haiku = createMockHaiku(0.5);
    mockHaikuGenerator.generate.mockResolvedValue(haiku);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    expect(mockHaikuGenerator.appendImg).toHaveBeenCalledTimes(1);
    expect(mockHaikuGenerator.appendImg).toHaveBeenCalledWith(
      expect.objectContaining({ quality: { totalScore: 0.5 } }),
      false,
    );
    expect(results.at(-1).bestHaiku?.imgPath).toBe(
      '/tmp/test.png',
    );
  });

  it('handles no haikus generated gracefully', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(null);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult.bestHaiku).toBeNull();
    expect(finalResult.bestScore).toBe(0);
    expect(mockHaikuGenerator.appendImg).not.toHaveBeenCalled();
  });

  it('handles errors during generation without stopping', async () => {
    mockHaikuGenerator.generate
      .mockRejectedValueOnce(new Error('Generation failed'))
      .mockResolvedValueOnce(createMockHaiku(0.6))
      .mockResolvedValueOnce(createMockHaiku(0.4));

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    expect(results).toHaveLength(4);
    const finalResult = results.at(-1);
    expect(finalResult.bestScore).toBe(0.6);
    expect(finalResult.bestHaiku).not.toBeNull();
  });

  it('configures generator with theme when provided', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(createMockHaiku(0.5));

    await collectAllProgress(
      handler.generate({ iterations: 1, theme: 'spring' }),
    );

    expect(mockHaikuGenerator.configure).toHaveBeenCalledWith({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme: 'spring',
    });
  });

  it('applies filter tokens when provided', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(createMockHaiku(0.5));

    await collectAllProgress(
      handler.generate({ iterations: 1, filter: 'nature water' }),
    );

    expect(mockHaikuGenerator.filter).toHaveBeenCalledWith(['nature', 'water']);
  });

  it('uses empty filter array when no filter provided', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(createMockHaiku(0.5));

    await collectAllProgress(handler.generate({ iterations: 1 }));

    expect(mockHaikuGenerator.filter).toHaveBeenCalledWith([]);
  });

  it('increments haiku count for each successful generation', async () => {
    mockHaikuGenerator.generate
      .mockResolvedValueOnce(createMockHaiku(0.5))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createMockHaiku(0.6));

    await collectAllProgress(handler.generate({ iterations: 3 }));

    // Wait for async increment calls to complete
    await new Promise((resolve) => { setTimeout(resolve, 10); });

    expect(mockGlobalStatsRepository.incrementHaikuCount).toHaveBeenCalledTimes(
      2,
    );
  });

  it('reports correct totalIterations in all yields', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(createMockHaiku(0.5));

    const results = await collectAllProgress(
      handler.generate({ iterations: 5 }),
    );

    for (const result of results) {
      expect(result.totalIterations).toBe(5);
    }
  });

  it('returns 0 for bestScore when no valid haiku is found', async () => {
    mockHaikuGenerator.generate.mockResolvedValue(null);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    for (const result of results) {
      expect(result.bestScore).toBe(0);
    }
  });

  it('handles haiku with undefined quality gracefully', async () => {
    const haikuWithoutQuality = {
      verses: ['line one', 'line two longer', 'line three'],
      book: { title: 'Test', author: 'Author' },
    } as HaikuValue;
    mockHaikuGenerator.generate.mockResolvedValue(haikuWithoutQuality);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult.bestScore).toBe(0);
    expect(finalResult.bestHaiku).not.toBeNull();
  });
});
