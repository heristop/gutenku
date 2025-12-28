import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { BookMetadataExtractorService } from '../../src/domain/services/BookMetadataExtractorService';
import { RawBookText } from '../../src/domain/value-objects/RawBookText';
import { MetadataExtractionException } from '../../src/domain/exceptions/book';

describe('BookMetadataExtractorService', () => {
  const service = new BookMetadataExtractorService();

  describe('extractTitle', () => {
    it('extracts title from standard Gutenberg format', () => {
      const content =
        "Title: Alice's Adventures in Wonderland\nAuthor: Lewis Carroll\n";
      const title = service.extractTitle(content);
      expect(title).toBe("Alice's Adventures in Wonderland");
    });

    it('handles titles with special characters', () => {
      const content = 'Title: War & Peace: A Novel\nAuthor: Leo Tolstoy\n';
      const title = service.extractTitle(content);
      expect(title).toBe('War & Peace: A Novel');
    });

    it('handles titles with multiple words', () => {
      const content =
        'Title: The Count of Monte Cristo\nAuthor: Alexandre Dumas\n';
      const title = service.extractTitle(content);
      expect(title).toBe('The Count of Monte Cristo');
    });

    it('trims whitespace from extracted title', () => {
      const content = 'Title:   Moby Dick   \nAuthor: Herman Melville\n';
      const title = service.extractTitle(content);
      expect(title).toBe('Moby Dick');
    });

    it('returns null when title pattern not found', () => {
      const content = 'Some random text without title\n';
      const title = service.extractTitle(content);
      expect(title).toBeNull();
    });

    it('handles title with CRLF line endings', () => {
      const content = 'Title: Pride and Prejudice\r\nAuthor: Jane Austen\r\n';
      const title = service.extractTitle(content);
      expect(title).toBe('Pride and Prejudice');
    });
  });

  describe('extractAuthor', () => {
    it('extracts author from standard Gutenberg format', () => {
      const content =
        "Title: Alice's Adventures in Wonderland\nAuthor: Lewis Carroll\n";
      const author = service.extractAuthor(content);
      expect(author).toBe('Lewis Carroll');
    });

    it('handles authors with middle names', () => {
      const content = 'Title: The Great Gatsby\nAuthor: F. Scott Fitzgerald\n';
      const author = service.extractAuthor(content);
      expect(author).toBe('F. Scott Fitzgerald');
    });

    it('handles authors with suffixes', () => {
      const content = 'Title: Some Book\nAuthor: John Smith Jr.\n';
      const author = service.extractAuthor(content);
      expect(author).toBe('John Smith Jr.');
    });

    it('trims whitespace from extracted author', () => {
      const content = 'Title: Moby Dick\nAuthor:   Herman Melville   \n';
      const author = service.extractAuthor(content);
      expect(author).toBe('Herman Melville');
    });

    it('returns null when author pattern not found', () => {
      const content = 'Some random text without author\n';
      const author = service.extractAuthor(content);
      expect(author).toBeNull();
    });
  });

  describe('extract', () => {
    it('extracts complete metadata from valid Gutenberg text', () => {
      const content =
        "Title: Alice's Adventures in Wonderland\nAuthor: Lewis Carroll\n";
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const metadata = service.extract(rawText);

      expect(metadata.title).toBe("Alice's Adventures in Wonderland");
      expect(metadata.author).toBe('Lewis Carroll');
      expect(metadata.gutenbergId).toBe(11);
    });

    it('throws MetadataExtractionException when title is missing', () => {
      const content = 'Author: Lewis Carroll\n';
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      expect(() => service.extract(rawText)).toThrow(
        MetadataExtractionException,
      );
    });

    it('throws MetadataExtractionException when author is missing', () => {
      const content = "Title: Alice's Adventures in Wonderland\n";
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      expect(() => service.extract(rawText)).toThrow(
        MetadataExtractionException,
      );
    });

    it('throws MetadataExtractionException when both are missing', () => {
      const content = 'Some random text\n';
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      expect(() => service.extract(rawText)).toThrow(
        MetadataExtractionException,
      );
    });
  });

  describe('tryExtract', () => {
    it('returns both title and author when present', () => {
      const content = 'Title: Moby Dick\nAuthor: Herman Melville\n';
      const rawText = RawBookText.create({ content, gutenbergId: 2701 });

      const result = service.tryExtract(rawText);

      expect(result.title).toBe('Moby Dick');
      expect(result.author).toBe('Herman Melville');
    });

    it('returns null for missing fields without throwing', () => {
      const content = 'Some random text\n';
      const rawText = RawBookText.create({ content, gutenbergId: 11 });

      const result = service.tryExtract(rawText);

      expect(result.title).toBeNull();
      expect(result.author).toBeNull();
    });
  });
});
