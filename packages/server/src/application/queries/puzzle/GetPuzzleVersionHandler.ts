import { injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs';
import type { GetPuzzleVersionQuery } from './GetPuzzleVersionQuery';
import { getPuzzleNumber, type PuzzleVersion } from '@gutenku/shared';
import { getGutenGuessBooks } from '~~/data';

@injectable()
export class GetPuzzleVersionHandler implements IQueryHandler<
  GetPuzzleVersionQuery,
  PuzzleVersion
> {
  async execute(query: GetPuzzleVersionQuery): Promise<PuzzleVersion> {
    const puzzleNumber = getPuzzleNumber(query.date);
    const bookCount = getGutenGuessBooks().length;

    return {
      puzzleNumber,
      version: `${puzzleNumber}-${bookCount}`,
    };
  }
}
