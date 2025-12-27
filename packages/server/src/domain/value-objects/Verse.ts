import { SyllableCount } from './SyllableCount';
import {
  InvalidVerseException,
  InvalidSyllableCountException,
  BlacklistedCharacterException,
} from '~/domain/exceptions';

export interface VerseProps {
  readonly text: string;
  readonly expectedSyllables: number;
  readonly isFirstVerse?: boolean;
}

export class Verse {
  private static readonly BLACKLISTED_CHARS_REGEX =
    /(@|[0-9]|Mr|Mrs|Dr|#|\[|\||\(|\)|"|"|"|'|'|\/|--|:|,|_|—|\+|=|{|}|\]|\*|\$|%|\r|\n|;|~|&|\/)/g;
  private static readonly FIRST_WORDS_REGEX = /^(said|cried|inquired)/i;
  private static readonly LAST_WORDS_REGEX = /(or|and|of)$/i;
  private static readonly CONJUNCTION_START_REGEX = /^(and|but|or|of)/i;
  private static readonly UPPERCASE_REGEX = /^[A-Z\s!:.?]+$/;
  private static readonly LOST_LETTER_REGEX = /\b[A-Z]\b$/;
  private static readonly MAX_LENGTH = 30;

  private readonly _text: string;
  private readonly _syllableCount: SyllableCount;
  private readonly _cleanedText: string;

  private constructor(
    text: string,
    syllableCount: SyllableCount,
    cleanedText: string,
  ) {
    this._text = text;
    this._syllableCount = syllableCount;
    this._cleanedText = cleanedText;
    Object.freeze(this);
  }

  get text(): string {
    return this._text;
  }

  get cleanedText(): string {
    return this._cleanedText;
  }

  get syllableCount(): SyllableCount {
    return this._syllableCount;
  }

  static create(props: VerseProps): Verse {
    const { text, expectedSyllables, isFirstVerse = false } = props;

    const normalizedText = text.replaceAll('\n', ' ').trim();

    if (this.hasBlacklistedChars(normalizedText)) {
      throw new BlacklistedCharacterException(normalizedText);
    }

    if (this.UPPERCASE_REGEX.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'uppercase',
      });
    }

    if (this.FIRST_WORDS_REGEX.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'invalid_start_word',
      });
    }

    if (this.LAST_WORDS_REGEX.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'invalid_end_word',
      });
    }

    if (this.LOST_LETTER_REGEX.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'lost_letter',
      });
    }

    if (normalizedText.length >= this.MAX_LENGTH) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'length',
      });
    }

    if (isFirstVerse && this.CONJUNCTION_START_REGEX.test(normalizedText)) {
      throw new InvalidVerseException(normalizedText, {
        reason: 'conjunction_start',
      });
    }

    const syllableCount = SyllableCount.fromText(normalizedText);
    if (!syllableCount.isValidFor(expectedSyllables)) {
      throw new InvalidSyllableCountException(
        expectedSyllables,
        syllableCount.value,
        normalizedText,
      );
    }

    const cleanedText = this.cleanText(normalizedText);

    return new Verse(normalizedText, syllableCount, cleanedText);
  }

  private static hasBlacklistedChars(text: string): boolean {
    return this.BLACKLISTED_CHARS_REGEX.test(text);
  }

  private static cleanText(text: string): string {
    let cleaned = text
      .trim()
      .replaceAll(/[\n\r]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/^'|'$|\.\.\.$|\.$\.$|\.$|,$|!$|;$|\?$/g, '');

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  equals(other: Verse): boolean {
    return this._text === other._text;
  }

  toDTO(): string {
    return this._cleanedText;
  }
}
