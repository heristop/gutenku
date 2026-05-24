/**
 * Book validation and discovery section helpers for fetch-gutenberg-classics CLI.
 */
import pc from 'picocolors';
import cliProgress from 'cli-progress';
import ora from 'ora';
import { ChapterSplitterService } from '~/domain/services/ChapterSplitterService';
import { ChapterValidatorService } from '~/domain/services/ChapterValidatorService';
import { isEnglish } from './gutenberg-classics-filters';
import {
  type GutenbergBook,
  extractTopBooksFromHtml,
  fetchAllBookshelfPages,
  fetchPage,
  removeDuplicates,
} from './fetch-gutenberg-classics-parsers';

export interface ValidationResult {
  id: number;
  title: string;
  author: string;
  success: boolean;
  patternUsed: string | null;
  validChapters: number;
  totalChapters: number;
  error?: string;
}

export interface ClassicsResult {
  unique: GutenbergBook[];
  totalFound: number;
  nonEnglishFiltered: number;
  duplicateCount: number;
}

const CLASSICS_BOOKSHELF_URL = 'https://www.gutenberg.org/ebooks/bookshelf/649';
const GUTENBERG_TOP_URL = 'https://www.gutenberg.org/browse/scores/top';
const GUTENBERG_BOOK_URL = 'https://www.gutenberg.org/cache/epub';

export const MIN_VALID_CHAPTERS = 8;

const splitter = new ChapterSplitterService();
const validator = new ChapterValidatorService();

/**
 * Fetch book text and validate chapter extraction.
 */
export async function validateBook(
  book: GutenbergBook,
): Promise<ValidationResult> {
  try {
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
    const splitResult = splitter.splitContent(content);
    const validationResult = validator.validate(splitResult.chapters);
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
    const title =
      book.title.length > 40 ? book.title.slice(0, 37) + '...' : book.title;
    console.log(
      `  ${rank} ${idStr}  ${pc.cyan(title)} ${pc.dim('—')} ${downloads}`,
    );
  }
}

// Helper function to fetch and filter top books
export async function fetchTopBooksSection(
  existingIds: Set<number>,
): Promise<GutenbergBook[]> {
  const topBooks: GutenbergBook[] = [];
  const topSpinner = ora('Fetching top downloads of the week...').start();

  try {
    const topHtml = await fetchPage(GUTENBERG_TOP_URL);
    const allTopBooks = extractTopBooksFromHtml(topHtml);

    for (const book of allTopBooks) {
      if (!existingIds.has(book.id) && isEnglish(book.title)) {
        topBooks.push(book);
      }
    }

    topSpinner.succeed(
      pc.green(
        `Found ${allTopBooks.length} top books, ${topBooks.length} new English`,
      ),
    );

    displayTopBooks(topBooks);
  } catch {
    topSpinner.fail(pc.red('Failed to fetch top downloads'));
  }

  return topBooks;
}

// Helper function to fetch classics bookshelf
export async function fetchClassicsSection(
  existingIds: Set<number>,
): Promise<ClassicsResult> {
  console.log(pc.bold('\n═══ Classics of Literature Bookshelf ═══\n'));

  const classicsSpinner = ora(
    'Fetching Classics of Literature bookshelf (all pages)...',
  ).start();

  const result: ClassicsResult = {
    unique: [],
    totalFound: 0,
    nonEnglishFiltered: 0,
    duplicateCount: 0,
  };

  try {
    const allClassics = await fetchAllBookshelfPages(CLASSICS_BOOKSHELF_URL);
    result.totalFound = allClassics.length;

    const newClassics: GutenbergBook[] = [];

    for (const book of allClassics) {
      if (existingIds.has(book.id)) {
        continue;
      }

      if (!isEnglish(book.title)) {
        result.nonEnglishFiltered++;
        continue;
      }

      newClassics.push(book);
    }

    const { unique, duplicateCount } = removeDuplicates(newClassics);
    result.unique = unique;
    result.duplicateCount = duplicateCount;

    classicsSpinner.succeed(
      pc.green(
        `Found ${result.totalFound} classics, ${unique.length} new English`,
      ),
    );
  } catch {
    classicsSpinner.fail(pc.red('Failed to fetch classics bookshelf'));
  }

  return result;
}

// Helper to run validation on books
export async function runValidation(
  booksToValidate: GutenbergBook[],
): Promise<ValidationResult[]> {
  const validationBar = new cliProgress.SingleBar({
    format: `Validating ${pc.cyan('{bar}')} ${pc.yellow('{percentage}%')} | {value}/{total} | ${pc.dim('{title}')}`,
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
  });

  validationBar.start(booksToValidate.length, 0, { title: 'Starting...' });

  const results: ValidationResult[] = [];

  for (let i = 0; i < booksToValidate.length; i++) {
    const book = booksToValidate[i];
    const shortTitle =
      book.title.length > 30 ? book.title.slice(0, 27) + '...' : book.title;
    validationBar.update(i, { title: shortTitle });

    const result = await validateBook(book);
    results.push(result);

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }

  validationBar.update(booksToValidate.length, { title: pc.green('Complete') });
  validationBar.stop();

  return results;
}
