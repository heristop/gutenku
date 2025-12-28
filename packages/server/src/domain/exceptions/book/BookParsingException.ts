import { DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export class BookParsingException extends DomainException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: {
        gutenbergId?: number;
        step?: 'metadata' | 'splitting' | 'validation';
        [key: string]: unknown;
      };
    },
  ) {
    super(ErrorCode.BOOK_PARSING_FAILED, message, options);
  }
}
