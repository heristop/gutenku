import { injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type { GetPuzzleVersionQuery } from './GetPuzzleVersionQuery';
import { getPuzzleNumber, type PuzzleVersion } from '@gutenku/shared';
import { getGutenGuessBooks } from '~~/data';

/**
 * Bumped whenever the way a day's puzzle is built changes (clue ramp, shelf,
 * narrowing). A client that cached the puzzle under another generation
 * refetches it, keeping its guesses (see the front's fetchDailyPuzzle).
 * g2: tiered clue ramp, daily decoys with neighbours, state-aware narrowing.
 */
export const PUZZLE_GENERATION = 'g2';

export function puzzleVersionFor(puzzleNumber: number): string {
  return `${puzzleNumber}-${getGutenGuessBooks().length}-${PUZZLE_GENERATION}`;
}

@injectable()
export class GetPuzzleVersionHandler implements IQueryHandler<
  GetPuzzleVersionQuery,
  PuzzleVersion
> {
  async execute(query: GetPuzzleVersionQuery): Promise<PuzzleVersion> {
    const puzzleNumber = getPuzzleNumber(query.date);

    return {
      puzzleNumber,
      version: puzzleVersionFor(puzzleNumber),
    };
  }
}
