/**
 * Score display helpers for extract-haiku CLI.
 */
import pc from 'picocolors';
import type { HaikuValue } from '~/shared/types';

export function colorByThreshold(value: number, threshold: number): string {
  return value >= threshold
    ? pc.green(value.toFixed(3))
    : pc.yellow(value.toFixed(3));
}

export function colorByZero(value: number): string {
  return value > 0 ? pc.red(String(value)) : pc.green('0');
}

export function colorSentiment(value: number): string {
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

export function displayQualityScores(haiku: HaikuValue): void {
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
