#!/usr/bin/env npx tsx
/**
 * Crawl Project Gutenberg for classical books and top downloads.
 * Validates chapter extraction by default.
 *
 * Usage:
 *   pnpm fetch:classics                    # Discover + validate
 *   pnpm fetch:classics --limit 20         # Validate first 20 books
 *   pnpm fetch:classics --skip-validation  # Discovery only
 */

import 'reflect-metadata';
import { Command } from 'commander';
import pc from 'picocolors';
import cliProgress from 'cli-progress';
import ora from 'ora';
import { BOOK_IDS } from '../src/shared/constants/book-ids';
import { ChapterSplitterService } from '../src/domain/services/ChapterSplitterService';
import { ChapterValidatorService } from '../src/domain/services/ChapterValidatorService';

// CLI options
const program = new Command();
program
  .name('fetch-gutenberg-classics')
  .description('Crawl Project Gutenberg for classical books and validate chapter extraction')
  .option('--skip-validation', 'Skip chapter extraction validation')
  .option('--limit <n>', 'Limit validation to first N books')
  .parse();

const options = program.opts<{
  skipValidation?: boolean;
  limit?: string;
}>();

interface GutenbergBook {
  id: number;
  title: string;
  author: string;
  downloads?: number;
}

interface ValidationResult {
  id: number;
  title: string;
  author: string;
  success: boolean;
  patternUsed: string | null;
  validChapters: number;
  totalChapters: number;
  error?: string;
}

// Harvard Classics bookshelf - curated collection of classic literature
const CLASSICS_BOOKSHELF_URL = 'https://www.gutenberg.org/ebooks/bookshelf/649';

const GUTENBERG_TOP_URL = 'https://www.gutenberg.org/browse/scores/top';
const GUTENBERG_BOOK_URL = 'https://www.gutenberg.org/cache/epub';


// Non-English language indicators in Gutenberg titles
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

// Minimum valid chapters required for a book to pass validation
const MIN_VALID_CHAPTERS = 8;

// Services for chapter extraction validation
const splitter = new ChapterSplitterService();
const validator = new ChapterValidatorService();

function hasNonAsciiChars(text: string): boolean {
  // Check for characters outside common Latin ranges (avoiding control characters \u0000-\u001F)
  return /[^\u0020-\u024F\u1E00-\u1EFF]/.test(text);
}

function isEnglish(book: GutenbergBook): boolean {
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

function normalizeTitle(title: string): string {
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

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; BookCrawler/1.0; +https://github.com/gutenku)',
    },
  });
  return response.text();
}

/**
 * Fetch book text and validate chapter extraction.
 */
async function validateBook(book: GutenbergBook): Promise<ValidationResult> {
  try {
    // Fetch book text from Gutenberg
    const url = `${GUTENBERG_BOOK_URL}/${book.id}/pg${book.id}.txt`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BookCrawler/1.0; +https://github.com/gutenku)',
      },
    });

    if (!response.ok) {
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        success: false,
        patternUsed: null,
        validChapters: 0,
        totalChapters: 0,
        error: `HTTP ${response.status}`,
      };
    }

    const content = await response.text();

    // Split into chapters
    const splitResult = splitter.splitContent(content);

    // Validate chapters
    const validationResult = validator.validate(splitResult.chapters);

    // Check success (min valid chapters)
    const success = validationResult.validChapters.length >= MIN_VALID_CHAPTERS;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      success,
      patternUsed: splitResult.patternUsed?.name || null,
      validChapters: validationResult.validChapters.length,
      totalChapters: splitResult.chapters.length,
    };
  } catch (error) {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      success: false,
      patternUsed: null,
      validChapters: 0,
      totalChapters: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractTopBooksFromHtml(html: string): GutenbergBook[] {
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

    if (seen.has(id)) {continue;}
    seen.add(id);

    const downloadsMatch = fullText.match(/\((\d+)\)\s*$/);
    const downloads = downloadsMatch ? Number.parseInt(downloadsMatch[1], 10) : 0;

    const textWithoutDownloads = fullText.replace(/\s*\(\d+\)\s*$/, '').trim();

    const byMatch = textWithoutDownloads.match(/^(.+?)\s+by\s+(.+)$/i);
    let title: string;
    let author: string;

    if (byMatch) {
      title = byMatch[1].trim();
      author = byMatch[2].trim();
    } else {
      title = textWithoutDownloads;
      author = 'Unknown';
    }

    books.push({ id, title, author, downloads });
  }

  return books;
}

