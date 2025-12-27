import { syllable } from 'syllable';
import { ValidationException } from '~/domain/exceptions';

export class SyllableCount {
  private constructor(private readonly _value: number) {
    Object.freeze(this);
  }

  get value(): number {
    return this._value;
  }

  static fromText(text: string): SyllableCount {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const count = words.reduce((sum, word) => sum + syllable(word), 0);
    return new SyllableCount(count);
  }

  static create(count: number): SyllableCount {
    if (count < 0) {
      throw new ValidationException('Syllable count cannot be negative', {
        metadata: {
          field: 'syllableCount',
          value: count,
        },
      });
    }
    return new SyllableCount(count);
  }

  equals(other: SyllableCount): boolean {
    return this._value === other._value;
  }

  isValidFor(expectedCount: number): boolean {
    return this._value === expectedCount;
  }
}
