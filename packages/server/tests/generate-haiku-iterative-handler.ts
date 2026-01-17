import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GenerateHaikuIterativeHandler,
  type HaikuProgress,
} from '../src/application/queries/haiku/GenerateHaikuIterativeHandler';
import type HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import type { IGlobalStatsRepository } from '../src/domain/repositories/IGlobalStatsRepository';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type OpenAIGeneratorService from '../src/infrastructure/services/OpenAIGeneratorService';
import type { HaikuValue } from '../src/shared/types';
import type { VersePools } from '../src/domain/services/genetic/types';

// Use vi.hoisted to create mock that's available at mock definition time
const { mockEvolveWithProgress } = vi.hoisted(() => {
  const mockEvolveWithProgress = vi.fn();
  return { mockEvolveWithProgress };
});

// Mock GeneticAlgorithmService as a class using a real class
vi.mock('../src/domain/services/genetic/GeneticAlgorithmService', () => {
  return {
    GeneticAlgorithmService: class MockGeneticAlgorithmService {
      evolveWithProgress = mockEvolveWithProgress;
    },
  };
});

describe('GenerateHaikuIterativeHandler', () => {
  let handler: GenerateHaikuIterativeHandler;
  let mockHaikuGenerator: {
    configure: ReturnType<typeof vi.fn>;
    filter: ReturnType<typeof vi.fn>;
    buildFromDb: ReturnType<typeof vi.fn>;
    appendImg: ReturnType<typeof vi.fn>;
    extractVersePoolsFromContent: ReturnType<typeof vi.fn>;
    getNaturalLanguageService: ReturnType<typeof vi.fn>;
    getMarkovEvaluator: ReturnType<typeof vi.fn>;
  };
  let mockGlobalStatsRepository: {
    incrementHaikuCount: ReturnType<typeof vi.fn>;
    incrementGamePlayed: ReturnType<typeof vi.fn>;
    getGlobalStats: ReturnType<typeof vi.fn>;
  };
  let mockOpenAIGenerator: {
    configure: ReturnType<typeof vi.fn>;
    enrichHaikuWithMetadata: ReturnType<typeof vi.fn>;
  };
  let mockHaikuRepository: {
    createCacheWithTTL: ReturnType<typeof vi.fn>;
  };

  const createMockHaiku = (score: number): HaikuValue =>
    ({
      verses: ['line one here', 'line two is longer here', 'line three end'],
      book: {
        title: 'Test Book',
        author: 'Test Author',
        reference: 'test-ref',
      },
      chapter: { title: 'Chapter 1', content: 'Some chapter content here' },
      quality: { totalScore: score },
    }) as HaikuValue;

  const createMockVersePools = (): VersePools => ({
    fiveSyllable: [
      { text: 'cherry blossoms fall', source: 'test', chapter: 'ch1' },
      { text: 'moonlight on the lake', source: 'test', chapter: 'ch1' },
    ],
    sevenSyllable: [
      { text: 'dancing in the gentle breeze', source: 'test', chapter: 'ch1' },
      {
        text: 'softly through the silent night',
        source: 'test',
        chapter: 'ch1',
      },
    ],
  });

  // Creates a GA progress event (internal generation, distinct from user iteration)
  const createGAProgress = (
    generation: number,
    maxGen: number,
    fitness: number,
    isComplete: boolean,
  ) => ({
    generation,
    maxGenerations: maxGen,
    bestFitness: fitness,
    bestHaiku: {
      verses: [
        'cherry blossoms fall',
        'dancing in the gentle breeze',
        'moonlight on the lake',
      ] as [string, string, string],
      indices: [0, 0, 1],
      metrics: {
        totalScore: fitness,
        natureWords: 1,
        repeatedWords: 0,
        weakStarts: 0,
        sentiment: 0.5,
        grammar: 0.5,
        markovFlow: 5,
        trigramFlow: 5,
        uniqueness: 0.8,
        alliteration: 0.2,
        verseDistance: 0.5,
        lineLengthBalance: 0.7,
        imageryDensity: 0.3,
        semanticCoherence: 0.6,
        verbPresence: 0.5,
      },
    },
    isComplete,
    stopReason: isComplete ? 'max_generations' : undefined,
  });

  // GA_GENERATIONS_PER_ITERATION = 30 (internal constant)
  const GA_GENS = 30;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvolveWithProgress.mockReset();

    mockHaikuGenerator = {
      configure: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      buildFromDb: vi.fn(),
      appendImg: vi.fn((haiku: HaikuValue) =>
        Promise.resolve({ ...haiku, imgPath: '/tmp/test.png' }),
      ),
      extractVersePoolsFromContent: vi
        .fn()
        .mockReturnValue(createMockVersePools()),
      getNaturalLanguageService: vi.fn().mockReturnValue({}),
      getMarkovEvaluator: vi.fn().mockReturnValue({}),
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

    mockOpenAIGenerator = {
      configure: vi.fn(),
      enrichHaikuWithMetadata: vi.fn().mockResolvedValue(),
    };

    mockHaikuRepository = {
      createCacheWithTTL: vi.fn().mockResolvedValue(),
    };

    handler = new GenerateHaikuIterativeHandler(
      mockHaikuGenerator as unknown as HaikuGeneratorService,
      mockGlobalStatsRepository as IGlobalStatsRepository,
      mockOpenAIGenerator as unknown as OpenAIGeneratorService,
      mockHaikuRepository as unknown as IHaikuRepository,
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

  it('yields progress for every iteration with best score tracked', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    // Each iteration runs a full GA (30 internal generations)
    // We run 3 iterations, with scores 0.3, 0.5, 0.4
    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.3, 0.5, 0.4]; // Best score is 0.5 at iteration 2
      const score = scores[callCount - 1] || 0.3;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    // All 3 iterations yield + final = 4 total
    expect(results.length).toBe(4);
    expect(results[0].currentIteration).toBe(1);
    expect(results[0].bestScore).toBe(0.3);
    expect(results[0].bestHaiku).not.toBeNull(); // First iteration always has haiku
    expect(results[1].currentIteration).toBe(2);
    expect(results[1].bestScore).toBe(0.5); // Best so far
    expect(results[1].bestHaiku).not.toBeNull(); // New best found
    expect(results[2].currentIteration).toBe(3);
    expect(results[2].bestScore).toBe(0.5); // Still 0.5 (best so far)
    expect(results[2].bestHaiku).toBeNull(); // No improvement in this iteration
    expect(results[3].isComplete).toBeTruthy();
  });

  it('tracks the best haiku across iterations', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.3, 0.8, 0.6]; // Best is iteration 2
      const score = scores[callCount - 1] || 0.3;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult?.bestScore).toBe(0.8);
  });

  it('marks only the final yield as complete', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.5, 0.6]; // Both improve
      const score = scores[callCount - 1] || 0.5;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    // 2 iterations + 1 final = 3 results
    expect(results.length).toBe(3);
    // Only last result should be complete
    const lastResult = results.at(-1);
    expect(lastResult?.isComplete).toBeTruthy();
    // Check intermediate results are not complete
    expect(results[0].isComplete).toBeFalsy();
    expect(results[1].isComplete).toBeFalsy();
  });

  it('appends image only to final best haiku', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.5, 0.6];
      const score = scores[callCount - 1] || 0.5;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    // 2 iterations + 1 final = 3 results
    expect(results.length).toBe(3);
    expect(mockHaikuGenerator.appendImg).toHaveBeenCalledTimes(1);
    expect(results.at(-1)?.bestHaiku?.imgPath).toBe('/tmp/test.png');
  });

  it('handles no seed haiku gracefully', async () => {
    mockHaikuGenerator.buildFromDb.mockResolvedValue(null);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult?.bestHaiku).toBeNull();
    expect(finalResult?.bestScore).toBe(0);
    expect(finalResult?.isComplete).toBeTruthy();
    expect(mockHaikuGenerator.appendImg).not.toHaveBeenCalled();
  });

  it('handles seed haiku without chapter gracefully', async () => {
    const seedWithoutChapter = {
      ...createMockHaiku(0.5),
      chapter: undefined,
    };
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedWithoutChapter);

    const results = await collectAllProgress(
      handler.generate({ iterations: 2 }),
    );

    const finalResult = results.at(-1);
    expect(finalResult?.bestHaiku).toBeNull();
    expect(finalResult?.isComplete).toBeTruthy();
  });

  it('handles errors during seed haiku generation', async () => {
    mockHaikuGenerator.buildFromDb.mockRejectedValue(new Error('DB error'));

    const results = await collectAllProgress(
      handler.generate({ iterations: 3 }),
    );

    expect(results).toHaveLength(1);
    const finalResult = results.at(-1);
    expect(finalResult?.bestHaiku).toBeNull();
    expect(finalResult?.isComplete).toBeTruthy();
  });

  it('configures generator with theme when provided', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(
      handler.generate({ iterations: 1, theme: 'spring' }),
    );

    expect(mockHaikuGenerator.configure).toHaveBeenCalledWith({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme: 'spring',
    });
  });

  it('applies filter tokens when provided', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(
      handler.generate({ iterations: 1, filter: 'nature water' }),
    );

    expect(mockHaikuGenerator.filter).toHaveBeenCalledWith(['nature', 'water']);
  });

  it('does not apply filter when not provided', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(handler.generate({ iterations: 1 }));

    // filter should not be called when filterTokens is empty
    expect(mockHaikuGenerator.filter).not.toHaveBeenCalled();
  });

  it('increments haiku count after successful generation', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.5, 0.6];
      const score = scores[callCount - 1] || 0.5;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    await collectAllProgress(handler.generate({ iterations: 2 }));

    // Wait for async increment call
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });

    expect(mockGlobalStatsRepository.incrementHaikuCount).toHaveBeenCalledTimes(
      1,
    );
  });

  it('reports correct totalIterations in all yields', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.3, 0.4, 0.5, 0.6, 0.7]; // Each iteration improves
      const score = scores[callCount - 1] || 0.3;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    const results = await collectAllProgress(
      handler.generate({ iterations: 5 }),
    );

    // Final yield should report 5 as totalIterations
    const finalResult = results.at(-1);
    expect(finalResult?.totalIterations).toBe(5);
  });

  it('extracts verse pools from seed haiku chapter', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(handler.generate({ iterations: 1 }));

    expect(
      mockHaikuGenerator.extractVersePoolsFromContent,
    ).toHaveBeenCalledWith(
      seedHaiku.chapter?.content,
      seedHaiku.book.reference,
      seedHaiku.chapter?.title,
    );
  });

  it('creates GA service for each iteration', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    let callCount = 0;
    mockEvolveWithProgress.mockImplementation(function* () {
      callCount++;
      const scores = [0.3, 0.5, 0.7]; // Each improves
      const score = scores[callCount - 1] || 0.3;
      yield createGAProgress(GA_GENS, GA_GENS, score, true);
    });

    await collectAllProgress(handler.generate({ iterations: 3 }));

    // GA should be called once per iteration (3 iterations = 3 GA runs)
    expect(mockEvolveWithProgress).toHaveBeenCalledTimes(3);
  });

  it('enriches final haiku with OpenAI metadata when useAI is true', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(handler.generate({ iterations: 1, useAI: true }));

    expect(mockOpenAIGenerator.configure).toHaveBeenCalled();
    expect(mockOpenAIGenerator.enrichHaikuWithMetadata).toHaveBeenCalled();
  });

  it('does not call OpenAI when useAI is false', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(handler.generate({ iterations: 1, useAI: false }));

    expect(mockOpenAIGenerator.configure).not.toHaveBeenCalled();
    expect(mockOpenAIGenerator.enrichHaikuWithMetadata).not.toHaveBeenCalled();
  });

  it('does not call OpenAI when useAI is not provided (defaults to false)', async () => {
    const seedHaiku = createMockHaiku(0.5);
    mockHaikuGenerator.buildFromDb.mockResolvedValue(seedHaiku);

    mockEvolveWithProgress.mockImplementation(function* () {
      yield createGAProgress(GA_GENS, GA_GENS, 0.5, true);
    });

    await collectAllProgress(handler.generate({ iterations: 1 }));

    expect(mockOpenAIGenerator.configure).not.toHaveBeenCalled();
    expect(mockOpenAIGenerator.enrichHaikuWithMetadata).not.toHaveBeenCalled();
  });
});