/**
 * Extract books from a Gutenberg bookshelf page.
 * Structure: <li class="booklink"><a href="/ebooks/ID">
 *   <span class="title">Title</span>
 *   <span class="subtitle">Author</span>
 *   <span class="extra">Downloads downloads</span>
 * </a></li>
 */
function extractBooksFromBookshelfHtml(html: string): GutenbergBook[] {
  const books: GutenbergBook[] = [];
  const seen = new Set<number>();

  // Match bookshelf list items
  const itemPattern = /<li[^>]*class="booklink"[^>]*>[\s\S]*?<\/li>/gi;

  let match;
  while ((match = itemPattern.exec(html)) !== null) {
    const block = match[0];

    // Extract ID from href
    const idMatch = block.match(/href="\/ebooks\/(\d+)"/);
    if (!idMatch) {continue;}

    const id = Number.parseInt(idMatch[1], 10);

    if (seen.has(id)) {continue;}
    seen.add(id);

    // Extract title
    const titleMatch = block.match(/<span class="title">([^<]+)<\/span>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';

    // Extract author from subtitle
    const authorMatch = block.match(/<span class="subtitle">([^<]+)<\/span>/);
    const author = authorMatch ? authorMatch[1].trim() : 'Unknown';

    // Extract downloads from extra
    const downloadsMatch = block.match(/<span class="extra">(\d+)\s*downloads?<\/span>/i);
    const downloads = downloadsMatch ? Number.parseInt(downloadsMatch[1], 10) : 0;

    books.push({ id, title, author, downloads });
  }

  return books;
}

/**
 * Check if bookshelf page has a next page link.
 * Returns the next page URL or null.
 */
function getNextPageUrl(html: string, _baseUrl: string): string | null {
  const nextMatch = html.match(/href="([^"]*\?start_index=\d+)"[^>]*>Next<\/a>/i);

  if (nextMatch) {
    const path = nextMatch[1];
    // Build full URL
    return path.startsWith('http') ? path : `https://www.gutenberg.org${path}`;
  }
  return null;
}

/**
 * Fetch all pages of a bookshelf.
 */
async function fetchAllBookshelfPages(baseUrl: string): Promise<GutenbergBook[]> {
  const allBooks: GutenbergBook[] = [];
  let currentUrl: string | null = baseUrl;

  while (currentUrl) {
    const html = await fetchPage(currentUrl);
    const books = extractBooksFromBookshelfHtml(html);

    if (books.length === 0) {break;}

    allBooks.push(...books);

    // Check for next page
    currentUrl = getNextPageUrl(html, baseUrl);

    // Rate limiting between pages
    if (currentUrl) {
      await new Promise((resolve) => { setTimeout(resolve, 500); });
    }
  }

  return allBooks;
}

