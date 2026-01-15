/**
 * Project Gutenberg HTML parsing utilities.
 */

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  downloads?: number;
}

const NON_ENGLISH_PATTERNS = [
  /\(spanish\)/i,
  /\(french\)/i,
  /\(german\)/i,
  /\(italian\)/i,
  /\(dutch\)/i,
  /\(portuguese\)/i,
  /\(finnish\)/i,
  /\(swedish\)/i,
  /\(danish\)/i,
  /\(norwegian\)/i,
  /\(polish\)/i,
  /\(russian\)/i,
  /\(greek\)/i,
  /\(modern greek[^)]*\)/i,
  /\(ancient greek[^)]*\)/i,
  /\(latin\)/i,
  /\(chinese\)/i,
  /\(japanese\)/i,
  /\(korean\)/i,
  /\(arabic\)/i,
  /\(hebrew\)/i,
  /\(esperanto\)/i,
  /\(catalan\)/i,
  /\(tagalog\)/i,
  /\(welsh\)/i,
  /\(hungarian\)/i,
  /\(czech\)/i,
  /\(romanian\)/i,
];

export function hasNonAsciiChars(text: string): boolean {
  return /[^\u0020-\u024F\u1E00-\u1EFF]/.test(text);
}

export function isEnglish(book: GutenbergBook): boolean {
  const title = book.title;

  for (const pattern of NON_ENGLISH_PATTERNS) {
    if (pattern.test(title)) {
      return false;
    }
  }

  if (hasNonAsciiChars(title)) {
    return false;
  }

  return true;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:;].*$/, '')
    .replaceAll(/\([^)]*\)/g, '')
    .replace(/\btranslated?\b.*$/i, '')
    .replace(/^(the|a|an)\s+/i, '')
    .replaceAll(/[''""".,!?]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

export function extractTopBooksFromHtml(html: string): GutenbergBook[] {
  const books: GutenbergBook[] = [];
  const seen = new Set<number>();

  const weekSectionMatch = html.match(
    /Top 100 EBooks last 7 days[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/i,
  );

  if (!weekSectionMatch) {
    return books;
  }

  const listHtml = weekSectionMatch[1];
  const itemPattern = /<li[^>]*><a href="\/ebooks\/(\d+)"[^>]*>([^<]+)<\/a>/g;

  let match;
  while ((match = itemPattern.exec(listHtml)) !== null) {
    const id = Number.parseInt(match[1], 10);
    const fullText = match[2].trim();

    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const downloadsMatch = fullText.match(/\((\d+)\)\s*$/);
    const downloads = downloadsMatch
      ? Number.parseInt(downloadsMatch[1], 10)
      : 0;

    const textWithoutDownloads = fullText.replace(/\s*\(\d+\)\s*$/, '').trim();

    const byMatch = textWithoutDownloads.match(/^(.+?)\s+by\s+(.+)$/i);
    let title: string;
    let author: string;

    if (byMatch) {
      title = byMatch[1].trim();
      author = byMatch[2].trim();
    }

    if (!byMatch) {
      title = textWithoutDownloads;
      author = 'Unknown';
    }

    books.push({ id, title, author, downloads });
  }

  return books;
}

export function extractBooksFromBookshelfHtml(html: string): GutenbergBook[] {
  const books: GutenbergBook[] = [];
  const seen = new Set<number>();

  const itemPattern = /<li[^>]*class="booklink"[^>]*>[\s\S]*?<\/li>/gi;

  let match;
  while ((match = itemPattern.exec(html)) !== null) {
    const block = match[0];

    const idMatch = block.match(/href="\/ebooks\/(\d+)"/);
    if (!idMatch) {
      continue;
    }

    const id = Number.parseInt(idMatch[1], 10);
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const titleMatch = block.match(/<span class="title">([^<]+)<\/span>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';

    const authorMatch = block.match(/<span class="subtitle">([^<]+)<\/span>/);
    const author = authorMatch ? authorMatch[1].trim() : 'Unknown';

    const downloadsMatch = block.match(
      /<span class="extra">(\d+)\s*downloads?<\/span>/i,
    );
    const downloads = downloadsMatch
      ? Number.parseInt(downloadsMatch[1], 10)
      : 0;

    books.push({ id, title, author, downloads });
  }

  return books;
}

export function getNextPageUrl(html: string): string | null {
  const nextMatch = html.match(
    /href="([^"]*\?start_index=\d+)"[^>]*>Next<\/a>/i,
  );
  if (nextMatch) {
    const path = nextMatch[1];

    return path.startsWith('http') ? path : `https://www.gutenberg.org${path}`;
  }
  return null;
}

export function removeDuplicates(books: GutenbergBook[]): {
  unique: GutenbergBook[];
  duplicateCount: number;
  duplicates: Map<string, GutenbergBook[]>;
} {
  const byNormalizedTitle = new Map<string, GutenbergBook[]>();

  for (const book of books) {
    const normalized = normalizeTitle(book.title);
    if (!byNormalizedTitle.has(normalized)) {
      byNormalizedTitle.set(normalized, []);
    }
    byNormalizedTitle.get(normalized)!.push(book);
  }

  const unique: GutenbergBook[] = [];
  const duplicates = new Map<string, GutenbergBook[]>();
  let duplicateCount = 0;

  for (const [normalized, group] of byNormalizedTitle) {
    group.sort((a, b) => a.id - b.id);
    unique.push(group[0]);

    if (group.length > 1) {
      duplicates.set(normalized, group.slice(1));
      duplicateCount += group.length - 1;
    }
  }

  return { unique, duplicateCount, duplicates };
}
