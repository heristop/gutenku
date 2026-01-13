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
  // Filter out split() artifacts (captured groups) under 5 chars
  private readonly minChapterLength = 5;

  // Pattern order: specific before generic
  // Non-capturing groups (?:...) prevent split() artifacts
  // ToC exclusion via negative lookaheads:
  //   (?!.*\.{3}) - dot leaders
  //   (?!.*\s{2,}\d+\s*(?=\n)) - trailing page numbers
  private readonly patterns: ChapterPattern[] = [
    {
      // "I. A SCANDAL IN BOHEMIA" format
      // Roman numeral + period + title on same line
      // ` +` prevents cross-line matches, optional trailing period
      pattern:
        /\n{2,}\s*[IVXLCDMivxlcdm]+\. +[A-Z][A-Z\s''-]+\.?(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))\n/,
      name: 'ROMAN_DOT_TITLE',
    },
    {
      // Negative lookaheads to skip TOC entries
      // (?=\n) matches EOL not EOS
      pattern:
        /\n{2,}\s*CHAPTER[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'CHAPTER_NUMERIC_ROMAN',
    },
    {
      // Skip "CHAPTER ... PAGE" TOC headers
      pattern: /\n{2,}\s*CHAPTER[ .]+(?!PAGE\s*\n)(?:[A-Z][\w ]*)\n/i,
      name: 'CHAPTER_NAMED',
    },
    {
      pattern: /\n{2,}\s*Chapter (?:\d+) (?:[A-Z\s]+)\n{1,}/i,
      name: 'CHAPTER_WITH_TITLE',
    },
    {
      pattern: /\n{2,}\s*CHAPTER (?:\d+|[IVXLCDMivxlcdm]+)\. (?:[A-Z\s]+)\n/i,
      name: 'CHAPTER_DOT_TITLE',
    },
    {
      // Ordinal book divisions: "THE FIRST BOOK", "THE SECOND BOOK"
      // Must precede generic BOOK pattern
      pattern:
        /\n{2,}\s*(?:THE\s+)?(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH)\s+BOOK\s*\n/i,
      name: 'ORDINAL_BOOK',
    },
    {
      // Requires separator to avoid false matches like "Bookish"
      pattern:
        /\n{2,}\s*BOOK[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'BOOK',
    },
    {
      pattern:
        /\n{2,}\s*VOLUME[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'VOLUME',
    },
    {
      // Ordinal canto divisions: "CANTO THE FIRST"
      pattern:
        /\n{2,}\s*CANTO\s+(?:THE\s+)?(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)[.\s]*\n/i,
      name: 'ORDINAL_CANTO',
    },
    {
      pattern:
        /\n{2,}\s*CANTO[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'CANTO_UPPER',
    },
    {
      // STAVE divisions: "STAVE ONE--MARLEY'S GHOST"
      pattern:
        /\n{2,}\s*STAVE\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)[^\n]*\n/i,
      name: 'STAVE',
    },
    {
      // Requires separator to avoid false matches
      pattern:
        /\n{2,}\s*PART[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'PART',
    },
    {
      pattern:
        /\n{2,}\s*SECTION[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'SECTION',
    },
    {
      pattern:
        /\n{2,}\s*LETTER[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'LETTER',
    },
    {
      // FABLE divisions: "FABLE I.", "FABLE II."
      pattern:
        /\n{2,}\s*FABLE[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'FABLE',
    },
    {
      pattern:
        /\n{2,}\s*Canto[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?!.*\.{3})(?!.*\s{2,}\d+\s*(?=\n))[^\n]*\n/,
      name: 'CANTO_MIXED',
    },
    {
      // Bracketed numbers: "[ 1 ]" or "[1]"
      pattern: /\n{2,}\s*\[\s*\d+\s*\]\s*\n/,
      name: 'BRACKETED_NUMERIC',
    },
    // Generic patterns come last (less specific)
    {
      // Patterns like "Chapter 1", "ACT 2" (Arabic only, no Roman to avoid false positives)
      // Excludes ToC entries and Gutenberg publishing metadata
      pattern:
        /\n{2,}\s*(?!Copyright|Published|Printed|Edition)(?:[A-Z]\w*(?:\s\w+)*)[ .]{0,5}(?:\d+)\n/i,
      name: 'CUSTOM_PREFIX',
    },
    {
      // Optional period and trailing spaces
      pattern: /\n{2,}\s*(?:\d+)\.?\s*\n/,
      name: 'NUMERIC_ONLY',
    },
    {
      // Optional period and trailing spaces
      pattern: /\n{2,}\s*(?:[IVXLCDMivxlcdm]+)\.?\s*\n/,
      name: 'ROMAN_ONLY',
    },
    {
      pattern: /\n{2,}\s*(?:[A-Z][\w ]*)\n/,
      name: 'TITLE_ONLY',
    },
  ];

  split(rawText: RawBookText): SplitResult {
    return this.splitContent(rawText.content);
  }

  splitContent(content: string): SplitResult {
    // Normalize line endings (CRLF -> LF) for consistent pattern matching
    const normalizedContent = content.replaceAll('\r\n', '\n');

    // Remove Gutenberg footer to prevent it from polluting the last chapter
    const cleanedContent = this.removeGutenbergFooter(normalizedContent);

    for (const chapterPattern of this.patterns) {
      const chapters = cleanedContent.split(chapterPattern.pattern);
      if (chapters.length > 1) {
        // Filter empty strings and short fragments
        const validChapters = chapters.filter(
          (ch) => ch && ch.trim().length >= this.minChapterLength,
        );

        if (validChapters.length > 1) {
          return {
            chapters: validChapters,
            patternUsed: chapterPattern,
            rawSegmentCount: chapters.length,
          };
        }
      }
    }

    return {
      chapters: [cleanedContent],
      patternUsed: null,
      rawSegmentCount: 1,
    };
  }

  /**
   * Remove Gutenberg footer/license text from content end.
   */
  private removeGutenbergFooter(content: string): string {
    const footerPattern =
      /\*{3}\s*END\s+OF\s+(?:THE\s+)?PROJECT\s+GUTENBERG.*$/is;
    return content.replace(footerPattern, '').trim();
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
