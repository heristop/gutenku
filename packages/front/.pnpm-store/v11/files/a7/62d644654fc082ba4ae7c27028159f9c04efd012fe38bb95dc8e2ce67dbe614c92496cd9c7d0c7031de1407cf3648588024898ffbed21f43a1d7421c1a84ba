import { EmojiRegexMatch } from "./find.js";
/**
 * Callback for replacing emoji in text
 *
 * Returns text to replace emoji with, undefined to skip replacement
 */
export type FindAndReplaceEmojisInTextCallback = (match: EmojiRegexMatch, prev: string) => string | undefined;
/**
 * Find and replace emojis in text
 *
 * Returns null if nothing was replaced
 */
export declare function findAndReplaceEmojisInText(regexp: string | RegExp | (string | RegExp)[], content: string, callback: FindAndReplaceEmojisInTextCallback): string | null;