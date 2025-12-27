import { Query } from '~/application/cqrs/IQuery';
import type { BookValue } from '~/shared/types';

export class SelectRandomBookQuery extends Query<BookValue> {
  constructor() {
    super();
  }
}
