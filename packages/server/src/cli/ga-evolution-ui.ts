import pc from 'picocolors';
import stringWidth from 'string-width';
import type { DecodedHaiku } from '~/domain/services/genetic';

// Box drawing constants
export const BOX_WIDTH = 62;
export const INNER_WIDTH = BOX_WIDTH - 4; // "║ " + content + " ║"

/** Pad/truncate string to exact visual width */
export function fitToWidth(str: string, width: number): string {
  const visWidth = stringWidth(str);

  if (visWidth === width) {
    return str;
  }

  if (visWidth > width) {
    // Truncate - simple approach for plain strings
    let result = '';
    let currentWidth = 0;

    for (const char of str) {
      const charWidth = stringWidth(char);

      if (currentWidth + charWidth > width - 3) {
        break;
      }
      result += char;
      currentWidth += charWidth;
    }

    return result + '...';
  }
  // Pad
  return str + ' '.repeat(width - visWidth);
}

/** Create a box line with content */
export function boxLine(content: string): string {
  return (
    pc.bold('║') + ' ' + fitToWidth(content, INNER_WIDTH) + ' ' + pc.bold('║')
  );
}

/** Box top border */
export function boxTop(): string {
  return pc.bold('╔' + '═'.repeat(BOX_WIDTH - 2) + '╗');
}

/** Box bottom border */
export function boxBottom(): string {
  return pc.bold('╚' + '═'.repeat(BOX_WIDTH - 2) + '╝');
}

/** Box separator */
export function boxSep(): string {
  return pc.bold('╠' + '═'.repeat(BOX_WIDTH - 2) + '╣');
}

/** Progress bar */
export function progressBar(
  current: number,
  total: number,
  width: number,
): string {
  const pct = Math.min(1, current / total);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = pc.green('█'.repeat(filled)) + pc.dim('░'.repeat(empty));

  return bar + ' ' + pc.cyan((pct * 100).toFixed(0).padStart(3) + '%');
}

/** Sparkline chart */
export function sparkline(values: number[], width: number): string {
  if (values.length === 0) {
    return pc.dim('─'.repeat(width));
  }

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Sample to fit
  const step = Math.max(1, Math.ceil(values.length / width));
  const sampled: number[] = [];

  for (let i = 0; i < values.length && sampled.length < width; i += step) {
    sampled.push(values[i]);
  }

  const line = sampled
    .map((v) => {
      const norm = (v - min) / range;
      const idx = Math.min(Math.floor(norm * chars.length), chars.length - 1);

      return chars[idx];
    })
    .join('');

  const padding = width - stringWidth(line);

  return pc.green(line) + pc.dim('─'.repeat(Math.max(0, padding)));
}

/** Diversity bar */
function diversityColor(diversity: number): (text: string) => string {
  if (diversity > 0.5) {
    return pc.green;
  }

  if (diversity > 0.3) {
    return pc.yellow;
  }

  return pc.red;
}

export function diversityBar(diversity: number, width: number): string {
  const filled = Math.round(diversity * width);
  const empty = width - filled;

  const color = diversityColor(diversity);

  return color('●'.repeat(filled)) + pc.dim('○'.repeat(empty));
}

