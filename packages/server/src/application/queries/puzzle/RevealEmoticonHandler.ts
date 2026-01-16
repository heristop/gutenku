import { inject, injectable } from 'tsyringe';
import type { IQueryHandler } from '~/application/cqrs/IQueryHandler';
import type { RevealEmoticonQuery } from './RevealEmoticonQuery';
import { PuzzleService } from '~/domain/services/PuzzleService';

const BASE_VISIBLE_EMOTICONS = 2;

export interface EmoticonRevealResult {
  emoticons: string;
  emoticonCount: number;
  visibleIndices: number[];
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
    return this.puzzleService.getEmoticons(
      query.date,
      BASE_VISIBLE_EMOTICONS,
      query.scratchedPositions,
    );
  }
}
