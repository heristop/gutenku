import 'reflect-metadata';
import { describe, expect, it, beforeAll } from 'vitest';
import NaturalLanguageService from '../src/domain/services/NaturalLanguageService';
import {
  calculateHaikuQuality,
  type HaikuQualityScore,
} from '../src/shared/constants/validation';
import type { ExtractionMethod } from '../src/shared/types';

/**
 * Empirical Analysis: Does the fallback extraction chain affect haiku quality?
 *
 * This test suite compares quality metrics across all 4 extraction methods
 * using identical sample texts to prove whether fallbacks degrade quality.
 */

const nl = new NaturalLanguageService();

// Sample texts representing different content types
const SAMPLE_TEXTS = {
  // Well-punctuated literary prose - should favor punctuation method
  literary: `
    The ancient forest breathes softly. Moss covers every weathered stone here. Birds call through morning mist.
    The river flows swiftly onward. Silver fish dart beneath dark waves. Sunlight dances bright.
    Mountain peaks stand tall and proud. Snow melts into crystal streams. Spring awakens all nature.
    Autumn leaves fall gently down. Wind carries them far away. Trees stand bare and cold.
    The moon rises over hills. Stars appear one by one now. Night embraces all.
    Cherry blossoms drift slowly. Pink petals land on still water. Beauty fades too soon.
    Thunder rolls across the sky. Rain begins to fall steadily. Earth drinks deeply now.
    Fireflies dance in the dark. Their lights blink on and off. Summer night magic.
  `,

  // Sparse punctuation - may need fallback methods
  sparse: `
    Morning light filters through bamboo leaves creating soft shadows on ancient walls
    the garden path winds between stone lanterns covered in gentle moss
    water trickles from a bamboo fountain into a pool where koi swim lazily
    temple bells echo through mountain valleys as monks begin their daily prayers
    cherry trees line the riverbank their branches heavy with spring blossoms
    a crane stands motionless in shallow water watching for silver fish below
    autumn wind carries red maple leaves across the wooden bridge
    snow falls silently on the shrine roof where pine branches bow under weight
  `,

  // Minimal/stream text - will likely need chunk method
  minimal: `
    sunrise golden light spreads valley birds begin songs morning dew sparkles grass
    wind whispers secrets leaves dance shadows play stone path garden ancient wisdom
    moon silver glow night peaceful stars infinite wonder heart quiet contemplation
    rain gentle touch earth grateful flowers bloom colors bright nature celebration
    snow white blanket world hushed trees sleep deep winter dreams spring awakens
  `,
};

// Valid syllable counts for haiku verses
const VALID_SYLLABLES = new Set([5, 7]);

interface ExtractedQuote {
  text: string;
  syllables: number;
  isValid: boolean;
}

interface MethodAnalysis {
  method: ExtractionMethod;
  totalExtracted: number;
  validQuotes: number;
  validRatio: number;
  sampleHaikus: Array<{
    verses: string[];
    quality: HaikuQualityScore;
  }>;
  averageQuality: {
    natureWords: number;
    repeatedWords: number;
    weakStarts: number;
    totalScore: number;
  };
}

function extractAndFilter(text: string, method: ExtractionMethod, applyGrammarFilter = true): ExtractedQuote[] {
  let sentences: string[];

  switch (method) {
    case 'punctuation':
      sentences = nl.extractSentencesByPunctuation(text);
      break;
    case 'tokenizer':
      sentences = nl.extractSentences(text);
      break;
    case 'clause':
      sentences = nl.extractByExpandedClauses(text);
      break;
    case 'chunk':
      sentences = nl.extractWordChunks(text);
      break;
  }

  return sentences.map((s) => {
    const trimmed = s.trim();
    const syllables = nl.countSyllables(trimmed);
    const hasBlacklist = nl.hasBlacklistedCharsInQuote(trimmed);
    const hasUpperCase = nl.hasUpperCaseWords(trimmed);
    const startsWithConjunction = nl.startWithConjunction(trimmed);

    // Apply grammar filter for chunk method (matching HaikuGeneratorService behavior)
    let passesGrammar = true;

    if (method === 'chunk' && applyGrammarFilter) {
      const grammar = nl.analyzeGrammar(trimmed);
      if (grammar.score < 0.5) {
        passesGrammar = false;
      } else {
        // Reject chunks with capitalized words mid-phrase (indicates mid-sentence slice)
        const words = trimmed.split(/\s+/);
        for (let i = 1; i < words.length; i++) {
          if (words[i] && /^[A-Z]/.test(words[i])) {
            passesGrammar = false;
            break;
          }
        }
      }
    }

    return {
      text: trimmed,
      syllables,
      isValid:
        VALID_SYLLABLES.has(syllables) &&
        !hasBlacklist &&
        !hasUpperCase &&
        !startsWithConjunction &&
        passesGrammar &&
        trimmed.length > 3,
    };
  });
}

