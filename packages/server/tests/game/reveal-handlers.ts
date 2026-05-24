import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { RevealEmoticonHandler } from '../../src/application/queries/puzzle/RevealEmoticonHandler';
import { RevealEmoticonQuery } from '../../src/application/queries/puzzle/RevealEmoticonQuery';
import { RevealHaikuHandler } from '../../src/application/queries/puzzle/RevealHaikuHandler';
import { RevealHaikuQuery } from '../../src/application/queries/puzzle/RevealHaikuQuery';
import type { PuzzleService } from '../../src/domain/services/PuzzleService';

describe('RevealEmoticonHandler', () => {
  it('delegates to PuzzleService.getEmoticons with base visible count', async () => {
    const expected = {
      emoticons: '😀😁',
      emoticonCount: 5,
      visibleIndices: [0, 1],
    };
    const getEmoticons = vi.fn().mockReturnValue(expected);
    const puzzleService = { getEmoticons } as unknown as PuzzleService;

    const handler = new RevealEmoticonHandler(puzzleService);
    const query = new RevealEmoticonQuery('2026-01-15', [2, 3]);
    const result = await handler.execute(query);

    expect(result).toEqual(expected);
    expect(getEmoticons).toHaveBeenCalledWith('2026-01-15', 2, [2, 3]);
  });
});

describe('RevealEmoticonQuery', () => {
  it('stores date and scratchedPositions', () => {
    const query = new RevealEmoticonQuery('2026-02-01', [1, 4]);
    expect(query.date).toBe('2026-02-01');
    expect(query.scratchedPositions).toEqual([1, 4]);
  });
});

describe('RevealHaikuHandler', () => {
  it('delegates to PuzzleService.getHaiku with date and index', async () => {
    const getHaiku = vi.fn().mockResolvedValue('a haiku line');
    const puzzleService = { getHaiku } as unknown as PuzzleService;

    const handler = new RevealHaikuHandler(puzzleService);
    const query = new RevealHaikuQuery('2026-03-10', 2);
    const result = await handler.execute(query);

    expect(result).toBe('a haiku line');
    expect(getHaiku).toHaveBeenCalledWith('2026-03-10', 2);
  });

  it('returns null when service yields no haiku', async () => {
    const getHaiku = vi.fn().mockResolvedValue(null);
    const puzzleService = { getHaiku } as unknown as PuzzleService;

    const handler = new RevealHaikuHandler(puzzleService);
    const result = await handler.execute(new RevealHaikuQuery('2026-03-10', 9));

    expect(result).toBeNull();
  });
});

describe('RevealHaikuQuery', () => {
  it('stores date and index', () => {
    const query = new RevealHaikuQuery('2026-04-01', 0);
    expect(query.date).toBe('2026-04-01');
    expect(query.index).toBe(0);
  });
});
