/**
 * Shared validation patterns for verse/quote filtering.
 * Used by NaturalLanguageService and Verse value object.
 */

import { COMMON_NAMES } from '~~/data/common-names';
import { NATURE_WORDS } from '~~/data/nature-words';
import { ALLOWED_REPEATS, TITLES, SENSORY_WORDS } from './validation-wordlists';
import type { ExtractionMethod } from '@gutenku/shared';

// Quote thresholds per extraction method
// Punctuation (primary): lower threshold
// Chunk (fallback): higher threshold for quality filtering
export const MIN_QUOTES_THRESHOLD: Record<ExtractionMethod, number> = {
  punctuation: 6,
  tokenizer: 6,
  clause: 6,
  chunk: 12,
  genetic_algorithm: 0, // GA handles its own thresholds
};

// Haiku generation rules
export const VERSE_MAX_LENGTH = 30;

// Filter thresholds (for rejection during generation)
export const DEFAULT_SENTIMENT_MIN_SCORE = 0.5; // [0, 1] range - 0.5 = neutral
export const DEFAULT_MARKOV_MIN_SCORE = 0.1; // [0, 10] - bigram transition score
export const DEFAULT_GRAMMAR_MIN_SCORE = 0.3; // [0, 1] - POS grammar score
export const DEFAULT_TRIGRAM_MIN_SCORE = 0.5; // [0, 10] - trigram flow score
export const DEFAULT_UNIQUENESS_MIN_SCORE = 0.6; // [0, 1] - word uniqueness ratio
export const DEFAULT_ALLITERATION_MIN_SCORE = 0.2; // [0, 1] - phonetics/alliteration

// Additional filter defaults
export const DEFAULT_VERSE_DISTANCE_MIN_SCORE = 0.05; // [0, 1] quote proximity
export const DEFAULT_LINE_BALANCE_MIN_SCORE = 0.5; // [0, 1] line length balance
export const DEFAULT_IMAGERY_MIN_SCORE = 0; // [0, 1] disabled
export const DEFAULT_COHERENCE_MIN_SCORE = 0; // [0, 1] disabled
export const DEFAULT_VERB_MIN_SCORE = 0.3; // [0, 1] verb presence

