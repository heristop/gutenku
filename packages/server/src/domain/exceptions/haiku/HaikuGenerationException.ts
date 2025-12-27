import { type ExceptionMetadata, DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export interface HaikuGenerationMetadata extends ExceptionMetadata {
  attemptCount?: number;
  bookReference?: string;
  chapterId?: string;
}

export class HaikuGenerationException extends DomainException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: HaikuGenerationMetadata;
    },
  ) {
    super(ErrorCode.HAIKU_GENERATION_FAILED, message, options);
  }
}
