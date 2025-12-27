import { Query } from '~/application/cqrs/IQuery';
import type { ChapterValue } from '~/shared/types';

export class GetAllChaptersQuery extends Query<ChapterValue[]> {
  constructor(public readonly filter?: string | null) {
    super();
  }
}
