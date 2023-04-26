import fetch from 'node-fetch';
import cliProgress from 'cli-progress';
import { MarkovEvaluator } from '../src/services/markovEvaluator';
import { ChapterResponseData } from '../src/types';

const query = `
    query Query {
        chapters {
            content
        }
    }
`;

const body = {
    query: query,
};

fetch(process.env.SERVER_URI || 'http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
}).then(response => response.json()).then(async (response: {
    data: ChapterResponseData
}) => {
    const chapters = response.data.chapters;
    
    const markovEvaluator = new MarkovEvaluator();

    const bar = new cliProgress.SingleBar({
        format: 'Chapters | {bar} | {percentage}% || {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });

    bar.start(chapters.length, 0);
    
    for (const chapter of chapters) {
        markovEvaluator.trainMarkovChain(chapter.content);
        bar.increment();
    }

    bar.stop();

    markovEvaluator.save();
});