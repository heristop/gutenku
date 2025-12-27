import { type ExceptionMetadata, DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export interface ValidationMetadata extends ExceptionMetadata {
  field?: string;
  value?: unknown;
  constraints?: string[];
}

export class ValidationException extends DomainException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: ValidationMetadata;
    },
  ) {
    super(ErrorCode.VALIDATION_FAILED, message, options);
  }
}
