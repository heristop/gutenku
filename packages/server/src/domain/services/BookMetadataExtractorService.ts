import { singleton } from 'tsyringe';
import { BookMetadata } from '~/domain/value-objects/BookMetadata';
import type { RawBookText } from '~/domain/value-objects/RawBookText';
import { MetadataExtractionException } from '~/domain/exceptions/book';

export interface MetadataExtractionResult {
  title: string | null;
  author: string | null;
}

@singleton()
export class BookMetadataExtractorService {
  private readonly titlePattern = /Title:\s*(.+?)(?:\r?\n|$)/;
  private readonly authorPattern = /Author:\s*(.+?)(?:\r?\n|$)/;

  extract(rawText: RawBookText): BookMetadata {
    const title = this.extractTitle(rawText.content);
    const author = this.extractAuthor(rawText.content);

    if (!title && !author) {
      throw new MetadataExtractionException('both', {
        metadata: {
          gutenbergId: rawText.gutenbergId,
          contentPreview: rawText.content.substring(0, 200),
        },
      });
    }

    if (!title) {
      throw new MetadataExtractionException('title', {
        metadata: {
          gutenbergId: rawText.gutenbergId,
          contentPreview: rawText.content.substring(0, 200),
        },
      });
    }

    if (!author) {
      throw new MetadataExtractionException('author', {
        metadata: {
          gutenbergId: rawText.gutenbergId,
          contentPreview: rawText.content.substring(0, 200),
        },
      });
    }

    return BookMetadata.create({
      title,
      author,
      gutenbergId: rawText.gutenbergId,
    });
  }

  extractTitle(content: string): string | null {
    const match = content.match(this.titlePattern);
    return match ? match[1].trim() : null;
  }

  extractAuthor(content: string): string | null {
    const match = content.match(this.authorPattern);
    return match ? match[1].trim() : null;
  }

  tryExtract(rawText: RawBookText): MetadataExtractionResult {
    return {
      title: this.extractTitle(rawText.content),
      author: this.extractAuthor(rawText.content),
    };
  }
}
