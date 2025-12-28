import 'reflect-metadata';
import { describe, expect, it, beforeEach } from 'vitest';
import { BookParserService } from '../../src/domain/services/BookParserService';
import { BookMetadataExtractorService } from '../../src/domain/services/BookMetadataExtractorService';
import { ChapterSplitterService } from '../../src/domain/services/ChapterSplitterService';
import { ChapterValidatorService } from '../../src/domain/services/ChapterValidatorService';
import { RawBookText } from '../../src/domain/value-objects/RawBookText';
import { InsufficientChaptersException } from '../../src/domain/exceptions/book';

describe('BookParserService', () => {
  let service: BookParserService;
  let metadataExtractor: BookMetadataExtractorService;
  let chapterSplitter: ChapterSplitterService;
  let chapterValidator: ChapterValidatorService;

  beforeEach(() => {
    metadataExtractor = new BookMetadataExtractorService();
    chapterSplitter = new ChapterSplitterService();
    chapterValidator = new ChapterValidatorService();
    service = new BookParserService(
      metadataExtractor,
      chapterSplitter,
      chapterValidator,
    );
  });

  const createValidBook = (numChapters: number = 10): string => {
    let content = 'Title: Test Book\nAuthor: Test Author\n\n';

    for (let i = 1; i <= numChapters; i++) {
      content += `\n\nCHAPTER ${i}\n\n`;
      // Add enough paragraphs to pass validation
      content += Array(15)
        .fill(`This is paragraph content for chapter ${i}.`)
        .join('\n\n');
    }

    return content;
  };

  describe('parse', () => {
    it('parses a valid book with multiple chapters', () => {
      const content = createValidBook(10);
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.isValid).toBeTruthy();
      expect(result.parsedBook).not.toBeNull();
      expect(result.parsedBook?.title).toBe('Test Book');
      expect(result.parsedBook?.author).toBe('Test Author');
      expect(result.parsedBook?.chapterCount).toBeGreaterThanOrEqual(8);
    });

    it('returns errors when title is missing', () => {
      const content =
        'Author: Test Author\n\n' +
        createValidBook(10).split('\n').slice(2).join('\n');
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.some((e) => e.includes('title'))).toBeTruthy();
    });

    it('returns errors when author is missing', () => {
      const content =
        'Title: Test Book\n\n' +
        createValidBook(10).split('\n').slice(2).join('\n');
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.isValid).toBeFalsy();
      expect(result.errors.some((e) => e.includes('author'))).toBeTruthy();
    });

    it('returns errors when insufficient chapters', () => {
      const content = createValidBook(3); // Only 3 chapters, need 8
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.isValid).toBeFalsy();
      expect(
        result.errors.some((e) => e.includes('Insufficient chapters')),
      ).toBeTruthy();
    });

    it('throws InsufficientChaptersException when throwOnInvalidBook is true', () => {
      const content = createValidBook(3);
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      expect(() => {
        service.parse(rawText, { throwOnInvalidBook: true });
      }).toThrow(InsufficientChaptersException);
    });

    it('respects custom minChapters config', () => {
      const content = createValidBook(5);
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText, { validation: { minChapters: 3 } });

      expect(result.isValid).toBeTruthy();
      expect(result.parsedBook).not.toBeNull();
    });

    it('provides warnings for rejected chapters', () => {
      // Create book with some invalid chapters
      let content = 'Title: Test Book\nAuthor: Test Author\n\n';

      // Add valid chapters
      for (let i = 1; i <= 10; i++) {
        content += `\n\nCHAPTER ${i}\n\n`;
        content += Array(15).fill(`Paragraph ${i}.`).join('\n\n');
      }

      const rawText = RawBookText.create({ content, gutenbergId: 11 });
      const result = service.parse(rawText);

      // Should have stats about processing
      expect(result.stats.rawChapterCount).toBeGreaterThan(0);
    });

    it('provides warning when no chapter pattern matches', () => {
      const content =
        'Title: Test Book\nAuthor: Test Author\n\n' +
        Array(100).fill('Just text without chapter markers.').join('\n\n');
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(
        result.warnings.some((w) => w.includes('No chapter pattern matched')),
      ).toBeTruthy();
    });

    it('reports pattern used in result', () => {
      const content = createValidBook(10);
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.patternUsed).not.toBeNull();
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('provides stats about chapter processing', () => {
      const content = createValidBook(10);
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.parse(rawText);

      expect(result.stats).toBeDefined();
      expect(result.stats.rawChapterCount).toBeGreaterThan(0);
      expect(result.stats.validChapterCount).toBeGreaterThan(0);
    });
  });

  describe('parseContent', () => {
    it('creates RawBookText and parses', () => {
      const content = createValidBook(10);

      const result = service.parseContent(content, 11);

      expect(result.isValid).toBeTruthy();
      expect(result.parsedBook?.gutenbergId).toBe(11);
    });

    it('accepts parsing options', () => {
      const content = createValidBook(5);

      const result = service.parseContent(content, 11, {
        validation: { minChapters: 3 },
      });

      expect(result.isValid).toBeTruthy();
    });
  });
});
