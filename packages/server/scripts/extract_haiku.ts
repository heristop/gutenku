import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HaikuResponseData } from '../src/types';

dotenv.config();

const query = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean,
        $theme: String
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg,
            theme: $theme
        ) {
            book {
                title
                author
            }
            verses,
            rawVerses
            context
            chapter {
                title,
                content
            }
            executionTime
        }
    }
`;

const variables = {
    useAi: false,
    useCache: false,
    appendImg: false,
    theme: 'watermark',
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
    const haiku = response.data?.haiku;

    if (null === haiku) {
        console.error(response);

        throw new Error('Haiku fetch error');
    }

    console.info(
        haiku.verses,
        haiku.book.title
    );

    console.info('Time:', haiku.executionTime, 's');
});
