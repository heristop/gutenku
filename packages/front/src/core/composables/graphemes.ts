// Characters as a reader sees them: an emoji with its modifiers, a kanji, or
// a letter with a combining mark, each counts once. Browsers without
// Intl.Segmenter (Firefox ESR 115, older Safari) fall back to code points:
// close enough to size a verse or cut a teaser.

let segmenter: Intl.Segmenter | null | undefined;

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined) {
    segmenter =
      typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null;
  }

  return segmenter;
}

export function splitGraphemes(text: string): string[] {
  const graphemes = getSegmenter();

  return graphemes
    ? [...graphemes.segment(text)].map((part) => part.segment)
    : [...text];
}
