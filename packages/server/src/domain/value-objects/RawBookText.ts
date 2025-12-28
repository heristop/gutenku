import { ValidationException } from '~/domain/exceptions';

export interface RawBookTextProps {
  readonly content: string;
  readonly gutenbergId: number;
}

export class RawBookText {
  private readonly _content: string;
  private readonly _gutenbergId: number;

  private constructor(content: string, gutenbergId: number) {
    this._content = content;
    this._gutenbergId = gutenbergId;
    Object.freeze(this);
  }

  get content(): string {
    return this._content;
  }

  get gutenbergId(): number {
    return this._gutenbergId;
  }

  static create(props: RawBookTextProps): RawBookText {
    if (!props.content || props.content.trim().length === 0) {
      throw new ValidationException('Raw book text content cannot be empty', {
        metadata: {
          field: 'content',
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

    return new RawBookText(props.content, props.gutenbergId);
  }

  equals(other: RawBookText): boolean {
    return (
      this._gutenbergId === other._gutenbergId &&
      this._content === other._content
    );
  }
}
