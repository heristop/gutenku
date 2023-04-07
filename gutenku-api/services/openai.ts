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
                temperature: 0.3,
                max_tokens: 1200,
                top_p: 0.2,
                frequency_penalty: 0.2,
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
                haiku.book.emoticons = output.book_emoticons;
                haiku.translations = {
                    'fr': output.fr,
                    'es': output.es,
                };

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
        const haikus = await this.fetchHaikus();

        const prompt = 'Choose the most revelant haiku from the list below (correct grammatical construction, consistency between [Verses], capturing beauty of nature, sense of tranquility, peace and good moment of insight) and generate UTF-8 emoticons for the corresponding [Book Title]. Please provide a series of clear and easily recognizable emoticons that best represent the book:';
        const outputFormat = '{"id":[Id],"title":"<Give a creative short title to describe the haiku>","book_emoticons":"<Generate a series of UTF-8 emoticons that represent the related book (\'[Book Title\'])>","description":"<Describe and explain the haiku as an English literature teacher>","fr":"<Translate verses in french with \\n separator>,"es":"<Translate verses in spanish with \\n separator>","hashtags":"<Give 6 lowercase hashtags>"}';

        return `${prompt} (Use the following format: ${outputFormat})\n${haikus.join('\n')}\nSTOP\n`;
    }

    private async fetchHaikus(): Promise<string[]> {
        const haikus: string[] = [];

        for (const [i,] of Array(this.selectionCount).entries()) {
            const haiku = await this.haikuService.generate();

            this.haikuSelection.push(haiku);

            const verses = `Haiku [Id]: ${i}\n` +
                `[Verses]: ${haiku.verses.join('\n')}\n` +
                `[Book Title]: ${haiku.book.title}\n`;

            console.log(verses);

            haikus.push(verses);
        }

        return haikus;
    }
}
