import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ChapterSplitterService } from '../../src/domain/services/ChapterSplitterService';
import { RawBookText } from '../../src/domain/value-objects/RawBookText';

describe('ChapterSplitterService', () => {
  const service = new ChapterSplitterService();

  describe('chapter patterns', () => {
    it('matches CHAPTER with arabic numerals (CHAPTER 1)', () => {
      const content = `
Some preamble text.


CHAPTER 1

First chapter content here.


CHAPTER 2

Second chapter content here.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('matches CHAPTER with roman numerals (CHAPTER I)', () => {
      const content = `
Preamble.


CHAPTER I

First chapter.


CHAPTER II

Second chapter.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('matches CHAPTER with dots (CHAPTER.I.)', () => {
      const content = `
Preamble.


CHAPTER.I.

First chapter.


CHAPTER.II.

Second chapter.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
    });

    it('matches lowercase variants (Chapter i)', () => {
      const content = `
Preamble.


Chapter i

First chapter.


Chapter ii

Second chapter.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
    });

    it('matches BOOK divisions (BOOK I, BOOK 1)', () => {
      const content = `
Introduction.


BOOK I

First book content.


BOOK II

Second book content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('BOOK');
    });

    it('matches VOLUME divisions', () => {
      const content = `
Introduction.


VOLUME I

First volume content.


VOLUME II

Second volume content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('VOLUME');
    });

    it('matches CANTO divisions (Divine Comedy style)', () => {
      const content = `
Introduction.


CANTO I

Midway upon the journey of our life...


CANTO II

The day was going...
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('CANTO_UPPER');
    });

    it('matches PART divisions', () => {
      const content = `
Introduction.


PART I

First part content.


PART II

Second part content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('PART');
    });

    it('matches SECTION divisions', () => {
      const content = `
Introduction.


SECTION I

First section content.


SECTION II

Second section content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('SECTION');
    });

    it('matches LETTER divisions (epistolary novels)', () => {
      const content = `
Introduction.


LETTER I

Dear friend...


LETTER II

My dearest...
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('LETTER');
    });

    it('matches bare numeric chapter markers', () => {
      const content = `
Introduction.


1

First chapter content.


2

Second chapter content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('NUMERIC_ONLY');
    });

    it('matches bare roman numeral markers', () => {
      // Note: ROMAN_ONLY pattern is very broad and may be caught by other patterns
      // In practice, most books use more explicit markers
      const content = `
Preamble text here.


III

First chapter content.


IV

Second chapter content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      // Accept either ROMAN_ONLY or CUSTOM_PREFIX as both can match roman numerals
      expect(['ROMAN_ONLY', 'CUSTOM_PREFIX']).toContain(
        result.patternUsed?.name,
      );
    });
  });

  describe('splitContent', () => {
    it('uses first matching pattern and stops', () => {
      const content = `
Preamble.


CHAPTER 1

First chapter.


1

This should not be used as split point.
`;
      const result = service.splitContent(content);

      // Should use CHAPTER pattern, not bare numeric
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('returns original text when no pattern matches', () => {
      const content = 'Just some text without any chapter markers.';

      const result = service.splitContent(content);

      expect(result.chapters.length).toBe(1);
      expect(result.patternUsed).toBeNull();
    });

    it('requires 2+ newlines before chapter markers', () => {
      const content = `Some text.
CHAPTER 1
This should not split because only one newline before.`;

      const result = service.splitContent(content);

      expect(result.chapters.length).toBe(1);
      expect(result.patternUsed).toBeNull();
    });

    it('filters out empty segments', () => {
      const content = `


CHAPTER 1

Content.


CHAPTER 2

More content.
`;
      const result = service.splitContent(content);

      // Should not include empty strings
      result.chapters.forEach((chapter) => {
        expect(chapter.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('split with RawBookText', () => {
    it('accepts RawBookText value object', () => {
      const content = `
Title: Test Book
Author: Test Author


CHAPTER 1

First chapter content here with enough text.


CHAPTER 2

Second chapter content here with enough text.
`;
      const rawText = RawBookText.create({ content, gutenbergId: 123 });

      const result = service.split(rawText);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed).not.toBeNull();
    });
  });

  describe('getPatterns', () => {
    it('returns all 15 patterns', () => {
      const patterns = service.getPatterns();

      expect(patterns.length).toBe(15);
    });

    it('patterns have name and pattern properties', () => {
      const patterns = service.getPatterns();

      patterns.forEach((p) => {
        expect(p.name).toBeDefined();
        expect(p.pattern).toBeInstanceOf(RegExp);
      });
    });
  });
});
