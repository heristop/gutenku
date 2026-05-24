import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import {
  PuzzleService,
  seededRandom,
  dateToSeed,
  shuffleWithSeed,
  shuffleEmoticons,
  selectDailyBook,
  getEmoticonsByDate,
} from '../../src/domain/services/PuzzleService';
import type { IChapterRepository } from '../../src/domain/repositories/IChapterRepository';
import type NaturalLanguageService from '../../src/domain/services/NaturalLanguageService';

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

const makeRepo = (
  getChaptersByBookReference: () => Promise<unknown>,
): IChapterRepository =>
  ({
    getChaptersByBookReference: vi.fn(getChaptersByBookReference),
    getChapterById: vi.fn(),
    createChapter: vi.fn(),
    createChapters: vi.fn(),
    deleteChaptersByBookReference: vi.fn(),
  }) as unknown as IChapterRepository;

const makeNL = (
  splitter: (content: string) => string[] = (content) =>
    content.split(/[.!?]+/).filter((s) => s.trim().length > 0),
): NaturalLanguageService =>
  ({
    extractSentencesByPunctuation: vi.fn(splitter),
  }) as unknown as NaturalLanguageService;

describe('PuzzleService.getEmoticons', () => {
  it('delegates to getEmoticonsByDate', () => {
    const service = new PuzzleService(
      makeRepo(async () => []),
      makeNL(),
    );
    const result = service.getEmoticons('2026-01-15', 2, []);
    expect(result.emoticonCount).toBeGreaterThan(0);
    expect(result.visibleIndices.length).toBe(2);
  });

  it('uses the default empty scratched positions when omitted', () => {
    const service = new PuzzleService(
      makeRepo(async () => []),
      makeNL(),
    );
    const result = service.getEmoticons('2026-01-15', 2);
    expect(result.visibleIndices.length).toBe(2);
  });
});

describe('PuzzleService.getHaiku syllable edge cases', () => {
  it('ignores sentences with no alphabetic characters (zero syllables)', async () => {
    // Numeric-only sentences yield 0 syllables, so no haiku can form.
    const content = '12345. 67890. !!!.';
    const service = new PuzzleService(
      makeRepo(async () => [{ content }]),
      makeNL(),
    );
    expect(await service.getHaiku('2026-01-15', 0)).toBeNull();
  });

  it('filters out sentences that fail puzzle-sentence validation', async () => {
    // A sentence longer than the 50-char limit is rejected by isValidSentence.
    const longSentence =
      'this sentence is intentionally far longer than fifty characters total here';
    const content = `${longSentence}. silent autumn breeze. the river flows down to sea.`;
    const service = new PuzzleService(
      makeRepo(async () => [{ content }]),
      makeNL(),
    );
    // Not enough valid 5/7 verses remain after filtering -> null.
    const result = await service.getHaiku('2026-01-15', 0);
    expect(result).toBeNull();
  });
});

describe('PuzzleService.getHaiku', () => {
  it('returns null when no chapters exist', async () => {
    const service = new PuzzleService(
      makeRepo(async () => []),
      makeNL(),
    );
    expect(await service.getHaiku('2026-01-15', 0)).toBeNull();
  });

  it('returns null when chapter repository throws', async () => {
    const service = new PuzzleService(
      makeRepo(async () => {
        throw new Error('DB error');
      }),
      makeNL(),
    );
    expect(await service.getHaiku('2026-01-15', 0)).toBeNull();
  });

  it('returns null when not enough syllable verses to form a haiku', async () => {
    const service = new PuzzleService(
      makeRepo(async () => [{ content: 'one verse only here.' }]),
      makeNL(),
    );
    expect(await service.getHaiku('2026-01-15', 0)).toBeNull();
  });

  // Verified syllable counts (via the `syllable` lib): each line below is
  // exactly 5 or 7 syllables, so the haiku builder can assemble a 5-7-5.
  const RICH_CONTENT =
    [
      'silent autumn breeze', // 5
      'the river flows down to sea', // 7
      'gentle morning rain', // 5
      'soft light fades away', // 5
      'dew on the green grass', // 5
    ].join('. ') + '.';

  it('builds a 3-line haiku when enough 5/7-syllable sentences exist', async () => {
    const service = new PuzzleService(
      makeRepo(async () => [{ content: RICH_CONTENT }]),
      makeNL(),
    );
    const result = await service.getHaiku('2026-01-15', 0);
    expect(result).not.toBeNull();
    expect(result!.split('\n').length).toBe(3);
  });

  it('produces deterministic haikus for the same date and index', async () => {
    const make = () =>
      new PuzzleService(
        makeRepo(async () => [{ content: RICH_CONTENT }]),
        makeNL(),
      );
    const r1 = await make().getHaiku('2026-03-10', 0);
    const r2 = await make().getHaiku('2026-03-10', 0);
    expect(r1).toEqual(r2);
    expect(r1).not.toBeNull();
  });

  it('reuses a five-syllable verse when no distinct one remains', async () => {
    // Two identical 5-syllable sentences: after picking v1, filtering by !==v1
    // removes both, leaving remainingFive empty -> falls back to pick(availableFive).
    const content =
      [
        'silent autumn breeze',
        'silent autumn breeze',
        'the river flows down to sea',
      ].join('. ') + '.';
    const service = new PuzzleService(
      makeRepo(async () => [{ content }]),
      makeNL(),
    );
    const result = await service.getHaiku('2026-05-01', 0);
    expect(result).not.toBeNull();
    expect(result!.split('\n').length).toBe(3);
  });

  it('returns null index beyond generated haiku count', async () => {
    const service = new PuzzleService(
      makeRepo(async () => [{ content: 'one verse only here.' }]),
      makeNL(),
    );
    expect(await service.getHaiku('2026-01-15', 50)).toBeNull();
  });
});
