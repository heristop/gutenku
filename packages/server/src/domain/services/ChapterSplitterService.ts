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

  // Pattern order: specific keywords first, then positional markers
  // Non-capturing groups (?:...) prevent split() artifacts
  // ToC exclusion via negative lookaheads (for CHAPTER patterns only):
  //   (?!.*\.{3}) - dot leaders in ToC
  //   (?!.*\s{2,}\d+\s*$) - trailing page numbers at line end
  private readonly patterns: ChapterPattern[] = [
    // === CHAPTER patterns (most specific, include keyword) ===
    {
      // "CHAPTER I. THE TITLE" or "CHAPTER 1. THE TITLE" format
      // ToC exclusion: skip lines with dot leaders or trailing page numbers at end
      pattern:
        /\n{2,}\s*CHAPTER[ .]+(?:\d+|[IVXLCDMivxlcdm]+)(?![^\n]*\.{3})(?![^\n]*\s{2,}\d+\s*(?=\n))[^\n]*\n/i,
      name: 'CHAPTER_NUMERIC_ROMAN',
    },
    {
      // Skip "CHAPTER ... PAGE" TOC headers and ToC entries with trailing page numbers
      pattern:
        /\n{2,}\s*CHAPTER[ .]+(?!PAGE\s*\n)(?![^\n]*\s{2,}\d+\s*(?=\n))(?:[A-Z][\w ]*)\n/i,
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
    // === CANTO/STAVE patterns (before BOOK to handle epics like Rámáyan) ===
    {
      // Ordinal canto divisions: "CANTO THE FIRST"
      pattern:
        /\n{2,}\s*CANTO\s+(?:THE\s+)?(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)[.\s]*\n/i,
      name: 'ORDINAL_CANTO',
    },
    {
      pattern: /\n{2,}\s*CANTO[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'CANTO_UPPER',
    },
    {
      // STAVE divisions: "STAVE ONE--MARLEY'S GHOST"
      pattern:
        /\n{2,}\s*STAVE\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN)[^\n]*\n/i,
      name: 'STAVE',
    },
    // === BOOK/VOLUME patterns ===
    {
      // Ordinal book divisions: "THE FIRST BOOK", "THE SECOND BOOK"
      pattern:
        /\n{2,}\s*(?:THE\s+)?(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH)\s+BOOK\s*\n/i,
      name: 'ORDINAL_BOOK',
    },
    {
      // "BOOK I" or "BOOK 1" format
      pattern: /\n{2,}\s*BOOK[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'BOOK',
    },
    {
      pattern: /\n{2,}\s*VOLUME[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'VOLUME',
    },
    // === PART/SECTION patterns ===
    {
      pattern: /\n{2,}\s*PART[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'PART',
    },
    {
      pattern: /\n{2,}\s*SECTION[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'SECTION',
    },
    // === LETTER patterns ===
    {
      pattern: /\n{2,}\s*LETTER[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'LETTER',
    },
    // === FABLE pattern ===
    {
      pattern: /\n{2,}\s*FABLE[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/i,
      name: 'FABLE',
    },
    {
      pattern: /\n{2,}\s*Canto[ .]+(?:\d+|[IVXLCDMivxlcdm]+)[^\n]*\n/,
      name: 'CANTO_MIXED',
    },
    // === Positional patterns (no keyword, rely on position) ===
    {
      // Bracketed numbers: "[ 1 ]" or "[1]"
      pattern: /\n{2,}\s*\[\s*\d+\s*\]\s*\n/,
      name: 'BRACKETED_NUMERIC',
    },
    // === Generic patterns (least specific, last resort) ===
    {
      // Patterns like "Act 2", "Scene 1" (Arabic only, no Roman to avoid false positives)
      // Excludes Gutenberg publishing metadata
      pattern:
        /\n{2,}\s*(?!Copyright|Published|Printed|Edition)(?:[A-Z]\w*(?:\s\w+)*)[ .]{0,5}(?:\d+)\n/i,
      name: 'CUSTOM_PREFIX',
    },
    {
      // Standalone numbers: "1" or "1."
      pattern: /\n{2,}\s*(?:\d+)\.?\s*\n/,
      name: 'NUMERIC_ONLY',
    },
    {
      // Standalone Roman numerals: "I" or "I." (before ROMAN_DOT_TITLE to handle War of the Worlds)
      pattern: /\n{2,}\s*(?:[IVXLCDMivxlcdm]+)\.?\s*\n/,
      name: 'ROMAN_ONLY',
    },
    {
      // "I. A SCANDAL IN BOHEMIA" format - Roman numeral + period + title on same line
      // After ROMAN_ONLY to prefer standalone Roman numerals when applicable
      pattern: /\n{2,}\s*[IVXLCDMivxlcdm]+\. +[A-Z][A-Z\s''-]+\.?\n/,
      name: 'ROMAN_DOT_TITLE',
    },
    {
      // Title case words on their own line
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

    // Select pattern producing most chapters
    let bestResult: SplitResult | null = null;
    let bestChapterCount = 0;

    for (const chapterPattern of this.patterns) {
      const chapters = cleanedContent.split(chapterPattern.pattern);
      if (chapters.length > 1) {
        // Filter empty strings and short fragments
        const validChapters = chapters.filter(
          (ch) => ch && ch.trim().length >= this.minChapterLength,
        );

        if (validChapters.length > 1) {
          const patternIndex = this.patterns.indexOf(chapterPattern);
          const isKeywordPattern = patternIndex < 17; // CHAPTER, BOOK, CANTO, etc.
          const minChaptersForImmediateReturn = 8;

          // Check median length to filter ToC entries and appendix notes (min 2000 chars)
          const sortedLengths = validChapters
            .map((ch) => ch.length)
            .sort((a, b) => a - b);
          const medianLength =
            sortedLengths[Math.floor(sortedLengths.length / 2)];
          const hasGoodQuality = medianLength >= 2000;

          const shouldReturnImmediately =
            isKeywordPattern &&
            validChapters.length >= minChaptersForImmediateReturn &&
            hasGoodQuality;

          if (shouldReturnImmediately) {
            return {
              chapters: validChapters,
              patternUsed: chapterPattern,
              rawSegmentCount: chapters.length,
            };
          }

          // Track best result
          if (validChapters.length > bestChapterCount) {
            bestChapterCount = validChapters.length;
            bestResult = {
              chapters: validChapters,
              patternUsed: chapterPattern,
              rawSegmentCount: chapters.length,
            };
          }

          if (isKeywordPattern) {
            continue;
          }
        }
      }
    }

    // Return best result or fallback
    if (bestResult) {
      return bestResult;
    }

    return {
      chapters: [cleanedContent],
      patternUsed: null,
      rawSegmentCount: 1,
    };
  }

  /**
   * Remove Gutenberg footer/license text.
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
