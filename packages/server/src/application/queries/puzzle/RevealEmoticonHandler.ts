import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { RevealEmoticonQuery } from './RevealEmoticonQuery';
import { PuzzleService } from '~/domain/services/PuzzleService';

export interface EmoticonRevealResult {
  emoticons: string;
  emoticonCount: number;
}

@injectable()
export class RevealEmoticonHandler implements IQueryHandler<
  RevealEmoticonQuery,
  EmoticonRevealResult
> {
  constructor(
    @inject(PuzzleService)
    private readonly puzzleService: PuzzleService,
  ) {}

  async execute(query: RevealEmoticonQuery): Promise<EmoticonRevealResult> {
    return this.puzzleService.getEmoticons(query.date, query.count);
  }
}