/** Characters that invalidate a verse/quote */
export const BLACKLISTED_CHARS_PATTERN =
  /(@|[0-9]|Mr|Mrs|Dr|#|\[|\|\(|\)|"|“|”|'|‘|’|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&)/;

/** Words that should not start a verse */
export const INVALID_START_WORDS_PATTERN = /^(said|cried|inquired)/i;

/** Words that should not end a verse */
export const INVALID_END_WORDS_PATTERN = /(or|and|of)$/i;

/** All uppercase text (chapter headers, etc.) */
export const UPPERCASE_TEXT_PATTERN = /^[A-Z\s!:.?]+$/;

/** Single uppercase letter at end (truncated name) */
export const LOST_LETTER_PATTERN = /\b[A-Z]\b$/;

/** Conjunctions that shouldn't start a haiku */
export const CONJUNCTION_START_PATTERN = /^(and|but|or|of)/i;

/** Combined blacklist pattern for single-pass validation (used by NaturalLanguageService) */
export const COMBINED_BLACKLIST_PATTERN = new RegExp(
  `${INVALID_START_WORDS_PATTERN.source}|${INVALID_END_WORDS_PATTERN.source}|${BLACKLISTED_CHARS_PATTERN.source}|${LOST_LETTER_PATTERN.source}`,
  'i',
);

// Pre-compiled regex for word splitting (avoid creating new regex per call)
const WORD_SPLIT_REGEX = /\s+/;

/** Check if text contains a common first name - O(n) where n = word count */
export function containsCommonName(text: string): boolean {
  const words = text.toLowerCase().split(WORD_SPLIT_REGEX);

  return words.some((word) => COMMON_NAMES.has(word));
}

/**
 * Count repeated content words across verses.
 * Returns count of repeated words.
 */
export function countRepeatedWords(verses: string[]): number {
  const seen = new Set<string>();
  let repeats = 0;

  for (const verse of verses) {
    for (const word of verse.toLowerCase().split(WORD_SPLIT_REGEX)) {
      if (word.length > 0 && !ALLOWED_REPEATS.has(word)) {
        if (seen.has(word)) {
          repeats++;
        }
        seen.add(word);
      }
    }
  }

  return repeats;
}

/** Weak start words that lack imagery (pronouns, existential constructs, conjunctions) */
export const WEAK_START_PATTERN =
  /^(it|there|this|that|they|we|he|she|i|and|or|but)\s/i;

/**
 * Check if text starts with a weak word.
 */
export function hasWeakStart(text: string): boolean {
  return WEAK_START_PATTERN.test(text);
}

/**
 * Count nature/imagery words across verses (kigo-inspired).
 */
export function countNatureWords(verses: string[]): number {
  let count = 0;
  for (const verse of verses) {
    for (const word of verse.toLowerCase().split(WORD_SPLIT_REGEX)) {
      if (word.length > 0 && NATURE_WORDS.has(word)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Check if verse contains blacklisted characters (brackets, commas, etc.)
 */
export function hasBlacklistedChars(verse: string): boolean {
  return BLACKLISTED_CHARS_PATTERN.test(verse);
}

/**
 * Check if text contains a proper noun (capitalized word not at start of sentence).
 * Used to filter out sentences with character names.
 */
export function hasProperNoun(text: string): boolean {
  const words = text.split(/\s+/);
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    // Check if word starts with uppercase (and has lowercase after, to avoid acronyms)
    if (word && /^[A-Z][a-z]/.test(word)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a sentence is valid for puzzle haiku hints.
 * Filters out sentences with blacklisted chars, uppercase text, proper nouns, or excessive length.
 */
export function isValidPuzzleSentence(
  sentence: string,
  maxLength: number = 50,
): boolean {
  // Use shared blacklist validation (quotes, brackets, numbers, titles, etc.)
  if (hasBlacklistedChars(sentence)) {
    return false;
  }
  // Skip all-uppercase (chapter headers)
  if (UPPERCASE_TEXT_PATTERN.test(sentence)) {
    return false;
  }
  // Skip sentences with proper nouns (character names)
  if (hasProperNoun(sentence)) {
    return false;
  }
  // Check length
  return sentence.length < maxLength;
}

/**
 * Count blacklisted characters across all verses.
 * Used as a soft penalty in GA fitness.
 */
export function countBlacklistedVerses(verses: string[]): number {
  return verses.filter((v) => hasBlacklistedChars(v)).length;
}

/**
 * Check if a word is a proper noun.
 * - First words: checked against COMMON_NAMES or TITLES list
 * - Other words: checked for capitalization
 */
function isProperNoun(word: string, isFirstWord: boolean): boolean {
  const lower = word.toLowerCase();
  if (TITLES.has(lower)) {
    return true;
  }
  if (isFirstWord) {
    return COMMON_NAMES.has(lower);
  }
  return /^[A-Z]/.test(word);
}

/**
 * Count proper nouns in verses.
 * Used as a soft penalty in GA fitness - proper nouns usually indicate
 * character names or dialogue which don't work well in haiku.
 */
export function countProperNouns(verses: string[]): number {
  let count = 0;
  for (const verse of verses) {
    const words = verse.split(WORD_SPLIT_REGEX);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word && isProperNoun(word, i === 0)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Calculate verse distance score from quote proximity in source text.
 * 1.0 for adjacent verses, lower for larger spans.
 */
export function calculateVerseDistance(
  indices: number[],
  totalQuotes: number,
): number {
  if (indices.length < 2 || totalQuotes <= 1) {
    return 1;
  }
  const span = Math.max(...indices) - Math.min(...indices);

  return Math.max(0, 1 - span / totalQuotes);
}

/**
 * Calculate line length balance using coefficient of variation.
 * 1.0 for uniform lengths, lower with variance.
 */
export function calculateLineLengthBalance(verses: string[]): number {
  const lengths = verses.map((v) => v.length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) {
    return 1;
  }
  const variance =
    lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const cv = Math.sqrt(variance) / mean; // Coefficient of variation
  return Math.max(0, 1 - cv);
}

/**
 * Calculate sensory word density (caps at 6 words for score of 1.0).
 */
export function calculateImageryDensity(verses: string[]): number {
  const words = verses.flatMap((v) => v.toLowerCase().split(WORD_SPLIT_REGEX));
  const sensoryCount = words.filter((w) => SENSORY_WORDS.has(w)).length;

  return Math.min(1, sensoryCount / 6);
}

/**
 * Calculate semantic coherence via average Jaccard similarity between verse pairs.
 */
export function calculateSemanticCoherence(verses: string[]): number {
  if (verses.length < 2) {
    return 1;
  }

  const wordSets = verses.map(
    (v) =>
      new Set(
        v
          .toLowerCase()
          .split(WORD_SPLIT_REGEX)
          .filter((w) => w.length > 2),
      ),
  );

  const jaccard = (a: Set<string>, b: Set<string>): number => {
    const intersection = [...a].filter((x) => b.has(x)).length;
    const union = new Set([...a, ...b]).size;

    return union > 0 ? intersection / union : 0;
  };

  const sim12 = jaccard(wordSets[0], wordSets[1]);
  const sim13 = jaccard(wordSets[0], wordSets[2]);
  const sim23 = jaccard(wordSets[1], wordSets[2]);

  return (sim12 + sim13 + sim23) / 3;
}

/** Verb POS tags */
const VERB_TAGS = new Set(['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ']);

/**
 * Calculate verb presence score (caps at 3 verbs for score of 1.0).
 */
export function calculateVerbPresence(
  posResults: Array<{ tag: string }>,
): number {
  const verbCount = posResults.filter((t) => VERB_TAGS.has(t.tag)).length;

  return Math.min(1, verbCount / 3);
}

export interface HaikuQualityScore {
  natureWords: number; // Count of nature/imagery words
  repeatedWords: number; // Count of repeated content words (penalty)
  weakStarts: number; // Count of verses with weak starts (penalty)
  blacklistedVerses: number; // Count of verses with blacklisted chars (penalty)
  properNouns: number; // Count of proper nouns (penalty)
  verseLengthPenalty: number; // Count of verses exceeding max length (penalty)
  sentiment: number; // Average sentiment [0, 1]
  grammar: number; // POS score [0, 1]
  trigramFlow: number; // Trigram flow score [0, 10]
  markovFlow: number; // Markov bigram flow score [0, 10]
  uniqueness: number; // Word uniqueness ratio [0, 1]
  alliteration: number; // Alliteration score [0, 1]
  verseDistance: number; // Proximity of quotes in source [0, 1]
  lineLengthBalance: number; // Character length variance [0, 1]
  imageryDensity: number; // Sensory word density [0, 1]
  semanticCoherence: number; // Thematic relatedness [0, 1]
  verbPresence: number; // Active verb count [0, 1]
  totalScore: number; // Composite score for ranking
}

export interface QualityMetrics {
  sentiment: number;
  grammar: number;
  trigramFlow: number;
  markovFlow: number;
  alliteration: number;
  verseIndices?: number[];
  totalQuotes?: number;
  posResults?: Array<{ tag: string }>;
  /**
   * Pre-computed embedding-based semantic coherence [0, 1]
   * If provided, this will be used instead of Jaccard-based coherence
   * Computed by VerseEmbeddingService.computeSemanticCoherence()
   */
  embeddingCoherence?: number;
}

/**
 * Count verses that exceed the max length threshold.
 */
export function countLongVerses(verses: string[]): number {
  return verses.filter((v) => v.length >= VERSE_MAX_LENGTH).length;
}

/**
 * Calculate word uniqueness ratio (unique words / total words).
 */
export function calculateWordUniqueness(verses: string[]): number {
  const words = verses.flatMap((v) => v.toLowerCase().split(WORD_SPLIT_REGEX));
  const filtered = words.filter((w) => w.length > 0);
  if (filtered.length === 0) {
    return 0;
  }
  const unique = new Set(filtered);

  return unique.size / filtered.length;
}

/**
 * Calculate quality scores for haiku ranking/selection.
 */
export function calculateHaikuQuality(
  verses: string[],
  metrics: QualityMetrics = {
    sentiment: 0.5,
    grammar: 0,
    trigramFlow: 0,
    markovFlow: 0,
    alliteration: 0,
  },
): HaikuQualityScore {
  const natureWords = countNatureWords(verses);
  const repeatedWords = countRepeatedWords(verses);
  const weakStarts = verses.filter((v) => hasWeakStart(v)).length;
  const blacklistedVerses = countBlacklistedVerses(verses);
  const properNouns = countProperNouns(verses);
  const verseLengthPenalty = countLongVerses(verses);
  const uniqueness = calculateWordUniqueness(verses);

  // Calculate new KPIs
  const verseDistance =
    metrics.verseIndices && metrics.totalQuotes
      ? calculateVerseDistance(metrics.verseIndices, metrics.totalQuotes)
      : 0.5;
  const lineLengthBalance = calculateLineLengthBalance(verses);
  const imageryDensity = calculateImageryDensity(verses);
  // Use embedding-based coherence if provided, otherwise fall back to Jaccard
  const semanticCoherence =
    metrics.embeddingCoherence !== undefined
      ? metrics.embeddingCoherence
      : calculateSemanticCoherence(verses);
  const verbPresence = metrics.posResults
    ? calculateVerbPresence(metrics.posResults)
    : 0.5;

  // Score components:
  // Penalties:
  // - Repeated words: -2 per word
  // - Weak starts: -2 per verse
  // - Blacklisted chars: -3 per verse
  // - Proper nouns: -2 per noun
  // - Verse length: -3 per verse exceeding max length
  // Bonuses:
  // - Nature words: +2 per word
  // - Sentiment bonus: [0,1] → [-2, +2]
  // - Grammar: [0, 1] → [0, 2]
  // - Trigram flow: [0, 10] → [0, 2]
  // - Markov flow: [0, 10] → [0, 2]
  // - Uniqueness: [0, 1] → [0, 2]
  // - Alliteration: [0, 1] → [0, 1]
  // - Verse distance: [0, 1] → [0, 4] (high weight - important for GutenKu context)
  // - Line length balance: [0, 1] → [0, 1.5]
  // - Imagery density: [0, 1] → [0, 1.5]
  // - Semantic coherence: [0, 1] → [0, 2]
  // - Verb presence: [0, 1] → [0, 1]
  const sentimentBonus = (metrics.sentiment - 0.5) * 4;
  const grammarBonus = metrics.grammar * 1.5;
  const trigramBonus = metrics.trigramFlow * 0.2;
  const markovBonus = metrics.markovFlow * 0.5;
  const uniquenessBonus = uniqueness * 2;
  const alliterationBonus = metrics.alliteration * 1.5;
  const verseDistanceBonus = verseDistance * 4; // High weight for narrative proximity
  const lineLengthBonus = lineLengthBalance * 1.5;
  const imageryBonus = imageryDensity * 1.5;
  const coherenceBonus = semanticCoherence * 2;
  const verbBonus = verbPresence * 1;

  const totalScore =
    natureWords * 2 -
    repeatedWords * 2 -
    weakStarts * 2 -
    blacklistedVerses * 3 -
    properNouns * 2 -
    verseLengthPenalty * 3 +
    sentimentBonus +
    grammarBonus +
    trigramBonus +
    markovBonus +
    uniquenessBonus +
    alliterationBonus +
    verseDistanceBonus +
    lineLengthBonus +
    imageryBonus +
    coherenceBonus +
    verbBonus;

  return {
    natureWords,
    repeatedWords,
    weakStarts,
    blacklistedVerses,
    properNouns,
    verseLengthPenalty,
    sentiment: metrics.sentiment,
    grammar: metrics.grammar,
    trigramFlow: metrics.trigramFlow,
    markovFlow: metrics.markovFlow,
    uniqueness,
    alliteration: metrics.alliteration,
    verseDistance,
    lineLengthBalance,
    imageryDensity,
    semanticCoherence,
    verbPresence,
    totalScore,
  };
}
