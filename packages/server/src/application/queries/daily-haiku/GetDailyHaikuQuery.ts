import { Query } from '~/application/cqrs/IQuery';
import type {
  DailyHaikuNeighbours,
  DailyHaikuRecord,
} from '~/domain/repositories/IDailyHaikuRepository';

export type DailyHaikuRecordWithNeighbours = DailyHaikuRecord &
  Partial<DailyHaikuNeighbours>;

/**
 * Haiku of the current publication day (or the latest one), or the one
 * published on `date`. Future dates resolve to null.
 */
export class GetDailyHaikuQuery extends Query<DailyHaikuRecordWithNeighbours | null> {
  constructor(
    public readonly date?: string,
    public readonly withCard = false,
    public readonly withNeighbours = false,
  ) {
    super();
  }
}
