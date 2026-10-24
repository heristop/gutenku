/**
 * Create regular expression instance
 */
export declare function createEmojiRegExp(regexp: string): RegExp;
/**
 * Match
 */
export interface EmojiRegexMatch {
  match: string;
  sequence: number[];
  keyword: string;
  regexp: number;
}
/**
 * Add prev/next
 */
interface PrevMatch {
  match: EmojiRegexMatch;
  prev: string;
}
interface PrevNextMatch extends PrevMatch {
  next: string;
}
/**
 * Find emojis in text
 *
 * Returns only one entry per match
 */
export declare function getEmojiMatchesInText(regexp: string | RegExp | (string | RegExp)[], content: string): EmojiRegexMatch[];
/**
 * Sort emojis, get prev and next text
 */
export declare function sortEmojiMatchesInText(content: string, matches: EmojiRegexMatch[]): PrevNextMatch[];