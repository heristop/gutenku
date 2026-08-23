import { describe, it, expect } from 'vitest';
import { splitIntoRuns } from '@/features/haiku/composables/marker-layout';

describe('splitIntoRuns', () => {
  it('returns the whole paragraph as one non-verse run when nothing matches', () => {
    const runs = splitIntoRuns('A quiet pond in spring.', ['no such verse']);

    expect(runs).toEqual([{ text: 'A quiet pond in spring.', isVerse: false }]);
  });

  it('splits a paragraph around a verse', () => {
    const runs = splitIntoRuns('Before the verse text after.', ['the verse']);

    expect(runs).toEqual([
      { text: 'Before ', isVerse: false },
      { text: 'the verse', isVerse: true },
      { text: ' text after.', isVerse: false },
    ]);
  });

  it('keeps runs alternating for several verses', () => {
    const runs = splitIntoRuns('one two three four five', ['two', 'four']);

    expect(runs.map((r) => r.isVerse)).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
  });

  it('orders runs by position, not by verse order', () => {
    const runs = splitIntoRuns('one two three four five', ['four', 'two']);

    expect(runs.map((r) => r.text)).toEqual([
      'one ',
      'two',
      ' three ',
      'four',
      ' five',
    ]);
  });

  it('merges overlapping verse matches into a single run', () => {
    const runs = splitIntoRuns('the quiet pond', ['the quiet', 'quiet pond']);

    expect(runs).toEqual([{ text: 'the quiet pond', isVerse: true }]);
  });

  it('ignores blank verses and trims the ones it matches', () => {
    const runs = splitIntoRuns('a still pond', ['', '  ', ' still ']);

    expect(runs).toEqual([
      { text: 'a ', isVerse: false },
      { text: 'still', isVerse: true },
      { text: ' pond', isVerse: false },
    ]);
  });

  it('handles a verse covering the whole paragraph', () => {
    const runs = splitIntoRuns('a still pond', ['a still pond']);

    expect(runs).toEqual([{ text: 'a still pond', isVerse: true }]);
  });
});
