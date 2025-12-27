import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class InvalidFilterException extends ValidationException {
  constructor(
    filterWords: string[],
    options?: {
      reason?: string;
      cause?: Error;
    },
  ) {
    const message = options?.reason
      ? `Invalid filter words: ${options.reason}`
      : `Invalid filter words: ${filterWords.join(', ')}`;

    super(message, {
      cause: options?.cause,
      metadata: {
        field: 'filter',
        value: filterWords,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_FILTER;
  }
}
