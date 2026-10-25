import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import {
  PuzzleService,
  seededRandom,
  dateToSeed,
  shuffleWithSeed,
  shuffleEmoticons,
  selectDailyBook,
  getEmoticonsByDate,
} from '../../src/domain/services/PuzzleService';

describe('PuzzleService standalone helpers', () => {
  it('seededRandom is deterministic for the same seed', () => {
    const a = seededRandom(123);
    const b = seededRandom(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);

    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('dateToSeed converts a date to a numeric seed', () => {
    expect(dateToSeed('2026-01-15')).toBe(2026 * 10000 + 1 * 100 + 15);
  });

  it('dateToSeed returns 0 for empty string', () => {
    expect(dateToSeed('')).toBe(0);
  });

  it('shuffleWithSeed produces deterministic permutation and preserves elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const r1 = shuffleWithSeed(arr, seededRandom(7));
    const r2 = shuffleWithSeed(arr, seededRandom(7));
    expect(r1).toEqual(r2);
    expect([...r1].sort((a, b) => a - b)).toEqual(arr);
    // original not mutated
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('shuffleEmoticons keeps the same grapheme set', () => {
    const input = '😀😁😂🤣😃';
    const shuffled = shuffleEmoticons(input, seededRandom(99));
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const sortGraphemes = (s: string) =>
      [...segmenter.segment(s)].map((x) => x.segment).sort();
    expect(sortGraphemes(shuffled)).toEqual(sortGraphemes(input));
  });

  it('selectDailyBook returns the same book for the same date', () => {
    const b1 = selectDailyBook('2026-01-15');
    const b2 = selectDailyBook('2026-01-15');
    expect(b1.id).toBe(b2.id);
  });

  it('getEmoticonsByDate returns base emoticons consistently as count grows', () => {
    const two = getEmoticonsByDate('2026-01-15', 2);
    const three = getEmoticonsByDate('2026-01-15', 3);
    expect(three.emoticons.startsWith(two.emoticons)).toBeTruthy();
    expect(two.emoticonCount).toBe(three.emoticonCount);
    expect(two.visibleIndices.length).toBe(2);
  });

  it('getEmoticonsByDate appends valid scratched positions and ignores out-of-range', () => {
    const base = getEmoticonsByDate('2026-01-15', 2);
    const count = base.emoticonCount;
    // pick an index not already in base
    const candidate = [...Array(count).keys()].find(
      (i) => !base.visibleIndices.includes(i),
    )!;
    const withScratch = getEmoticonsByDate('2026-01-15', 2, [
      candidate,
      999, // out of range, filtered out
      -1, // negative, filtered out
    ]);
    // base part unchanged, plus one extra emoji for the valid scratch
    expect(withScratch.emoticons.startsWith(base.emoticons)).toBeTruthy();
    expect(withScratch.emoticons.length).toBeGreaterThan(base.emoticons.length);
    // visibleIndices does not include scratched positions
    expect(withScratch.visibleIndices).toEqual(base.visibleIndices);
  });
});

describe('PuzzleService.getEmoticons', () => {
  it('delegates to getEmoticonsByDate', () => {
    const service = new PuzzleService();
    const result = service.getEmoticons('2026-01-15', 2, []);
    expect(result.emoticonCount).toBeGreaterThan(0);
    expect(result.visibleIndices.length).toBe(2);
  });

  it('uses the default empty scratched positions when omitted', () => {
    const service = new PuzzleService();
    const result = service.getEmoticons('2026-01-15', 2);
    expect(result.visibleIndices.length).toBe(2);
  });
});
