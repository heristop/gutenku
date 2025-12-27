import { Query } from '~/application/cqrs/IQuery';
import type { BookValue } from '~/shared/types';

export class GetAllBooksQuery extends Query<BookValue[]> {
  constructor(public readonly filter?: string | null) {
    super();
  }
}
