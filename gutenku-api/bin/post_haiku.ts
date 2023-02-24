import dotenv from 'dotenv';
import fetch from 'node-fetch';
import readline from 'readline';
import InstagramPublisher from 'instagram-publisher';
import { HaikuResponseData } from '../src/types';

dotenv.config();

const query = `
    query Query($useAi: Boolean) {
        haiku(useAI: $useAi) {
            book {
                title
                author
            }
            verses
            title
            description
            chapter {
                title
            }
        }
    }
`;

const variables = {
    useAi: true
};

const body = {
    query: query,
    variables: variables,
    timeout: 300,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
}).then(response => response.json()).then((response: { 
      data: HaikuResponseData 
    }) => {
    const haiku = response.data.haiku;

    console.log(haiku);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
      
    rl.question('Post on Instagram? (y/n) ', (answer: string) => {
        if ('y' === answer) {
            const caption = `
🌸 “${haiku.title}” 
🗻 Can you guess from which book the text was extracted?
~~~
#gutenku #haiku #poetry #poem #haikupoetry #haikulover #haikusofinstagram #haikumoments #haikucommunity #japanesepoetry #naturepoetry #micropoetry #minimalistpoetry #zenpoetry #buddhistpoetry #meditativepoetry
`;

            console.log(caption);
            
            if (process.env.INSTAGRAM_API_USER) {
                const client = new InstagramPublisher({
                    email: process.env.INSTAGRAM_API_USER,
                    password: process.env.INSTAGRAM_API_PASSWORD,
                    verbose: true,
                });
            
                const imageData = {
                    image_path: haiku.image_path,
                    caption: caption,
                };
            
                client.createSingleImage(imageData).then(() => {
                    console.log('Image sent!');
                });
            }
        }

        rl.close();
    });
});
