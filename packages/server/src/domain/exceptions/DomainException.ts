import type { ErrorCode } from './ErrorCode';

export interface ExceptionMetadata {
  [key: string]: unknown;
}

export abstract class DomainException extends Error {
  public readonly code: ErrorCode;
  public readonly cause?: Error;
  public readonly metadata: ExceptionMetadata;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: Error;
      metadata?: ExceptionMetadata;
    },
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = options?.cause;
    this.metadata = options?.metadata ?? {};
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      cause: this.cause?.message,
      stack: this.stack,
    };
  }
}
