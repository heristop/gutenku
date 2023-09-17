import { injectable } from 'tsyringe';
import { HaikuValue, HaikuVariables } from '../../types';
import HaikuGeneratorService from './HaikuGeneratorService';
import OpenAIService from './OpenAIService';

@injectable()
export default class HaikuBridgeService {
    constructor(
        private readonly haikuGenerator: HaikuGeneratorService, 
        private readonly openAI: OpenAIService
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
            this.openAI.configure({
                apiKey: process.env.OPENAI_API_KEY,
                selectionCount: args.selectionCount,
                temperature: {
                    'prompt': args.promptTemperature,
                    'description': args.promptTemperature,
                },
            });
    
            haiku = await this.openAI.generate();
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