function removeDuplicates(books: GutenbergBook[]): {
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

// Helper function to fetch and filter top books
async function fetchTopBooksSection(existingIds: Set<number>): Promise<GutenbergBook[]> {
  const topBooks: GutenbergBook[] = [];
  const topSpinner = ora('Fetching top downloads of the week...').start();

  try {
    const topHtml = await fetchPage(GUTENBERG_TOP_URL);
    const allTopBooks = extractTopBooksFromHtml(topHtml);

    for (const book of allTopBooks) {
      if (!existingIds.has(book.id) && isEnglish(book)) {
        topBooks.push(book);
      }
    }

    topSpinner.succeed(
      pc.green(`Found ${allTopBooks.length} top books, ${topBooks.length} new English`),
    );

    displayTopBooks(topBooks);
  } catch {
    topSpinner.fail(pc.red('Failed to fetch top downloads'));
  }

  return topBooks;
}

// Helper to display top 50 books
function displayTopBooks(topBooks: GutenbergBook[]): void {
  if (topBooks.length === 0) {
    return;
  }

  console.log(pc.bold('\n═══ Top 50 Downloads This Week ═══\n'));

  const topToShow = topBooks.slice(0, 50);
  for (let i = 0; i < topToShow.length; i++) {
    const book = topToShow[i];
    const rank = pc.dim(`${(i + 1).toString().padStart(2)}.`);
    const idStr = pc.yellow(book.id.toString().padStart(6));
    const downloads = pc.green(`${book.downloads?.toLocaleString() || '?'} dl`);
    const title = book.title.length > 40 ? book.title.slice(0, 37) + '...' : book.title;
    console.log(`  ${rank} ${idStr}  ${pc.cyan(title)} ${pc.dim('—')} ${downloads}`);
  }
}

// Helper function to fetch classics bookshelf
interface ClassicsResult {
  unique: GutenbergBook[];
  totalFound: number;
  nonEnglishFiltered: number;
  duplicateCount: number;
}

async function fetchClassicsSection(existingIds: Set<number>): Promise<ClassicsResult> {
  console.log(pc.bold('\n═══ Classics of Literature Bookshelf ═══\n'));

  const classicsSpinner = ora('Fetching Classics of Literature bookshelf (all pages)...').start();

  let result: ClassicsResult = { unique: [], totalFound: 0, nonEnglishFiltered: 0, duplicateCount: 0 };

  try {
    const allClassics = await fetchAllBookshelfPages(CLASSICS_BOOKSHELF_URL);
    result.totalFound = allClassics.length;

    const newClassics: GutenbergBook[] = [];
    for (const book of allClassics) {
      if (existingIds.has(book.id)) {continue;}

      if (isEnglish(book)) {
        newClassics.push(book);
      } else {
        result.nonEnglishFiltered++;
      }
    }

    const { unique, duplicateCount } = removeDuplicates(newClassics);
    result.unique = unique;
    result.duplicateCount = duplicateCount;

    classicsSpinner.succeed(
      pc.green(`Found ${result.totalFound} classics, ${unique.length} new English`),
    );
  } catch {
    classicsSpinner.fail(pc.red('Failed to fetch classics bookshelf'));
  }

  return result;
}

// Helper to run validation on books
async function runValidation(booksToValidate: GutenbergBook[]): Promise<ValidationResult[]> {
  const validationBar = new cliProgress.SingleBar({
    format: `Validating ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total} | ${pc.dim('{title}')}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });

  validationBar.start(booksToValidate.length, 0, { title: 'Starting...' });

  const results: ValidationResult[] = [];

  for (let i = 0; i < booksToValidate.length; i++) {
    const book = booksToValidate[i];
    const shortTitle = book.title.length > 30 ? book.title.slice(0, 27) + '...' : book.title;
    validationBar.update(i, { title: shortTitle });

    const result = await validateBook(book);
    results.push(result);

    await new Promise((resolve) => { setTimeout(resolve, 500); });
  }

  validationBar.update(booksToValidate.length, { title: pc.green('Complete') });
  validationBar.stop();

  return results;
}

// Helper to display a single validation result
function displayValidationResult(r: ValidationResult): void {
  const status = r.success ? pc.green('✓') : pc.red('✗');
  const idStr = r.success
    ? pc.yellow(r.id.toString().padStart(6))
    : pc.dim(r.id.toString().padStart(6));
  const title = r.title.length > 45 ? r.title.slice(0, 42) + '...' : r.title;
  const titleStr = r.success ? pc.cyan(title) : pc.dim(title);

  if (r.success) {
    console.log(`  ${status} ${idStr}  ${titleStr}`);
    console.log(`           ${pc.dim(`${r.validChapters} chapters via ${r.patternUsed || 'none'}`)}`);
  } else {
    const reason = r.error || `${r.validChapters}/${r.totalChapters} chapters`;
    console.log(`  ${status} ${idStr}  ${titleStr} ${pc.red(`(${reason})`)}`);
  }
}

// Helper to display validated book IDs table
function displayValidatedBookIds(passed: ValidationResult[]): void {
  if (passed.length === 0) {
    return;
  }

  console.log(pc.bold('\n═══ Validated Book IDs for book-ids.ts ═══\n'));

  const idCol = 'ID'.padStart(6);
  const titleCol = 'Title'.padEnd(45);
  const chapCol = 'Ch'.padStart(3);
  const patternCol = 'Pattern';
  console.log(pc.dim(`  ${idCol}  ${titleCol}  ${chapCol}  ${patternCol}`));
  console.log(pc.dim(`  ${'─'.repeat(6)}  ${'─'.repeat(45)}  ${'─'.repeat(3)}  ${'─'.repeat(20)}`));

  const sortedPassed = [...passed].sort((a, b) => a.id - b.id);
  for (const r of sortedPassed) {
    const id = pc.yellow(r.id.toString().padStart(6));
    const title = r.title.length > 45 ? r.title.slice(0, 42) + '...' : r.title.padEnd(45);
    const chapters = pc.green(r.validChapters.toString().padStart(3));
    const pattern = pc.dim(r.patternUsed || 'none');
    console.log(`  ${id}  ${pc.cyan(title)}  ${chapters}  ${pattern}`);
  }

  console.log(pc.dim('\n// Copy-paste IDs:'));
  const passedIds = sortedPassed.map((r) => r.id);
  for (let i = 0; i < passedIds.length; i += 10) {
    const chunk = passedIds.slice(i, i + 10);
    console.log(pc.yellow(chunk.join(', ') + ','));
  }
}

async function main() {
  console.log(pc.bold('\n🏛️  Project Gutenberg Book Crawler\n'));

  const skipValidation = options.skipValidation ?? false;
  const limit = options.limit ? Number.parseInt(options.limit, 10) : undefined;
  const existingIds = new Set(BOOK_IDS);

  console.log(`${pc.dim('Collection:')}    ${pc.cyan(String(existingIds.size))} books already in your library`);
  console.log(`${pc.dim('Validation:')}    ${skipValidation ? pc.yellow('skipped') : pc.green('enabled')}`);

  if (limit) {
    console.log(`${pc.dim('Limit:')}         ${pc.cyan(String(limit))} books`);
  }
  console.log();

  // Fetch top downloads and classics
  const topBooks = await fetchTopBooksSection(existingIds);
  const classics = await fetchClassicsSection(existingIds);

  // Display discovery summary
  console.log(pc.bold('\n═══ Discovery Summary ═══\n'));
  console.log(`${pc.dim('Classics found:')}   ${pc.cyan(String(classics.totalFound))} books`);
  console.log(`${pc.dim('Non-English:')}      ${pc.yellow(String(classics.nonEnglishFiltered))} filtered`);
  console.log(`${pc.dim('Duplicates:')}       ${pc.yellow(String(classics.duplicateCount))} removed`);
  console.log(`${pc.dim('Top downloads:')}    ${pc.cyan(String(topBooks.length))} new`);
  console.log(`${pc.dim('Classics unique:')} ${pc.green(String(classics.unique.length))} works`);

  if (skipValidation) {
    outputBookIds('Top Downloads', topBooks);
    outputBookIds('Classical Books', classics.unique);
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    return;
  }

  // Prepare books for validation
  const allBooksToValidate = [...topBooks, ...classics.unique];
  const booksToValidate = limit ? allBooksToValidate.slice(0, limit) : allBooksToValidate;

  if (booksToValidate.length === 0) {
    console.log(pc.yellow('\n⚠️  No books to validate'));
    console.log(pc.bold(pc.green('\n✨ Done!\n')));
    return;
  }

  console.log(pc.bold('\n═══ Validating Chapter Extraction ═══\n'));
  console.log(`${pc.dim('Books to validate:')} ${pc.cyan(String(booksToValidate.length))}`);
  console.log(`${pc.dim('Min chapters:')}      ${pc.cyan(String(MIN_VALID_CHAPTERS))}\n`);

  const validationResults = await runValidation(booksToValidate);

  // Display results
  const passed = validationResults.filter((r) => r.success);
  const failed = validationResults.filter((r) => !r.success);

  console.log(pc.bold('\n═══ Validation Results ═══\n'));
  console.log(`${pc.green('✓ Passed:')} ${passed.length}`);
  console.log(`${pc.red('✗ Failed:')} ${failed.length}`);

  console.log(pc.bold('\n═══ All Validated Books ═══\n'));
  const allResults = [...validationResults].sort((a, b) => a.id - b.id);
  for (const r of allResults) {
    displayValidationResult(r);
  }

  displayValidatedBookIds(passed);
  console.log(pc.bold(pc.green('\n✨ Done!\n')));
}

function outputBookIds(label: string, books: GutenbergBook[]) {
  if (books.length === 0) {
    return;
  }

  console.log(pc.bold(`\n═══ ${label} IDs for book-ids.ts ═══\n`));
  console.log(pc.dim('// Books discovered (not validated):'));

  const ids = books.map((b) => b.id).sort((a, b) => a - b);
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    console.log(pc.yellow(chunk.join(', ') + ','));
  }
}

main().catch((error) => {
  console.error(pc.red('\n✗ Fatal error:'), error);
  process.exit(1);
});
