/**
 * HTML parsing and book discovery helpers for fetch-gutenberg-classics CLI.
 */
import { normalizeTitle } from './gutenberg-classics-filters';

export interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  downloads?: number;
}

export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; BookCrawler/1.0; +https://github.com/gutenku)',
    },
  });

  return response.text();
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
    const title = byMatch ? byMatch[1].trim() : textWithoutDownloads;
    const author = byMatch ? byMatch[2].trim() : 'Unknown';

    books.push({ id, title, author, downloads });
  }

  return books;
}

/**
 * Extract books from a Gutenberg bookshelf page.
 */
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

/**
 * Check if bookshelf page has a next page link.
 * Returns the next page URL or null.
 */
export function getNextPageUrl(html: string, _baseUrl: string): string | null {
  const nextMatch = html.match(
    /href="([^"]*\?start_index=\d+)"[^>]*>Next<\/a>/i,
  );

  if (nextMatch) {
    const path = nextMatch[1];
    
return path.startsWith('http') ? path : `https://www.gutenberg.org${path}`;
  }
  
return null;
}

/**
 * Fetch all pages of a bookshelf.
 */
export async function fetchAllBookshelfPages(
  baseUrl: string,
): Promise<GutenbergBook[]> {
  const allBooks: GutenbergBook[] = [];
  let currentUrl: string | null = baseUrl;

  while (currentUrl) {
    const html = await fetchPage(currentUrl);
    const books = extractBooksFromBookshelfHtml(html);

    if (books.length === 0) {
      break;
    }

    allBooks.push(...books);

    currentUrl = getNextPageUrl(html, baseUrl);

    if (currentUrl) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }

  return allBooks;
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
