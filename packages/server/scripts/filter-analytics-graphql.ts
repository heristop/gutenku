#!/usr/bin/env node
/**
 * Filter Analytics Script (GraphQL-based)
 * Analyzes different filter threshold configurations via the GraphQL API
 * to find optimal balance between haiku quality and generation success rate.
 */
import dotenv from 'dotenv';
dotenv.config();

import pc from 'picocolors';
import fetch from 'node-fetch';

interface ScoreConfig {
  sentiment: number;
  markovChain: number;
  pos: number;
  trigram: number;
  phonetics: number;
  uniqueness: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
}

interface FilterConfig {
  name: string;
  score: ScoreConfig;
}

interface HaikuQuality {
  natureWords: number;
  repeatedWords: number;
  weakStarts: number;
  sentiment: number;
  grammar: number;
  trigramFlow: number;
  uniqueness: number;
  alliteration: number;
  verseDistance: number;
  lineLengthBalance: number;
  imageryDensity: number;
  semanticCoherence: number;
  verbPresence: number;
  totalScore: number;
}

interface HaikuResponse {
  data?: {
    haiku?: {
      verses: string[];
      executionTime: number;
      quality: HaikuQuality;
    };
  };
  errors?: Array<{ message: string }>;
}

interface AnalyticsResult {
  config: FilterConfig;
  iterations: number;
  successes: number;
  failures: number;
  successRate: number;
  avgExecutionTime: number;
  avgQuality: HaikuQuality;
  qualityScores: number[];
}

// Test configurations based on baseline averages:
// Verse Distance avg: 0.145, Line Balance avg: 0.849, Imagery avg: 0.017, Coherence avg: 0.023, Verb avg: 0.711
const FILTER_CONFIGS: FilterConfig[] = [
  // No filters - baseline
  {
    name: 'No Filters',
    score: {
      sentiment: 0, markovChain: 0, pos: 0, trigram: 0, phonetics: 0, uniqueness: 0,
      verseDistance: 0, lineLengthBalance: 0, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0,
    },
  },
  // Original defaults only (no new KPIs)
  {
    name: 'Original Defaults Only',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0, lineLengthBalance: 0, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0,
    },
  },
  // Minimal new KPIs (very lenient)
  {
    name: 'Minimal New KPIs',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0.05, lineLengthBalance: 0.5, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0.3,
    },
  },
  // Light new KPIs
  {
    name: 'Light New KPIs',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0.1, lineLengthBalance: 0.6, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0.4,
    },
  },
  // Moderate new KPIs
  {
    name: 'Moderate New KPIs',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0.15, lineLengthBalance: 0.7, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0.5,
    },
  },
  // Balance + Line focus
  {
    name: 'Line Balance Focus',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0, lineLengthBalance: 0.75, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0,
    },
  },
  // Verb presence focus
  {
    name: 'Verb Presence Focus',
    score: {
      sentiment: 0.5, markovChain: 0.1, pos: 0.3, trigram: 0.5, phonetics: 0.2, uniqueness: 0.6,
      verseDistance: 0, lineLengthBalance: 0, imageryDensity: 0, semanticCoherence: 0, verbPresence: 0.5,
    },
  },
];

const SERVER_URL = process.env.SERVER_URI || 'http://localhost:4000/graphql';

