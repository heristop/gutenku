import { inject, injectable } from 'tsyringe';
import type { HaikuValue, HaikuVariables } from '~/shared/types';
import HaikuGeneratorService from '~/domain/services/HaikuGeneratorService';
import OpenAIGeneratorService from '~/infrastructure/services/OpenAIGeneratorService';

@injectable()
export default class HaikuBridgeService {
  constructor(
    @inject(HaikuGeneratorService)
    private readonly haikuGenerator: HaikuGeneratorService,
    @inject(OpenAIGeneratorService)
    private readonly openAIGenerator: OpenAIGeneratorService,
  ) {}

  async generate(args: HaikuVariables): Promise<HaikuValue> {
    let haiku: HaikuValue = null;

    this.haikuGenerator.configure({
      cache: {
        minCachedDocs: Number.parseInt(process.env.MIN_CACHED_DOCS),
        ttl: 24 * 60 * 60 * 1000, // 24 hours,
        enabled: args.useCache,
      },
      score: {
        markovChain: args.markovMinScore,
        sentiment: args.sentimentMinScore,
      },
      theme: args.theme,
    });

    const OPENAI_SELECTION_MODE =
      args.useAI && undefined !== process.env.OPENAI_API_KEY;

    if (OPENAI_SELECTION_MODE === true) {
      this.openAIGenerator.configure({
        apiKey: process.env.OPENAI_API_KEY,
        selectionCount: args.selectionCount,
        temperature: {
          description: args.descriptionTemperature,
        },
      });

      haiku = await this.openAIGenerator.generate();
    }

    if (haiku === null) {
      haiku = await this.haikuGenerator
        .filter(args.filter ? args.filter.split(' ') : [])
        .generate();
    }

    if (args.appendImg !== false) {
      haiku = await this.haikuGenerator.appendImg(haiku);
    }

    return haiku;
  }
}
