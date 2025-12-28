import { Query } from '~/application/cqrs/IQuery';
import type { GlobalStatsValue } from '~/domain/repositories/IGlobalStatsRepository';

export class GetGlobalStatsQuery extends Query<GlobalStatsValue> {
  constructor() {
    super();
  }
}
