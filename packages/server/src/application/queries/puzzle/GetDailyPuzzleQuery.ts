import { Query } from '~/application/cqrs/IQuery';
import type { DailyPuzzleResponse } from '@gutenku/shared';

export class GetDailyPuzzleQuery extends Query<DailyPuzzleResponse> {
  constructor(
    public readonly date: string,
    public readonly revealedRounds: number[] = [],
    public readonly visibleEmoticonCount?: number,
    public readonly revealedHaikuCount?: number,
    public readonly locale: string = 'en',
  ) {
    super();
  }
}
