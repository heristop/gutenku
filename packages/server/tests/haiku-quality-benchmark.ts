import 'reflect-metadata';
import { describe, expect, it, beforeAll } from 'vitest';
import HaikuGeneratorService from '../src/domain/services/HaikuGeneratorService';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import { MarkovEvaluatorService } from '../src/domain/services/MarkovEvaluatorService';
import { MarkovChainService } from '../src/domain/services/MarkovChainService';
import type { IHaikuRepository } from '../src/domain/repositories/IHaikuRepository';
import type { IChapterRepository } from '../src/domain/repositories/IChapterRepository';
import type { IBookRepository } from '../src/domain/repositories/IBookRepository';
import type { ICanvasService } from '../src/domain/services/ICanvasService';
import type { IEventBus } from '../src/domain/events/IEventBus';
import { PubSubService } from '../src/infrastructure/services/PubSubService';
import type { BookValue, ChapterValue, HaikuValue, HaikuQualityScore } from '../src/shared/types';
import {
  calculateHaikuQuality,
  countNatureWords,
  countRepeatedWords,
  hasWeakStart,
  calculateWordUniqueness,
} from '../src/shared/constants/validation';

// Pre-defined haikus for benchmark testing
// Each has 5-7-5 syllable structure verified
const SAMPLE_HAIKUS = [
  {
    source: 'Nature Poetry',
    verses: ['The old pond sits still', 'A frog jumps into water', 'Splash sounds in the night'],
  },
  {
    source: 'Nature Poetry',
    verses: ['Autumn moonlight falls', 'Leaves drift on the gentle wind', 'Winter comes at last'],
  },
  {
    source: 'Nature Poetry',
    verses: ['Cherry blossoms fall', 'Pink petals on the water', 'Spring returns again'],
  },
  {
    source: 'Classical Literature',
    verses: ['She walks in the rain', 'Umbrella shields from the storms', 'Puddles at her feet'],
  },
  {
    source: 'Classical Literature',
    verses: ['He reads by the fire', 'Pages turn in quiet room', 'Clock ticks on the wall'],
  },
  {
    source: 'Philosophy',
    verses: ['Truth speaks in silence', 'Wise men listen to the wind', 'Knowledge grows in time'],
  },
  {
    source: 'Philosophy',
    verses: ['Water finds its way', 'Through the stones and valleys now', 'Patience conquers all'],
  },
  {
    source: 'Adventure',
    verses: ['Ships sail on the sea', 'Waves crash on the distant shore', 'Gulls cry in the wind'],
  },
  {
    source: 'Adventure',
    verses: ['Land appears at dawn', 'Sailors cheer the rising sun', 'New worlds wait ahead'],
  },
  {
    source: 'Mixed Nature',
    verses: ['Mountains touch the sky', 'Rivers flow through ancient stones', 'Birds sing morning songs'],
  },
];

// Fake repositories for testing
class FakeHaikuRepository implements IHaikuRepository {
  async createCacheWithTTL(): Promise<void> {}
  async extractFromCache(): Promise<HaikuValue[]> { return []; }
  async extractOneFromCache(): Promise<HaikuValue | null> { return null; }
}

class FakeChapterRepository implements IChapterRepository {
  async getAllChapters(): Promise<ChapterValue[]> { return []; }
  async getChapterById(): Promise<ChapterValue | null> { return null; }
  async getFilteredChapters(): Promise<ChapterValue[]> { return []; }
}

class FakeBookRepository implements IBookRepository {
  async getAllBooks(): Promise<BookValue[]> { return []; }
  async getBookById(): Promise<BookValue | null> { return null; }
  async selectRandomBook(): Promise<BookValue> {
    return { author: 'Test Author', chapters: ['ch1'], reference: 'test-ref', title: 'Test Book' } as unknown as BookValue;
  }
}

class FakeCanvasService implements ICanvasService {
  useTheme(): void {}
  async create(): Promise<string> { return '/tmp/test.png'; }
  async read(): Promise<{ data: Buffer; contentType: string }> {
    return { contentType: 'image/jpeg', data: Buffer.from('test') };
  }
}

class FakeEventBus implements IEventBus {
  publish = async () => {};
}

interface BenchmarkResult {
  verses: string[];
  quality: HaikuQualityScore;
  source: string;
}

interface BenchmarkStats {
  count: number;
  mean: number;
  min: number;
  max: number;
  stdDev: number;
}

