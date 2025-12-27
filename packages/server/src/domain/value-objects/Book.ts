import { BookReference } from './BookReference';
import { ValidationException } from '~/domain/exceptions';
import type { BookValue } from '@gutenku/shared';

export interface BookProps {
  readonly reference: string;
  readonly title: string;
  readonly author: string;
  readonly emoticons?: string;
}

export class Book {
  private readonly _reference: BookReference;
  private readonly _title: string;
  private readonly _author: string;
  private readonly _emoticons?: string;

  private constructor(
    reference: BookReference,
    title: string,
    author: string,
    emoticons?: string,
  ) {
    this._reference = reference;
    this._title = title;
    this._author = author;
    this._emoticons = emoticons;
    Object.freeze(this);
  }

  get reference(): BookReference {
    return this._reference;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get emoticons(): string | undefined {
    return this._emoticons;
  }

  static create(props: BookProps): Book {
    if (!props.title || props.title.trim().length === 0) {
      throw new ValidationException('Book title cannot be empty', {
        metadata: {
          field: 'title',
          value: props.title,
        },
      });
    }

    if (!props.author || props.author.trim().length === 0) {
      throw new ValidationException('Book author cannot be empty', {
        metadata: {
          field: 'author',
          value: props.author,
        },
      });
    }

    const reference = BookReference.create(props.reference);

    return new Book(
      reference,
      props.title.trim(),
      props.author.trim(),
      props.emoticons,
    );
  }

  static fromDTO(dto: BookValue): Book {
    return Book.create({
      reference: dto.reference,
      title: dto.title,
      author: dto.author,
      emoticons: dto.emoticons,
    });
  }

  toDTO(): BookValue {
    return {
      reference: this._reference.value,
      title: this._title,
      author: this._author,
      emoticons: this._emoticons,
    };
  }

  equals(other: Book): boolean {
    return this._reference.equals(other._reference);
  }
}
