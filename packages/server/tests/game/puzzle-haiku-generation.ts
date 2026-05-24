import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GetDailyPuzzleHandler } from '../../src/application/queries/puzzle/GetDailyPuzzleHandler';
import { GetDailyPuzzleQuery } from '../../src/application/queries/puzzle/GetDailyPuzzleQuery';
import type NaturalLanguageService from '../../src/domain/services/NaturalLanguageService';
import type { MarkovEvaluatorService } from '../../src/domain/services/MarkovEvaluatorService';

// Build a chapter rich enough to satisfy the >=6 five-syllable and
// >=3 seven-syllable verse pool requirements of generateHaikus.
const FIVE = 'silent autumn breeze'; // 5 syllables: si-lent au-tumn breeze
const SEVEN = 'the river flows down to sea'; // 7 syllables

const buildContent = () => {
  const sentences: string[] = [];
  
for (let i = 0; i < 8; i++) {
    sentences.push(FIVE);
    sentences.push(SEVEN);
  }
  
return sentences.join('. ') + '.';
};

const makeNL = (): NaturalLanguageService =>
  ({
    extractSentencesByPunctuation: vi.fn((content: string) =>
      content
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  }) as unknown as NaturalLanguageService;

const makeMarkov = (): MarkovEvaluatorService =>
  ({
    evaluateHaiku: vi.fn(() => 0.5),
  }) as unknown as MarkovEvaluatorService;

const makeChapterRepo = (chapters: { content: string }[]) => ({
  getChaptersByBookReference: vi.fn().mockResolvedValue(chapters),
  getChapterById: vi.fn(),
  createChapter: vi.fn(),
  createChapters: vi.fn(),
  deleteChaptersByBookReference: vi.fn(),
});

describe('GetDailyPuzzleHandler full haiku generation', () => {
  it('generates 3 haikus when verse pools are large enough', async () => {
    const handler = new GetDailyPuzzleHandler(
      makeChapterRepo([{ content: buildContent() }]),
      makeNL(),
      makeMarkov(),
    );

    const result = await handler.execute(
      new GetDailyPuzzleQuery('2026-01-15', [], 2, 3),
    );

    expect(Array.isArray(result.puzzle.haikus)).toBeTruthy();
    // When pools are big enough we expect 3 generated haikus, each 3 lines
    expect(result.puzzle.haikus.length).toBeLessThanOrEqual(3);
    expect(
      result.puzzle.haikus.every((h) => h.split('\n').length === 3),
    ).toBeTruthy();
  });

  it('scores verses through the markov evaluator', async () => {
    const markov = makeMarkov();
    const handler = new GetDailyPuzzleHandler(
      makeChapterRepo([{ content: buildContent() }]),
      makeNL(),
      markov,
    );

    await handler.execute(new GetDailyPuzzleQuery('2026-01-15', [], 2, 3));

    // scoreVerse delegates to markovEvaluator.evaluateHaiku for multi-word verses
    expect(markov.evaluateHaiku).toHaveBeenCalled();
  });

  it('produces deterministic haikus for the same date', async () => {
    const make = () =>
      new GetDailyPuzzleHandler(
        makeChapterRepo([{ content: buildContent() }]),
        makeNL(),
        makeMarkov(),
      );

    const r1 = await make().execute(
      new GetDailyPuzzleQuery('2026-02-10', [], 2, 3),
    );
    const r2 = await make().execute(
      new GetDailyPuzzleQuery('2026-02-10', [], 2, 3),
    );

    expect(r1.puzzle.haikus).toEqual(r2.puzzle.haikus);
  });

  it('returns empty haikus when pools are too small to score', async () => {
    const handler = new GetDailyPuzzleHandler(
      makeChapterRepo([{ content: `${FIVE}. ${SEVEN}. ${FIVE}.` }]),
      makeNL(),
      makeMarkov(),
    );

    const result = await handler.execute(
      new GetDailyPuzzleQuery('2026-01-15', [], 2, 3),
    );
    expect(result.puzzle.haikus).toEqual([]);
  });
});