/** Clean verse text and capitalize first letter */
export function cleanVerse(verse: string): string {
  const cleaned = verse
    .replaceAll(/[\r\n]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export interface FrameData {
  generation: number;
  maxGenerations: number;
  stats: {
    bestFitness: number;
    averageFitness: number;
    worstFitness: number;
    diversity: number;
  };
  bestHaiku: string[] | null;
  fitnessHistory: number[];
  avgHistory: number[];
  bookTitle: string;
  elapsedMs: number;
}

export function renderFrame(data: FrameData): string {
  const lines: string[] = [];

  // Title
  lines.push(boxTop());
  lines.push(boxLine(pc.cyan('        🧬 GENETIC ALGORITHM EVOLUTION 🧬')));
  lines.push(boxSep());

  // Book & Generation
  const bookStr =
    data.bookTitle.length > 30
      ? data.bookTitle.slice(0, 27) + '...'
      : data.bookTitle;
  lines.push(boxLine(pc.dim('Book: ') + pc.white(bookStr)));

  // Generation progress
  const genStr = `Gen ${pc.cyan(String(data.generation).padStart(3))}/${data.maxGenerations}`;
  const pbar = progressBar(data.generation, data.maxGenerations, 22);
  lines.push(boxLine(`${genStr}  ${pbar}`));

  // Elapsed time
  const elapsed = (data.elapsedMs / 1000).toFixed(1);
  lines.push(boxLine(pc.dim('Elapsed: ') + pc.yellow(elapsed + 's')));

  lines.push(boxSep());

  // Fitness stats
  const best = pc.green(data.stats.bestFitness.toFixed(2).padStart(7));
  const avg = pc.yellow(data.stats.averageFitness.toFixed(2).padStart(7));
  const worst = pc.red(data.stats.worstFitness.toFixed(2).padStart(7));
  lines.push(boxLine(`Best: ${best}  Avg: ${avg}  Worst: ${worst}`));

  // Diversity
  const divBar = diversityBar(data.stats.diversity, 14);
  const divPct = pc.cyan(
    (data.stats.diversity * 100).toFixed(0).padStart(3) + '%',
  );
  lines.push(boxLine(`Diversity: ${divBar} ${divPct}`));

  lines.push(boxSep());

  // Sparklines
  const sparkWidth = 42;
  lines.push(
    boxLine(`${pc.dim('Best:')} ${sparkline(data.fitnessHistory, sparkWidth)}`),
  );
  lines.push(
    boxLine(`${pc.dim('Avg: ')} ${sparkline(data.avgHistory, sparkWidth)}`),
  );

  // Haiku
  if (data.bestHaiku?.length === 3) {
    lines.push(boxSep());
    lines.push(boxLine(pc.cyan('Current Best Haiku:')));

    for (const verse of data.bestHaiku) {
      const cleaned = cleanVerse(verse);
      const display =
        cleaned.length > INNER_WIDTH - 4
          ? cleaned.slice(0, INNER_WIDTH - 7) + '...'
          : cleaned;
      lines.push(boxLine('  ' + pc.white(display)));
    }
  }

  lines.push(boxBottom());

  return lines.join('\n');
}

function finalChartGlyph(bNorm: number, aNorm: number, row: number): string {
  if (bNorm === row && aNorm === row) {
    return pc.cyan('◆');
  }

  if (bNorm === row) {
    return pc.green('●');
  }

  if (aNorm === row) {
    return pc.yellow('○');
  }

  if (bNorm > row && row >= aNorm) {
    return pc.dim('│');
  }

  return ' ';
}

function finalChartRowLabel(
  row: number,
  height: number,
  min: number,
  range: number,
  line: string,
): string {
  if (row === Math.floor(height / 2)) {
    return pc.dim(`  ${(min + range / 2).toFixed(1).padStart(6)} ┤`) + line;
  }

  if (row === 0) {
    return pc.dim(`  ${min.toFixed(1).padStart(6)} ┤`) + line;
  }

  return pc.dim('         │') + line;
}

export function drawFinalChart(
  history: {
    generation: number;
    bestFitness: number;
    averageFitness: number;
  }[],
): void {
  if (history.length === 0) {
    return;
  }

  const height = 10;
  const width = Math.min(50, history.length);

  const sampled =
    history.length > width
      ? history.filter(
          (_, i) =>
            i % Math.ceil(history.length / width) === 0 ||
            i === history.length - 1,
        )
      : history;

  const best = sampled.map((h) => h.bestFitness);
  const avg = sampled.map((h) => h.averageFitness);

  const min = Math.min(...best, ...avg, 0);
  const max = Math.max(...best, ...avg);
  const range = max - min || 1;

  console.log();
  console.log(pc.dim(`  ${max.toFixed(1).padStart(6)} ┤`));

  for (let row = height - 1; row >= 0; row--) {
    let line = '';

    for (let col = 0; col < sampled.length; col++) {
      const bNorm = Math.floor(((best[col] - min) / range) * height);
      const aNorm = Math.floor(((avg[col] - min) / range) * height);
      line += finalChartGlyph(bNorm, aNorm, row);
    }

    console.log(finalChartRowLabel(row, height, min, range, line));
  }

  console.log(pc.dim('         └' + '─'.repeat(sampled.length)));
  console.log(
    pc.dim(`         0`) +
      ' '.repeat(Math.max(0, sampled.length - 10)) +
      pc.dim(`Gen ${history.length - 1}`),
  );
  console.log();
  console.log(`  ${pc.green('●')} Best  ${pc.yellow('○')} Average`);
}

export function displayHaikuCandidate(
  haiku: DecodedHaiku,
  index: number,
  isBest: boolean,
): void {
  const marker = isBest ? pc.green(' ★ BEST') : '';
  const idx = isBest
    ? pc.green(pc.bold(`#${index + 1}`))
    : pc.dim(`#${index + 1}`);

  console.log(
    `\n  ${idx}${marker} ${pc.magenta(`[${haiku.fitness.toFixed(2)}]`)}`,
  );

  for (const verse of haiku.verses) {
    const cleaned = cleanVerse(verse);
    console.log(isBest ? pc.cyan(`    ${cleaned}`) : pc.dim(`    ${cleaned}`));
  }

  const m = haiku.metrics;
  console.log(
    pc.dim(
      `    nature:${m.natureWords} sent:${m.sentiment.toFixed(2)} gram:${m.grammar.toFixed(2)} markov:${m.markovFlow.toFixed(2)}`,
    ),
  );
}