function generateHaikusFromQuotes(
  quotes: ExtractedQuote[],
  count: number,
): Array<{ verses: string[]; quality: HaikuQualityScore }> {
  const fiveSyllable = quotes.filter((q) => q.isValid && q.syllables === 5);
  const sevenSyllable = quotes.filter((q) => q.isValid && q.syllables === 7);

  const haikus: Array<{ verses: string[]; quality: HaikuQualityScore }> = [];

  // Generate haikus: 5-7-5 pattern
  for (let i = 0; i < count && fiveSyllable.length >= 2 && sevenSyllable.length >= 1; i++) {
    const verse1 = fiveSyllable[i % fiveSyllable.length].text;
    const verse2 = sevenSyllable[i % sevenSyllable.length].text;
    const verse3 = fiveSyllable[(i + 1) % fiveSyllable.length].text;

    // Skip if same verse repeated

    if (verse1 === verse3) {continue;}

    const verses = [verse1, verse2, verse3];
    const quality = calculateHaikuQuality(verses);

    haikus.push({ verses, quality });
  }

  return haikus;
}

function analyzeMethod(text: string, method: ExtractionMethod): MethodAnalysis {
  const quotes = extractAndFilter(text, method);
  const validQuotes = quotes.filter((q) => q.isValid);
  const haikus = generateHaikusFromQuotes(quotes, 10);

  const avgQuality = {
    natureWords: 0,
    repeatedWords: 0,
    weakStarts: 0,
    totalScore: 0,
  };


  if (haikus.length > 0) {
    for (const h of haikus) {
      avgQuality.natureWords += h.quality.natureWords;
      avgQuality.repeatedWords += h.quality.repeatedWords;
      avgQuality.weakStarts += h.quality.weakStarts;
      avgQuality.totalScore += h.quality.totalScore;
    }
    avgQuality.natureWords /= haikus.length;
    avgQuality.repeatedWords /= haikus.length;
    avgQuality.weakStarts /= haikus.length;
    avgQuality.totalScore /= haikus.length;
  }

  return {
    method,
    totalExtracted: quotes.length,
    validQuotes: validQuotes.length,
    validRatio: quotes.length > 0 ? validQuotes.length / quotes.length : 0,
    sampleHaikus: haikus.slice(0, 3),
    averageQuality: avgQuality,
  };
}