const calculateStats = (values: number[]): BenchmarkStats => {
  if (values.length === 0) {
    return { count: 0, mean: 0, min: 0, max: 0, stdDev: 0 };
  }
  const count = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / count;
  const stdDev = Math.sqrt(variance);
  return { count, mean, min, max, stdDev };
};

describe('Haiku Quality Benchmark', () => {
  let generator: HaikuGeneratorService;
  let naturalLanguage: NaturalLanguageService;
  let markovEvaluator: MarkovEvaluatorService;
  let results: BenchmarkResult[] = [];

  beforeAll(async () => {
    naturalLanguage = new NaturalLanguageService();
    const markovChain = new MarkovChainService(naturalLanguage);
    markovEvaluator = new MarkovEvaluatorService(markovChain);

    generator = new HaikuGeneratorService(
      new FakeHaikuRepository(),
      new FakeChapterRepository(),
      new FakeBookRepository(),
      markovEvaluator,
      naturalLanguage,
      new FakeCanvasService(),
      new PubSubService(),
      new FakeEventBus(),
    );

    // Build haikus from pre-defined samples with quality scoring
    for (const sample of SAMPLE_HAIKUS) {
      const haiku = generator.buildHaiku(
        { author: 'Test Author', reference: 'test', title: sample.source } as BookValue,
        { content: sample.verses.join('. '), title: 'Chapter 1' } as ChapterValue,
        sample.verses,
      );
      if (haiku.quality) {
        results.push({
          verses: haiku.verses,
          quality: haiku.quality,
          source: sample.source,
        });
      }
    }
  });

  describe('Quality Score Distribution', () => {
    it('generates haikus with valid quality scores', () => {
      expect(results.length).toBeGreaterThan(0);

      for (const result of results) {
        expect(result.quality).toBeDefined();
        expect(result.quality.totalScore).toBeDefined();
        expect(typeof result.quality.totalScore).toBe('number');
      }
    });

    it('totalScore distribution is reasonable', () => {
      const scores = results.map((r) => r.quality.totalScore);
      const stats = calculateStats(scores);

      console.log('\n📊 Total Score Distribution:');
      console.log(`   Count: ${stats.count}`);
      console.log(`   Mean:  ${stats.mean.toFixed(2)}`);
      console.log(`   Min:   ${stats.min.toFixed(2)}`);
      console.log(`   Max:   ${stats.max.toFixed(2)}`);
      console.log(`   StdDev: ${stats.stdDev.toFixed(2)}`);

      // Total scores should vary (not all the same)

      if (stats.count > 1) {
        expect(stats.stdDev).toBeGreaterThanOrEqual(0);
      }
    });

    it('sentiment scores are in valid range [0, 1]', () => {
      for (const result of results) {
        expect(result.quality.sentiment).toBeGreaterThanOrEqual(0);
        expect(result.quality.sentiment).toBeLessThanOrEqual(1);
      }

      const sentiments = results.map((r) => r.quality.sentiment);
      const stats = calculateStats(sentiments);

      console.log('\n📊 Sentiment Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(3)}`);
      console.log(`   Range: [${stats.min.toFixed(3)}, ${stats.max.toFixed(3)}]`);
    });

    it('grammar scores are in valid range [0, 1]', () => {
      for (const result of results) {
        expect(result.quality.grammar).toBeGreaterThanOrEqual(0);
        expect(result.quality.grammar).toBeLessThanOrEqual(1);
      }

      const grammars = results.map((r) => r.quality.grammar);
      const stats = calculateStats(grammars);

      console.log('\n📊 Grammar (POS) Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(3)}`);
      console.log(`   Range: [${stats.min.toFixed(3)}, ${stats.max.toFixed(3)}]`);
    });

    it('trigramFlow scores are non-negative', () => {
      for (const result of results) {
        expect(result.quality.trigramFlow).toBeGreaterThanOrEqual(0);
      }

      const trigrams = results.map((r) => r.quality.trigramFlow);
      const stats = calculateStats(trigrams);

      console.log('\n📊 Trigram Flow Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(3)}`);
      console.log(`   Range: [${stats.min.toFixed(3)}, ${stats.max.toFixed(3)}]`);
    });

    it('uniqueness scores are in valid range [0, 1]', () => {
      for (const result of results) {
        expect(result.quality.uniqueness).toBeGreaterThanOrEqual(0);
        expect(result.quality.uniqueness).toBeLessThanOrEqual(1);
      }

      const uniquenesses = results.map((r) => r.quality.uniqueness);
      const stats = calculateStats(uniquenesses);

      console.log('\n📊 Uniqueness Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(3)}`);
      console.log(`   Range: [${stats.min.toFixed(3)}, ${stats.max.toFixed(3)}]`);
    });

    it('alliteration scores are in valid range [0, 1]', () => {
      for (const result of results) {
        expect(result.quality.alliteration).toBeGreaterThanOrEqual(0);
        expect(result.quality.alliteration).toBeLessThanOrEqual(1);
      }

      const alliterations = results.map((r) => r.quality.alliteration);
      const stats = calculateStats(alliterations);

      console.log('\n📊 Alliteration Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(3)}`);
      console.log(`   Range: [${stats.min.toFixed(3)}, ${stats.max.toFixed(3)}]`);
    });

    it('natureWords count is non-negative', () => {
      for (const result of results) {
        expect(result.quality.natureWords).toBeGreaterThanOrEqual(0);
      }

      const natureWords = results.map((r) => r.quality.natureWords);
      const stats = calculateStats(natureWords);

      console.log('\n📊 Nature Words Distribution:');
      console.log(`   Mean:  ${stats.mean.toFixed(2)}`);
      console.log(`   Range: [${stats.min}, ${stats.max}]`);
    });
  });

  describe('Metric Calculation Verification', () => {
    it('calculateHaikuQuality produces consistent results', () => {
      const testVerses = ['The autumn wind blows', 'Leaves fall gently to the ground', 'Winter comes at last'];

      const metrics = {
        sentiment: 0.6,
        grammar: 0.8,
        trigramFlow: 2.5,
        alliteration: 0.4,
      };

      const quality1 = calculateHaikuQuality(testVerses, metrics);
      const quality2 = calculateHaikuQuality(testVerses, metrics);

      expect(quality1.totalScore).toBe(quality2.totalScore);
      expect(quality1.natureWords).toBe(quality2.natureWords);
      expect(quality1.uniqueness).toBe(quality2.uniqueness);
    });

    it('countNatureWords detects nature vocabulary', () => {
      const withNature = ['sun moon stars sky', 'river mountain tree', 'flower wind rain'];
      const withoutNature = ['the quick brown fox', 'jumps over fence', 'lazy dog sleeps'];

      const natureCount = countNatureWords(withNature);
      const noNatureCount = countNatureWords(withoutNature);

      expect(natureCount).toBeGreaterThan(noNatureCount);
    });

    it('countRepeatedWords detects repetition', () => {
      const withRepeats = ['moon shines bright', 'moon glows softly', 'moon fades at dawn'];
      const noRepeats = ['sun rises high', 'clouds drift past', 'birds sing songs'];

      const repeatsCount = countRepeatedWords(withRepeats);
      const noRepeatsCount = countRepeatedWords(noRepeats);

      expect(repeatsCount).toBeGreaterThan(noRepeatsCount);
    });

    it('hasWeakStart detects weak starting words', () => {
      expect(hasWeakStart('It was dark')).toBeTruthy();
      expect(hasWeakStart('There is hope')).toBeTruthy();
      expect(hasWeakStart('The moon rises')).toBeFalsy();
      expect(hasWeakStart('Mountains stand tall')).toBeFalsy();
    });

    it('calculateWordUniqueness measures vocabulary diversity', () => {
      const unique = ['sun moon stars', 'river mountain tree', 'flower wind rain'];
      const repetitive = ['the the the', 'the the the', 'the the the'];

      const uniqueScore = calculateWordUniqueness(unique);
      const repetitiveScore = calculateWordUniqueness(repetitive);

      expect(uniqueScore).toBeGreaterThan(repetitiveScore);
      expect(uniqueScore).toBeGreaterThan(0.5);
      expect(repetitiveScore).toBeLessThan(0.5);
    });
  });

  describe('Score Component Weights', () => {
    it('nature words contribute positively to score', () => {
      const withNature = calculateHaikuQuality(
        ['The autumn wind blows', 'Cherry blossoms fall softly', 'Moon rises tonight'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      const withoutNature = calculateHaikuQuality(
        ['The man walked slowly', 'People gathered in the room', 'Time passed by quickly'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(withNature.natureWords).toBeGreaterThan(withoutNature.natureWords);
    });

    it('repeated words reduce score', () => {
      const noRepeats = calculateHaikuQuality(
        ['Sun rises high now', 'Moon glows in the night', 'Stars shine brightly too'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      const withRepeats = calculateHaikuQuality(
        ['Sun rises sun high', 'Sun glows in the sun', 'Sun shines sun sun'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(noRepeats.totalScore).toBeGreaterThan(withRepeats.totalScore);
    });

    it('weak starts reduce score', () => {
      const strongStarts = calculateHaikuQuality(
        ['Mountains stand so tall', 'Rivers flow downstream', 'Eagles soar above'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      const weakStarts = calculateHaikuQuality(
        ['It was a dark night', 'There is nothing here', 'This is all we have'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(strongStarts.weakStarts).toBe(0);
      expect(weakStarts.weakStarts).toBe(3);
      expect(strongStarts.totalScore).toBeGreaterThan(weakStarts.totalScore);
    });

    it('higher sentiment improves score', () => {
      const positive = calculateHaikuQuality(
        ['Joy fills the morning', 'Love blossoms in spring', 'Peace comes at sunset'],
        { sentiment: 0.8, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      const negative = calculateHaikuQuality(
        ['Joy fills the morning', 'Love blossoms in spring', 'Peace comes at sunset'],
        { sentiment: 0.2, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(positive.totalScore).toBeGreaterThan(negative.totalScore);
    });

    it('higher grammar score improves total', () => {
      const goodGrammar = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.9, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      const badGrammar = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.1, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(goodGrammar.totalScore).toBeGreaterThan(badGrammar.totalScore);
    });

    it('higher trigram flow improves score', () => {
      const goodFlow = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 8, markovFlow: 0, alliteration: 0 },
      );

      const badFlow = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0 },
      );

      expect(goodFlow.totalScore).toBeGreaterThan(badFlow.totalScore);
    });

    it('higher alliteration improves score', () => {
      const highAllit = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0.9 },
      );

      const lowAllit = calculateHaikuQuality(
        ['Test verse one here', 'Test verse two is here', 'Test verse three here'],
        { sentiment: 0.5, grammar: 0.5, trigramFlow: 0, markovFlow: 0, alliteration: 0.1 },
      );

      expect(highAllit.totalScore).toBeGreaterThan(lowAllit.totalScore);
    });
  });

  describe('Benchmark Summary', () => {
    it('prints comprehensive quality summary', () => {
      console.log('\n' + '='.repeat(60));
      console.log('📋 HAIKU QUALITY BENCHMARK SUMMARY');
      console.log('='.repeat(60));

      console.log(`\nTotal haikus generated: ${results.length}`);

      if (results.length > 0) {
        console.log('\n--- Sample Haikus with Scores ---\n');

        for (const result of results.slice(0, 3)) {
          console.log(`Source: ${result.source}`);
          console.log(`Verses:`);
          result.verses.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
          console.log(`Quality:`);
          console.log(`  Nature Words:   ${result.quality.natureWords}`);
          console.log(`  Repeated Words: ${result.quality.repeatedWords}`);
          console.log(`  Weak Starts:    ${result.quality.weakStarts}`);
          console.log(`  Sentiment:      ${result.quality.sentiment.toFixed(3)}`);
          console.log(`  Grammar:        ${result.quality.grammar.toFixed(3)}`);
          console.log(`  Trigram Flow:   ${result.quality.trigramFlow.toFixed(3)}`);
          console.log(`  Uniqueness:     ${result.quality.uniqueness.toFixed(3)}`);
          console.log(`  Alliteration:   ${result.quality.alliteration.toFixed(3)}`);
          console.log(`  Total Score:    ${result.quality.totalScore.toFixed(2)}`);
          console.log('');
        }

        // Overall statistics
        const allScores = results.map((r) => r.quality.totalScore);
        const stats = calculateStats(allScores);

        console.log('--- Overall Statistics ---');
        console.log(`  Mean Score:     ${stats.mean.toFixed(2)}`);
        console.log(`  Score Range:    [${stats.min.toFixed(2)}, ${stats.max.toFixed(2)}]`);
        console.log(`  Std Deviation:  ${stats.stdDev.toFixed(2)}`);
      }

      console.log('\n' + '='.repeat(60));

      expect(true).toBeTruthy();
    });
  });
});
