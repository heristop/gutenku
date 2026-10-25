import { describe, expect, it } from 'vitest';
import { longestVerseLength } from '@/features/haiku/composables/verse-fit';

describe('longestVerseLength', () => {
  it('measures the longest verse', () => {
    expect(longestVerseLength(['a b', 'abcd'])).toBe(4);
    expect(longestVerseLength(['Rising upon that motion'])).toBe(23);
  });

  it('is zero for no verses', () => {
    expect(longestVerseLength([])).toBe(0);
  });

  it('counts characters as read, not code units', () => {
    expect(longestVerseLength(['古い池や'])).toBe(4);
    // "É" written as E + combining acute counts once
    expect(longestVerseLength(['Élevée sur ce mouvement'])).toBe(23);
  });
});
