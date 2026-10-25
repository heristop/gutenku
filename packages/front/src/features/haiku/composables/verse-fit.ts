import { splitGraphemes } from '@/core/composables/graphemes';

/** The longest verse, in characters: what the poem's type is sized to. */
export function longestVerseLength(verses: readonly string[]): number {
  return verses.reduce(
    (longest, verse) => Math.max(longest, splitGraphemes(verse).length),
    0,
  );
}
