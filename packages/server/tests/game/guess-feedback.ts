import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GetDailyPuzzleHandler } from '../../src/application/queries/puzzle/GetDailyPuzzleHandler';
import { GetDailyPuzzleQuery } from '../../src/application/queries/puzzle/GetDailyPuzzleQuery';
import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';
import { ReduceBooksHandler } from '../../src/application/queries/puzzle/ReduceBooksHandler';
import { ReduceBooksQuery } from '../../src/application/queries/puzzle/ReduceBooksQuery';
import { selectDailyBook } from '../../src/domain/services/PuzzleService';
import { getGutenGuessBooks } from '~~/data';

const DATE = '2026-01-15';
const stats = {
  getGlobalStats: vi.fn(),
  incrementGamePlayed: vi.fn(async () => {}),
};
const answer = selectDailyBook(DATE);
const wrongBook = getGutenGuessBooks().find((b) => b.id !== answer.id)!;

describe('GetDailyPuzzleHandler upcoming clue types', () => {
  it('names every round clue type without opening their content', async () => {
    const { puzzle } = await new GetDailyPuzzleHandler().execute(
      new GetDailyPuzzleQuery(DATE, [1]),
    );

    expect(puzzle.hintTypes).toHaveLength(6);
    expect(puzzle.hintTypes?.[0]).toBe('emoticons');
    expect(puzzle.hints).toHaveLength(1);
    expect(puzzle.version).toMatch(/-g\d+$/);
  });

  it('agrees with the clue each miss opens', async () => {
    const { puzzle } = await new GetDailyPuzzleHandler().execute(
      new GetDailyPuzzleQuery(DATE, [1]),
    );
    const handler = new SubmitGuessHandler(stats as never);

    for (let round = 1; round < 6; round++) {
      const result = await handler.execute(
        new SubmitGuessQuery(DATE, wrongBook.id.toString(), round),
      );

      expect(result.nextHint?.type).toBe(puzzle.hintTypes?.[round]);
    }
  });
});

describe('ReduceBooksHandler with the game state', () => {
  it('drops books already guessed and keeps the answer', async () => {
    const result = await new ReduceBooksHandler().execute(
      new ReduceBooksQuery(DATE, 'en', [wrongBook.id.toString()], 2),
    );
    const refs = result.map((b) => b.reference);

    expect(refs).not.toContain(wrongBook.id.toString());
    expect(refs).toContain(answer.id.toString());
  });

  it('rejects an out-of-range round', async () => {
    await expect(
      new ReduceBooksHandler().execute(new ReduceBooksQuery(DATE, 'en', [], 9)),
    ).rejects.toThrow(/currentRound|too_big|Too big|<=6/i);
  });
});
