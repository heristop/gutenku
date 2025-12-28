import { DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export class BookFetchException extends DomainException {
  constructor(
    gutenbergId: number,
    options?: {
      cause?: Error;
      metadata?: {
        statusCode?: number;
        url?: string;
        [key: string]: unknown;
      };
    },
  ) {
    super(
      ErrorCode.BOOK_FETCH_FAILED,
      `Failed to fetch book ${gutenbergId} from Project Gutenberg`,
      {
        ...options,
        metadata: {
          ...options?.metadata,
          gutenbergId,
        },
      },
    );
  }
}
