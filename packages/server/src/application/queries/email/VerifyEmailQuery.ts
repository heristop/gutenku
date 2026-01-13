import { Query } from '~/application/cqrs/IQuery';

export interface VerifyEmailResult {
  success: boolean;
  message: string;
}

export class VerifyEmailQuery extends Query<VerifyEmailResult> {
  constructor(public readonly token: string) {
    super();
  }
}
