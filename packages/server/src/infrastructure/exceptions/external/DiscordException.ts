import { ErrorCode } from '~/domain/exceptions/ErrorCode';
import {
  type ExternalServiceMetadata,
  ExternalServiceException,
} from './ExternalServiceException';

export interface DiscordMetadata extends ExternalServiceMetadata {
  webhookUrl?: string;
  messageId?: string;
}

export class DiscordException extends ExternalServiceException {
  constructor(
    message: string,
    options?: {
      cause?: Error;
      metadata?: Omit<DiscordMetadata, 'serviceName'>;
    },
  ) {
    super('Discord', message, options);
    (this as { code: ErrorCode }).code = ErrorCode.DISCORD_ERROR;
  }
}

export class DiscordWebhookException extends DiscordException {
  constructor(options?: { statusCode?: number; cause?: Error }) {
    super('Failed to post message to Discord webhook', {
      cause: options?.cause,
      metadata: { statusCode: options?.statusCode },
    });
  }
}
