import { Query } from '~/application/cqrs/IQuery';
import type { DailyHaikuNeighbours } from '~/domain/repositories/IDailyHaikuRepository';

/** Nearest recorded days around `date`, never beyond the current one. */
export class GetDailyHaikuNeighboursQuery extends Query<DailyHaikuNeighbours> {
  constructor(public readonly date: string) {
    super();
  }
}
