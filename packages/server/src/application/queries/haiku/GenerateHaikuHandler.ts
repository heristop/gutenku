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
  ) {}

  async execute(query: GenerateHaikuQuery): Promise<HaikuValue> {
    let haiku: HaikuValue = null;

    this.haikuGenerator.configure({
      cache: {
        minCachedDocs: Number.parseInt(process.env.MIN_CACHED_DOCS, 10),
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        enabled: query.useCache,
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

    if (OPENAI_SELECTION_MODE === true) {
      this.openAIGenerator.configure({
        apiKey: process.env.OPENAI_API_KEY,
        selectionCount: query.selectionCount,
        temperature: {
          description: query.descriptionTemperature,
        },
      });

      haiku = await this.openAIGenerator.generate();
    }

    if (haiku === null) {
      haiku = await this.haikuGenerator
        .filter(query.filter ? query.filter.split(' ') : [])
        .generate();
    }

    if (query.appendImg !== false) {
      haiku = await this.haikuGenerator.appendImg(haiku);
    }

    if (haiku !== null) {
      // Fire-and-forget - don't block the response
      this.globalStatsRepository.incrementHaikuCount().catch(() => {});
    }

    return haiku;
  }
}
