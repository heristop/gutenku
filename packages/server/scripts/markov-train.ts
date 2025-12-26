import 'reflect-metadata';
import fetch from 'node-fetch';
import cliProgress from 'cli-progress';
import { container } from 'tsyringe';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import type { ChapterResponseData } from '~/shared/types';

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
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})
  .then((response) => response.json())
  .then(async (response: { data: ChapterResponseData }) => {
    const chapters = response.data.chapters;

    if (chapters === null) {
      console.error(response);

      throw new Error('Chapters fetch error');
    }

    const markovEvaluator = container.resolve(MarkovEvaluatorService);

    const bar = new cliProgress.SingleBar({
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      format: 'Chapters | {bar} | {percentage}% || {value}/{total}',
      hideCursor: true,
    });

    bar.start(chapters.length, 0);

    for (const chapter of chapters) {
      markovEvaluator.trainMarkovChain(chapter.content);
      bar.increment();
    }

    bar.stop();

    markovEvaluator.save();
  });
