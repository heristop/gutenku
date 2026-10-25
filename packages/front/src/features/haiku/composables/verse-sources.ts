export interface VerseContext {
  before: string;
  match: string;
  after: string;
  clippedStart: boolean;
  clippedEnd: boolean;
}

function normalize(text: string): string {
  return text.replaceAll(/\s+/g, ' ').trim();
}

// Locates a verse in its chapter and returns the words around it, so each line
// of the poem can cite its source like a margin annotation.
export function getVerseContext(
  content: string,
  verse: string,
  radius = 36,
): VerseContext | null {
  const text = normalize(content ?? '');
  const needle = normalize(verse ?? '');

  if (!text || !needle) {
    return null;
  }

  const start = text.toLowerCase().indexOf(needle.toLowerCase());

  if (start === -1) {
    return null;
  }

  const end = start + needle.length;
  let from = Math.max(0, start - radius);
  let to = Math.min(text.length, end + radius);

  // Snap to word boundaries so the quote never opens mid-word
  if (from > 0) {
    const space = text.indexOf(' ', from);
    from = space !== -1 && space < start ? space + 1 : start;
  }

  if (to < text.length) {
    const space = text.lastIndexOf(' ', to);
    to = space > end ? space : end;
  }

  return {
    before: text.slice(from, start),
    match: text.slice(start, end),
    after: text.slice(end, to),
    clippedStart: from > 0,
    clippedEnd: to < text.length,
  };
}
