import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { RevealHaikuQuery } from './RevealHaikuQuery';
import { GetDailyPuzzleHandler } from './GetDailyPuzzleHandler';

@injectable()
export class RevealHaikuHandler implements IQueryHandler<
  RevealHaikuQuery,
  string | null
> {
  constructor(
    // The puzzle's own haiku list: the free haiku and the paid ones come from
    // one generator, so they agree on every fetch
    @inject(GetDailyPuzzleHandler)
    private readonly puzzleHandler: Pick<GetDailyPuzzleHandler, 'getHaiku'>,
  ) {}

  async execute(query: RevealHaikuQuery): Promise<string | null> {
    return this.puzzleHandler.getHaiku(query.date, query.index);
  }
}
