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
                temperature: 0.6,
                max_tokens: 1024,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["STOP"],
            });

            if (200 === completion.status) {
                const output = JSON.parse(completion.data.choices[0].text);
                index = output.id;

                // Add title
                haikuSelection[index].title = output.title;

                // Add description
                haikuSelection[index].description = output.description;
            }
        } catch (error) {
            console.log(error);
        }

        if (!haikuSelection[index]) {
            return await Haiku.generate();
        }

        return haikuSelection[index];
    },

    async generatePrompt() {
        const verses = [];

        for (let i = 0; i < 6; ++i) {
            const haiku = await Haiku.generate();

            haikuSelection.push(haiku);
            verses.push(i + ":\n" + haiku.verses.join("\n") + "\n");
        }

        const prompt = 'What is the most revelant haiku from the list below?';

        return `${prompt} (output JSON format: {"id":ID,"title":"Give a short title for this Haiku","description":"Describe and explain the meaning of this Haiku"})

            ${verses.join("\n")}

        STOP
        `;
    }
}
