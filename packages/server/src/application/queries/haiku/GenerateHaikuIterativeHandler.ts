import { inject, injectable } from 'tsyringe';
import type { HaikuValue } from '~/shared/types';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import {
  type IGlobalStatsRepository,
  IGlobalStatsRepositoryToken,
} from '~/domain/repositories/IGlobalStatsRepository';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('haiku-iterative-handler');

export interface HaikuProgress {
  currentIteration: number;
  totalIterations: number;
  bestScore: number;
  bestHaiku: HaikuValue | null;
  isComplete: boolean;
}

export interface IterativeHaikuArgs {
  iterations: number;
  theme?: string;
  filter?: string;
}

@injectable()
export class GenerateHaikuIterativeHandler {
  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGenerator: HaikuGeneratorService,
    @inject(IGlobalStatsRepositoryToken)
    private readonly globalStatsRepository: IGlobalStatsRepository,
  ) {}

  async *generate(args: IterativeHaikuArgs): AsyncGenerator<HaikuProgress> {
    const { iterations, theme, filter } = args;
    let bestHaiku: HaikuValue | null = null;
    let bestScore = -Infinity;

    log.info({ iterations, theme, filter }, 'Starting iterative haiku generation');

    this.haikuGenerator.configure({
      cache: { enabled: false, minCachedDocs: 0, ttl: 0 },
      theme,
    });

    const filterTokens = filter ? filter.split(' ') : [];

    for (let i = 1; i <= iterations; i++) {
      try {
        const haiku = await this.haikuGenerator
          .filter(filterTokens)
          .generate();

        if (haiku) {
          // Increment counter for each successfully generated haiku
          this.globalStatsRepository.incrementHaikuCount().catch(() => {});

          const score = haiku.quality?.totalScore ?? 0;

          if (score > bestScore) {
            bestScore = score;
            bestHaiku = haiku;
            log.info({ iteration: i, score }, 'New best haiku found');
          }
        }
      } catch (error) {
        log.warn({ iteration: i, error }, 'Failed to generate haiku in iteration');
      }

      // Send current best haiku during iterations (without image)
      yield {
        currentIteration: i,
        totalIterations: iterations,
        bestScore: bestScore === -Infinity ? 0 : bestScore,
        bestHaiku,
        isComplete: false,
      };
    }

    // Generate image only for the final best haiku
    if (bestHaiku) {
      bestHaiku = await this.haikuGenerator.appendImg(bestHaiku, false);
    }

    // Final update with the best haiku and its image
    yield {
      currentIteration: iterations,
      totalIterations: iterations,
      bestScore: bestScore === -Infinity ? 0 : bestScore,
      bestHaiku,
      isComplete: true,
    };

    log.info({ bestScore, iterations }, 'Iterative generation complete');
  }
}