async function fetchHaiku(config: ScoreConfig): Promise<HaikuResponse> {
  const query = `
    query Haiku(
      $sentimentMinScore: Float,
      $markovMinScore: Float,
      $posMinScore: Float,
      $trigramMinScore: Float,
      $phoneticsMinScore: Float,
      $uniquenessMinScore: Float,
      $verseDistanceMinScore: Float,
      $lineLengthBalanceMinScore: Float,
      $imageryDensityMinScore: Float,
      $semanticCoherenceMinScore: Float,
      $verbPresenceMinScore: Float
    ) {
      haiku(
        useAI: false,
        useCache: false,
        appendImg: false,
        sentimentMinScore: $sentimentMinScore,
        markovMinScore: $markovMinScore,
        posMinScore: $posMinScore,
        trigramMinScore: $trigramMinScore,
        phoneticsMinScore: $phoneticsMinScore,
        uniquenessMinScore: $uniquenessMinScore,
        verseDistanceMinScore: $verseDistanceMinScore,
        lineLengthBalanceMinScore: $lineLengthBalanceMinScore,
        imageryDensityMinScore: $imageryDensityMinScore,
        semanticCoherenceMinScore: $semanticCoherenceMinScore,
        verbPresenceMinScore: $verbPresenceMinScore
      ) {
        verses
        executionTime
        quality {
          natureWords
          repeatedWords
          weakStarts
          sentiment
          grammar
          trigramFlow
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

  const response = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        sentimentMinScore: config.sentiment,
        markovMinScore: config.markovChain,
        posMinScore: config.pos,
        trigramMinScore: config.trigram,
        phoneticsMinScore: config.phonetics,
        uniquenessMinScore: config.uniqueness,
        verseDistanceMinScore: config.verseDistance,
        lineLengthBalanceMinScore: config.lineLengthBalance,
        imageryDensityMinScore: config.imageryDensity,
        semanticCoherenceMinScore: config.semanticCoherence,
        verbPresenceMinScore: config.verbPresence,
      },
    }),
  });

  return response.json() as Promise<HaikuResponse>;
}

async function runAnalytics(iterations: number): Promise<void> {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  HAIKU FILTER ANALYTICS (GraphQL)')));
  console.log(pc.bold('='.repeat(70)));
  console.log(`\nServer: ${pc.dim(SERVER_URL)}`);
  console.log(`Running ${iterations} iterations per configuration...\n`);

  const results: AnalyticsResult[] = [];

  for (const config of FILTER_CONFIGS) {
    console.log(pc.bold(`\nTesting: ${pc.yellow(config.name)}`));
    console.log('-'.repeat(50));

    let successes = 0;
    let failures = 0;
    let totalExecutionTime = 0;
    const qualityScores: number[] = [];
    const qualityAggregates: HaikuQuality = {
      natureWords: 0,
      repeatedWords: 0,
      weakStarts: 0,
      sentiment: 0,
      grammar: 0,
      trigramFlow: 0,
      uniqueness: 0,
      alliteration: 0,
      verseDistance: 0,
      lineLengthBalance: 0,
      imageryDensity: 0,
      semanticCoherence: 0,
      verbPresence: 0,
      totalScore: 0,
    };

    for (let i = 0; i < iterations; i++) {
      process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);

      try {
        const response = await fetchHaiku(config.score);
        const haiku = response.data?.haiku;

        if (haiku && haiku.quality) {
          successes++;
          totalExecutionTime += haiku.executionTime;
          qualityScores.push(haiku.quality.totalScore);

          qualityAggregates.natureWords += haiku.quality.natureWords;
          qualityAggregates.repeatedWords += haiku.quality.repeatedWords;
          qualityAggregates.weakStarts += haiku.quality.weakStarts;
          qualityAggregates.sentiment += haiku.quality.sentiment;
          qualityAggregates.grammar += haiku.quality.grammar;
          qualityAggregates.trigramFlow += haiku.quality.trigramFlow;
          qualityAggregates.uniqueness += haiku.quality.uniqueness;
          qualityAggregates.alliteration += haiku.quality.alliteration;
          qualityAggregates.verseDistance += haiku.quality.verseDistance;
          qualityAggregates.lineLengthBalance += haiku.quality.lineLengthBalance;
          qualityAggregates.imageryDensity += haiku.quality.imageryDensity;
          qualityAggregates.semanticCoherence += haiku.quality.semanticCoherence;
          qualityAggregates.verbPresence += haiku.quality.verbPresence;
          qualityAggregates.totalScore += haiku.quality.totalScore;
        } else {
          failures++;
        }
      } catch {
        failures++;
      }
    }

    const successRate = (successes / iterations) * 100;
    const avgQuality: HaikuQuality = successes > 0 ? {
      natureWords: qualityAggregates.natureWords / successes,
      repeatedWords: qualityAggregates.repeatedWords / successes,
      weakStarts: qualityAggregates.weakStarts / successes,
      sentiment: qualityAggregates.sentiment / successes,
      grammar: qualityAggregates.grammar / successes,
      trigramFlow: qualityAggregates.trigramFlow / successes,
      uniqueness: qualityAggregates.uniqueness / successes,
      alliteration: qualityAggregates.alliteration / successes,
      verseDistance: qualityAggregates.verseDistance / successes,
      lineLengthBalance: qualityAggregates.lineLengthBalance / successes,
      imageryDensity: qualityAggregates.imageryDensity / successes,
      semanticCoherence: qualityAggregates.semanticCoherence / successes,
      verbPresence: qualityAggregates.verbPresence / successes,
      totalScore: qualityAggregates.totalScore / successes,
    } : {
      natureWords: 0, repeatedWords: 0, weakStarts: 0, sentiment: 0,
      grammar: 0, trigramFlow: 0, uniqueness: 0, alliteration: 0,
      verseDistance: 0, lineLengthBalance: 0, imageryDensity: 0,
      semanticCoherence: 0, verbPresence: 0, totalScore: 0,
    };

    results.push({
      config,
      iterations,
      successes,
      failures,
      successRate,
      avgExecutionTime: successes > 0 ? totalExecutionTime / successes : 0,
      avgQuality,
      qualityScores,
    });

    const getSuccessColor = (): typeof pc.green => {
      if (successRate >= 80) {
        return pc.green;
      }

      if (successRate >= 50) {
        return pc.yellow;
      }
      return pc.red;
    };
    const successColor = getSuccessColor();
    console.log(`\n  Success: ${successColor(successRate.toFixed(1) + '%')} | Quality: ${pc.cyan(avgQuality.totalScore.toFixed(2))} | Avg Time: ${avgQuality.totalScore > 0 ? (totalExecutionTime / successes).toFixed(3) + 's' : 'N/A'}`);
  }

  printDetailedResults(results);
  findOptimalConfig(results);
}

function printDetailedResults(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  DETAILED RESULTS')));
  console.log(pc.bold('='.repeat(70)));

  for (const result of results) {
    console.log(pc.bold(`\n${result.config.name}`));
    console.log('-'.repeat(50));

    console.log(pc.dim('Success Metrics:'));
    console.log(`  Rate: ${formatPercent(result.successRate)} (${result.successes}/${result.iterations})`);
    console.log(`  Avg Execution: ${result.avgExecutionTime.toFixed(3)}s`);

    console.log(pc.dim('\nQuality Metrics:'));
    console.log(`  Total Score:    ${pc.cyan(result.avgQuality.totalScore.toFixed(2))}`);
    console.log(`  Nature Words:   ${result.avgQuality.natureWords.toFixed(2)}`);
    console.log(`  Repeated:       ${result.avgQuality.repeatedWords.toFixed(2)}`);
    console.log(`  Weak Starts:    ${result.avgQuality.weakStarts.toFixed(2)}`);
    console.log(`  Sentiment:      ${result.avgQuality.sentiment.toFixed(3)}`);
    console.log(`  Grammar:        ${result.avgQuality.grammar.toFixed(3)}`);
    console.log(`  Trigram Flow:   ${result.avgQuality.trigramFlow.toFixed(3)}`);
    console.log(`  Uniqueness:     ${result.avgQuality.uniqueness.toFixed(3)}`);
    console.log(`  Alliteration:   ${result.avgQuality.alliteration.toFixed(3)}`);
    console.log(pc.dim('\nNew KPIs:'));
    console.log(`  Verse Distance: ${pc.magenta(result.avgQuality.verseDistance.toFixed(3))}`);
    console.log(`  Line Balance:   ${result.avgQuality.lineLengthBalance.toFixed(3)}`);
    console.log(`  Imagery:        ${result.avgQuality.imageryDensity.toFixed(3)}`);
    console.log(`  Coherence:      ${result.avgQuality.semanticCoherence.toFixed(3)}`);
    console.log(`  Verb Presence:  ${result.avgQuality.verbPresence.toFixed(3)}`);

    if (result.qualityScores.length > 0) {
      const sorted = [...result.qualityScores].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted.at(-1);
      const median = sorted[Math.floor(sorted.length / 2)];
      console.log(pc.dim('\nScore Distribution:'));
      console.log(`  Min: ${min.toFixed(2)} | Median: ${median.toFixed(2)} | Max: ${max.toFixed(2)}`);
    }

    console.log(pc.dim('\nFilter Settings:'));
    const s = result.config.score;
    console.log(`  sentiment=${s.sentiment}, markov=${s.markovChain}, pos=${s.pos}`);
    console.log(`  trigram=${s.trigram}, phonetics=${s.phonetics}, uniqueness=${s.uniqueness}`);
    console.log(`  verseDistance=${s.verseDistance}, lineBalance=${s.lineLengthBalance}, imagery=${s.imageryDensity}`);
    console.log(`  coherence=${s.semanticCoherence}, verbPresence=${s.verbPresence}`);
  }
}

function findOptimalConfig(results: AnalyticsResult[]): void {
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.cyan('  OPTIMAL CONFIGURATION ANALYSIS')));
  console.log(pc.bold('='.repeat(70)));

  // Composite score: 40% success, 60% quality
  const scored = results.map(r => ({
    result: r,
    composite: (r.successRate / 100) * 0.4 + Math.min(1, r.avgQuality.totalScore / 15) * 0.6,
  })).sort((a, b) => b.composite - a.composite);

  console.log('\nRanking (40% success + 60% quality):');
  console.log('-'.repeat(50));

  scored.forEach((s, i) => {
    const medal = '  ';
    const rank = `#${i + 1}`;
    console.log(`${medal}${rank}: ${pc.bold(s.result.config.name)}`);
    console.log(`     Score: ${pc.cyan(s.composite.toFixed(3))} | Success: ${formatPercent(s.result.successRate)} | Quality: ${s.result.avgQuality.totalScore.toFixed(2)}`);
  });

  // Best overall
  const best = scored[0];
  console.log(pc.bold('\n' + '='.repeat(70)));
  console.log(pc.bold(pc.green('  RECOMMENDED DEFAULTS')));
  console.log(pc.bold('='.repeat(70)));
  console.log(`\nBest configuration: ${pc.bold(best.result.config.name)}`);
  console.log(`  Success Rate: ${formatPercent(best.result.successRate)}`);
  console.log(`  Avg Quality:  ${best.result.avgQuality.totalScore.toFixed(2)}`);

  const s = best.result.config.score;
  console.log(pc.cyan(`
  // Original filters
  DEFAULT_SENTIMENT_MIN_SCORE = ${s.sentiment};
  DEFAULT_MARKOV_MIN_SCORE = ${s.markovChain};
  DEFAULT_GRAMMAR_MIN_SCORE = ${s.pos};
  DEFAULT_TRIGRAM_MIN_SCORE = ${s.trigram};
  DEFAULT_UNIQUENESS_MIN_SCORE = ${s.uniqueness};
  DEFAULT_ALLITERATION_MIN_SCORE = ${s.phonetics};

  // New KPI filters
  DEFAULT_VERSE_DISTANCE_MIN_SCORE = ${s.verseDistance};
  DEFAULT_LINE_BALANCE_MIN_SCORE = ${s.lineLengthBalance};
  DEFAULT_IMAGERY_MIN_SCORE = ${s.imageryDensity};
  DEFAULT_COHERENCE_MIN_SCORE = ${s.semanticCoherence};
  DEFAULT_VERB_MIN_SCORE = ${s.verbPresence};
`));
}

function formatPercent(value: number): string {
  if (value >= 80) {
    return pc.green(value.toFixed(1) + '%');
  }

  if (value >= 50) {
    return pc.yellow(value.toFixed(1) + '%');
  }
  return pc.red(value.toFixed(1) + '%');
}

// Parse args
const args = process.argv.slice(2);
const iterations = args.includes('--iterations')
  ? Number.parseInt(args[args.indexOf('--iterations') + 1], 10)
  : 25;

runAnalytics(iterations).catch(error => {
  console.error(pc.red('Fatal error:'), error);
  process.exit(1);
});
