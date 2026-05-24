import type {
  BookValue,
  BookValueWithChapters,
  ChapterValue,
  ChapterWithBook,
  ExtractionMethod,
  HaikuValue,
} from '~/shared/types';
import {
  cleanVerses,
  extractContextVerses,
} from '~/shared/helpers/HaikuHelper';
import {
  calculateHaikuQuality,
  type QualityMetrics,
} from '~/shared/constants/validation';

export interface ChunkContext {
  filterWords: string[];
  maxAttemptsInBook: number;
  getBookFromPool: () => Promise<BookValueWithChapters>;
  selectRandomChapter: (book: BookValueWithChapters) => ChapterValue;
  getVerses: (chapter: ChapterValue) => {
    verses: string[];
    indices: number[];
    totalQuotes: number;
  };
  verseContainsFilterWord: (verses: string[]) => boolean;
}

export interface ChunkResult {
  verses: string[];
  indices: number[];
  totalQuotes: number;
  chapter: ChapterValue;
  book: BookValueWithChapters;
  nextIteration: number;
}

/**
 * Process a chunk of haiku-extraction iterations. Returns as soon as a chunk
 * yields at least 3 verses, otherwise returns the (empty) state for the next
 * outer attempt.
 */
export async function processChunk(
  chapters: ChapterWithBook[],
  currentBook: BookValueWithChapters | null,
  startIteration: number,
  chunkSize: number,
  ctx: ChunkContext,
): Promise<ChunkResult> {
  let verses: string[] = [];
  let indices: number[] = [];
  let totalQuotes = 0;
  let book: BookValueWithChapters | null = currentBook;
  let chapter: ChapterValue | ChapterWithBook | null = null;

  for (let i = 0; i < chunkSize; i++) {
    const currentIteration = startIteration + i;

    if (chapters.length > 0) {
      const randomIndex = Math.floor(Math.random() * chapters.length);
      const selectedChapter = chapters[randomIndex]!;
      chapter = selectedChapter;
      book = selectedChapter.book;
    }

    if (chapters.length === 0) {
      if (!book) {
        book = await ctx.getBookFromPool();
      }
      chapter = ctx.selectRandomChapter(book);
    }

    const result = ctx.getVerses(chapter!);
    verses = result.verses;
    indices = result.indices;
    totalQuotes = result.totalQuotes;

    if (
      ctx.filterWords.length > 0 &&
      !ctx.verseContainsFilterWord(verses)
    ) {
      verses = [];
      indices = [];
    }

    if (verses.length >= 3) {
      return {
        book: book!,
        chapter: chapter!,
        nextIteration: currentIteration + 1,
        verses,
        indices,
        totalQuotes,
      };
    }

    if (currentIteration % ctx.maxAttemptsInBook === 0) {
      book = await ctx.getBookFromPool();
    }
  }

  return {
    book: book!,
    chapter: chapter!,
    nextIteration: startIteration + chunkSize,
    verses,
    indices,
    totalQuotes,
  };
}

export interface BuildHaikuOptions {
  executionStartMs: number;
  lastExtractionMethod: ExtractionMethod;
  calculateQualityMetrics: (
    verses: string[],
    verseIndices: number[],
    totalQuotes: number,
  ) => QualityMetrics;
}

/**
 * Build a HaikuValue from extracted verses + chapter/book + scoring helpers.
 */
export function buildHaiku(
  book: BookValue,
  chapter: ChapterValue,
  verses: string[],
  indices: number[],
  totalQuotes: number,
  options: BuildHaikuOptions,
): HaikuValue {
  const executionTime = (Date.now() - options.executionStartMs) / 1000;
  const cleanedVerses = cleanVerses(verses);

  return {
    book: {
      reference: book.reference,
      title: book.title,
      author: book.author,
      emoticons: book.emoticons,
    },
    cacheUsed: false,
    chapter,
    context: extractContextVerses(verses, chapter.content),
    executionTime,
    rawVerses: verses,
    verses: cleanedVerses,
    quality: calculateHaikuQuality(
      cleanedVerses,
      options.calculateQualityMetrics(cleanedVerses, indices, totalQuotes),
    ),
    extractionMethod: options.lastExtractionMethod,
  };
}

export function selectRandomChapter(book: BookValueWithChapters): ChapterValue {
  const chapters = (book.chapters ?? []) as ChapterValue[];

  return chapters[Math.floor(Math.random() * chapters.length)]!;
}

export interface BuildLoopConfig {
  maxAttempts: number;
  chunkSize: number;
  filterWords: string[];
  getFilteredChapters: (words: string[]) => Promise<ChapterWithBook[]>;
  getBookFromPool: () => Promise<BookValueWithChapters>;
  chunkCtx: ChunkContext;
  onMaxAttempts: (versesFound: number) => never;
}

export interface BuildLoopResult {
  book: BookValueWithChapters;
  chapter: ChapterValue;
  verses: string[];
  indices: number[];
  totalQuotes: number;
}

/**
 * Drive the iterative chunked extraction loop. Yields between chunks so the
 * event loop can stay responsive. Throws (via onMaxAttempts) if no haiku is
 * found within the budget.
 */
export async function runBuildLoop(
  cfg: BuildLoopConfig,
): Promise<BuildLoopResult> {
  let verses: string[] = [];
  let book: BookValueWithChapters | null = null;
  let chapter: ChapterValue | null = null;
  let chapters: ChapterWithBook[] = [];
  let indices: number[] = [];
  let totalQuotes = 0;
  let i = 1;

  if (cfg.filterWords.length > 0) {
    chapters = await cfg.getFilteredChapters(cfg.filterWords);
  }

  if (chapters.length === 0) {
    book = await cfg.getBookFromPool();
  }

  while (verses.length < 3 && i < cfg.maxAttempts) {
    const chunkResult = await processChunk(
      chapters,
      book,
      i,
      Math.min(cfg.chunkSize, cfg.maxAttempts - i + 1),
      cfg.chunkCtx,
    );

    verses = chunkResult.verses;
    indices = chunkResult.indices;
    totalQuotes = chunkResult.totalQuotes;
    chapter = chunkResult.chapter;
    book = chunkResult.book;
    i = chunkResult.nextIteration;

    if (verses.length >= 3) {
      break;
    }

    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });
  }

  if (verses.length < 3) {
    cfg.onMaxAttempts(verses.length);
  }

  return {
    book: book!,
    chapter: chapter!,
    verses,
    indices,
    totalQuotes,
  };
}
