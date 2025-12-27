import { ValidationException } from '~/domain/exceptions';
import type { ChapterValue } from '@gutenku/shared';

export interface ChapterProps {
  readonly title?: string;
  readonly content: string;
}

export class Chapter {
  private static readonly MIN_CONTENT_LENGTH = 100;

  private readonly _title?: string;
  private readonly _content: string;

  private constructor(content: string, title?: string) {
    this._content = content;
    this._title = title;
    Object.freeze(this);
  }

  get title(): string | undefined {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  static create(props: ChapterProps): Chapter {
    if (!props.content || props.content.trim().length === 0) {
      throw new ValidationException('Chapter content cannot be empty', {
        metadata: {
          field: 'content',
          value: props.content,
        },
      });
    }

    if (props.content.length < this.MIN_CONTENT_LENGTH) {
      throw new ValidationException(
        `Chapter content must be at least ${this.MIN_CONTENT_LENGTH} characters`,
        {
          metadata: {
            field: 'content',
            value: props.content.length,
            constraints: [`minLength: ${this.MIN_CONTENT_LENGTH}`],
          },
        },
      );
    }

    return new Chapter(props.content, props.title?.trim());
  }

  static fromDTO(dto: ChapterValue): Chapter {
    return Chapter.create({
      title: dto.title,
      content: dto.content,
    });
  }

  toDTO(): ChapterValue {
    return {
      title: this._title,
      content: this._content,
    };
  }

  equals(other: Chapter): boolean {
    return this._content === other._content && this._title === other._title;
  }
}
