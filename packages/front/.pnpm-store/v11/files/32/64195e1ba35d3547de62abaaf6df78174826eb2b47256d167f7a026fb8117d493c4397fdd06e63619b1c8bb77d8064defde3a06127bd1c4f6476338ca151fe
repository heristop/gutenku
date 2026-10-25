/**
 * Regex in item
 */
interface BaseEmojiItemRegex {
  type: 'utf16' | 'sequence' | 'set' | 'optional';
  regex: string;
  group: boolean;
  length: number;
}
interface EmojiItemRegexWithNumbers {
  numbers?: number[];
}
export interface UTF16EmojiItemRegex extends BaseEmojiItemRegex, Required<EmojiItemRegexWithNumbers> {
  type: 'utf16';
  group: true;
}
type SequenceEmojiItemRegexItem = UTF16EmojiItemRegex | SetEmojiItemRegex | OptionalEmojiItemRegex;
export interface SequenceEmojiItemRegex extends BaseEmojiItemRegex, EmojiItemRegexWithNumbers {
  type: 'sequence';
  items: SequenceEmojiItemRegexItem[];
}
export type SetEmojiItemRegexItem = UTF16EmojiItemRegex | SequenceEmojiItemRegex | OptionalEmojiItemRegex;
export interface SetEmojiItemRegex extends BaseEmojiItemRegex, EmojiItemRegexWithNumbers {
  type: 'set';
  sets: SetEmojiItemRegexItem[];
}
type OptionalEmojiItemRegexItem = UTF16EmojiItemRegex | SequenceEmojiItemRegex | SetEmojiItemRegex;
export interface OptionalEmojiItemRegex extends BaseEmojiItemRegex {
  type: 'optional';
  item: OptionalEmojiItemRegexItem;
  group: true;
}
export type EmojiItemRegex = UTF16EmojiItemRegex | SequenceEmojiItemRegex | SetEmojiItemRegex | OptionalEmojiItemRegex;
/**
 * Wrap regex in group
 */
export declare function wrapRegexInGroup(regex: string): string;
/**
 * Update UTF16 item, return regex
 */
export declare function updateUTF16EmojiRegexItem(item: UTF16EmojiItemRegex): string;
/**
 * Create UTF-16 regex
 */
export declare function createUTF16EmojiRegexItem(numbers: number[]): UTF16EmojiItemRegex;
/**
 * Update sequence regex. Does not update group
 */
export declare function updateSequenceEmojiRegexItem(item: SequenceEmojiItemRegex): string;
/**
 * Create sequence regex
 */
export declare function createSequenceEmojiRegexItem(sequence: EmojiItemRegex[], numbers?: number[]): SequenceEmojiItemRegex;
/**
 * Update set regex and group
 */
export declare function updateSetEmojiRegexItem(item: SetEmojiItemRegex): string;
/**
 * Create set regex
 */
export declare function createSetEmojiRegexItem(set: EmojiItemRegex[]): SetEmojiItemRegex;
/**
 * Update optional regex
 */
export declare function updateOptionalEmojiRegexItem(item: OptionalEmojiItemRegex): string;
/**
 * Create optional item
 */
export declare function createOptionalEmojiRegexItem(item: EmojiItemRegex): OptionalEmojiItemRegex;
/**
 * Clone item
 */
export declare function cloneEmojiRegexItem<T extends BaseEmojiItemRegex>(item: T, shallow?: boolean): T;