import { Query } from '~/application/cqrs/IQuery';
import type { BookValue } from '~/shared/types';

export class GetBookByIdQuery extends Query<BookValue | null> {
  constructor(public readonly id: string) {
    super();
  }
}
