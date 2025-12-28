import { DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export class InsufficientChaptersException extends DomainException {
  constructor(
    foundCount: number,
    requiredCount: number,
    options?: {
      cause?: Error;
      metadata?: {
        gutenbergId?: number;
        patternUsed?: string;
        [key: string]: unknown;
      };
    },
  ) {
    super(
      ErrorCode.INSUFFICIENT_CHAPTERS,
      `Book has insufficient chapters: found ${foundCount}, required ${requiredCount}`,
      {
        ...options,
        metadata: {
          ...options?.metadata,
          foundCount,
          requiredCount,
        },
      },
    );
  }
}
