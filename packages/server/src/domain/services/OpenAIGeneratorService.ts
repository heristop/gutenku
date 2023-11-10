import OpenAI from 'openai';
import { singleton } from 'tsyringe';
import { HaikuValue, OpenAIOptions } from '../../shared/types';
import HaikuGeneratorService from './HaikuGeneratorService';
import { IGenerator } from '../interfaces/IGenerator';

@singleton()
export default class OpenAIGeneratorService implements IGenerator {
    private readonly MAX_SELECTION_COUNT: number = 100;

    private haikuSelection: HaikuValue[] = [];
    private openai: OpenAI;

    private selectionCount: number;
    private descriptionTemperature: number;

    constructor(private readonly haikuGeneratorService: HaikuGeneratorService) {}

    configure(options: OpenAIOptions): OpenAIGeneratorService {
        const {
            apiKey,
            selectionCount,
            temperature
        } = options;

        if (undefined === selectionCount) {
            this.selectionCount = parseInt(process.env.OPENAI_SELECTION_COUNT);
        }

        if (selectionCount > 0) {
            this.selectionCount = Math.min(
                selectionCount,
                this.MAX_SELECTION_COUNT
            );
        }

        temperature.description = temperature.description ?? parseFloat(process.env.OPENAI_DESCRIPTION_TEMPERATURE || '0.3');
        console.log('temperature', temperature);

        this.descriptionTemperature = temperature.description;

        this.openai = new OpenAI({
            apiKey: apiKey
        });

        return this;
    }

    async generate(): Promise<HaikuValue | null> {
        let haiku: HaikuValue;

        try {
            const prompt = await this.generateSelectionPrompt();

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                temperature: 0.2,
                max_tokens: 1200,
                top_p: 0.1,
                frequency_penalty: 0.3,
                presence_penalty: 0,
                stop: ['STOP'],
                messages: [{
                    'role': 'user',
                    'content': prompt
                }],
            });

            const answer = completion.choices[0].message.content;

            const output = JSON.parse(answer);
            const index = output.id;

            haiku = this.haikuSelection[index];
            this.haikuSelection = [];

            haiku = await this.addDescription(haiku);
            haiku = await this.addTranslations(haiku);
            haiku = await this.addBookmojis(haiku);

            return haiku;
        } catch (error) {
            if (error instanceof OpenAI.APIError) {
                console.error(error.status);
                console.error(error.message);
                console.error(error.code);
                console.error(error.type);
            } else {
                // Non-API error
                console.log(error);
            }
        } finally {
            this.haikuSelection = [];
            haiku = null;
        }

        return await this.haikuGeneratorService.generate();
    }

    private async generateSelectionPrompt(): Promise<string> {
        const prompt = `Please select the most relevant haiku from the following list of ${this.selectionCount}, considering factors such as correct grammatical structure, consistency between the three lines, the ability to capture the beauty of nature, the conveyance of tranquility and peace, and the presentation of a profound moment of insight`;

        const haikus = await this.fetchHaikus();

        return `${prompt} (Use the following format: {"id":[Id]})\n${haikus.join('\n')}\nSTOP\n`;
    }

    private async addDescription(haiku: HaikuValue): Promise<HaikuValue> {
        const prompt = `Act as an English Literature Teacher and describe the Haiku: "${haiku.verses.join('\\n')}"`;
        const outputFormat = '{"title":"<Give a creative short title to describe the haiku>","description":"<Describe and explain the haiku>","hashtags":"<Give 6 lowercase hashtags>"}';

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            temperature: this.descriptionTemperature,
            max_tokens: 1000,
            top_p: 0.4,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{
                'role': 'user',
                'content': `${prompt} (Use the following format: ${outputFormat})`
            }],
        });

        const answer = completion.choices[0].message.content;
        const output = JSON.parse(answer);

        haiku.title = output.title;
        haiku.description = output.description;
        haiku.hashtags = output.hashtags;

        return haiku;
    }

    private async addTranslations(haiku: HaikuValue): Promise<HaikuValue> {
        let prompt = `Act as a Poem Translator and translate this haiku using \\n separator: "${haiku.verses.join('\\n')}"`;
        let outputFormat = '';
        outputFormat += '"fr":"<Translate the Haiku in french>",';
        outputFormat += '"jp":"<Translate the Haiku in rōmaji>",';
        outputFormat += '"es":"<Translate the Haiku in spanish>",';
        outputFormat += '"it":"<Translate the Haiku in italian>",';
        outputFormat += '"de":"<Translate the Haiku in german>"';
        prompt = `${prompt} (Use the following format: {${outputFormat}})`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-1106-preview',
            temperature: 0.3,
            max_tokens: 1000,
            top_p: 0.4,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{
                'role': 'user',
                'content': prompt
            }],
        });

        const answer = completion.choices[0].message.content;
        const output = JSON.parse(answer);

        haiku.translations = {
            'fr': output.fr,
            'jp': output.jp,
            'es': output.es,
            'it': output.it,
            'de': output.de,
        };

        return haiku;
    }

    private async addBookmojis(haiku: HaikuValue): Promise<HaikuValue> {
        let prompt = `Please provide a series of clear and easily recognizable emoticons that best represent the book "${haiku.book.title}":`;
        const outputFormat = '<Generate a series of UTF-8 emoticons that represent the related book>';
        prompt = `${prompt} (Use the following format: ${outputFormat})`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            temperature: 0.6,
            max_tokens: 20,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{
                'role': 'user',
                'content': prompt
            }],
        });

        const answer = completion.choices[0].message.content.replace(/[\n\s]+/g, '');

        haiku.book.emoticons = answer;

        return haiku;
    }

    private async fetchHaikus(): Promise<string[]> {
        const haikus: string[] = [];

        // Fetch haikus from the cache using the service
        this.haikuSelection = await this.haikuGeneratorService.extractFromCache(this.selectionCount);

        if (0 === this.haikuSelection.length) {
            // Generate and append new haikus to the selection
            for (let i = 0; i < this.selectionCount; i++) {
                const haiku = await this.haikuGeneratorService.buildFromDb();
                this.haikuSelection.push(haiku);
    
                const verses = `[Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;
                console.log(verses);
                haikus.push(verses);
            }
        }

        // Log and append details of each haiku in the selection
        this.haikuSelection.forEach((haiku, i: number) => {
            const verses = `[Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;
            console.log(verses);
            haikus.push(verses);
        });

        return haikus;
    }
}
