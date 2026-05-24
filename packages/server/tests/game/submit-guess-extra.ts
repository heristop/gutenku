import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { SubmitGuessHandler } from '../../src/application/queries/puzzle/SubmitGuessHandler';
import { SubmitGuessQuery } from '../../src/application/queries/puzzle/SubmitGuessQuery';

const makeHandler = () =>
  new SubmitGuessHandler({
    getGlobalStats: vi.fn(),
    incrementGamePlayed: vi.fn().mockResolvedValue(undefined),
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
    const incrementGamePlayed = vi.fn().mockResolvedValue(undefined);
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
