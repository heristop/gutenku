import { EmojiComponentType } from "../data.js";
import { EmojiTestData, EmojiTestDataItem } from "./parse.js";
export interface EmojiTestDataComponentsMap {
  converted: Map<number, string>;
  items: Map<string | number, EmojiTestDataItem>;
  names: Map<string | number, string>;
  types: Record<string, EmojiComponentType>;
  keywords: Record<string, string>;
}
/**
 * Map components from test data
 */
export declare function mapEmojiTestDataComponents(testSequences: EmojiTestData): EmojiTestDataComponentsMap;
/**
 * Sequence with components
 */
export type EmojiSequenceWithComponents = (EmojiComponentType | number)[];
/**
 * Convert to string
 */
export declare function emojiSequenceWithComponentsToString(sequence: EmojiSequenceWithComponents): string;
/**
 * Entry in sequence
 */
export interface EmojiSequenceComponentEntry {
  index: number;
  type: EmojiComponentType;
}
/**
 * Find variations in sequence
 */
export declare function findEmojiComponentsInSequence(sequence: number[]): EmojiSequenceComponentEntry[];
/**
 * Component values
 */
export type EmojiSequenceComponentValues = Partial<Record<EmojiComponentType, number[]>>;
/**
 * Replace components in sequence
 */
export declare function replaceEmojiComponentsInCombinedSequence(sequence: EmojiSequenceWithComponents, values: EmojiSequenceComponentValues): number[];