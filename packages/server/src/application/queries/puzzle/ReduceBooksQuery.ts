import { Query } from '~/application/cqrs/IQuery';
import type { BookValue } from '@gutenku/shared';

export class ReduceBooksQuery extends Query<BookValue[]> {
  constructor(
    public readonly date: string,
    public readonly locale: string = 'en',
  ) {
    super();
  }
}
