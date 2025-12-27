import { InvalidBookReferenceException } from '~/domain/exceptions';

export class BookReference {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  static create(reference: string): BookReference {
    if (!reference || reference.trim().length === 0) {
      throw new InvalidBookReferenceException(reference);
    }
    return new BookReference(reference.trim());
  }

  equals(other: BookReference): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
