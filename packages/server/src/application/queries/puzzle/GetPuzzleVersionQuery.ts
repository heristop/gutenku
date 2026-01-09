import { Query } from '~/application/cqrs/IQuery';
import type { PuzzleVersion } from '@gutenku/shared';

export class GetPuzzleVersionQuery extends Query<PuzzleVersion> {
  constructor(public readonly date: string) {
    super();
  }
}
