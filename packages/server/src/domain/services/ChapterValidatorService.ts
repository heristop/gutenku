import { singleton } from 'tsyringe';
import { ChapterContent } from '~/domain/value-objects/ChapterContent';

export interface ValidationConfig {
  minParagraphs: number;
  minChapters: number;
  excludeGutenbergTemplate: boolean;
}

export interface ChapterValidationResult {
  isValid: boolean;
  reasons: string[];
}

export interface ValidationResult {
  validChapters: ChapterContent[];
  rejectedChapters: Array<{
    content: string;
    index: number;
    reasons: string[];
  }>;
  totalProcessed: number;
}

@singleton()
export class ChapterValidatorService {
  private static readonly DEFAULT_CONFIG: ValidationConfig = {
    minParagraphs: 10,
    minChapters: 8,
    excludeGutenbergTemplate: true,
  };

  // Match Gutenberg template patterns (PROJECT GUTENBERG + optional markers)
  // Avoids false positives on historical "Johannes Gutenberg" references
  private readonly gutenbergPattern =
    /(?:\*{3}\s*(?:START|END)\s+OF\s+(?:THE\s+)?)?PROJECT\s+GUTENBERG/i;

  validate(
    rawChapters: string[],
    config?: Partial<ValidationConfig>,
  ): ValidationResult {
    const mergedConfig = {
      ...ChapterValidatorService.DEFAULT_CONFIG,
      ...config,
    };

    const validChapters: ChapterContent[] = [];
    const rejectedChapters: Array<{
      content: string;
      index: number;
      reasons: string[];
    }> = [];

    let validIndex = 0;

    for (let i = 0; i < rawChapters.length; i++) {
      const chapter = rawChapters[i];
      const validation = this.validateChapter(chapter, mergedConfig);

      if (validation.isValid) {
        try {
          const chapterContent = ChapterContent.create({
            content: chapter,
            index: validIndex,
          });
          validChapters.push(chapterContent);
          validIndex++;
        } catch {
          rejectedChapters.push({
            content: chapter,
            index: i,
            reasons: ['Failed to create ChapterContent (too short)'],
          });
        }
      }

      if (!validation.isValid) {
        rejectedChapters.push({
          content: chapter,
          index: i,
          reasons: validation.reasons,
        });
      }
    }

    return {
      validChapters,
      rejectedChapters,
      totalProcessed: rawChapters.length,
    };
  }

  validateChapter(
    content: string,
    config: ValidationConfig,
  ): ChapterValidationResult {
    const reasons: string[] = [];

    if (
      config.excludeGutenbergTemplate &&
      this.containsGutenbergTemplate(content)
    ) {
      reasons.push('Contains Gutenberg template text');
    }
    if (!this.hasSufficientParagraphs(content, config.minParagraphs)) {
      reasons.push(
        `Insufficient paragraphs (requires ${config.minParagraphs})`,
      );
    }

    return {
      isValid: reasons.length === 0,
      reasons,
    };
  }

  containsGutenbergTemplate(content: string): boolean {
    return this.gutenbergPattern.test(content);
  }

  hasSufficientParagraphs(content: string, minParagraphs: number): boolean {
    return this.countParagraphs(content) >= minParagraphs;
  }

  countParagraphs(content: string): number {
    // Split on blank lines to count paragraphs, not individual lines
    return content
      .split(/\n\s*\n/)
      .filter((paragraph) => paragraph.trim().length > 0).length;
  }

  static getDefaultConfig(): ValidationConfig {
    return { ...ChapterValidatorService.DEFAULT_CONFIG };
  }
}
