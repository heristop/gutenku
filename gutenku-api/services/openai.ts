import { fork } from 'child_process';
import { Configuration, OpenAIApi } from 'openai';
import { HaikuValue, OpenAIOptions } from '../src/types';
import HaikuService, { GeneratorInterface } from './haiku';

export default class OpenAIService implements GeneratorInterface {
    private haikuSelection: HaikuValue[] = [];

    private configuration: Configuration;
    private openAIApi: OpenAIApi;
    private haikuService: HaikuService;
    private selectionCount: number;

    private readonly MAX_SELECTION_COUNT: number = 20;

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
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ['STOP'],
            });

            if (200 === completion.status) {
                const output = JSON.parse(completion.data.choices[0].text);
                const index = output.id;

                const haiku = this.haikuSelection[index];
                this.haikuSelection = [];

                haiku.title = output.title;
                haiku.description = output.description;

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

        const prompt = 'What is the most revelant, with the best grammar and the most beautiful haiku from the list below?';
        const outputFormat = '{"id":ID,"title":"Give a short title for this Haiku","description":"Describe and explain the meaning of this Haiku"}';

        return `${prompt} (output JSON format: ${outputFormat})\n${verses.join('\n')}\nSTOP\n`;
    }

    private async fetchVerses(): Promise<string[]> {
        const verses: string[] = [];

        for (const [i,] of Array(this.selectionCount).entries()) {
            const verse = await (new Promise<string>(resolve => {
                // fork another process
                const process = fork('./bin/extract_haiku.ts');

                process.send({ i });

                // listen for messages from forked process
                process.on('message', async (haiku: HaikuValue) => {
                    this.haikuSelection.push(haiku);

                    console.log(i, haiku.verses, haiku.book.title);

                    const verse = `${i}:\n${haiku.verses.join('\n')}\n`;

                    resolve(verse);
                });
            }));

            verses.push(verse);
        }

        return verses;
    }
}
