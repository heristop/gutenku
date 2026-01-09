/**
 * Shared validation patterns for verse/quote filtering.
 * Used by NaturalLanguageService and Verse value object.
 */

/** Characters that invalidate a verse/quote */
export const BLACKLISTED_CHARS_PATTERN =
  /(@|[0-9]|Mr|Mrs|Dr|#|\[|\|\(|\)|"|“|”|‘|’|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&)/;

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
