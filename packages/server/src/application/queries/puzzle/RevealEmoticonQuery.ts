import { Query } from '~/application/cqrs/IQuery';
import type { EmoticonRevealResult } from './RevealEmoticonHandler';

export class RevealEmoticonQuery extends Query<EmoticonRevealResult> {
  constructor(
    public readonly date: string,
    public readonly scratchedPositions: number[],
  ) {
    super();
  }
}
