import { Query } from '~/application/cqrs/IQuery';

export class RevealHaikuQuery extends Query<string | null> {
  constructor(
    public readonly date: string,
    public readonly index: number,
  ) {
    super();
  }
}
