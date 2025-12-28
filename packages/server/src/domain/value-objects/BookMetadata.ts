import { ValidationException } from '~/domain/exceptions';

export interface BookMetadataProps {
  readonly title: string;
  readonly author: string;
  readonly gutenbergId: number;
}

export class BookMetadata {
  private readonly _title: string;
  private readonly _author: string;
  private readonly _gutenbergId: number;

  private constructor(title: string, author: string, gutenbergId: number) {
    this._title = title;
    this._author = author;
    this._gutenbergId = gutenbergId;
    Object.freeze(this);
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get gutenbergId(): number {
    return this._gutenbergId;
  }

  static create(props: BookMetadataProps): BookMetadata {
    if (!props.title || props.title.trim().length === 0) {
      throw new ValidationException('Book title cannot be empty', {
        metadata: {
          field: 'title',
          gutenbergId: props.gutenbergId,
        },
      });
    }

    if (!props.author || props.author.trim().length === 0) {
      throw new ValidationException('Book author cannot be empty', {
        metadata: {
          field: 'author',
          gutenbergId: props.gutenbergId,
        },
      });
    }

    if (!Number.isInteger(props.gutenbergId) || props.gutenbergId <= 0) {
      throw new ValidationException('Gutenberg ID must be a positive integer', {
        metadata: {
          field: 'gutenbergId',
          value: props.gutenbergId,
        },
      });
    }

    return new BookMetadata(
      props.title.trim(),
      props.author.trim(),
      props.gutenbergId,
    );
  }

  equals(other: BookMetadata): boolean {
    return (
      this._gutenbergId === other._gutenbergId &&
      this._title === other._title &&
      this._author === other._author
    );
  }
}
