import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class InvalidVerseCountException extends ValidationException {
  constructor(expected: number, actual: number) {
    super(`Haiku must have exactly ${expected} verses, got ${actual}`, {
      metadata: {
        field: 'verses',
        value: actual,
        constraints: [`expected: ${expected}`],
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_VERSE_COUNT;
  }
}
