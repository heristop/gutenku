import OpenAI from 'openai';

import { HaikuValue, OpenAIOptions } from '../types';
import HaikuService, { IGenerator } from './haiku';

export default class OpenAIService implements IGenerator {
    private haikuSelection: HaikuValue[] = [];

    private openai: OpenAI;
    private haikuService: HaikuService;
    private selectionCount: number;

    private readonly MAX_SELECTION_COUNT: number = 100;

    constructor(haikuService: HaikuService, options: OpenAIOptions) {
        const { apiKey, selectionCount } = options;

        if (undefined === selectionCount) {
            this.selectionCount = parseInt(process.env.OPENAI_SELECTION_COUNT);
        }

        if (selectionCount > 0) {
            this.selectionCount = Math.min(
                selectionCount,
                this.MAX_SELECTION_COUNT
            );
        }

        this.openai = new OpenAI({
            apiKey: apiKey
        });

        this.haikuService = haikuService;
    }

    async generate(): Promise<HaikuValue> {
        try {
            const prompt = await this.generatePrompt();
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

            haiku.title = output.title;
            haiku.description = output.description;
            haiku.hashtags = output.hashtags;

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

    private async generatePrompt(): Promise<string> {
        const haikus = await this.fetchHaikus();

        const prompt = 'Choose the most revelant haiku from the list below (correct grammatical construction, consistency between [Verses], capturing beauty of nature, sense of tranquility, peace and good moment of insight):';
        const outputFormat = '{"id":[Id],"title":"<Give a creative short title to describe the haiku>","description":"<Describe and explain the haiku as an English literature teacher>","hashtags":"<Give 6 lowercase hashtags>"}';

        return `${prompt} (Use the following format: ${outputFormat})\n${haikus.join('\n')}\nSTOP\n`;
    }

    private async addTranslations(haiku: HaikuValue): Promise<HaikuValue> {
        let prompt = `Translate this haiku using \\n separator: "${haiku.verses.join('\\n')}"`;
        const outputFormat = '{"fr":"<Translate the Haiku in french>,"es":"<Translate the Haiku in spanish>","jp":"<Translate the Haiku in rōmaji>"}';
        prompt = `${prompt} (Use the following format: ${outputFormat})`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            temperature: 0.4,
            max_tokens: 1000,
            top_p: 0.5,
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
            'es': output.es,
            'jp': output.jp,
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
