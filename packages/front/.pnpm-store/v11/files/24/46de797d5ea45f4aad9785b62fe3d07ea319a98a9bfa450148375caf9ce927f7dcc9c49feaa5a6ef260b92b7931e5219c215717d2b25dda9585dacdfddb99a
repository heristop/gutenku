import { EmojiSequenceComponentEntry, EmojiTestDataComponentsMap } from "./components.js";
/**
 * Split emoji name in base name and variations
 *
 * Variations are also split in strings and emoji components with indexes pointing to sequence
 */
export interface SplitEmojiName {
  base: string;
  key: string;
  variations?: (string | EmojiSequenceComponentEntry)[];
  components?: number;
}
/**
 * Split emoji name to base name and variations
 *
 * Also finds indexes of each variation
 */
export declare function splitEmojiNameVariations(name: string, sequence: number[], componentsData: EmojiTestDataComponentsMap): SplitEmojiName;