import { describe, it, expect, beforeAll } from 'vitest';
import 'reflect-metadata';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BookParserService,
  type ParsingResult,
} from '~/domain/services/BookParserService';
import { BookMetadataExtractorService } from '~/domain/services/BookMetadataExtractorService';
import { ChapterSplitterService } from '~/domain/services/ChapterSplitterService';
import { ChapterValidatorService } from '~/domain/services/ChapterValidatorService';
import { RawBookText } from '~/domain/value-objects';

/**
 * Golden Tests - Regression testing for book parsing
 *
 * These tests verify that the TypeScript implementation produces
 * consistent and expected results for known books.
 */

interface GoldenTestCase {
  bookId: number;
  title: string;
  author: string;
  minChapters: number;
  maxChapters: number;
  description: string;
}

const GOLDEN_TEST_CASES: GoldenTestCase[] = [
  {
    bookId: 11,
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    minChapters: 10,
    maxChapters: 15,
    description: 'Classic story with CHAPTER numbering',
  },
  {
    bookId: 345,
    title: 'Dracula',
    author: 'Bram Stoker',
    minChapters: 20,
    maxChapters: 30,
    description: 'Novel with CHAPTER numbering',
  },
  {
    bookId: 1184,
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    // The novel has 117 chapters - now correctly extracted with indentation support
    minChapters: 100,
    maxChapters: 120,
    description: 'Very long novel with many chapters',
  },
  {
    bookId: 8800,
    title: 'The divine comedy',
    author: 'Dante Alighieri',
    // With correct paragraph counting (blank-line separated), poetry has fewer "paragraphs"
    // The Divine Comedy has ~100 cantos but many have sparse blank-line-separated sections
    minChapters: 45,
    maxChapters: 60,
    description: 'Uses Canto pattern for splitting',
  },
];

