import { Query } from '~/application/cqrs/IQuery';
import type { HaikuVersion } from '@gutenku/shared';

export class GetHaikuVersionQuery extends Query<HaikuVersion> {
  constructor(public readonly date: string) {
    super();
  }
}
