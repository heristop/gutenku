export interface UnicodeFormattingOptions {
  prefix: string;
  separator: string;
  case: 'upper' | 'lower';
  format: 'utf-32' | 'utf-16';
  add0: boolean;
  throwOnError: boolean;
}
/**
 * Convert unicode number to string
 *
 * Example:
 * 	0x1F600 => '1F600'
 */
export declare function getEmojiUnicodeString(code: number, options?: Partial<UnicodeFormattingOptions>): string;
/**
 * Convert unicode numbers sequence to string
 *
 * Example:
 * 	[0x1f441, 0xfe0f] => '1f441-fe0f'
 */
export declare function getEmojiSequenceString(sequence: number[], options?: Partial<UnicodeFormattingOptions>): string;
/**
 * Convert unicode numbers sequence to string
 *
 * Simple version of `getEmojiSequenceString()` without options that otherwise add to bundle
 */
export declare function getEmojiSequenceKeyword(sequence: number[]): string;