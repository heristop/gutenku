import { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type InfrastructureMetadata,
  InfrastructureException,
} from '../InfrastructureException';

export interface DatabaseMetadata extends InfrastructureMetadata {
  database?: string;
  collection?: string;
  operation?: 'connect' | 'query' | 'insert' | 'update' | 'delete';
}

export class DatabaseException extends InfrastructureException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: DatabaseMetadata;
    },
  ) {
    super(ErrorCode.DATABASE_ERROR, message, {
      ...options,
      metadata: { service: 'MongoDB', ...options?.metadata },
    });
  }
}

export class ConnectionException extends DatabaseException {
  constructor(options?: { uri?: string; database?: string; cause?: Error }) {
    super('Failed to connect to MongoDB', {
      cause: options?.cause,
      metadata: {
        operation: 'connect',
        database: options?.database,
      },
    });

    (this as { code: ErrorCode }).code = ErrorCode.CONNECTION_FAILED;
  }
}

export class QueryException extends DatabaseException {
  constructor(options: {
    collection: string;
    operation: 'query' | 'insert' | 'update' | 'delete';
    cause?: Error;
  }) {
    super(
      `MongoDB ${options.operation} failed on collection: ${options.collection}`,
      {
        cause: options.cause,
        metadata: {
          collection: options.collection,
          operation: options.operation,
        },
      },
    );

    (this as { code: ErrorCode }).code = ErrorCode.QUERY_FAILED;
  }
}
