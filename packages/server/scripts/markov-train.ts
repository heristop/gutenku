#!/usr/bin/env node
import 'reflect-metadata';
import fetch from 'node-fetch';
import pc from 'picocolors';
import ora from 'ora';
import cliProgress from 'cli-progress';
import logUpdate from 'log-update';
import { container } from 'tsyringe';
import { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import { ParallelMarkovTrainer } from '~/domain/services/ParallelMarkovTrainer';
import type { ChapterResponseData } from '~/shared/types';

const useParallel = process.argv.includes('--parallel');

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

const formatNumber = (n: number): string => n.toLocaleString('en-US');

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${seconds}s`;
};

try {
  console.log(pc.bold('\n🧠 Markov Chain Training\n'));

  if (useParallel) {
    console.log(pc.yellow('⚡ Parallel mode enabled\n'));
  }

  const startTime = Date.now();

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

  if (useParallel) {
    // Parallel training mode
    const parallelTrainer = new ParallelMarkovTrainer();
    const chapterContents = chapters.map((c) => c.content);

    // Show worker count
    const { cpus } = await import('node:os');
    const workerCount = Math.max(1, cpus().length - 1);

    const renderProgress = (completed: number, total: number): void => {
      const percentage = Math.round((completed / total) * 100);
      const barWidth = 40;
      const filledWidth = Math.round((completed / total) * barWidth);
      const bar =
        pc.cyan('\u2588'.repeat(filledWidth)) +
        '\u2591'.repeat(barWidth - filledWidth);
      logUpdate(
        `Workers ${bar} ${pc.yellow(`${percentage}%`)} | ${completed}/${total}`,
      );
    };

    renderProgress(0, workerCount);

    const result = await parallelTrainer.train(
      chapterContents,
      (completed, total) => {
        renderProgress(completed, total);
      },
    );

    logUpdate.done();

    // Import merged results
    markovEvaluator.importTrainingData(result);
  } else {
    // Sequential training mode (original)
    const progressBar = new cliProgress.SingleBar({
      format: `Training ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    progressBar.start(chapters.length, 0);

    const yieldToGC = (): Promise<void> =>
      new Promise((resolve) => {
        setImmediate(resolve);
      });
    const forceGC =
      typeof globalThis.gc === 'function'
        ? (globalThis.gc as () => void)
        : null;
    const GC_INTERVAL = 50;

    for (let i = 0; i < chapters.length; i++) {
      markovEvaluator.trainMarkovChain(chapters[i].content);
      progressBar.increment();

      if ((i + 1) % GC_INTERVAL === 0) {
        forceGC?.();
        await yieldToGC();
      }
    }

    progressBar.stop();
  }

  // Save model with spinner
  const saveSpinner = ora('Saving model...').start();
  const saved = await markovEvaluator.save();

  if (saved) {
    saveSpinner.succeed(pc.green('Model saved successfully'));
  } else {
    saveSpinner.warn(pc.yellow('Model save returned false'));
  }

  // Get stats and duration
  const stats = markovEvaluator.getStats();
  const duration = Date.now() - startTime;

  // Summary
  console.log(pc.bold('\n╔══════════════════════════════════════╗'));
  console.log(pc.bold('║       📊 Training Summary            ║'));
  console.log(pc.bold('╚══════════════════════════════════════╝\n'));

  console.log(pc.dim('─────────────────────────────────────────'));
  console.log(
    `  ${pc.cyan('Mode')}            ${useParallel ? pc.yellow('Parallel') : pc.blue('Sequential')}`,
  );
  console.log(
    `  ${pc.cyan('Duration')}        ${pc.white(formatDuration(duration))}`,
  );
  console.log(
    `  ${pc.cyan('Chapters')}        ${pc.white(formatNumber(chapters.length))}`,
  );
  console.log(pc.dim('─────────────────────────────────────────'));

  console.log(pc.bold('\n  📈 Model Statistics\n'));
  console.log(
    `  ${pc.cyan('Bigram keys')}     ${pc.green(formatNumber(stats.bigrams))}`,
  );
  console.log(
    `  ${pc.cyan('Trigram keys')}    ${pc.green(formatNumber(stats.trigrams))}`,
  );
  console.log(
    `  ${pc.cyan('Vocabulary')}      ${pc.green(formatNumber(stats.vocabulary))}`,
  );
  console.log(
    `  ${pc.cyan('Total bigrams')}   ${pc.green(formatNumber(stats.totalBigrams))}`,
  );
  console.log(
    `  ${pc.cyan('Total trigrams')}  ${pc.green(formatNumber(stats.totalTrigrams))}`,
  );
  console.log(pc.dim('─────────────────────────────────────────'));

  console.log(
    `\n  ${pc.cyan('Model saved')}     ${saved ? pc.green('✓ yes') : pc.red('✗ no')}`,
  );

  console.log(pc.bold(pc.green('\n✨ Training complete!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
