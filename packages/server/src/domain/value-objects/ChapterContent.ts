import { ValidationException } from '~/domain/exceptions';

export interface ChapterContentProps {
  readonly content: string;
  readonly index: number;
}

export class ChapterContent {
  private static readonly MIN_CONTENT_LENGTH = 100;

  private readonly _content: string;
  private readonly _index: number;
  private readonly _paragraphCount: number;

  private constructor(content: string, index: number, paragraphCount: number) {
    this._content = content;
    this._index = index;
    this._paragraphCount = paragraphCount;
    Object.freeze(this);
  }

  get content(): string {
    return this._content;
  }

  get index(): number {
    return this._index;
  }

  get paragraphCount(): number {
    return this._paragraphCount;
  }

  get title(): string {
    return `Chapter ${this._index + 1}`;
  }

  static create(props: ChapterContentProps): ChapterContent {
    if (!props.content || props.content.trim().length === 0) {
      throw new ValidationException('Chapter content cannot be empty', {
        metadata: {
          field: 'content',
          index: props.index,
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
            index: props.index,
            constraints: [`minLength: ${this.MIN_CONTENT_LENGTH}`],
          },
        },
      );
    }

    if (!Number.isInteger(props.index) || props.index < 0) {
      throw new ValidationException(
        'Chapter index must be a non-negative integer',
        {
          metadata: {
            field: 'index',
            value: props.index,
          },
        },
      );
    }

    const paragraphCount = ChapterContent.countParagraphs(props.content);

    return new ChapterContent(props.content, props.index, paragraphCount);
  }

  static countParagraphs(content: string): number {
    return content.split('\n').filter((line) => line.trim().length > 0).length;
  }

  equals(other: ChapterContent): boolean {
    return this._index === other._index && this._content === other._content;
  }
}
