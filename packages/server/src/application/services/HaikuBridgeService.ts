import { injectable } from 'tsyringe';
import { HaikuValue, HaikuVariables } from '../../shared/types';
import HaikuGeneratorService from '../../domain/services/HaikuGeneratorService';
import OpenAIGeneratorService from '../../domain/services/OpenAIGeneratorService';

@injectable()
export default class HaikuBridgeService {
    constructor(
        private readonly haikuGenerator: HaikuGeneratorService, 
        private readonly openAIGenerator: OpenAIGeneratorService
    ) {}

    async generate(args: HaikuVariables): Promise<HaikuValue> {
        let haiku: HaikuValue = null;

        this.haikuGenerator
            .configure({
                cache: {
                    'minCachedDocs': parseInt(process.env.MIN_CACHED_DOCS),
                    'ttl': 24 * 60 * 60 * 1000, // 24 hours,
                    'enabled': args.useCache,
                },
                score: {
                    'sentiment': args.sentimentMinScore,
                    'markovChain': args.markovMinScore,
                },
                theme: args.theme,
            });
    
        const OPENAI_SELECTION_MODE = args.useAI && undefined !== process.env.OPENAI_API_KEY;
    
        if (true === OPENAI_SELECTION_MODE) {
            this.openAIGenerator.configure({
                apiKey: process.env.OPENAI_API_KEY,
                selectionCount: args.selectionCount,
                temperature: {
                    'description': args.descriptionTemperature,
                },
            });
    
            haiku = await this.openAIGenerator.generate();
        }
    
        if (null === haiku) {
            haiku = await this.haikuGenerator
                .filter(args.filter ? args.filter.split(' ') : [])
                .generate();
        }
    
        if (false !== args.appendImg) {
            haiku = await this.haikuGenerator.appendImg(haiku);
        }
    
        return haiku;
    }
}
