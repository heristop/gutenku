import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class InvalidSyllableCountException extends ValidationException {
  constructor(expected: number, actual: number, verse: string) {
    super(
      `Expected ${expected} syllables, got ${actual} for verse: "${verse}"`,
      {
        metadata: {
          field: 'syllableCount',
          value: actual,
          constraints: [`expected: ${expected}`],
        },
      },
    );

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_SYLLABLE_COUNT;
  }
}
