import { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type InfrastructureMetadata,
  InfrastructureException,
} from '../InfrastructureException';

export interface ExternalServiceMetadata extends InfrastructureMetadata {
  serviceName: string;
  endpoint?: string;
  statusCode?: number;
  requestId?: string;
}

export class ExternalServiceException extends InfrastructureException {
  constructor(
    serviceName: string,
    message: string,
    options?: {
      cause?: Error;
      metadata?: Omit<ExternalServiceMetadata, 'serviceName'>;
    },
  ) {
    super(ErrorCode.EXTERNAL_SERVICE_ERROR, message, {
      ...options,
      metadata: { serviceName, ...options?.metadata },
    });
  }
}
