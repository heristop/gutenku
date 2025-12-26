import { describe, expect, it } from 'vitest';
import {
  cleanVerses,
  extractContextVerses,
  findContext,
} from '../src/shared/helpers/HaikuHelper';

describe('cleanVerses', () => {
  it('trims, collapses spaces and strips trailing punctuation', () => {
    const input = [
      '  hello, world...  ',
      "it's me!",
      ' ,,, ',
      'newline\nbreaks\rtoo',
      "'quoted'",
    ];
    const result = cleanVerses(input);
    expect(result).toEqual([
      'Hello, world',
      "It's me",
      ',,',
      'Newline breaks too',
      'Quoted',
    ]);
  });

  it('capitalizes first letter of each verse', () => {
    const input = ['lowercase start', 'another verse'];
    const result = cleanVerses(input);
    expect(result[0]).toBe('Lowercase start');
    expect(result[1]).toBe('Another verse');
  });

  it('handles empty array', () => {
    const result = cleanVerses([]);
    expect(result).toEqual([]);
  });

  it('strips trailing semicolons and question marks', () => {
    const input = ['what is this;', 'is it good?'];
    const result = cleanVerses(input);
    expect(result).toEqual(['What is this', 'Is it good']);
  });
});

describe('findContext', () => {
  const chapter =
    'A quick brown fox jumps over the lazy dog. The rain in Spain falls mainly on the plain. Lorem ipsum dolor sit amet.';

  it('returns context around a substring', () => {
    const ctx = findContext(chapter, 'rain in Spain', 2, 1);
    expect(ctx).toBeTruthy();
    expect(ctx?.wordsBefore).toBe('The ');
    expect(ctx?.wordsAfter).toBe(' falls');
  });

  it('returns null if substring is not found', () => {
    const ctx = findContext(chapter, 'not present', 2, 1);
    expect(ctx).toBeNull();
  });

  it('returns sentence context before and after', () => {
    const ctx = findContext(chapter, 'lazy dog', 3, 1);
    expect(ctx).toBeTruthy();
    expect(ctx?.sentenceBefore).toBeDefined();
    expect(ctx?.sentenceAfter).toBeDefined();
  });

  it('handles default numWords and numSentences', () => {
    const ctx = findContext(chapter, 'fox jumps');
    expect(ctx).toBeTruthy();
    expect(ctx?.wordsBefore).toBeDefined();
    expect(ctx?.wordsAfter).toBeDefined();
  });

  it('handles substring at start of text', () => {
    const ctx = findContext(chapter, 'A quick', 2, 1);
    expect(ctx).toBeTruthy();
    expect(ctx?.wordsBefore).toBe('');
  });
});

describe('extractContextVerses', () => {
  const chapter =
    'First verse is here. Second verse follows. Third verse ends.';

  it('extracts context for multiple verses', () => {
    const verses = ['First verse', 'Second verse', 'Third verse'];
    const result = extractContextVerses(verses, chapter);
    expect(result.length).toBe(3);
  });

  it('handles verses not found in chapter', () => {
    const verses = ['not found verse'];
    const result = extractContextVerses(verses, chapter);
    expect(result[0]).toBeNull();
  });

  it('handles newlines in chapter content', () => {
    const chapterWithNewlines = 'First verse\nis here.\nSecond verse follows.';
    const verses = ['First verse is here'];
    const result = extractContextVerses(verses, chapterWithNewlines);
    expect(result.length).toBe(1);
  });

  it('handles empty verses array', () => {
    const result = extractContextVerses([], chapter);
    expect(result).toEqual([]);
  });

  it('handles verses with newlines', () => {
    const verses = ['First\nverse'];
    const result = extractContextVerses(verses, chapter);
    expect(result.length).toBe(1);
  });

  it('handles empty chapter', () => {
    const result = extractContextVerses(['test'], '');
    expect(result[0]).toBeNull();
  });

  it('handles single word verse', () => {
    const result = extractContextVerses(['First'], chapter);
    expect(result[0]).toBeDefined();
  });
});

describe('cleanVerses - additional cases', () => {
  it('handles verse with only punctuation', () => {
    const result = cleanVerses(['...']);
    expect(result[0]).toBe('');
  });

  it('handles verse with mixed punctuation at end', () => {
    const result = cleanVerses(['Hello world...!']);
    expect(result[0]).toBe('Hello world...');
  });

  it('handles verse with tabs', () => {
    const result = cleanVerses(['hello\tworld']);
    expect(result[0]).toBe('Hello world');
  });

  it('handles verse with carriage returns', () => {
    const result = cleanVerses(['hello\r\nworld']);
    expect(result[0]).toBe('Hello world');
  });

  it('handles single character verse', () => {
    const result = cleanVerses(['a']);
    expect(result[0]).toBe('A');
  });

  it('handles unicode characters', () => {
    const result = cleanVerses(['hello 世界']);
    expect(result[0]).toBe('Hello 世界');
  });
});
