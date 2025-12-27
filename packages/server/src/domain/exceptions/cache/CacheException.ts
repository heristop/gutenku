import { type ExceptionMetadata, DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export interface CacheMetadata extends ExceptionMetadata {
  operation: 'read' | 'write';
  collectionName?: string;
  documentCount?: number;
}

export class CacheException extends DomainException {
  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: Error;
      metadata?: CacheMetadata;
    },
  ) {
    super(code, message, options);
  }
}

export class CacheReadException extends CacheException {
  constructor(options?: { cause?: Error; collectionName?: string }) {
    super(ErrorCode.CACHE_READ_FAILED, 'Failed to read from haiku cache', {
      cause: options?.cause,
      metadata: {
        operation: 'read',
        collectionName: options?.collectionName ?? 'haikus',
      },
    });
  }
}

export class CacheWriteException extends CacheException {
  constructor(options?: { cause?: Error; collectionName?: string }) {
    super(ErrorCode.CACHE_WRITE_FAILED, 'Failed to write to haiku cache', {
      cause: options?.cause,
      metadata: {
        operation: 'write',
        collectionName: options?.collectionName ?? 'haikus',
      },
    });
  }
}
