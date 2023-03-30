import { Configuration, OpenAIApi } from 'openai';
import { HaikuValue, OpenAIOptions } from '../src/types';
import HaikuService, { GeneratorInterface } from './haiku';

export default class OpenAIService implements GeneratorInterface {
    private haikuSelection: HaikuValue[] = [];

    private configuration: Configuration;
    private openAIApi: OpenAIApi;
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

        this.configuration = new Configuration({ apiKey });
        this.openAIApi = new OpenAIApi(this.configuration);
        this.haikuService = haikuService;
    }

    async generate(): Promise<HaikuValue> {
        try {
            const prompt = await this.generatePrompt();
            const completion = await this.openAIApi.createCompletion({
                model: 'text-davinci-003',
                prompt,
                temperature: 0.6,
                max_tokens: 1200,
                top_p: 0.2,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ['STOP'],
            });

            if (200 === completion.status) {
                const answer = completion.data.choices[0].text;
                const output = JSON.parse(answer);
                const index = output.id;

                const haiku = this.haikuSelection[index];
                this.haikuSelection = [];

                haiku.title = output.title;
                haiku.description = output.description;
                haiku.hashtags = output.hashtags;
                haiku.fr = output.fr;
                haiku.es = output.es;

                return haiku;
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.haikuSelection = [];
        }

        return await this.haikuService.generate();
    }

    private async generatePrompt(): Promise<string> {
        const verses = await this.fetchVerses();

        const prompt = 'Please help me choose the best haiku from this list. I\'m looking for a haiku that captures the beauty of nature and evokes a sense of tranquility and peace. Which haiku from this list would you choose for this prompt?';
        const outputFormat = '{"id":ID,"title":"<Give a short title to describe this haiku>","description":"<Describe and explain the meaning of this Haiku>","fr":"<Translate haiku verses in french>,"es":"<Translate haiku verses in spanish>","hashtags":"<Give 6 lowercase hashtags>"}';

        return `${prompt} (Use the following format: ${outputFormat})\n${verses.join('\n')}\nSTOP\n`;
    }

    private async fetchVerses(): Promise<string[]> {
        const verses: string[] = [];

        for (const [i,] of Array(this.selectionCount).entries()) {
            const haiku = await this.haikuService.generate();

            this.haikuSelection.push(haiku);

            console.log(i, haiku.verses, haiku.book.title);

            const verse = `${i}:\n${haiku.verses.join('\n')}\n`;

            verses.push(verse);
        }

        return verses;
    }
}
