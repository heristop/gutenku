import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ChapterValidatorService } from '../../src/domain/services/ChapterValidatorService';

describe('ChapterValidatorService', () => {
  const service = new ChapterValidatorService();

  describe('countParagraphs', () => {
    it('counts paragraphs by newline characters', () => {
      const content = `First paragraph.

Second paragraph.

Third paragraph.`;

      const count = service.countParagraphs(content);

      expect(count).toBe(3);
    });

    it('ignores empty lines when counting', () => {
      const content = `First paragraph.



Second paragraph.`;

      const count = service.countParagraphs(content);

      expect(count).toBe(2);
    });

    it('returns 0 for empty content', () => {
      const count = service.countParagraphs('');

      expect(count).toBe(0);
    });

    it('returns 0 for whitespace-only content', () => {
      const count = service.countParagraphs('   \n\n   \n   ');

      expect(count).toBe(0);
    });
  });

  describe('containsGutenbergTemplate', () => {
    it('detects GUTENBERG text (case insensitive)', () => {
      const content = 'Some text with PROJECT GUTENBERG boilerplate.';

      expect(service.containsGutenbergTemplate(content)).toBeTruthy();
    });

    it('detects lowercase gutenberg', () => {
      const content = 'Some text with gutenberg template.';

      expect(service.containsGutenbergTemplate(content)).toBeTruthy();
    });

    it('returns false when no Gutenberg text present', () => {
      const content = 'This is a normal chapter without any boilerplate.';

      expect(service.containsGutenbergTemplate(content)).toBeFalsy();
    });
  });

  describe('hasSufficientParagraphs', () => {
    it('returns true for chapters with >= minParagraphs', () => {
      const content = Array(15).fill('Paragraph content.').join('\n\n');

      expect(service.hasSufficientParagraphs(content, 10)).toBeTruthy();
    });

    it('returns false for chapters with < minParagraphs', () => {
      const content = Array(5).fill('Paragraph content.').join('\n\n');

      expect(service.hasSufficientParagraphs(content, 10)).toBeFalsy();
    });

    it('returns true when exactly at minParagraphs', () => {
      const content = Array(10).fill('Paragraph content.').join('\n\n');

      expect(service.hasSufficientParagraphs(content, 10)).toBeTruthy();
    });
  });

  describe('validateChapter', () => {
    it('accepts chapters meeting all criteria', () => {
      const content = Array(15).fill('Valid paragraph content.').join('\n\n');
      const config = ChapterValidatorService.getDefaultConfig();

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeTruthy();
      expect(result.reasons).toHaveLength(0);
    });

    it('rejects chapters with Gutenberg template', () => {
      const content =
        Array(15).fill('Valid paragraph.').join('\n\n') + '\nPROJECT GUTENBERG';
      const config = ChapterValidatorService.getDefaultConfig();

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeFalsy();
      expect(result.reasons).toContain('Contains Gutenberg template text');
    });

    it('rejects chapters with insufficient paragraphs', () => {
      const content = Array(5).fill('Short paragraph.').join('\n\n');
      const config = ChapterValidatorService.getDefaultConfig();

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeFalsy();
      expect(
        result.reasons.some((r) => r.includes('Insufficient paragraphs')),
      ).toBeTruthy();
    });

    it('collects multiple rejection reasons', () => {
      const content = 'Short.\nGUTENBERG';
      const config = ChapterValidatorService.getDefaultConfig();

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeFalsy();
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });

    it('respects custom minParagraphs config', () => {
      const content = Array(5).fill('Paragraph.').join('\n\n');
      const config = {
        ...ChapterValidatorService.getDefaultConfig(),
        minParagraphs: 3,
      };

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeTruthy();
    });

    it('respects excludeGutenbergTemplate=false config', () => {
      const content = Array(15).fill('Paragraph.').join('\n\n') + '\nGUTENBERG';
      const config = {
        ...ChapterValidatorService.getDefaultConfig(),
        excludeGutenbergTemplate: false,
      };

      const result = service.validateChapter(content, config);

      expect(result.isValid).toBeTruthy();
    });
  });

  describe('validate', () => {
    it('filters out invalid chapters', () => {
      const chapters = [
        Array(15).fill('Valid chapter 1.').join('\n\n'),
        'Short chapter', // Too short
        Array(15).fill('Valid chapter 2.').join('\n\n'),
        Array(15).fill('Paragraph.').join('\n\n') + '\nGUTENBERG', // Has Gutenberg
      ];

      const result = service.validate(chapters);

      expect(result.validChapters.length).toBe(2);
      expect(result.rejectedChapters.length).toBe(2);
    });

    it('provides rejection reasons for each rejected chapter', () => {
      const chapters = ['Short chapter', 'Another short'];

      const result = service.validate(chapters);

      expect(result.rejectedChapters.length).toBe(2);
      result.rejectedChapters.forEach((rejected) => {
        expect(rejected.reasons.length).toBeGreaterThan(0);
      });
    });

    it('tracks total processed count', () => {
      const chapters = Array(10).fill(
        Array(15).fill('Paragraph.').join('\n\n'),
      );

      const result = service.validate(chapters);

      expect(result.totalProcessed).toBe(10);
    });

    it('applies custom config', () => {
      // Content must be at least 100 characters for ChapterContent
      const chapters = [
        Array(5)
          .fill(
            'This is a paragraph with enough content to pass the minimum length requirement.',
          )
          .join('\n\n'),
      ];

      const result = service.validate(chapters, { minParagraphs: 3 });

      expect(result.validChapters.length).toBe(1);
    });

    it('creates ChapterContent with correct indices', () => {
      const chapters = [
        Array(15).fill('Valid chapter 1.').join('\n\n'),
        'Short', // Will be rejected
        Array(15).fill('Valid chapter 2.').join('\n\n'),
      ];

      const result = service.validate(chapters);

      expect(result.validChapters[0].index).toBe(0);
      expect(result.validChapters[1].index).toBe(1); // Index continues from valid chapters
    });
  });

  describe('getDefaultConfig', () => {
    it('returns default values', () => {
      const config = ChapterValidatorService.getDefaultConfig();

      expect(config.minParagraphs).toBe(10);
      expect(config.minChapters).toBe(8);
      expect(config.excludeGutenbergTemplate).toBeTruthy();
    });
  });
});
