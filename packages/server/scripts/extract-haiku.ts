#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import pc from 'picocolors';
import ora from 'ora';
import { program } from 'commander';
import type { HaikuResponseData, HaikuValue } from '~/shared/types';

dotenv.config();

program
  .name('extract-haiku')
  .description('Generate haikus and select the best by score')
  .option('-n, --iterations <number>', 'number of haikus to generate', '1')
  .parse();

const options = program.opts();
const iterations = Math.max(1, Number.parseInt(options.iterations, 10) || 1);

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
          extractionMethod
          quality {
              natureWords
              repeatedWords
              weakStarts
              sentiment
              grammar
              trigramFlow
              markovFlow
              uniqueness
              alliteration
              verseDistance
              lineLengthBalance
              imageryDensity
              semanticCoherence
              verbPresence
              totalScore
          }
      }
  }
`;

const variables = {
  appendImg: false,
  useAi: false,
  useCache: false,
};

async function fetchHaiku(): Promise<HaikuValue | null> {
  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify({ query, variables }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as { data: HaikuResponseData };
  return data.data?.haiku ?? null;
}

// Helper functions for quality score display
function colorByThreshold(value: number, threshold: number): string {
  return value >= threshold ? pc.green(value.toFixed(3)) : pc.yellow(value.toFixed(3));
}

function colorByZero(value: number): string {
  return value > 0 ? pc.red(String(value)) : pc.green('0');
}

function colorSentiment(value: number): string {
  if (value > 0.6) {
    return pc.green(value.toFixed(3));
  }

  if (value < 0.4) {
    return pc.red(value.toFixed(3));
  }
  return pc.yellow(value.toFixed(3));
}

function displayQualityScores(haiku: HaikuValue): void {
  if (!haiku.quality) {
    return;
  }
  const q = haiku.quality;

  console.log(pc.bold('\n═══ Quality Scores ═══\n'));

  console.log(`${pc.dim('Nature words:')}     ${pc.green(String(q.natureWords))}`);
  console.log(`${pc.dim('Repeated words:')}   ${colorByZero(q.repeatedWords)}`);
  console.log(`${pc.dim('Weak starts:')}      ${colorByZero(q.weakStarts)}`);
  console.log(`${pc.dim('Sentiment:')}        ${colorSentiment(q.sentiment ?? 0.5)}`);
  console.log(`${pc.dim('Grammar:')}          ${colorByThreshold(q.grammar ?? 0, 0.5)}`);
  console.log(`${pc.dim('Trigram flow:')}     ${colorByThreshold(q.trigramFlow ?? 0, 2)}`);
  console.log(`${pc.dim('Markov flow:')}      ${colorByThreshold(q.markovFlow ?? 0, 2)}`);
  console.log(`${pc.dim('Uniqueness:')}       ${colorByThreshold(q.uniqueness ?? 0, 0.7)}`);
  console.log(`${pc.dim('Alliteration:')}     ${colorByThreshold(q.alliteration ?? 0, 0.3)}`);
  console.log(`${pc.dim('Verse Distance:')}   ${pc.magenta((q.verseDistance ?? 0).toFixed(3))}`);
  console.log(`${pc.dim('Line Balance:')}     ${colorByThreshold(q.lineLengthBalance ?? 0, 0.5)}`);
  console.log(`${pc.dim('Imagery:')}          ${colorByThreshold(q.imageryDensity ?? 0, 0.15)}`);
  console.log(`${pc.dim('Coherence:')}        ${colorByThreshold(q.semanticCoherence ?? 0, 0.1)}`);
  console.log(`${pc.dim('Verb Presence:')}    ${colorByThreshold(q.verbPresence ?? 0, 0.3)}`);

  const totalColor = q.totalScore >= 0 ? pc.green : pc.red;
  console.log(`\n${pc.dim('Total score:')}      ${pc.bold(totalColor(q.totalScore.toFixed(2)))}`);
}

try {
  console.log(pc.bold('\n🎋 Haiku Extraction\n'));
  console.log(pc.dim(`Iterations: ${iterations}`));

  const candidates: HaikuValue[] = [];
  let bestHaiku: HaikuValue | null = null;
  let bestScore = -Infinity;
  let bestIndex = 0;

  for (let i = 0; i < iterations; i++) {
    const spinner = ora(`Generating haiku ${i + 1}/${iterations}...`).start();

    const haiku = await fetchHaiku();

    if (!haiku) {
      spinner.fail(pc.red(`Failed to generate haiku ${i + 1}`));
      continue;
    }

    const score = haiku.quality?.totalScore ?? 0;
    candidates.push(haiku);

    if (score > bestScore) {
      bestScore = score;
      bestHaiku = haiku;
      bestIndex = candidates.length - 1;
    }

    spinner.succeed(
      pc.green(`Haiku ${i + 1}`) +
      pc.dim(` (${haiku.book.title})`) +
      pc.magenta(` [score: ${score.toFixed(2)}]`)
    );
  }

  if (!bestHaiku) {
    console.error(pc.red('\nNo haikus generated'));
    process.exit(1);
  }

  // Show all candidates if multiple iterations
  if (iterations > 1) {
    console.log(pc.bold(`\n═══ All Candidates (${candidates.length}) ═══\n`));

    candidates.forEach((haiku, i) => {
      const score = haiku.quality?.totalScore ?? 0;
      const isBest = i === bestIndex;
      const marker = isBest ? pc.green('★ BEST') : '';
      const indexStr = isBest ? pc.green(pc.bold(`#${i + 1}`)) : pc.dim(`#${i + 1}`);
      const scoreStr = pc.magenta(`[score: ${score.toFixed(2)}]`);
      const bookInfo = pc.dim(`(${haiku.book.title})`);

      console.log(`${indexStr} ${marker} ${bookInfo} ${scoreStr}`);
      haiku.verses.forEach((verse) => {
        const verseText = isBest ? pc.cyan(`  ${verse}`) : pc.dim(`  ${verse}`);
        console.log(verseText);
      });
      console.log();
    });
  }

  // Display best haiku
  console.log(pc.bold('═══ Best Haiku ═══\n'));

  console.log(pc.cyan('  ' + bestHaiku.verses.join('\n  ')));

  console.log(pc.dim(`\n  — ${bestHaiku.book.title}`));
  console.log(pc.dim(`    by ${bestHaiku.book.author}`));

  // Details
  console.log(pc.bold('\n═══ Details ═══\n'));
  console.log(
    `${pc.dim('Extraction:')}      ${pc.magenta(bestHaiku.extractionMethod || 'unknown')}`,
  );
  console.log(
    `${pc.dim('Execution time:')} ${pc.yellow(bestHaiku.executionTime + 's')}`,
  );

  // Quality scores for best haiku
  displayQualityScores(bestHaiku);

  console.log(pc.bold(pc.green('\n✨ Done!\n')));
  process.exit(0);
} catch (error) {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
}
