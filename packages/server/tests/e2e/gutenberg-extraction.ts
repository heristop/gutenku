import 'reflect-metadata';
import { describe, expect, it, beforeAll } from 'vitest';
import { container } from 'tsyringe';
import { GutenbergClient } from '../../src/infrastructure/external/GutenbergClient';
import { BookParserService } from '../../src/domain/services/BookParserService';
import { BookMetadataExtractorService } from '../../src/domain/services/BookMetadataExtractorService';
import { ChapterSplitterService } from '../../src/domain/services/ChapterSplitterService';
import { ChapterValidatorService } from '../../src/domain/services/ChapterValidatorService';

/**
 * E2E tests for Gutenberg book extraction.
 * These tests fetch real books from Project Gutenberg and validate the extraction pipeline.
 *
 * Note: These tests require network access and may be slow.
 * Run with: pnpm test tests/e2e/gutenberg-extraction.ts
 */
describe('Gutenberg E2E Extraction', () => {
  let client: GutenbergClient;
  let parser: BookParserService;

  beforeAll(() => {
    // Register services
    container.registerSingleton(BookMetadataExtractorService);
    container.registerSingleton(ChapterSplitterService);
    container.registerSingleton(ChapterValidatorService);
    container.registerSingleton(BookParserService);

    client = new GutenbergClient();
    parser = container.resolve(BookParserService);
  });

  describe('GutenbergClient', () => {
    it('fetches Alice in Wonderland (book 11)', async () => {
      const content = await client.fetchBook(11);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(10000);
      expect(content).toContain('Alice');
      expect(content).toContain('Wonderland');
    }, 30000);

    it('checks availability of existing book', async () => {
      const available = await client.isAvailable(11);

      expect(available).toBeTruthy();
    }, 10000);

    it('checks availability of non-existing book', async () => {
      const available = await client.isAvailable(999999999);

      expect(available).toBeFalsy();
    }, 10000);
  });

  describe('Full Extraction Pipeline', () => {
    // Test cases: [gutenbergId, expectedTitle, expectedAuthor, minChapters]
    const testBooks = [
      {
        id: 11,
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        minChapters: 10,
        description: 'Classic novel with clear chapter structure',
      },
      {
        id: 1342,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        minChapters: 50,
        description: 'Novel with many chapters',
      },
      {
        id: 84,
        title: 'Frankenstein',
        author: 'Mary Wollstonecraft Shelley',
        minChapters: 20,
        description: 'Novel with letter and chapter structure',
      },
    ];

    for (const book of testBooks) {
      describe(`Book ${book.id}: ${book.description}`, () => {
        let content: string;
        let parseResult: ReturnType<typeof parser.parseContent>;

        beforeAll(async () => {
          content = await client.fetchBook(book.id);
          parseResult = parser.parseContent(content, book.id, {
            validation: { minChapters: 1 },
          });
        }, 30000);

        it('fetches book content', () => {
          expect(content).toBeDefined();
          expect(content.length).toBeGreaterThan(1000);
        });

        it('extracts title correctly', () => {
          expect(parseResult.parsedBook?.metadata.title).toContain(
            book.title.split(' ')[0], // First word of title
          );
        });

        it('extracts author correctly', () => {
          expect(parseResult.parsedBook?.metadata.author).toContain(
            book.author.split(' ')[0], // First word of author
          );
        });

        it('produces valid chapters', () => {
          expect(parseResult.isValid).toBeTruthy();
          expect(parseResult.stats.validChapterCount).toBeGreaterThanOrEqual(
            book.minChapters,
          );
        });

        it('chapters have content', () => {
          const chapters = parseResult.parsedBook?.chapters ?? [];
          for (const chapter of chapters) {
            expect(chapter.content.length).toBeGreaterThan(100);
          }
        });

        it('removes Gutenberg footer from content', () => {
          const chapters = parseResult.parsedBook?.chapters ?? [];
          const lastChapter = chapters.at(-1);
          expect(lastChapter?.content).not.toContain(
            '*** END OF THE PROJECT GUTENBERG',
          );
        });
      });
    }
  });

  describe('Edge Cases', () => {
    it('handles book with unusual chapter patterns', async () => {
      // The Adventures of Sherlock Holmes - uses "ADVENTURE" as chapter marker
      const content = await client.fetchBook(1661);
      const result = parser.parseContent(content, 1661, {
        validation: { minChapters: 1 },
      });

      expect(result.isValid).toBeTruthy();
      expect(result.stats.validChapterCount).toBeGreaterThan(5);
    }, 30000);

    it('handles poetry (Divine Comedy)', async () => {
      const content = await client.fetchBook(8800);
      const result = parser.parseContent(content, 8800, {
        validation: { minChapters: 1 },
      });

      expect(result.isValid).toBeTruthy();
      // Poetry may have fewer valid chapters due to paragraph structure
      expect(result.stats.validChapterCount).toBeGreaterThan(0);
      expect(result.patternUsed?.name).toMatch(/CANTO/i);
    }, 30000);

    it('extracts multi-line metadata', async () => {
      // War and Peace - may have complex metadata
      const content = await client.fetchBook(2600);
      const result = parser.parseContent(content, 2600, {
        validation: { minChapters: 1 },
      });

      expect(result.parsedBook?.metadata.title).toBeDefined();
      expect(result.parsedBook?.metadata.author).toBeDefined();
    }, 30000);
  });

  describe('Error Handling', () => {
    it('throws on non-existent book', async () => {
      await expect(client.fetchBook(999999999)).rejects.toThrow();
    }, 30000);
  });
});
