import { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type InfrastructureMetadata,
  InfrastructureException,
} from '../InfrastructureException';

export interface ConfigMetadata extends InfrastructureMetadata {
  variableName?: string;
  expectedType?: string;
}

export class ConfigurationException extends InfrastructureException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: ConfigMetadata;
    },
  ) {
    super(ErrorCode.CONFIGURATION_ERROR, message, options);
  }
}

export class MissingApiKeyException extends ConfigurationException {
  constructor(serviceName: string) {
    super(`Missing API key for service: ${serviceName}`, {
      metadata: {
        service: serviceName,
        variableName: `${serviceName.toUpperCase()}_API_KEY`,
      },
    });
    (this as { code: ErrorCode }).code = ErrorCode.MISSING_API_KEY;
  }
}

export class MissingEnvVarException extends ConfigurationException {
  constructor(variableName: string, expectedType?: string) {
    super(`Missing required environment variable: ${variableName}`, {
      metadata: {
        variableName,
        expectedType,
      },
    });
    (this as { code: ErrorCode }).code = ErrorCode.MISSING_ENV_VAR;
  }
}
