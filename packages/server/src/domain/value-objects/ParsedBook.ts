import type { BookMetadata } from './BookMetadata';
import type { ChapterContent } from './ChapterContent';
import { ValidationException } from '~/domain/exceptions';

export interface ParsedBookProps {
  readonly metadata: BookMetadata;
  readonly chapters: ChapterContent[];
}

export class ParsedBook {
  private static readonly MIN_CHAPTERS = 8;

  private readonly _metadata: BookMetadata;
  private readonly _chapters: ChapterContent[];

  private constructor(metadata: BookMetadata, chapters: ChapterContent[]) {
    this._metadata = metadata;
    this._chapters = [...chapters];
    Object.freeze(this._chapters);
    Object.freeze(this);
  }

  get metadata(): BookMetadata {
    return this._metadata;
  }

  get chapters(): readonly ChapterContent[] {
    return this._chapters;
  }

  get chapterCount(): number {
    return this._chapters.length;
  }

  get title(): string {
    return this._metadata.title;
  }

  get author(): string {
    return this._metadata.author;
  }

  get gutenbergId(): number {
    return this._metadata.gutenbergId;
  }

  static create(props: ParsedBookProps): ParsedBook {
    if (!props.metadata) {
      throw new ValidationException('Book metadata is required', {
        metadata: {
          field: 'metadata',
        },
      });
    }

    if (!props.chapters || props.chapters.length === 0) {
      throw new ValidationException('Book must have at least one chapter', {
        metadata: {
          field: 'chapters',
          gutenbergId: props.metadata.gutenbergId,
        },
      });
    }

    return new ParsedBook(props.metadata, props.chapters);
  }

  isValid(): boolean {
    return this._chapters.length >= ParsedBook.MIN_CHAPTERS;
  }

  static getMinChapters(): number {
    return ParsedBook.MIN_CHAPTERS;
  }

  equals(other: ParsedBook): boolean {
    if (!this._metadata.equals(other._metadata)) {
      return false;
    }

    if (this._chapters.length !== other._chapters.length) {
      return false;
    }

    return this._chapters.every((chapter, index) =>
      chapter.equals(other._chapters[index]),
    );
  }
}
