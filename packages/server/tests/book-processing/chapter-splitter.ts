import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ChapterSplitterService } from '../../src/domain/services/ChapterSplitterService';
import { RawBookText } from '../../src/domain/value-objects/RawBookText';

describe('ChapterSplitterService', () => {
  const service = new ChapterSplitterService();

  describe('chapter patterns', () => {
    it('matches ROMAN numeral with title (I. A SCANDAL IN BOHEMIA)', () => {
      const content = `
Contents

   I.     A Scandal in Bohemia
   II.    The Red-Headed League


I. A SCANDAL IN BOHEMIA

To Sherlock Holmes she is always the woman.


II. THE RED-HEADED LEAGUE

I had called upon my friend, Mr. Sherlock Holmes.


III. A CASE OF IDENTITY

My dear fellow, said Sherlock Holmes.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(2);
      expect(result.patternUsed?.name).toBe('ROMAN_DOT_TITLE');
    });

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

    it('matches FABLE divisions (La Fontaine style)', () => {
      const content = `
Preface text here.


    FABLE I.

    THE GRASSHOPPER AND THE ANT.

    The Grasshopper, so blithe and gay,
    Sang the summer time away.


    FABLE II.

    THE RAVEN AND THE FOX.

    Master Raven, perched upon a tree,
    Held in his beak a savoury piece of cheese.


    FABLE III.

    THE FROG THAT WISHED TO MAKE HERSELF AS BIG AS THE OX.

    A Frog, no bigger than a pullet's egg,
    A fat Ox feeding in a meadow spied.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(2);
      expect(result.patternUsed?.name).toBe('FABLE');
    });

    it('matches ordinal BOOK divisions (THE FIRST BOOK, etc.)', () => {
      const content = `
Introduction text here.


THE FIRST BOOK

Content of the first book.


THE SECOND BOOK

Content of the second book.


THE THIRD BOOK

Content of the third book.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(2);
      expect(result.patternUsed?.name).toBe('ORDINAL_BOOK');
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

    it('matches CHAPTER with em-dash title (Les Misérables style)', () => {
      const content = `
Preamble text.


CHAPTER I—M. MYRIEL

First chapter content here with the bishop.


CHAPTER II—M. MYRIEL BECOMES M. WELCOME

Second chapter content continues.


CHAPTER III—A HARD BISHOPRIC

Third chapter about the bishopric.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(2);
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('matches CHAPTER with en-dash title', () => {
      const content = `
Preamble.


CHAPTER I–THE BEGINNING

First chapter content.


CHAPTER II–THE MIDDLE

Second chapter content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('matches CHAPTER with colon title', () => {
      const content = `
Preamble.


CHAPTER 1: THE ADVENTURE BEGINS

First chapter content.


CHAPTER 2: THE JOURNEY CONTINUES

Second chapter content.
`;
      const result = service.splitContent(content);

      expect(result.chapters.length).toBeGreaterThan(1);
      expect(result.patternUsed?.name).toBe('CHAPTER_NUMERIC_ROMAN');
    });

    it('excludes TOC entries with dot leaders', () => {
      const content = `
TABLE OF CONTENTS


CHAPTER I—M. MYRIEL.......................... 1


CHAPTER II—M. MYRIEL BECOMES M. WELCOME..... 15


THE ACTUAL BOOK STARTS HERE


CHAPTER I—M. MYRIEL

The actual first chapter content starts here with real text.


CHAPTER II—M. MYRIEL BECOMES M. WELCOME

The actual second chapter content.
`;
      const result = service.splitContent(content);

      // Should only match the actual chapters (after "THE ACTUAL BOOK STARTS HERE")
      // and not the TOC entries with dot leaders
      expect(result.chapters.length).toBe(3); // Preamble + 2 chapters
      // First segment should contain the TOC (not split by it)
      expect(result.chapters[0]).toContain('TABLE OF CONTENTS');
      expect(result.chapters[0]).toContain('........................');
    });

    it('excludes TOC entries with trailing page numbers', () => {
      const content = `
CONTENTS


CHAPTER I    1


CHAPTER II    15


CHAPTER III    28


MAIN TEXT


CHAPTER I

Actual chapter one content with real text.


CHAPTER II

Actual chapter two content.
`;
      const result = service.splitContent(content);

      // Should skip TOC entries with "  1" style page numbers
      expect(result.chapters.length).toBe(3); // Preamble/TOC + 2 chapters
      expect(result.chapters[0]).toContain('CONTENTS');
    });

    it('excludes TOC header "CHAPTER ... PAGE" and uses ROMAN_ONLY instead', () => {
      // This simulates books like "Coward or Hero?" that have:
      // - A TOC header line with "CHAPTER" and "PAGE" columns
      // - Actual chapters marked with just roman numerals (I., II., etc.)
      const content = `
Some preamble text.


        CHAPTER                                            PAGE

        I        THE CAPTAIN'S INDIGNATION                   13

        II       MY NOSE                                     16


------------------------------------------------------------------------


                                   I.

                       THE CAPTAIN'S INDIGNATION.


First chapter content here with the captain being indignant.


                                  II.

                              MY NOSE.


Second chapter content about a nose.


                                  III.

                     COLONEL BOISSOT'S SYSTEM.


Third chapter content about a system.
`;
      const result = service.splitContent(content);

      // Should use ROMAN_ONLY pattern (I., II., III.), not CHAPTER_NAMED
      expect(result.patternUsed?.name).toBe('ROMAN_ONLY');
      expect(result.chapters.length).toBeGreaterThan(2);
      // First segment should contain the TOC (not split by it)
      expect(result.chapters[0]).toContain('CHAPTER');
      expect(result.chapters[0]).toContain('PAGE');
    });

    it('matches roman numerals with trailing period (I., II., etc.)', () => {
      const content = `
Preamble text.


                                   I.

First chapter content.


                                  II.

Second chapter content.


                                  III.

Third chapter content.
`;
      const result = service.splitContent(content);

      expect(result.patternUsed?.name).toBe('ROMAN_ONLY');
      expect(result.chapters.length).toBe(4); // Preamble + 3 chapters
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
    it('returns all 21 patterns', () => {
      const patterns = service.getPatterns();

      expect(patterns.length).toBe(21);
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
