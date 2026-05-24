import pc from 'picocolors';
import { syllable } from 'syllable';
import type NaturalLanguageService from '~/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '~/domain/services/MarkovEvaluatorService';
import type { VersePools, VerseCandidate } from '~/domain/services/genetic';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
} from '~/shared/constants/validation';

export interface BenchmarkResult {
  method: 'ga' | 'random';
  iteration: number;
  book: string;
  bestScore: number;
  avgTop5Score: number;
  metrics: {
    natureWords: number;
    sentiment: number;
    grammar: number;
    markovFlow: number;
    uniqueness: number;
    alliteration: number;
  };
  timeMs: number;
  searchSpace: number;
}

export interface AggregatedStats {
  method: 'ga' | 'random';
  avgBestScore: number;
  avgTop5Score: number;
  minBestScore: number;
  maxBestScore: number;
  stdDevBestScore: number;
  avgTimeMs: number;
  avgMetrics: {
    natureWords: number;
    sentiment: number;
    grammar: number;
    markovFlow: number;
    uniqueness: number;
    alliteration: number;
  };
}

// Extract verse pools from chapter content
export function extractVersePoolsFromContent(
  content: string,
  bookId: string,
  chapterId: string,
  naturalLanguage: NaturalLanguageService,
): VersePools {
  const sentences = naturalLanguage.extractSentencesByPunctuation(content);

  const fiveSyllable: VerseCandidate[] = [];
  const sevenSyllable: VerseCandidate[] = [];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = naturalLanguage.extractWords(sentence);

    if (!words) {
      continue;
    }

    const syllableCount = words.reduce((c, w) => c + syllable(w), 0);

    if (syllableCount === 5) {
      fiveSyllable.push({ text: sentence, syllableCount: 5, sourceIndex: i });
      continue;
    }

    if (syllableCount === 7) {
      sevenSyllable.push({ text: sentence, syllableCount: 7, sourceIndex: i });
    }
  }

  return {
    fiveSyllable,
    sevenSyllable,
    bookId,
    chapterId,
  };
}

