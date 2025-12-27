import { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type ExternalServiceMetadata,
  ExternalServiceException,
} from './ExternalServiceException';

export interface OpenAIMetadata extends ExternalServiceMetadata {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  retryAfter?: number;
}

export class OpenAIException extends ExternalServiceException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: Omit<OpenAIMetadata, 'serviceName'>;
    },
  ) {
    super('OpenAI', message, options);
    (this as { code: ErrorCode }).code = ErrorCode.OPENAI_ERROR;
  }
}

export class OpenAINotConfiguredException extends OpenAIException {
  constructor() {
    super(
      'OpenAI client not configured. Call configure() before making requests.',
    );
    (this as { code: ErrorCode }).code = ErrorCode.OPENAI_NOT_CONFIGURED;
  }
}

export class OpenAIRateLimitException extends OpenAIException {
  constructor(options?: { retryAfter?: number; cause?: Error }) {
    super(
      `OpenAI rate limit exceeded. Retry after ${options?.retryAfter ?? 'unknown'} seconds.`,
      {
        cause: options?.cause,
        metadata: { retryAfter: options?.retryAfter } as Omit<
          OpenAIMetadata,
          'serviceName'
        >,
      },
    );
    (this as { code: ErrorCode }).code = ErrorCode.OPENAI_RATE_LIMITED;
  }
}
