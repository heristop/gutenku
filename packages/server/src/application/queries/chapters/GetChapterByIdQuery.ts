import { Query } from '~/application/cqrs/IQuery';
import type { ChapterValue } from '~/shared/types';

export class GetChapterByIdQuery extends Query<ChapterValue | null> {
  constructor(public readonly id: string) {
    super();
  }
}