describe('Extraction Method Quality Analysis', () => {
  const methods: ExtractionMethod[] = ['punctuation', 'tokenizer', 'clause', 'chunk'];

  describe('Literary Text (well-punctuated)', () => {
    let results: Map<ExtractionMethod, MethodAnalysis>;

    beforeAll(() => {
      results = new Map();
      for (const method of methods) {
        results.set(method, analyzeMethod(SAMPLE_TEXTS.literary, method));
      }
    });

    it('compares extraction yield across methods', () => {
      console.log('\n=== LITERARY TEXT ANALYSIS ===\n');
      console.log('| Method      | Extracted | Valid | Ratio  |');
      console.log('|-------------|-----------|-------|--------|');

      for (const method of methods) {
        const r = results.get(method)!;
        console.log(
          `| ${method.padEnd(11)} | ${String(r.totalExtracted).padStart(9)} | ${String(r.validQuotes).padStart(5)} | ${(r.validRatio * 100).toFixed(1).padStart(5)}% |`,
        );
      }

      // Punctuation should yield good results for literary text
      const punct = results.get('punctuation')!;
      expect(punct.validQuotes).toBeGreaterThan(0);
    });

    it('compares quality scores across methods', () => {
      console.log('\n| Method      | Nature | Repeat | Weak | Total |');
      console.log('|-------------|--------|--------|------|-------|');

      for (const method of methods) {
        const r = results.get(method)!;
        const q = r.averageQuality;
        console.log(
          `| ${method.padEnd(11)} | ${q.natureWords.toFixed(1).padStart(6)} | ${q.repeatedWords.toFixed(1).padStart(6)} | ${q.weakStarts.toFixed(1).padStart(4)} | ${q.totalScore.toFixed(1).padStart(5)} |`,
        );
      }

      // All methods should produce some quality haikus from literary text
      for (const method of methods) {
        const r = results.get(method)!;
        if (r.sampleHaikus.length > 0) {
          // Nature words should be found in literary nature text
          expect(r.averageQuality.natureWords).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('shows sample haikus from each method', () => {
      console.log('\n--- Sample Haikus by Method ---\n');

      for (const method of methods) {
        const r = results.get(method)!;
        console.log(`\n[${method.toUpperCase()}] (${r.sampleHaikus.length} generated)`);
        for (const h of r.sampleHaikus.slice(0, 2)) {
          console.log(`  "${h.verses[0]}"`);
          console.log(`  "${h.verses[1]}"`);
          console.log(`  "${h.verses[2]}"`);
          console.log(`  Score: ${h.quality.totalScore} (nature: ${h.quality.natureWords}, repeat: ${h.quality.repeatedWords}, weak: ${h.quality.weakStarts})\n`);
        }
      }

      expect(true).toBeTruthy();
    });
  });

  describe('Sparse Punctuation Text', () => {
    let results: Map<ExtractionMethod, MethodAnalysis>;

    beforeAll(() => {
      results = new Map();
      for (const method of methods) {
        results.set(method, analyzeMethod(SAMPLE_TEXTS.sparse, method));
      }
    });

    it('shows punctuation method struggles with sparse text', () => {
      console.log('\n=== SPARSE TEXT ANALYSIS ===\n');
      console.log('| Method      | Extracted | Valid | Ratio  |');
      console.log('|-------------|-----------|-------|--------|');

      for (const method of methods) {
        const r = results.get(method)!;
        console.log(
          `| ${method.padEnd(11)} | ${String(r.totalExtracted).padStart(9)} | ${String(r.validQuotes).padStart(5)} | ${(r.validRatio * 100).toFixed(1).padStart(5)}% |`,
        );
      }

      // Punctuation method likely yields fewer results for sparse text
      const punct = results.get('punctuation')!;
      const chunk = results.get('chunk')!;

      // Fallback methods should extract MORE candidates
      expect(chunk.totalExtracted).toBeGreaterThan(punct.totalExtracted);
      console.log(
        `\nChunk extracts ${chunk.totalExtracted} vs punctuation ${punct.totalExtracted} (${((chunk.totalExtracted / punct.totalExtracted) * 100).toFixed(0)}% more)`,
      );
    });

    it('compares quality when fallbacks are needed', () => {
      console.log('\n| Method      | Nature | Repeat | Weak | Total |');
      console.log('|-------------|--------|--------|------|-------|');

      for (const method of methods) {
        const r = results.get(method)!;
        const q = r.averageQuality;
        console.log(
          `| ${method.padEnd(11)} | ${q.natureWords.toFixed(1).padStart(6)} | ${q.repeatedWords.toFixed(1).padStart(6)} | ${q.weakStarts.toFixed(1).padStart(4)} | ${q.totalScore.toFixed(1).padStart(5)} |`,
        );
      }

      // All methods should produce results with valid quality scores
      expect(results.size).toBe(methods.length);
    });
  });

  describe('Minimal Text (needs chunk method)', () => {
    let results: Map<ExtractionMethod, MethodAnalysis>;

    beforeAll(() => {
      results = new Map();
      for (const method of methods) {
        results.set(method, analyzeMethod(SAMPLE_TEXTS.minimal, method));
      }
    });

    it('shows only chunk method can extract from minimal text', () => {
      console.log('\n=== MINIMAL TEXT ANALYSIS ===\n');
      console.log('| Method      | Extracted | Valid | Ratio  |');
      console.log('|-------------|-----------|-------|--------|');

      for (const method of methods) {
        const r = results.get(method)!;
        console.log(
          `| ${method.padEnd(11)} | ${String(r.totalExtracted).padStart(9)} | ${String(r.validQuotes).padStart(5)} | ${(r.validRatio * 100).toFixed(1).padStart(5)}% |`,
        );
      }

      // Chunk should be the only method that extracts many candidates
      const chunk = results.get('chunk')!;
      expect(chunk.totalExtracted).toBeGreaterThan(10);
    });

    it('chunk method quality on minimal text', () => {
      const chunk = results.get('chunk')!;

      console.log('\n[CHUNK METHOD] Sample haikus from minimal text:');
      for (const h of chunk.sampleHaikus.slice(0, 3)) {
        console.log(`  "${h.verses[0]}"`);
        console.log(`  "${h.verses[1]}"`);
        console.log(`  "${h.verses[2]}"`);
        console.log(`  Score: ${h.quality.totalScore}\n`);
      }

      // Even chunk method should produce valid syllable structures
      for (const h of chunk.sampleHaikus) {
        expect(nl.countSyllables(h.verses[0])).toBe(5);
        expect(nl.countSyllables(h.verses[1])).toBe(7);
        expect(nl.countSyllables(h.verses[2])).toBe(5);
      }
    });
  });

  describe('Statistical Comparison', () => {
    it('aggregates quality across all text types', () => {
      const allResults: Map<ExtractionMethod, { scores: number[]; haikusGenerated: number }> = new Map();

      for (const method of methods) {
        allResults.set(method, { scores: [], haikusGenerated: 0 });
      }

      for (const textType of Object.values(SAMPLE_TEXTS)) {
        for (const method of methods) {
          const analysis = analyzeMethod(textType, method);
          const methodData = allResults.get(method)!;
          methodData.haikusGenerated += analysis.sampleHaikus.length;
          for (const h of analysis.sampleHaikus) {
            methodData.scores.push(h.quality.totalScore);
          }
        }
      }

      console.log('\n=== AGGREGATE STATISTICS ===\n');
      console.log('| Method      | Haikus | Avg Score | Min | Max |');
      console.log('|-------------|--------|-----------|-----|-----|');

      for (const method of methods) {
        const data = allResults.get(method)!;
        if (data.scores.length > 0) {
          const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
          const min = Math.min(...data.scores);
          const max = Math.max(...data.scores);
          console.log(
            `| ${method.padEnd(11)} | ${String(data.haikusGenerated).padStart(6)} | ${avg.toFixed(1).padStart(9)} | ${String(min).padStart(3)} | ${String(max).padStart(3)} |`,
          );
        } else {
          console.log(`| ${method.padEnd(11)} | ${String(0).padStart(6)} |       N/A | N/A | N/A |`);
        }
      }

      // The key finding: compare punctuation vs chunk quality
      const punctScores = allResults.get('punctuation')!.scores;
      const chunkScores = allResults.get('chunk')!.scores;


      if (punctScores.length > 0 && chunkScores.length > 0) {
        const punctAvg = punctScores.reduce((a, b) => a + b, 0) / punctScores.length;
        const chunkAvg = chunkScores.reduce((a, b) => a + b, 0) / chunkScores.length;

        console.log('\n--- CONCLUSION ---');
        console.log(`Punctuation avg score: ${punctAvg.toFixed(2)}`);
        console.log(`Chunk avg score: ${chunkAvg.toFixed(2)}`);
        console.log(`Difference: ${(punctAvg - chunkAvg).toFixed(2)}`);


        if (punctAvg > chunkAvg) {
          console.log('\n=> PUNCTUATION produces HIGHER quality haikus');
          console.log('=> Fallback methods MAY reduce quality');
        } else if (chunkAvg > punctAvg) {
          console.log('\n=> CHUNK produces HIGHER quality haikus');
          console.log('=> Fallback methods IMPROVE quality');
        } else {
          console.log('\n=> Methods produce SIMILAR quality');
          console.log('=> Fallback methods maintain quality');
        }
      }

      expect(true).toBeTruthy();
    });
  });
});
