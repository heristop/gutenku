/**
 * Shared validation patterns for verse/quote filtering.
 * Used by NaturalLanguageService and Verse value object.
 */

import { COMMON_NAMES } from '~~/data/common-names';
import { NATURE_WORDS } from '~~/data/nature-words';

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

// ============================================================================
// Soft Scoring Functions (for ranking, not rejection)
// ============================================================================

/** Common words allowed to repeat across verses without penalty */
const ALLOWED_REPEATS = new Set([
  'the',
  'a',
  'an',
  'in',
  'on',
  'of',
  'to',
  'and',
  'is',
  'was',
  'with',
  'for',
  'at',
  'by',
  'from',
  'as',
]);

/**
 * Count repeated content words across verses (soft scoring).
 * Returns count of repeated words (0 = good, higher = worse).
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

/** Weak start words that lack imagery (pronouns, existential constructs) */
export const WEAK_START_PATTERN = /^(it|there|this|that|they|we|he|she|i)\s/i;

/**
 * Check if text starts with a weak word (soft scoring).
 * Returns true if verse starts with a weak word.
 */
export function hasWeakStart(text: string): boolean {
  return WEAK_START_PATTERN.test(text);
}

/**
 * Count nature/imagery words across verses (kigo-inspired scoring).
 * Returns count of nature words found (higher = more nature imagery).
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

// ============================================================================
// Haiku Quality Scoring (for ranking)
// ============================================================================

export interface HaikuQualityScore {
  natureWords: number; // Count of nature/imagery words
  repeatedWords: number; // Count of repeated content words (lower is better)
  weakStarts: number; // Count of verses with weak starts (lower is better)
  totalScore: number; // Composite score for ranking
}

/**
 * Calculate quality scores for a haiku (for ranking/selection).
 * Higher totalScore = better quality.
 */
export function calculateHaikuQuality(verses: string[]): HaikuQualityScore {
  const natureWords = countNatureWords(verses);
  const repeatedWords = countRepeatedWords(verses);
  const weakStarts = verses.filter((v) => hasWeakStart(v)).length;

  // Composite score: reward nature words, penalize repetition and weak starts
  const totalScore = natureWords * 2 - repeatedWords * 3 - weakStarts * 2;

  return {
    natureWords,
    repeatedWords,
    weakStarts,
    totalScore,
  };
}