// Random sampling (simulate current behavior)
export function randomSampling(
  versePools: VersePools,
  naturalLanguage: NaturalLanguageService,
  markovEvaluator: MarkovEvaluatorService,
  count: number = 50,
): { verses: string[]; score: number; metrics: HaikuQualityScore }[] {
  const results: {
    verses: string[];
    score: number;
    metrics: HaikuQualityScore;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const verse1Idx = Math.floor(
      Math.random() * versePools.fiveSyllable.length,
    );
    const verse2Idx = Math.floor(
      Math.random() * versePools.sevenSyllable.length,
    );
    let verse3Idx = Math.floor(Math.random() * versePools.fiveSyllable.length);

    // Avoid same verse for 1 and 3
    while (verse3Idx === verse1Idx && versePools.fiveSyllable.length > 1) {
      verse3Idx = Math.floor(Math.random() * versePools.fiveSyllable.length);
    }

    const verses = [
      versePools.fiveSyllable[verse1Idx].text,
      versePools.sevenSyllable[verse2Idx].text,
      versePools.fiveSyllable[verse3Idx].text,
    ];

    // Calculate metrics
    const sentiment = naturalLanguage.analyzeSentiment(verses.join(' '));
    const grammar = naturalLanguage.analyzeGrammar(verses.join(' '));
    const phonetics = naturalLanguage.analyzePhonetics(verses);
    const markovFlow = markovEvaluator.evaluateHaiku(verses);
    const trigramFlow = markovEvaluator.evaluateHaikuTrigrams(verses);

    const quality = calculateHaikuQuality(verses, {
      sentiment,
      grammar: grammar.score,
      trigramFlow,
      markovFlow,
      alliteration: phonetics.alliterationScore,
      verseIndices: [verse1Idx, verse2Idx, verse3Idx],
      totalQuotes:
        versePools.fiveSyllable.length + versePools.sevenSyllable.length,
    });

    results.push({
      verses,
      score: quality.totalScore,
      metrics: quality,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

  return Math.sqrt(variance);
}

export function aggregateResults(results: BenchmarkResult[]): AggregatedStats {
  const bestScores = results.map((r) => r.bestScore);
  const avgTop5Scores = results.map((r) => r.avgTop5Score);
  const times = results.map((r) => r.timeMs);

  return {
    method: results[0].method,
    avgBestScore: bestScores.reduce((a, b) => a + b, 0) / bestScores.length,
    avgTop5Score:
      avgTop5Scores.reduce((a, b) => a + b, 0) / avgTop5Scores.length,
    minBestScore: Math.min(...bestScores),
    maxBestScore: Math.max(...bestScores),
    stdDevBestScore: calculateStdDev(bestScores),
    avgTimeMs: times.reduce((a, b) => a + b, 0) / times.length,
    avgMetrics: {
      natureWords:
        results.reduce((sum, r) => sum + r.metrics.natureWords, 0) /
        results.length,
      sentiment:
        results.reduce((sum, r) => sum + r.metrics.sentiment, 0) /
        results.length,
      grammar:
        results.reduce((sum, r) => sum + r.metrics.grammar, 0) / results.length,
      markovFlow:
        results.reduce((sum, r) => sum + r.metrics.markovFlow, 0) /
        results.length,
      uniqueness:
        results.reduce((sum, r) => sum + r.metrics.uniqueness, 0) /
        results.length,
      alliteration:
        results.reduce((sum, r) => sum + r.metrics.alliteration, 0) /
        results.length,
    },
  };
}

function chartGlyph(gaNorm: number, randomNorm: number, row: number): string {
  if (gaNorm === row && randomNorm === row) {
    return pc.cyan('◆');
  }

  if (gaNorm === row) {
    return pc.green('●');
  }

  if (randomNorm === row) {
    return pc.yellow('○');
  }

  return ' ';
}

function chartAxisLabel(
  row: number,
  chartHeight: number,
  minVal: number,
  range: number,
  line: string,
): string {
  if (row === chartHeight - 1) {
    return pc.dim('         │') + line;
  }

  if (row === Math.floor(chartHeight / 2)) {
    const midVal = minVal + range / 2;

    return pc.dim(`  ${midVal.toFixed(1).padStart(6)} ┤`) + line;
  }

  if (row === 0) {
    return pc.dim(`  ${minVal.toFixed(1).padStart(6)} ┤`) + line;
  }

  return pc.dim('         │') + line;
}

export function drawComparisonChart(
  gaResults: BenchmarkResult[],
  randomResults: BenchmarkResult[],
  iterations: number,
): void {
  const chartHeight = 15;
  const chartWidth = Math.min(40, iterations);

  const gaBest = gaResults.map((r) => r.bestScore);
  const randomBest = randomResults.map((r) => r.bestScore);

  const allValues = [...gaBest, ...randomBest];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  console.log(pc.bold('\n═══ Score Distribution Chart ═══\n'));
  console.log(pc.dim(`  ${maxVal.toFixed(1).padStart(6)} ┤`));

  for (let row = chartHeight - 1; row >= 0; row--) {
    let line = '';

    for (let col = 0; col < Math.min(chartWidth, iterations); col++) {
      const gaVal = gaBest[col] ?? 0;
      const randomVal = randomBest[col] ?? 0;

      const gaNorm = Math.floor(((gaVal - minVal) / range) * chartHeight);
      const randomNorm = Math.floor(
        ((randomVal - minVal) / range) * chartHeight,
      );

      line += chartGlyph(gaNorm, randomNorm, row);
    }

    console.log(chartAxisLabel(row, chartHeight, minVal, range, line));
  }

  const xAxis = '─'.repeat(chartWidth);
  console.log(pc.dim('         └') + pc.dim(xAxis));
  console.log(
    pc.dim(`         1`) +
      ' '.repeat(Math.max(0, chartWidth - 10)) +
      pc.dim(`Iter ${iterations}`),
  );

  console.log();
  console.log(
    `  ${pc.green('●')} GA best score  ${pc.yellow('○')} Random best score`,
  );
}

export function printMetricsTable(
  gaStats: AggregatedStats,
  randomStats: AggregatedStats,
): void {
  console.log(pc.bold('\n═══ Detailed Metrics Comparison ═══\n'));

  const metrics = [
    {
      name: 'Nature Words',
      ga: gaStats.avgMetrics.natureWords,
      random: randomStats.avgMetrics.natureWords,
    },
    {
      name: 'Sentiment',
      ga: gaStats.avgMetrics.sentiment,
      random: randomStats.avgMetrics.sentiment,
    },
    {
      name: 'Grammar',
      ga: gaStats.avgMetrics.grammar,
      random: randomStats.avgMetrics.grammar,
    },
    {
      name: 'Markov Flow',
      ga: gaStats.avgMetrics.markovFlow,
      random: randomStats.avgMetrics.markovFlow,
    },
    {
      name: 'Uniqueness',
      ga: gaStats.avgMetrics.uniqueness,
      random: randomStats.avgMetrics.uniqueness,
    },
    {
      name: 'Alliteration',
      ga: gaStats.avgMetrics.alliteration,
      random: randomStats.avgMetrics.alliteration,
    },
  ];

  console.log(
    pc.dim('  ┌──────────────────┬──────────┬──────────┬────────────┐'),
  );
  console.log(
    pc.dim('  │ ') +
      pc.bold('Metric'.padEnd(16)) +
      pc.dim(' │ ') +
      pc.bold('GA'.padStart(8)) +
      pc.dim(' │ ') +
      pc.bold('Random'.padStart(8)) +
      pc.dim(' │ ') +
      pc.bold('Improve'.padStart(10)) +
      pc.dim(' │'),
  );
  console.log(
    pc.dim('  ├──────────────────┼──────────┼──────────┼────────────┤'),
  );

  for (const metric of metrics) {
    const improvement =
      metric.random !== 0
        ? ((metric.ga - metric.random) / Math.abs(metric.random)) * 100
        : 0;
    const improvementStr =
      improvement >= 0
        ? pc.green('+' + improvement.toFixed(1) + '%')
        : pc.red(improvement.toFixed(1) + '%');

    console.log(
      pc.dim('  │ ') +
        metric.name.padEnd(16) +
        pc.dim(' │ ') +
        pc.cyan(metric.ga.toFixed(3).padStart(8)) +
        pc.dim(' │ ') +
        pc.yellow(metric.random.toFixed(3).padStart(8)) +
        pc.dim(' │ ') +
        improvementStr.padStart(19) +
        pc.dim(' │'),
    );
  }

  console.log(
    pc.dim('  └──────────────────┴──────────┴──────────┴────────────┘'),
  );
}
