import { describe, expect, it } from 'vitest';
import HaikuHelper from '../src/shared/helpers/HaikuHelper';

describe('HaikuHelper.clean', () => {
  it('trims, collapses spaces and strips trailing punctuation', () => {
    const input = [
      '  hello, world...  ',
      "it's me!",
      ' ,,, ',
      'newline\nbreaks\rtoo',
      "'quoted'",
    ];
    const result = HaikuHelper.clean(input);
    expect(result).toEqual([
      'Hello, world',
      "It's me",
      ',,',
      'Newline breaks too',
      'Quoted',
    ]);
  });
});

describe('HaikuHelper.findContext', () => {
  const chapter =
    'A quick brown fox jumps over the lazy dog. The rain in Spain falls mainly on the plain. Lorem ipsum dolor sit amet.';

  it('returns context around a substring', () => {
    const ctx = HaikuHelper.findContext(chapter, 'rain in Spain', 2, 1);
    expect(ctx).toBeTruthy();
    // @ts-expect-error – ctx may be null in type
    expect(ctx.wordsBefore).toBe('The ');
    // @ts-expect-error – ctx may be null in type
    expect(ctx.wordsAfter).toBe(' falls');
  });

  it('returns null if substring is not found', () => {
    const ctx = HaikuHelper.findContext(chapter, 'not present', 2, 1);
    expect(ctx).toBeNull();
  });
});
