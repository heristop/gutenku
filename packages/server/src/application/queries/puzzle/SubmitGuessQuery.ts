import { Query } from '~/application/cqrs/IQuery';
import type { GuessResult } from '@gutenku/shared';

export interface HintUsage {
  emoticonScratches: number;
  haikuReveals: number;
}

export class SubmitGuessQuery extends Query<GuessResult> {
  constructor(
    public readonly date: string,
    public readonly guessedBookId: string,
    public readonly currentRound: number,
    public readonly hints?: HintUsage,
    public readonly locale: string = 'en',
  ) {
    super();
  }
}
