import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { RevealHaikuQuery } from './RevealHaikuQuery';
import { PuzzleService } from '~/domain/services/PuzzleService';

@injectable()
export class RevealHaikuHandler implements IQueryHandler<
  RevealHaikuQuery,
  string | null
> {
  constructor(
    @inject(PuzzleService)
    private readonly puzzleService: PuzzleService,
  ) {}

  async execute(query: RevealHaikuQuery): Promise<string | null> {
    return this.puzzleService.getHaiku(query.date, query.index);
  }
}
