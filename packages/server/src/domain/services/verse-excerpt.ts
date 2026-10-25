// The few words around each verse of a haiku, cut from its chapter: enough
// prose for the home page to black out, leaving the verses standing.

export interface VerseExcerpt {
  /** One fragment per verse, in poem order, joined by " … " */
  text: string;
  /** Each verse as it reads in `text` (the chapter's own case) */
  verses: string[];
}

const RADIUS = 28;
const SEPARATOR = ' … ';

function normalize(text: string): string {
  return text.replaceAll(/\s+/g, ' ').trim();
}

// Widens [start, end) by up to RADIUS characters each side, on word bounds
function fragmentAround(text: string, start: number, end: number): string {
  let from = Math.max(0, start - RADIUS);
  let to = Math.min(text.length, end + RADIUS);

  if (from > 0) {
    const space = text.indexOf(' ', from);
    from = space !== -1 && space < start ? space + 1 : start;
  }

  if (to < text.length) {
    const space = text.lastIndexOf(' ', to);
    to = space > end ? space : end;
  }

  return text.slice(from, to);
}

export function buildVerseExcerpt(
  content: string,
  rawVerses: readonly string[],
): VerseExcerpt | null {
  const text = normalize(content ?? '');

  if (!text || rawVerses.length === 0) {
    return null;
  }

  const lower = text.toLowerCase();
  const fragments: string[] = [];
  const verses: string[] = [];

  for (const raw of rawVerses) {
    const needle = normalize(raw);
    const start = needle ? lower.indexOf(needle.toLowerCase()) : -1;

    if (start === -1) {
      return null;
    }

    const end = start + needle.length;
    fragments.push(fragmentAround(text, start, end));
    verses.push(text.slice(start, end));
  }

  return { text: fragments.join(SEPARATOR), verses };
}
