import Haiku from './haiku';
import { Configuration, OpenAIApi } from 'openai';

const haikuSelection = [];

export default {
    async generate() {
        let index = 0;

        try {
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const openai = new OpenAIApi(configuration);

            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: await this.generatePrompt(),
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["STOP"],
            });

            if (200 === completion.status) {
                const output = JSON.parse(completion.data.choices[0].text);
                index = output.id;

                // Add meaning
                haikuSelection[index].meaning = output.meaning;
            }
        } catch (error) {
            console.log(error);
        }

        if (!haikuSelection[index]) {
            return await Haiku.generateWithImage();
        }

        return await Haiku.addImage(haikuSelection[index]);
    },

    async generatePrompt() {
        const verses = [];

        for (let i = 0; i < 20; i++) {
            const haiku = await Haiku.generate();

            haikuSelection.push(haiku);
            verses.push(i + ":\n" + haiku.verses.join("\n") + "\n");
        }

        const prompt = 'What is the most revelant haiku from the list below?';

        return `${prompt} (output JSON format: {"id":ID,"meaning":"Describe and explain the meaning of this Haiku"})

            ${verses.join("\n")}

        STOP
        `;
    }
}
