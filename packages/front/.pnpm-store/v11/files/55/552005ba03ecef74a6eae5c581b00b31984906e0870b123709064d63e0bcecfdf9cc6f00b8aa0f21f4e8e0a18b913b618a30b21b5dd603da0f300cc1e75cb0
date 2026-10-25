import { EmojiItemRegex } from "./base.js";
/**
 * Tree item
 */
interface TreeItem {
  regex: EmojiItemRegex;
  end?: true;
  children?: TreeItem[];
}
/**
 * Create tree
 */
export declare function createEmojisTree(sequences: number[][]): TreeItem[];
/**
 * Parse tree
 */
export declare function parseEmojiTree(items: TreeItem[]): EmojiItemRegex;