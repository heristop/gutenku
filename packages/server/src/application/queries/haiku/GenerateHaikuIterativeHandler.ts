import { inject, injectable } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import OpenAIGeneratorService from '~/infrastructure/services/OpenAIGeneratorService';
import {
  type IGlobalStatsRepository,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';
import {
  type IHaikuRepository,
  IHaikuRepositoryToken,
} from '~/domain/repositories/IHaikuRepository';
import { GeneticAlgorithmService } from '~/domain/services/genetic/GeneticAlgorithmService';
import type { DecodedHaiku } from '~/domain/services/genetic/types';
import {
  cleanVerses,
  extractContextVerses,
} from '~/shared/helpers/HaikuHelper';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('haiku-iterative-handler');

/** Number of internal GA generations per iteration */
const GA_GENERATIONS_PER_ITERATION = 50;

export interface HaikuProgress {
  currentIteration: number;
  totalIterations: number;
  bestScore: number;
  bestHaiku: HaikuValue | null;
  isComplete: boolean;
  stopReason?: string;
}

export interface IterativeHaikuArgs {
  iterations: number;
  theme?: string;
  filter?: string;
}

/** Default TTL for crafted haikus: 48 hours */
const DEFAULT_CACHE_TTL_MS = 48 * 60 * 60 * 1000;

@injectable()
export class GenerateHaikuIterativeHandler {
  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGenerator: HaikuGeneratorService,
    @inject(IGlobalStatsRepositoryToken)
    private readonly globalStatsRepository: IGlobalStatsRepository,
    @inject(OpenAIGeneratorService)
    private readonly openAIGenerator: OpenAIGeneratorService,
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
  ) {}

  async *generate(args: IterativeHaikuArgs): AsyncGenerator<HaikuProgress> {
    const { iterations, theme, filter } = args;

    log.info(
      { iterations, theme, filter },
      'Starting GA-based iterative haiku generation',
    );

    this.configureGenerator(theme, filter);

    const seedHaiku = await this.getSeedHaiku();
    if (!seedHaiku?.chapter) {
      yield this.createEmptyProgress(iterations);

      return;
    }

    const versePools = this.haikuGenerator.extractVersePoolsFromContent(
      seedHaiku.chapter.content,
      seedHaiku.book.reference,
      seedHaiku.chapter.title || 'unknown',
    );

    log.info(
      {
        fiveCount: versePools.fiveSyllable.length,
        sevenCount: versePools.sevenSyllable.length,
        bookRef: seedHaiku.book.reference,
        iterations,
        generationsPerIteration: GA_GENERATIONS_PER_ITERATION,
      },
      'Starting multi-iteration GA haiku generation',
    );

    let bestOverallScore = -Infinity;
    let bestOverallHaiku: HaikuValue | null = null;

    for (let iteration = 1; iteration <= iterations; iteration++) {
      const {
        bestHaiku: iterationBestHaiku,
        bestScore: iterationBestScore,
        stopReason,
      } = this.runGAIteration(versePools, seedHaiku);

      const foundBetter =
        iterationBestScore > bestOverallScore && iterationBestHaiku;
      if (foundBetter) {
        bestOverallScore = iterationBestScore;
        bestOverallHaiku = iterationBestHaiku;
        log.debug(
          { iteration, score: bestOverallScore },
          'New best haiku found',
        );
      }

      yield {
        currentIteration: iteration,
        totalIterations: iterations,
        bestScore: bestOverallScore,
        bestHaiku: foundBetter ? bestOverallHaiku : null,
        isComplete: false,
        stopReason: foundBetter ? stopReason : undefined,
      };

      await new Promise<void>((resolve) => {
        setImmediate(resolve);
      });
    }

    const bestHaiku = await this.finalizeHaiku(bestOverallHaiku);

    this.globalStatsRepository.incrementHaikuCount().catch(() => {});

    // Save crafted haiku to database for haiku of the day
    if (bestHaiku) {
      this.haikuRepository
        .createCacheWithTTL(bestHaiku, DEFAULT_CACHE_TTL_MS)
        .catch((error) => {
          log.warn({ error }, 'Failed to cache crafted haiku');
        });
    }

    yield {
      currentIteration: iterations,
      totalIterations: iterations,
      bestScore: bestHaiku?.quality?.totalScore ?? 0,
      bestHaiku,
      isComplete: true,
      stopReason: 'completed',
    };

    log.info(
      { bestScore: bestHaiku?.quality?.totalScore, iterations },
      'GA-based iterative generation complete',
    );
  }

  private configureGenerator(theme?: string, filter?: string): void {
    this.haikuGenerator.configure({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme,
    });

    const filterTokens = filter ? filter.split(' ') : [];
    if (filterTokens.length > 0) {
      this.haikuGenerator.filter(filterTokens);
    }
  }

  private async getSeedHaiku(): Promise<HaikuValue | null> {
    try {
      const seedHaiku = await this.haikuGenerator.buildFromDb();
      if (!seedHaiku?.chapter) {
        log.warn('No seed haiku available, cannot run GA evolution');

        return null;
      }

      return seedHaiku;
    } catch (error) {
      log.error({ error }, 'Failed to get seed haiku for GA');

      return null;
    }
  }

  private createEmptyProgress(iterations: number): HaikuProgress {
    return {
      currentIteration: 0,
      totalIterations: iterations,
      bestScore: 0,
      bestHaiku: null,
      isComplete: true,
    };
  }

  private runGAIteration(
    versePools: import('~/domain/services/genetic/types').VersePools,
    seedHaiku: HaikuValue,
  ): { bestHaiku: HaikuValue | null; bestScore: number; stopReason?: string } {
    const gaService = new GeneticAlgorithmService(
      this.haikuGenerator.getNaturalLanguageService(),
      this.haikuGenerator.getMarkovEvaluator(),
      {
        maxGenerations: GA_GENERATIONS_PER_ITERATION,
        populationSize: 100,
      },
    );

    let iterationBestHaiku: HaikuValue | null = null;
    let iterationBestScore = -Infinity;
    let stopReason: string | undefined;

    for (const progress of gaService.evolveWithProgress(versePools)) {
      if (progress.bestFitness > iterationBestScore) {
        iterationBestScore = progress.bestFitness;
        iterationBestHaiku = this.convertGAResultToHaikuValue(
          progress.bestHaiku,
          seedHaiku,
        );
      }
      stopReason = progress.stopReason;
    }

    return {
      bestHaiku: iterationBestHaiku,
      bestScore: iterationBestScore,
      stopReason,
    };
  }

  private async finalizeHaiku(
    haiku: HaikuValue | null,
  ): Promise<HaikuValue | null> {
    if (!haiku) {
      return null;
    }

    try {
      const withImage = await this.haikuGenerator.appendImg(haiku, false);

      this.openAIGenerator.configure({
        apiKey: process.env.OPENAI_API_KEY,
        selectionCount: 1,
        temperature: { description: 0.7 },
      });
      await this.openAIGenerator.enrichHaikuWithMetadata(withImage);

      return withImage;
    } catch (error) {
      log.error({ error }, 'Failed to generate image or enrich metadata');

      return haiku;
    }
  }

  private convertGAResultToHaikuValue(
    decoded: DecodedHaiku,
    seedHaiku: HaikuValue,
  ): HaikuValue {
    const cleaned = cleanVerses([...decoded.verses]) as [
      string,
      string,
      string,
    ];

    return {
      book: seedHaiku.book,
      chapter: seedHaiku.chapter,
      verses: cleaned,
      rawVerses: decoded.verses,
      quality: {
        totalScore: decoded.metrics.totalScore,
        natureWords: decoded.metrics.natureWords,
        repeatedWords: decoded.metrics.repeatedWords,
        weakStarts: decoded.metrics.weakStarts,
        blacklistedVerses: decoded.metrics.blacklistedVerses ?? 0,
        properNouns: decoded.metrics.properNouns ?? 0,
        verseLengthPenalty: decoded.metrics.verseLengthPenalty ?? 0,
        sentiment: decoded.metrics.sentiment,
        grammar: decoded.metrics.grammar,
        markovFlow: decoded.metrics.markovFlow,
        trigramFlow: decoded.metrics.trigramFlow,
        uniqueness: decoded.metrics.uniqueness,
        alliteration: decoded.metrics.alliteration,
        verseDistance: decoded.metrics.verseDistance,
        lineLengthBalance: decoded.metrics.lineLengthBalance,
        imageryDensity: decoded.metrics.imageryDensity,
        semanticCoherence: decoded.metrics.semanticCoherence,
        verbPresence: decoded.metrics.verbPresence,
      },
      cacheUsed: false,
      extractionMethod: 'genetic_algorithm',
      executionTime: 0,
      context: extractContextVerses(
        [...decoded.verses],
        seedHaiku.chapter.content,
      ),
    };
  }
}
