import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { GenerateHaikuQuery } from './GenerateHaikuQuery';
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
import { dateToSeed, getTodayUTC } from '~/shared/helpers/SeededRandom';
import { createLogger } from '~/infrastructure/services/Logger';

const log = createLogger('haiku-handler');

@injectable()
export class GenerateHaikuHandler implements IQueryHandler<
  GenerateHaikuQuery,
  HaikuValue
> {
  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGenerator: HaikuGeneratorService,
    @inject(OpenAIGeneratorService)
    private readonly openAIGenerator: OpenAIGeneratorService,
    @inject(IGlobalStatsRepositoryToken)
    private readonly globalStatsRepository: IGlobalStatsRepository,
    @inject(IHaikuRepositoryToken)
    private readonly haikuRepository: IHaikuRepository,
  ) {}

  async execute(query: GenerateHaikuQuery): Promise<HaikuValue> {
    let haiku: HaikuValue = null;
    const minCachedDocs = Number.parseInt(process.env.MIN_CACHED_DOCS, 10);

    // Daily mode: use deterministic extraction from cache
    if (query.useDaily) {
      const date = query.date || getTodayUTC();
      const seed = dateToSeed(date);

      log.info({ date, seed, useDaily: true }, 'Daily haiku mode');

      haiku = await this.haikuRepository.extractDeterministicFromCache(
        seed,
        minCachedDocs,
      );

      if (haiku) {
        log.info({ seed, cacheUsed: true }, 'Daily haiku extracted from cache');
      } else {
        log.info(
          { seed },
          'Daily haiku cache miss, falling back to generation',
        );
      }
    }

    // Configure generator for both daily fallback and craft mode
    this.haikuGenerator.configure({
      cache: {
        minCachedDocs,
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        enabled: query.useCache && !query.useDaily, // Disable random cache in daily mode
      },
      score: {
        markovChain: query.markovMinScore,
        sentiment: query.sentimentMinScore,
        pos: query.posMinScore,
        trigram: query.trigramMinScore,
        tfidf: query.tfidfMinScore,
        phonetics: query.phoneticsMinScore,
      },
      theme: query.theme,
    });

    const OPENAI_SELECTION_MODE =
      query.useAI && undefined !== process.env.OPENAI_API_KEY;

    log.info(
      {
        useAI: query.useAI,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        OPENAI_SELECTION_MODE,
      },
      'OpenAI mode check',
    );

    // Try OpenAI generation if enabled and no daily haiku yet
    if (haiku === null && OPENAI_SELECTION_MODE === true) {
      this.openAIGenerator.configure({
        apiKey: process.env.OPENAI_API_KEY,
        selectionCount: query.selectionCount,
        temperature: {
          description: query.descriptionTemperature,
        },
      });

      haiku = await this.openAIGenerator.generate();
      log.info(
        {
          hasTitle: !!haiku?.title,
          hasEmoticons: !!haiku?.book?.emoticons,
          hasTranslations: !!haiku?.translations,
        },
        'OpenAI generation result',
      );
    }

    // Fallback to standard generation
    if (haiku === null) {
      haiku = await this.haikuGenerator
        .filter(query.filter ? query.filter.split(' ') : [])
        .generate();
    }

    if (query.appendImg !== false) {
      haiku = await this.haikuGenerator.appendImg(haiku, query.useImageAI);
    }

    if (haiku !== null && haiku.cacheUsed !== true) {
      // Fire-and-forget - don't block the response
      this.globalStatsRepository.incrementHaikuCount().catch(() => {});
    }

    return haiku;
  }
}
