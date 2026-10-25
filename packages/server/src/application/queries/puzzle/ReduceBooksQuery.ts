import { Query } from '~/application/cqrs/IQuery';
import type { BookValue } from '@gutenku/shared';

export class ReduceBooksQuery extends Query<BookValue[]> {
  constructor(
    public readonly date: string,
    public readonly locale: string = 'en',
    /** Books already guessed: they leave the shelf first */
    public readonly guessedBookIds: readonly string[] = [],
    /** The round reached: clues 1..currentRound are open */
    public readonly currentRound: number = 1,
  ) {
    super();
  }
}
