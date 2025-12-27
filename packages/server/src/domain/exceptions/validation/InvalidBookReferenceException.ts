import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class InvalidBookReferenceException extends ValidationException {
  constructor(reference: string) {
    super(`Invalid book reference format: "${reference}"`, {
      metadata: {
        field: 'reference',
        value: reference,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_BOOK_REFERENCE;
  }
}
