import { ErrorCode } from '../ErrorCode';
import {
  type ValidationMetadata,
  ValidationException,
} from './ValidationException';

export type VerseValidationReason =
  | 'syllables'
  | 'grammar'
  | 'length'
  | 'blacklisted_chars'
  | 'uppercase'
  | 'conjunction_start'
  | 'invalid_start_word'
  | 'invalid_end_word'
  | 'lost_letter';

export interface VerseValidationMetadata extends ValidationMetadata {
  verse: string;
  syllableCount?: number;
  expectedSyllables?: number;
  grammarScore?: number;
  reason?: VerseValidationReason;
}

export class InvalidVerseException extends ValidationException {
  constructor(
    verse: string,
    options: {
      reason: VerseValidationReason;
      syllableCount?: number;
      expectedSyllables?: number;
      grammarScore?: number;
      cause?: Error;
    },
  ) {
    const reasonMessages: Record<VerseValidationReason, string> = {
      syllables: `Verse has ${options.syllableCount} syllables, expected ${options.expectedSyllables}`,
      grammar: `Verse has low grammar score: ${options.grammarScore}`,
      length: 'Verse exceeds maximum length',
      blacklisted_chars: 'Verse contains blacklisted characters',
      uppercase: 'Verse contains uppercase words',
      conjunction_start: 'First verse cannot start with conjunction',
      invalid_start_word: 'Verse starts with invalid word',
      invalid_end_word: 'Verse ends with invalid word',
      lost_letter: 'Verse has lost letter at end',
    };

    const message = reasonMessages[options.reason] ?? 'Verse validation failed';

    super(message, {
      cause: options.cause,
      metadata: {
        field: 'verse',
        verse,
        ...options,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.INVALID_VERSE;
  }
}
