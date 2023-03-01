import Haiku from './haiku';
import { Configuration, OpenAIApi } from 'openai';
import { HaikuValue } from '../src/types';

let haikuSelection: HaikuValue[] = [];

export default {
    async generate(): Promise<HaikuValue> {
        try {
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const openai = new OpenAIApi(configuration);

            const prompt = await this.generatePrompt();
            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["STOP"],
            });

            if (200 === completion.status) {
                const output = JSON.parse(completion.data.choices[0].text);
                const index = output.id;

                const haiku = haikuSelection[index];
                haikuSelection = [];

                haiku.title = output.title;
                haiku.description = output.description;

                return haiku;
            }
        } catch (error) {
            console.log(error);
        }

        return await Haiku.generate();
    },

    async generatePrompt(): Promise<string> {
        const verses: string[] = [];

        for (const [i,] of Array(7).entries()) {
            const haiku = await Haiku.generate();
            const verse = `${i}:\n${haiku.verses.join("\n")}\n`;

            haikuSelection.push(haiku);

            verses.push(verse);
            console.log(verse + "\n");
        }

        const prompt = 'What is the most revelant and beautiful haiku from the list below?';
        const outputFormat = '{"id":ID,"title":"Give a short title for this Haiku","description":"Describe and explain the meaning of this Haiku"}';

        return `${prompt} (output JSON format: ${outputFormat})\n${verses.join("\n")}\nSTOP\n`;
    }
}
