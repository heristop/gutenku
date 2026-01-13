import { Query } from '~/application/cqrs/IQuery';

export interface UnsubscribeEmailResult {
  success: boolean;
  message: string;
}

export class UnsubscribeEmailQuery extends Query<UnsubscribeEmailResult> {
  constructor(public readonly token: string) {
    super();
  }
}
