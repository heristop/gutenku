import { Query } from '~/application/cqrs/IQuery';
import type { GuessResult } from '@gutenku/shared';

export class SubmitGuessQuery extends Query<GuessResult> {
  constructor(
    public readonly date: string,
    public readonly guessedBookId: string,
    public readonly currentRound: number,
  ) {
    super();
  }
}
