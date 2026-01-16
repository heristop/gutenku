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
    this.configureGenerator(query);

    let haiku = await this.tryDailyMode(query);
    haiku ??= await this.tryOpenAIGeneration(query);
    haiku ??= await this.tryStandardGeneration(query);

    if (query.appendImg !== false) {
      haiku = await this.haikuGenerator.appendImg(haiku, query.useImageAI);
    }

    this.recordStats(haiku);

    return haiku;
  }

  private configureGenerator(query: GenerateHaikuQuery): void {
    const cacheEnabled = query.useCache && !query.useDaily;

    this.haikuGenerator.configure({
      cache: {
        minCachedDocs: 0,
        ttl: 48 * 60 * 60 * 1000,
        enabled: cacheEnabled,
      },
      score: {
        markovChain: query.markovMinScore,
        sentiment: query.sentimentMinScore,
        pos: query.posMinScore,
        trigram: query.trigramMinScore,
        tfidf: query.tfidfMinScore,
        phonetics: query.phoneticsMinScore,
        uniqueness: query.uniquenessMinScore,
        verseDistance: query.verseDistanceMinScore,
        lineLengthBalance: query.lineLengthBalanceMinScore,
        imageryDensity: query.imageryDensityMinScore,
        semanticCoherence: query.semanticCoherenceMinScore,
        verbPresence: query.verbPresenceMinScore,
      },
      theme: query.theme,
    });
  }

  private async tryDailyMode(
    query: GenerateHaikuQuery,
  ): Promise<HaikuValue | null> {
    if (!query.useDaily) {
      return null;
    }

    const date = query.date || getTodayUTC();
    const seed = dateToSeed(date);

    log.info({ date, seed, useDaily: true }, 'Daily haiku mode');

    const haiku = await this.haikuRepository.extractDeterministicFromCache(
      seed,
      0,
      date,
    );

    if (haiku) {
      log.info({ seed, cacheUsed: true }, 'Daily haiku extracted from cache');
    }

    if (!haiku) {
      log.info({ seed }, 'Daily haiku cache miss, falling back to generation');
    }

    return haiku;
  }

  private async tryOpenAIGeneration(
    query: GenerateHaikuQuery,
  ): Promise<HaikuValue | null> {
    const isOpenAIEnabled =
      query.useAI && process.env.OPENAI_API_KEY !== undefined;

    log.info(
      {
        useAI: query.useAI,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        isOpenAIEnabled,
      },
      'OpenAI mode check',
    );

    if (!isOpenAIEnabled) {
      return null;
    }

    this.openAIGenerator.configure({
      apiKey: process.env.OPENAI_API_KEY,
      selectionCount: query.selectionCount,
      fromDb: query.fromDb,
      liveCount: query.liveCount,
      temperature: { description: query.descriptionTemperature },
    });

    const haiku = await this.openAIGenerator.generate();

    log.info(
      {
        hasTitle: !!haiku?.title,
        hasEmoticons: !!haiku?.book?.emoticons,
        hasTranslations: !!haiku?.translations,
      },
      'OpenAI generation result',
    );

    return haiku;
  }

  private async tryStandardGeneration(
    query: GenerateHaikuQuery,
  ): Promise<HaikuValue | null> {
    const extractionMethod =
      query.extractionMethod === 'punctuation' ||
      query.extractionMethod === 'chunk'
        ? query.extractionMethod
        : null;

    return this.haikuGenerator
      .filter(query.filter ? query.filter.split(' ') : [])
      .setExtractionMethod(extractionMethod)
      .generate();
  }

  private recordStats(haiku: HaikuValue | null): void {
    if (haiku !== null && haiku.cacheUsed !== true) {
      this.globalStatsRepository.incrementHaikuCount().catch(() => {});
    }
  }
}
