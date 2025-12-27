import { ErrorCode } from '../ErrorCode';
import { ValidationException } from './ValidationException';

export class BlacklistedCharacterException extends ValidationException {
  constructor(verse: string) {
    super(`Verse contains blacklisted characters: "${verse}"`, {
      metadata: {
        field: 'verse',
        value: verse,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.BLACKLISTED_CHARACTER;
  }
}
