import { singleton } from 'tsyringe';
import type { RawBookText } from '~/domain/value-objects/RawBookText';

export interface ChapterPattern {
  pattern: RegExp;
  name: string;
}

export interface SplitResult {
  chapters: string[];
  patternUsed: ChapterPattern | null;
  rawSegmentCount: number;
}

@singleton()
export class ChapterSplitterService {
  // Pattern order: specific patterns before generic ones
  private readonly patterns: ChapterPattern[] = [
    {
      pattern: /\n{2,}CHAPTER[ .]+(\d+|[IVXLCDMivxlcdm]+)[ .]*\n/i,
      name: 'CHAPTER_NUMERIC_ROMAN',
    },
    {
      pattern: /\n{2,}CHAPTER[ .]+([A-Z][\w ]*)\n/i,
      name: 'CHAPTER_NAMED',
    },
    {
      pattern: /\n{2,}Chapter (\d+) ([A-Z\s]+)\n{1,}/i,
      name: 'CHAPTER_WITH_TITLE',
    },
    {
      pattern: /\n{2,}CHAPTER (\d+|[IVXLCDMivxlcdm]+)\. ([A-Z\s]+)\n/i,
      name: 'CHAPTER_DOT_TITLE',
    },
    {
      pattern: /\n{2,}BOOK[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'BOOK',
    },
    {
      pattern: /\n{2,}VOLUME[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'VOLUME',
    },
    {
      pattern: /\n{2,}CANTO[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'CANTO_UPPER',
    },
    {
      pattern: /\n{2,}PART[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'PART',
    },
    {
      pattern: /\n{2,}SECTION[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'SECTION',
    },
    {
      pattern: /\n{2,}LETTER[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'LETTER',
    },
    {
      pattern: /\n{2,}Canto[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/,
      name: 'CANTO_MIXED',
    },
    // Generic patterns come last (less specific)
    {
      pattern: /\n{2,}([A-Z][\w ]*)[ .]*(\d+|[IVXLCDMivxlcdm]+)\n/i,
      name: 'CUSTOM_PREFIX',
    },
    {
      pattern: /\n{2,}(\d+)\n/,
      name: 'NUMERIC_ONLY',
    },
    {
      pattern: /\n{2,}([IVXLCDMivxlcdm]+)\n/,
      name: 'ROMAN_ONLY',
    },
    {
      pattern: /\n{2,}([A-Z][\w ]*)\n/,
      name: 'TITLE_ONLY',
    },
  ];

  split(rawText: RawBookText): SplitResult {
    return this.splitContent(rawText.content);
  }

  splitContent(content: string): SplitResult {
    // Normalize line endings (CRLF -> LF) for consistent pattern matching
    const normalizedContent = content.replaceAll('\r\n', '\n');

    for (const chapterPattern of this.patterns) {
      const chapters = normalizedContent.split(chapterPattern.pattern);

      if (chapters.length > 1) {
        return {
          chapters: chapters.filter((ch) => ch && ch.trim().length > 0),
          patternUsed: chapterPattern,
          rawSegmentCount: chapters.length,
        };
      }
    }

    return {
      chapters: [normalizedContent],
      patternUsed: null,
      rawSegmentCount: 1,
    };
  }

  splitWithPattern(content: string, pattern: ChapterPattern): string[] {
    return content
      .split(pattern.pattern)
      .filter((ch) => ch && ch.trim().length > 0);
  }

  getPatterns(): readonly ChapterPattern[] {
    return this.patterns;
  }
}
