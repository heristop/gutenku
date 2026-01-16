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
  // Maximum header size to search for metadata
  private readonly maxHeaderSize = 3000;

  // Pattern to find the end of Gutenberg header
  private readonly headerEndPattern =
    /\*{3}\s*START\s+OF\s+(?:THE\s+)?PROJECT\s+GUTENBERG/i;

  // Title pattern - captures content after "Title:" until a newline
  // Works with: "Title:", "TITLE:", "Title :"
  private readonly titlePattern = /Title\s*:\s*(.+?)(?:\r?\n|$)/i;

  // Author pattern - captures content after "Author:" until a newline
  private readonly authorPattern = /Author\s*:\s*(.+?)(?:\r?\n|$)/i;

  // Fallback patterns for anonymous/translated works
  private readonly translatorPattern = /Translator\s*:\s*(.+?)(?:\r?\n|$)/i;
  private readonly editorPattern = /Editor\s*:\s*(.+?)(?:\r?\n|$)/i;
  private readonly retoldByPattern = /Retold\s+by\s*:\s*(.+?)(?:\r?\n|$)/i;

  /**
   * Extract the Gutenberg header portion for metadata search.
   */
  private extractHeader(content: string): string {
    const headerEnd = content.search(this.headerEndPattern);

    if (headerEnd > 0) {
      return content.substring(0, headerEnd);
    }
    // Fallback: use first maxHeaderSize characters
    return content.substring(0, this.maxHeaderSize);
  }

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
    const header = this.extractHeader(content);
    const match = header.match(this.titlePattern);

    if (!match) {
      return null;
    }

    // Clean multi-line titles: collapse whitespace and newlines
    return this.cleanMultilineValue(match[1]);
  }

  extractAuthor(content: string): string | null {
    const header = this.extractHeader(content);

    // Try Author first
    let match = header.match(this.authorPattern);

    if (match) {
      return this.cleanMultilineValue(match[1]);
    }

    // Fallback to Translator for anonymous/translated works
    match = header.match(this.translatorPattern);

    if (match) {
      return this.cleanMultilineValue(match[1]);
    }

    // Fallback to Editor for compiled works
    match = header.match(this.editorPattern);

    if (match) {
      return this.cleanMultilineValue(match[1]);
    }

    // Fallback to "Retold by" for adaptations
    match = header.match(this.retoldByPattern);

    if (match) {
      return this.cleanMultilineValue(match[1]);
    }

    return null;
  }

  /**
   * Clean multi-line metadata value by collapsing whitespace.
   */
  private cleanMultilineValue(value: string): string {
    return value
      .replaceAll(/\r?\n\s*/g, ' ') // Collapse newlines with any indentation
      .replaceAll(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  }

  tryExtract(rawText: RawBookText): MetadataExtractionResult {
    return {
      title: this.extractTitle(rawText.content),
      author: this.extractAuthor(rawText.content),
    };
  }
}
