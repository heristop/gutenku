const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

// Characters as a reader sees them: a kanji, or an accented letter written
// with a combining mark, counts once
function length(verse: string): number {
  let count = 0;

  for (const _ of graphemes.segment(verse)) {
    count++;
  }

  return count;
}

/** The longest verse, in characters: what the poem's type is sized to. */
export function longestVerseLength(verses: readonly string[]): number {
  return verses.reduce((longest, verse) => Math.max(longest, length(verse)), 0);
}
