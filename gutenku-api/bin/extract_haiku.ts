import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HaikuResponseData } from '../src/types';

dotenv.config();

// receive message from master process
process.on('message', async () => {
    const query = `
        query Query(
            $useAi: Boolean, 
            $withImg: Boolean, 
        ) {
            haiku(
                useAI: $useAi, 
                withImg: $withImg, 
            ) {
                book {
                    title
                    author
                }
                verses,
                rawVerses
                chapter {
                    title,
                    content
                }
            }
        }
    `;

    const variables = {
        useAi: false,
        withImg: false,
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

        process.send({ ...haiku });
    });
});
