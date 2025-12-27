import type { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type ExceptionMetadata,
  DomainException,
} from '~/domain/exceptions/DomainException';

export interface InfrastructureMetadata extends ExceptionMetadata {
  service?: string;
  operation?: string;
}

export abstract class InfrastructureException extends DomainException {
  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: Error;
      metadata?: InfrastructureMetadata;
    },
  ) {
    super(code, message, options);
  }
}
