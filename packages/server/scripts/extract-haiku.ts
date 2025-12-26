import dotenv from 'dotenv';
import log from 'loglevel';
import fetch from 'node-fetch';
import type { HaikuResponseData } from '~/shared/types';

dotenv.config();
log.enableAll();

const query = `
    query Query(
        $useAi: Boolean,
        $useCache: Boolean,
        $appendImg: Boolean
    ) {
        haiku(
            useAI: $useAi,
            useCache: $useCache,
            appendImg: $appendImg
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
  appendImg: false,
  useAi: false,
  useCache: false,
};

const body = {
  query: query,
  variables: variables,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})
  .then((response) => response.json())
  .then(async (response: { data: HaikuResponseData }) => {
    const haiku = response.data?.haiku;

    if (haiku === null) {
      console.error(response);

      throw new Error('Haiku fetch error');
    }

    console.info(haiku.verses, haiku.book.title);

    console.info('Time:', haiku.executionTime, 's');
  });
