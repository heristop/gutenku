import OpenAI from 'openai';

import { HaikuValue, OpenAIOptions } from '../types';
import HaikuService, { IGenerator } from './haiku';

export default class OpenAIService implements IGenerator {
    private haikuSelection: HaikuValue[] = [];

    private openai: OpenAI;
    private haikuService: HaikuService;
    private selectionCount: number;
    private promptTemperature: number;
    private descriptionTemperature: number;

    private readonly MAX_SELECTION_COUNT: number = 100;

    constructor(haikuService: HaikuService, options: OpenAIOptions) {
        const {
            apiKey,
            selectionCount,
            temperature
        } = options;

        console.log('temperature', options.temperature);

        if (undefined === selectionCount) {
            this.selectionCount = parseInt(process.env.OPENAI_SELECTION_COUNT);
        }

        if (selectionCount > 0) {
            this.selectionCount = Math.min(
                selectionCount,
                this.MAX_SELECTION_COUNT
            );
        }

        this.promptTemperature = temperature.prompt ?? parseFloat(process.env.OPENAI_PROMPT_TEMPERATURE || '0.7');
        this.descriptionTemperature = temperature.description ?? parseFloat(process.env.OPENAI_DESCRIPTION_TEMPERATURE || '0.3');

        this.openai = new OpenAI({
            apiKey: apiKey
        });

        this.haikuService = haikuService;
    }

    async generate(): Promise<HaikuValue> {
        try {
            // Meta Prompt
            // Example of generated prompt: "Among the following haikus,
            // select the one that best captures the essence of the traditional Japanese form, 
            // demonstrates a deep appreciation for nature, creates a sense of tranquility and peace, 
            // and delivers a profound or insightful moment. 
            // The haiku should also be grammatically correct and maintain a consistent theme across all verses.""
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

            let haiku = this.haikuSelection[index];
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
        }

        return await this.haikuService.generate();
    }

    private async generateSelectionPrompt(): Promise<string> {
        let prompt = 'Generate a gpt-4 prompt to choose the most revelant haiku from the list below.';
        prompt += 'For instance: "Correct grammatical construction, consistency between [Verses], capturing beauty of nature, sense of tranquility, peace and good moment of insight"';
        prompt = `${prompt} (Use the following format: {"prompt":[Prompt]})`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            temperature: this.promptTemperature,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            messages: [{
                'role': 'user',
                'content': prompt
            }],
        });

        const answer = completion.choices[0].message.content;
        const output = JSON.parse(answer);

        console.log('prompt', output.prompt);

        const haikus = await this.fetchHaikus();

        return `${output.prompt} (Use the following format: {"id":[Id]})\n${haikus.join('\n')}\nSTOP\n`;
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
            model: 'gpt-4',
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

        for (const [i,] of Array(this.selectionCount).entries()) {
            const haiku = await this.haikuService.generate();

            this.haikuSelection.push(haiku);

            const verses = `Haiku [Id]: ${i}\n[Verses]: ${haiku.verses.join('\n')}\n`;

            console.log(verses);

            haikus.push(verses);
        }

        return haikus;
    }
}
