#!/usr/bin/env node
import 'reflect-metadata';
import fetch from 'node-fetch';
import pc from 'picocolors';
import ora from 'ora';
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

try {
  console.log(pc.bold('\n🧠 Markov Chain Training\n'));

  // Fetch chapters with spinner
  const fetchSpinner = ora('Fetching chapters from server...').start();

  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as { data: ChapterResponseData };
  const chapters = data.data?.chapters;

  if (!chapters) {
    fetchSpinner.fail(pc.red('Failed to fetch chapters'));
    console.error(pc.red('\nError response:'), data);
    process.exit(1);
  }

  fetchSpinner.succeed(
    pc.green(`Fetched ${pc.cyan(String(chapters.length))} chapters`),
  );

  // Train with progress bar
  console.log(pc.dim(`\nTraining on ${chapters.length} chapters...\n`));

  const markovEvaluator = container.resolve(MarkovEvaluatorService);

  const progressBar = new cliProgress.SingleBar({
    format: `Training ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  progressBar.start(chapters.length, 0);

  for (const chapter of chapters) {
    markovEvaluator.trainMarkovChain(chapter.content);
    progressBar.increment();
  }

  progressBar.stop();

  // Save model with spinner
  const saveSpinner = ora('Saving model...').start();
  const saved = await markovEvaluator.save();

  if (saved) {
    saveSpinner.succeed(pc.green('Model saved successfully'));
  } else {
    saveSpinner.warn(pc.yellow('Model save returned false'));
  }

  // Summary
  console.log(pc.bold('\n═══ Training Summary ═══\n'));
  console.log(pc.green(`✓ Chapters processed: ${chapters.length}`));
  console.log(pc.green(`✓ Model saved: ${saved ? 'yes' : 'no'}`));

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
