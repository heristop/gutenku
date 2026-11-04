import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';
import { selectDailyBook } from '../../src/domain/services/PuzzleService';
import { GUTENGUESS_BOOKS } from '../../data/gutenguess-books';

const makeHandler = () =>
  new SubmitGuessHandler({
    getGlobalStats: vi.fn(),
    incrementGamePlayed: vi.fn().mockResolvedValue(),
  });

// A full fixture cycle contains each of the three books exactly once.
const dateForBook = (id: number) => {
  const date = ['2026-01-01', '2026-01-02', '2026-01-03'].find(
    (day) => selectDailyBook(day).id === id,
  );
  if (!date) {
    throw new Error(`Missing fixture date for book ${id}`);
  }
  return date;
};

describe('SubmitGuessHandler book anecdotes', () => {
  it.each(['en', 'fr', 'ja'] as const)(
    'returns the %s anecdote on both victory and final defeat',
    async (locale) => {
      const book = GUTENGUESS_BOOKS.find((entry) => entry.id === 11)!;
      const handler = makeHandler();
      const date = dateForBook(book.id);
      const won = await handler.execute(
        new SubmitGuessQuery(date, '11', 1, undefined, locale),
      );
      const lost = await handler.execute(
        new SubmitGuessQuery(date, 'wrong-book-id', 6, undefined, locale),
      );

      expect(won.isCorrect).toBeTruthy();
      expect(lost.isCorrect).toBeFalsy();
      expect(won.correctBook?.anecdote).toBe(book.anecdote![locale]);
      expect(lost.correctBook?.anecdote).toBe(book.anecdote![locale]);
    },
  );

  it.each([1, 2, 3, 4, 5])(
    'does not reveal an anecdote after a wrong guess in round %i',
    async (round) => {
      const result = await makeHandler().execute(
        new SubmitGuessQuery(dateForBook(11), 'wrong-book-id', round),
      );

      expect(result.correctBook).toBeUndefined();
      expect(JSON.stringify(result)).not.toContain('anecdote');
    },
  );

  it.each(['fr', 'ja', 'zz'])(
    'falls back to English when the %s anecdote is unavailable',
    async (locale) => {
      const book = GUTENGUESS_BOOKS.find((entry) => entry.id === 84)!;
      const result = await makeHandler().execute(
        new SubmitGuessQuery(dateForBook(book.id), '84', 1, undefined, locale),
      );

      expect(result.correctBook?.anecdote).toBe(book.anecdote!.en);
    },
  );

  it('supports an older book with no anecdote', async () => {
    const result = await makeHandler().execute(
      new SubmitGuessQuery(dateForBook(1342), '1342', 1, undefined, 'fr'),
    );

    expect(result.isCorrect).toBeTruthy();
    expect(result.correctBook?.anecdote).toBeUndefined();
  });

  it('falls back to English for an anecdote in an unsupported locale', async () => {
    const book = GUTENGUESS_BOOKS.find((entry) => entry.id === 11)!;
    const result = await makeHandler().execute(
      new SubmitGuessQuery(dateForBook(11), '11', 1, undefined, 'zz'),
    );
    expect(result.correctBook?.anecdote).toBe(book.anecdote!.en);
  });
});

describe('SubmitGuessHandler locale and hint usage', () => {
  it('localizes the correct book on game over for the fr locale', async () => {
    const handler = makeHandler();
    const result = await handler.execute(
      new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6, undefined, 'fr'),
    );
    expect(result.correctBook).toBeDefined();
    expect(typeof result.correctBook?.title).toBe('string');
    expect(typeof result.correctBook?.summary).toBe('string');
  });

  it('localizes for the ja locale', async () => {
    const handler = makeHandler();
    const result = await handler.execute(
      new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6, undefined, 'ja'),
    );
    expect(result.correctBook).toBeDefined();
  });

  it('falls back to en for an unsupported locale', async () => {
    const handler = makeHandler();
    const result = await handler.execute(
      new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6, undefined, 'zz'),
    );
    expect(result.correctBook).toBeDefined();
  });

  it('uses provided hint usage counters in stats tracking', async () => {
    const incrementGamePlayed = vi.fn().mockResolvedValue();
    const handler = new SubmitGuessHandler({
      getGlobalStats: vi.fn(),
      incrementGamePlayed,
    });

    await handler.execute(
      new SubmitGuessQuery('2026-01-15', 'wrong-book-id', 6, {
        emoticonScratches: 3,
        haikuReveals: 2,
      }),
    );

    await new Promise((r) => {
      setTimeout(r, 10);
    });

    expect(incrementGamePlayed).toHaveBeenCalledWith(false, {
      emoticonScratches: 3,
      haikuReveals: 2,
      roundHints: 5,
    });
  });

  it('localizes the correct book when the guess is correct', async () => {
    const handler = makeHandler();
    // brute-force find the correct book for the date, then submit it with fr locale
    const probe = makeHandler();
    const { getGutenGuessBooks } = await import('../../data');
    let correctRef: string | undefined;

    for (const book of getGutenGuessBooks()) {
      const r = await probe.execute(
        new SubmitGuessQuery('2026-01-15', book.id.toString(), 1),
      );

      if (r.isCorrect) {
        correctRef = book.id.toString();
        break;
      }
    }
    expect(correctRef).toBeDefined();

    const result = await handler.execute(
      new SubmitGuessQuery('2026-01-15', correctRef!, 1, undefined, 'fr'),
    );
    expect(result.isCorrect).toBeTruthy();
    expect(result.correctBook?.title.length).toBeGreaterThan(0);
  });
});
