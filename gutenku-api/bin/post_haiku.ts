import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { program } from 'commander';
import { createInterface } from 'readline';
import { HaikuResponseData } from '../src/types';
import Instagram from '../services/instagram';
import terminalImage from 'terminal-image';

dotenv.config();

program
    .option('--no-interaction')
    .option('--no-openai');

program.parse();

const options = program.opts();

const query = `
    query Query($useAi: Boolean, $keepImage: Boolean) {
        haiku(useAI: $useAi, keepImage: $keepImage) {
            book {
                title
                author
            }
            verses
            title
            description
            image_path
            chapter {
                title
            }
        }
    }
`;

const variables = {
    useAi: options.openai,
    keepImage: true,
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
}).then(response => response.json()).then(async (response: {
    data: HaikuResponseData
}) => {
    const haiku = response.data.haiku;

    console.log(await terminalImage.file(haiku.image_path, { width: 20 }));
    console.log(haiku);

    if (false === options.interaction) {
        Instagram.post(haiku);
    } else {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\nPost on Instagram? (y/n) \x1b[33m[n]\x1b[0m ', (answer: string) => {
            if ('y' === answer || 'yes' === answer) {
                Instagram.post(haiku);
            }

            rl.close();
        });
    }
});

