import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HaikuResponseData } from '../src/types';

dotenv.config();

const query = `
    query Query(
        $useAi: Boolean,
        $skipCache: Boolean,
        $appendImg: Boolean, 
    ) {
        haiku(
            useAI: $useAi,
            skipCache: $skipCache,
            appendImg: $appendImg, 
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
    skipCache: true,
    appendImg: false,
};

const body = {
    query: query,
    variables: variables,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
}).then(response => response.json()).then(async (response: {
    data: HaikuResponseData
}) => {
    const haiku = response.data.haiku;

    console.log(haiku.book.title, haiku.verses);
});