describe('Golden Tests - Book Parsing Regression', () => {
  const dataDir = path.resolve(__dirname, '../../data');

  const createParser = () => {
    const metadataExtractor = new BookMetadataExtractorService();
    const chapterSplitter = new ChapterSplitterService();
    const chapterValidator = new ChapterValidatorService();
    return new BookParserService(
      metadataExtractor,
      chapterSplitter,
      chapterValidator,
    );
  };

  const parseBook = (bookId: number): ParsingResult | null => {
    const filePath = path.join(dataDir, `book_${bookId}.txt`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const rawBookText = RawBookText.create({ content, gutenbergId: bookId });
    return createParser().parse(rawBookText);
  };

  GOLDEN_TEST_CASES.forEach((testCase) => {
    const filePath = path.join(dataDir, `book_${testCase.bookId}.txt`);
    const fileExists = fs.existsSync(filePath);

    describe.skipIf(!fileExists)(
      `Book ${testCase.bookId} - ${testCase.description}`,
      () => {
        it('extracts correct title', () => {
          const result = parseBook(testCase.bookId);
          expect(result?.parsedBook?.metadata.title).toBe(testCase.title);
        });

        it('extracts correct author', () => {
          const result = parseBook(testCase.bookId);
          expect(result?.parsedBook?.metadata.author).toBe(testCase.author);
        });

        it(`produces between ${testCase.minChapters} and ${testCase.maxChapters} chapters`, () => {
          const result = parseBook(testCase.bookId);
          expect(result?.stats.validChapterCount).toBeGreaterThanOrEqual(
            testCase.minChapters,
          );
          expect(result?.stats.validChapterCount).toBeLessThanOrEqual(
            testCase.maxChapters,
          );
        });

        it('produces valid parsedBook', () => {
          const result = parseBook(testCase.bookId);
          expect(result?.parsedBook?.gutenbergId).toBe(testCase.bookId);
          expect(result?.isValid).toBeTruthy();
        });

        it('all chapters have content', () => {
          const result = parseBook(testCase.bookId);
          result?.parsedBook?.chapters.forEach((chapter) => {
            expect(chapter.content.length).toBeGreaterThan(100);
            expect(chapter.paragraphCount).toBeGreaterThanOrEqual(10);
          });
        });
      },
    );
  });
});

describe('Book Parser - Pattern Matching Verification', () => {
  let parser: BookParserService;
  const dataDir = path.resolve(__dirname, '../../data');

  beforeAll(() => {
    const metadataExtractor = new BookMetadataExtractorService();
    const chapterSplitter = new ChapterSplitterService();
    const chapterValidator = new ChapterValidatorService();
    parser = new BookParserService(
      metadataExtractor,
      chapterSplitter,
      chapterValidator,
    );
  });

  const aliceFilePath = path.join(dataDir, 'book_11.txt');
  const aliceFileExists = fs.existsSync(aliceFilePath);

  it.skipIf(!aliceFileExists)(
    'processes Alice in Wonderland consistently',
    () => {
      const content = fs.readFileSync(aliceFilePath, 'utf-8');
      const rawBookText = RawBookText.create({ content, gutenbergId: 11 });

      // Run parser multiple times to verify consistency
      const results = Array.from({ length: 3 }, () =>
        parser.parse(rawBookText),
      );

      // All results should be identical
      expect(results[0].stats.validChapterCount).toBe(
        results[1].stats.validChapterCount,
      );
      expect(results[1].stats.validChapterCount).toBe(
        results[2].stats.validChapterCount,
      );
      expect(results[0].parsedBook?.metadata.title).toBe(
        results[1].parsedBook?.metadata.title,
      );
    },
  );

  it.skipIf(!aliceFileExists)('filters out Gutenberg template sections', () => {
    const content = fs.readFileSync(aliceFilePath, 'utf-8');
    const rawBookText = RawBookText.create({ content, gutenbergId: 11 });
    const result = parser.parse(rawBookText);

    // No chapter should contain "GUTENBERG"
    result.parsedBook?.chapters.forEach((chapter) => {
      expect(chapter.content.toUpperCase()).not.toContain('GUTENBERG');
    });
  });
});

describe('Book Parser - Edge Cases', () => {
  let parser: BookParserService;

  beforeAll(() => {
    const metadataExtractor = new BookMetadataExtractorService();
    const chapterSplitter = new ChapterSplitterService();
    const chapterValidator = new ChapterValidatorService();
    parser = new BookParserService(
      metadataExtractor,
      chapterSplitter,
      chapterValidator,
    );
  });

  it('handles book with no chapters gracefully', () => {
    const content = `Title: Empty Book
Author: Test Author

This book has no chapters, just continuous text.
The text continues without any chapter markers.
`;
    const rawBookText = RawBookText.create({ content, gutenbergId: 99999 });
    const result = parser.parse(rawBookText);

    // With no chapter markers, the parsing may fail or produce invalid result
    expect(result.isValid).toBeFalsy();
  });

  it('handles book with mixed chapter patterns', () => {
    // Create content with CHAPTER pattern - each chapter needs 10+ paragraphs
    const makeParagraphs = (count: number) =>
      Array(count)
        .fill(
          'This is a paragraph with enough content to pass validation. '.repeat(
            5,
          ),
        )
        .join('\n\n');

    const content = `Title: Mixed Pattern Book
Author: Test Author


CHAPTER I

${makeParagraphs(12)}


CHAPTER II

${makeParagraphs(12)}


CHAPTER III

${makeParagraphs(12)}


CHAPTER IV

${makeParagraphs(12)}


CHAPTER V

${makeParagraphs(12)}


CHAPTER VI

${makeParagraphs(12)}


CHAPTER VII

${makeParagraphs(12)}


CHAPTER VIII

${makeParagraphs(12)}


CHAPTER IX

${makeParagraphs(12)}
`;

    const rawBookText = RawBookText.create({ content, gutenbergId: 99998 });
    const result = parser.parse(rawBookText);

    expect(result.parsedBook?.metadata.title).toBe('Mixed Pattern Book');
    expect(result.stats.validChapterCount).toBeGreaterThanOrEqual(8);
    expect(result.isValid).toBeTruthy();
  });
});
