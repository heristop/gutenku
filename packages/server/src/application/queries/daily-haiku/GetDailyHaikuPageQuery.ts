import { Query } from '~/application/cqrs/IQuery';
import type { DailyHaikuRecordWithNeighbours } from './GetDailyHaikuQuery';

export interface DailyHaikuRecordPage {
  /** Newest first; every item carries its previous/next recorded dates. */
  records: DailyHaikuRecordWithNeighbours[];
  nextBefore: string | null;
  hasMore: boolean;
}

/** Archive page, newest first, strictly before `before` (exclusive cursor). */
export class GetDailyHaikuPageQuery extends Query<DailyHaikuRecordPage> {
  constructor(
    public readonly before: string | undefined,
    public readonly limit: number,
  ) {
    super();
  }
}
