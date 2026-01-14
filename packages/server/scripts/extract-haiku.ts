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
  .option(
    '-m, --method <method>',
    'extraction method: punctuation, chunk, or auto (default)',
    'auto',
  )
  .parse();

const options = program.opts();
const iterations = Math.max(1, Number.parseInt(options.iterations, 10) || 1);
const extractionMethod = ['punctuation', 'chunk'].includes(options.method)
  ? options.method
  : null;

const query = `
  query Query(
      $useAi: Boolean,
      $useCache: Boolean,
      $appendImg: Boolean,
      $extractionMethod: String
  ) {
      haiku(
          useAI: $useAi,
          useCache: $useCache,
          appendImg: $appendImg,
          extractionMethod: $extractionMethod
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
          executionTime
          extractionMethod
          quality {
              natureWords
              repeatedWords
              weakStarts
              blacklistedVerses
              properNouns
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
  extractionMethod,
};

interface GraphQLResponse {
  data?: HaikuResponseData;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

async function fetchHaiku(): Promise<{
  haiku: HaikuValue | null;
  error?: string;
}> {
  const response = await fetch(
    process.env.SERVER_URI || 'http://localhost:4000/graphql',
    {
      body: JSON.stringify({ query, variables }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  );

  const data = (await response.json()) as GraphQLResponse;

  if (data.errors && data.errors.length > 0) {
    return { haiku: null, error: data.errors[0].message };
  }

  return { haiku: data.data?.haiku ?? null };
}

// Quality score display functions
function colorByThreshold(value: number, threshold: number): string {
  return value >= threshold
    ? pc.green(value.toFixed(3))
    : pc.yellow(value.toFixed(3));
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

interface ScoreDisplay {
  label: string;
  getValue: (q: NonNullable<HaikuValue['quality']>) => string;
}

const scoreDisplays: ScoreDisplay[] = [
  { label: 'Nature words:', getValue: (q) => pc.green(String(q.natureWords)) },
  { label: 'Repeated words:', getValue: (q) => colorByZero(q.repeatedWords) },
  { label: 'Weak starts:', getValue: (q) => colorByZero(q.weakStarts) },
  {
    label: 'Blacklisted:',
    getValue: (q) => colorByZero(q.blacklistedVerses ?? 0),
  },
  { label: 'Proper nouns:', getValue: (q) => colorByZero(q.properNouns ?? 0) },
  { label: 'Sentiment:', getValue: (q) => colorSentiment(q.sentiment ?? 0.5) },
  { label: 'Grammar:', getValue: (q) => colorByThreshold(q.grammar ?? 0, 0.5) },
  {
    label: 'Trigram flow:',
    getValue: (q) => colorByThreshold(q.trigramFlow ?? 0, 2),
  },
  {
    label: 'Markov flow:',
    getValue: (q) => colorByThreshold(q.markovFlow ?? 0, 2),
  },
  {
    label: 'Uniqueness:',
    getValue: (q) => colorByThreshold(q.uniqueness ?? 0, 0.7),
  },
  {
    label: 'Alliteration:',
    getValue: (q) => colorByThreshold(q.alliteration ?? 0, 0.3),
  },
  {
    label: 'Verse Distance:',
    getValue: (q) => pc.magenta((q.verseDistance ?? 0).toFixed(3)),
  },
  {
    label: 'Line Balance:',
    getValue: (q) => colorByThreshold(q.lineLengthBalance ?? 0, 0.5),
  },
  {
    label: 'Imagery:',
    getValue: (q) => colorByThreshold(q.imageryDensity ?? 0, 0.15),
  },
  {
    label: 'Coherence:',
    getValue: (q) => colorByThreshold(q.semanticCoherence ?? 0, 0.1),
  },
  {
    label: 'Verb Presence:',
    getValue: (q) => colorByThreshold(q.verbPresence ?? 0, 0.3),
  },
];

function displayQualityScores(haiku: HaikuValue): void {
  if (!haiku.quality) {
    return;
  }
  const q = haiku.quality;

  console.log(pc.bold('\n═══ Quality Scores ═══\n'));

  for (const { label, getValue } of scoreDisplays) {
    console.log(`${pc.dim(label.padEnd(17))} ${getValue(q)}`);
  }

  const totalColor = q.totalScore >= 0 ? pc.green : pc.red;
  console.log(
    `\n${pc.dim('Total score:')}      ${pc.bold(totalColor(q.totalScore.toFixed(2)))}`,
  );
}

try {
  console.log(pc.bold('\n🎋 Haiku Extraction\n'));
  console.log(pc.dim(`Iterations: ${iterations}`));
  console.log(pc.dim(`Method: ${extractionMethod ?? 'auto'}`));

  const candidates: HaikuValue[] = [];
  let bestHaiku: HaikuValue | null = null;
  let bestScore = -Infinity;
  let bestIndex = 0;

  for (let i = 0; i < iterations; i++) {
    const spinner = ora(`Generating haiku ${i + 1}/${iterations}...`).start();

    const result = await fetchHaiku();

    if (!result.haiku) {
      const errorMsg = result.error ? `: ${result.error}` : '';
      spinner.fail(pc.red(`Failed to generate haiku ${i + 1}${errorMsg}`));
      continue;
    }

    const haiku = result.haiku;

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
        pc.magenta(` [score: ${score.toFixed(2)}]`),
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
      const indexStr = isBest
        ? pc.green(pc.bold(`#${i + 1}`))
        : pc.dim(`#${i + 1}`);
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
