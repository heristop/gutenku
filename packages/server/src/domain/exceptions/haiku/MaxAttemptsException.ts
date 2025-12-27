import { ErrorCode } from '../ErrorCode';
import {
  type HaikuGenerationMetadata,
  HaikuGenerationException,
} from './HaikuGenerationException';

export interface MaxAttemptsMetadata extends HaikuGenerationMetadata {
  maxAttempts: number;
  versesFound: number;
  filterWords?: string[];
}

export class MaxAttemptsException extends HaikuGenerationException {
  constructor(options: {
    maxAttempts: number;
    versesFound: number;
    filterWords?: string[];
    cause?: Error;
  }) {
    const message = `Failed to generate haiku after ${options.maxAttempts} attempts. Found ${options.versesFound}/3 valid verses.`;

    super(message, {
      cause: options.cause,
      metadata: {
        maxAttempts: options.maxAttempts,
        versesFound: options.versesFound,
        filterWords: options.filterWords,
      },
    });

    // Override the error code
    (this as { code: ErrorCode }).code = ErrorCode.MAX_ATTEMPTS_EXCEEDED;
  }
}
