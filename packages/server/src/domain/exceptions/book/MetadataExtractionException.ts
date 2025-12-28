import { DomainException } from '../DomainException';
import { ErrorCode } from '../ErrorCode';

export class MetadataExtractionException extends DomainException {
  constructor(
    field: 'title' | 'author' | 'both',
    options?: {
      cause?: Error;
      metadata?: {
        gutenbergId?: number;
        contentPreview?: string;
        [key: string]: unknown;
      };
    },
  ) {
    super(
      ErrorCode.METADATA_EXTRACTION_FAILED,
      `Failed to extract ${field} from book text`,
      options,
    );
  }
}
